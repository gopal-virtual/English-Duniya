"use strict"; 

var fs = require('fs');
var http = require('http');
var request = require('request-promise');
var prompt = require('prompt');
var chalk = require('chalk');
var meta = {
	'questions' : 0,
	'videos' : 0,
	'lessons' : 0,
	'FOUND' : 0,
	'NOT FOUND' : 0
};
var properties = [
    {
      name: 'grade', 
      validator: /^[0-9]+$/,
      warning: 'Grade must be number you m\'fucker'
    }
  ];

prompt.start();

prompt.get( properties, function (err, result) {
	if (err) { return onErr(err); }
	else{
		parse(result.grade)
	}
});

function onErr(err) {
	console.log(err);
	return 1;
}

function parse(grade){
	fs.readFile('lesson.json', 'utf8', (err,data) => {

		var lessons = JSON.parse(data);

		var lessonLength = false || lessons.length;

		for (var i = lessonLength - 1; i >= 0; i--) {
			// meta.lessons++;
			if(lessons[i].node.type.grade == grade){
				new Lesson(lessons[i]).getStatus();
			}
		}

		// setTimeout(function(){
		// 	console.log("%j",meta);
		// },10000);

	})
	
}

function Lesson (lesson)
{
	this.lesson = lesson;
	this.title = this.lesson.node.title;
	this.grade = this.lesson.node.type.grade;
}
Lesson.prototype.getStatus = function ()
{
	return {
		title : this.title,
		grade : this.grade,
		url : this.parseUrl()
	}
}
Lesson.prototype.resourceType = function (resource)
{
	if (resource.node.content_type_name == 'assessment' && resource.node.type.type == 'assessment') {
        return 'assessment'
      } else if (resource.node.content_type_name == 'assessment' && resource.node.type.type == 'practice') {
        return 'practice'
      } else if (resource.node.content_type_name == 'resource' && resource.node.type.file_type == 'mp4') {
        return 'video'
      } else if (resource.node.content_type_name ==  'json question') {
      	return 'question'
      }	
}
Lesson.prototype.parseUrl = function()
{
	// traverse the lesson
	var urlList = [];

	//intro sound
	var introSound =  this.lesson.node.meta && this.lesson.node.meta.intros && this.lesson.node.meta.intros.sound && this.lesson.node.meta.intros.sound!='' ? this.lesson.node.meta.intros.sound : false;
	if(introSound){
		for (var i = introSound.length - 1; i >= 0; i--) {
			urlList.push(new urlObj(this.title , this.grade ,'intro', 'lesson', introSound[i], 'not requested').getUrlObj())
		}
	}
	else{
		var intro = {
			lesson_title : this.title,
			grade : this.grade,
			status : 'No Intro sound'
		}
		console.warn(chalk.yellow("\nMissing Intro File\n"),intro);
	}

	// resources
	for (var resources = this.lesson.objects, i = resources.length - 1; i >= 0; i--) {
		if(this.resourceType(resources[i]) == 'video'){
			meta.videos++;
			urlList.push(new urlObj(this.title , this.grade,'video', 'lesson', resources[i].node.type.path, 'not requested').getUrlObj());
		}
		if(this.resourceType(resources[i]) == 'practice'){
			if(!resources[i].objects.length){
				var noquestion = {
					title : this.title ,
					grade : this.grade,
					practice : resources[i].node.title,
					Question : 'No question found'
				}
				console.log(chalk.yellow("\nNo Questions Found\n"),noquestion);
			}
			else{
				for (var questions = resources[i].objects, c = questions.length - 1; c >= 0; c--) {
					meta.questions++;
					//instruction

					var answer = questions[c].node.type.answer;
					if(!answer.length){
						var noanswer = {
							lesson_title : this.title,
							grade : this.grade,
							practice : resources[i].node.title,
							node_id : questions[c].node.id,
							object_id : questions[c].node.object_id,
							status : 'No answer'
						}
						console.log(chalk.yellow("\nNo Answer Found\n"),noanswer);
					}
					var instruction = questions[c].node.meta && questions[c].node.meta.instructions && questions[c].node.meta.instructions.sounds ? questions[c].node.meta.instructions.sounds : false;
					if(instruction){
						for (var z = instruction.length - 1; z >= 0; z--) {
							urlList.push(new urlObj(this.title , this.grade, 'question instruction', 'practice', instruction[z], 'not requested').getUrlObj())
						}
						
					}

					// widget
					var widget = questions[c].node.type.content.widgets;
					for(var type in widget){
						for(var id in widget[type]){
							urlList.push(new urlObj(this.title , this.grade, 'question', 'practice', widget[type][id], 'not requested').getUrlObj())
						}
					}
				}
			}
		}
	}

	// question
	return urlList;
}


function urlObj (lesson_title, grade, type, parent, url, status)
{	
	this.lesson_title = typeof(lesson_title)!='undefined' ? lesson_title : '',
	this.grade = typeof(grade)!='undefined' ? grade : '',
	this.type = typeof(type)!='undefined' ? type : '';
	this.parent = typeof(parent)!='undefined' ? parent : '';
	this.url = typeof(url)!='undefined' ? url : '';
	this.status = typeof(status)!='undefined' ? status : '';
}

urlObj.prototype.setStatus = function (status)
{
	this.status = status;
}
urlObj.prototype.getUrlObj = function ()

{
	var _this = this;
	var options = {
		    method: 'HEAD',
		    uri: 'https://cc-test.zaya.in' + this.url,
		    resolveWithFullResponse: true 
		};

	request(options)
    .then(function(success){
    	var FOUND = {
    			lesson_title : _this.lesson_title,
    			grade : _this.grade,
				type : _this.type,
				parent : _this.parent,
				url : typeof(_this.url) == 'string' ? _this.url : JSON.stringify(_this.url),
			}
		// if(success.statusCode == 200)
		// 	console.log(success.statusCode, FOUND);    	
    })
    .catch(function(err){
    	var NOT_FOUND = {
    			lesson_title : _this.lesson_title,
    			grade : _this.grade,
				type : _this.type,
				parent : _this.parent,
				url : typeof(_this.url) == 'string' ? _this.url : JSON.stringify(_this.url),
			}
		if(err.statusCode == 404){
			console.log(chalk.red("\nMissing FIle - 404\n"),err.statusCode, NOT_FOUND);
			// console.log();
		}
    })
}
