var PouchDB = require('pouchdb');
var fs = require('fs');
var argv = require('yargs').argv;


console.log('Arguments',argv);

function getDbFromCouch(dbName){
	var db = new PouchDB('https://ci-couch.zaya.in/'+dbName);
	return db.allDocs({
		include_docs: true
	})
}

function traverseDocs(json){
	// console.log(json);
	for (var i = 0; i < json.length; i++) {
		console.log("Lesson - "+(i+1)+": "+ json[i].id);
	}
}

function readJsonFile(filename){
	return new Promise((resolve, reject) => {
		fs.readFile('temp/'+filename, 'utf8', (err, data) => {
		  if (err) reject (err);
		  resolve(JSON.parse(data));
		});
	})
}

function writeJsonFile(filename, data){
	return new Promise((resolve, reject) => {
		fs.writeFile('temp/'+filename, JSON.stringify(docs), 'utf8', (err) => {
			if (err) reject (err);
			resolve(true);
		});
	})
}

function readLessonsDb(){
	readJsonFile('lessonsdb.json').then((docs) => {
		traverseDocs(docs.rows);
	}).catch((err) => {
		console.err('Error occured while reading lessonsdb',err);
	});
}

function main(){
	readLessonsDb();
}


main();