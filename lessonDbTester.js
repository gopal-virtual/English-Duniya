var PouchDB = require('pouchdb');
var fs = require('fs');
var argv = require('yargs').argv;
var chalk = require('chalk');

// console.log('Arguments',argv);

function getDbFromCouch(dbName){
	var db = new PouchDB('https://ci-couch.zaya.in/lessonsdb');
	return db.allDocs({
		include_docs: true
	})
}


function readJsonFile(filename){
	return new Promise((resolve, reject) => {
		fs.readFile('temp/'+filename, 'utf8', (err, data) => {
		  if (err) reject(err);
		  resolve(data ? JSON.parse(data) : null);
		});
	})
}

function writeJsonFile(filename, data){
	return new Promise((resolve, reject) => {
		fs.writeFile('temp/'+filename, JSON.stringify(data), 'utf8', (err) => {
			if (err) reject(err);
			resolve(data);
		});
	})
}

function readLessonsDb(){
	readJsonFile('lessonsdb.json').then((docs) => {
		// traverseDocs(docs.rows);
	}).catch((err) => {
		console.err('Error occured while reading lessonsdb',err);
	});
}

function readFromLocalData(filename){
	return new Promise((resolve, reject) => {
		fs.readFile('www/data/'+filename, 'utf8', (err, data) => {
		  if (err) reject (err);
		  resolve(JSON.parse(data));
		});
	})
}


function printTs(msg){
	console.log(chalk.dim("[" + Date.now() + "] ") + msg)
}

function log(msg){
	console.log(chalk.blue("[log] ") + msg)
}

class Test{
	constructor(){
		this.tests = {};
	}

	createTests(testName, testFunc){
		this.tests[testName] = testFunc;
	}

	runTests(){
		// if (this.tests.length == 0){
			// console.log('No test to run');
		// } else {
			for(let testName in this.tests){
				console.log(chalk.yellow("[Test] " + testName));
				this.tests[testName](this.pass, this.fail);
			}
		// }
	}

	pass(msg = ''){
		console.log(chalk.blue("[status] ")+chalk.green('Passed ')+msg);
	}

	fail(msg = ''){
		console.log(chalk.blue("[status] ")+chalk.red('Failed ')+msg);
	}
}

function checkLessons(lessonsObj){
	// let i=0
	for (let lessonId in lessonsObj) {
		testLesson(lessonsObj[lessonId]);
	}
}

function testLesson(lesson, detail = false){
	if (!lesson) {
		printTs('lesson doesnt exist');
		return;
	}

	if (detail){
		console.log(JSON.stringify(lesson,null,2))
	}

	let test = new Test();
	printTs('Lesson  - ' + lesson.node.id);

	test.createTests('Validate Lesson Structure',(pass, fail) => {
		testLessonStructure(pass, fail, lesson);
	});

	test.createTests('Intro Sound Present', (pass, fail) => {
		testIntroSound(pass, fail, lesson);
	});

	test.runTests();
}

function testIntroSound(pass, fail, lesson){
	if (lesson.node.meta) {
		if (lesson.node.meta.intros) {
			if (lesson.node.meta.intros.sound) {
				if (lesson.node.meta.intros.sound.length != 0) {
	// console.log(lesson.node.meta);
					pass();
				}else{
					fail('sound in lesson meta intro is empty');
				}
			} else {
				fail('sound not present in lesson meta intro');
			}
		} else {
			fail('intros not found in lesson meta');
		}
	} else {
		fail('meta not found in lesson');
	}

}

function testLessonStructure(pass, fail, lesson){
	log("Skill : " + lesson.node.tag);
	switch(lesson.node.tag ? lesson.node.tag.toLowerCase() : null){
		case 'reading':
		case 'listening':
			if (lesson.objects.length == 1) {
				lesson.objects[0].node.content_type_name  == 'assessment' && lesson.objects[0].node.type.type == 'practice' ? pass() : fail('node is not practice');
			} else {
				fail('more than one nodes in lesson');
			}
			break;
		case 'vocabulary':
		case 'grammar':
			if (lesson.objects.length == 2 || lesson.objects.length == 3) {
				// lesson.objects[0].node.content_type_name == 'resources' || lesson.objects[0].node.content_type_name == 'vocabulary' ? pass() : fail('first node is neither vocabui nor video');
				let practice = false;
				let video = false;
				let vocabui = false;
				for (let i = 0; i < lesson.objects.length; i++) {
					if(lesson.objects[i].node.content_type_name == 'resource') {
						video = true;
					}

					if (lesson.objects[i].node.content_type_name == 'vocabulary') {
						vocabui = true;
					}

					if(lesson.objects[i].node.content_type_name == 'assessment' && lesson.objects[i].node.type.type == 'practice'){
						practice = true;
					}
				}

				log('Video : '+video)
				log('VocabUI : '+vocabui)
				log('Practice : '+practice)

				if (practice) {
					pass();
				}else{
					fail(vocabui || video ? 'no practice found' : 'no vocabui or video found');
				}
			} else {
				fail('more than two/three nodes in lesson');
			}
			break;
		default:
			// console.log(chalk.red("Lesson of unknown skill"))
			fail('lesson does not have a valid skill');
	}
}

function main(){
	let lessonData;
	let kmapsData;
	Promise.all([
		loadLessons(),	
		readFromLocalData('kmapsJSON.json')
	]).then((data) => {
		if (argv.lessonId) {
			testLesson(data[0][argv.lessonId], true);
		}else{
			compareLessonKmaps(data[0],data[1]);
			checkLessons(data[0]);
		}
	
	})
	.catch((err) => {
		console.log(err);
	})
	
}

function compareLessonKmaps(lessonData, kmapsData){
	kmapsData = kmapsData[0];
	let test = new Test();

	test.createTests('Compare Kmaps with lessonsdb', (pass, fail) => {
		let isLessonMissing = false;
		for (let lessonId in kmapsData) {
			if(!lessonData[lessonId]){
				isLessonMissing = true;
				log("Missing Id : " + lessonId);
			}
		}
		if (isLessonMissing) {
			fail('Some lessons are missing');
		}else{
			pass();
		}
	})

	test.runTests();
}

function loadLessons(){
	return readJsonFile('lessons.json').then((docs) => {
		return docs;
	}, (err) => {
		if (err.code === "ENOENT") {
			return createLessonDb().then(() => {
				return createLessonJson()
			})
		}else{
			printTs('Error occured while reading lessonsdb',err);
		}
	});	
}

function createLessonJson(){
	return readJsonFile('lessonsdb.json').then((data) => {
		let lessonsObj = {};
		for (var i = 0; i < data.length; i++) {
			lessonsObj[data[i].id] = data[i].doc.lesson;
		}
		return writeJsonFile('lessons.json',lessonsObj)
	})
}

function createLessonDb(){
	return getDbFromCouch('lessonsdb').then((data) => {
		return writeJsonFile('lessonsdb.json',data.rows)
	})
}

main();