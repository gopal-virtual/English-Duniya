var fs = require('fs-extra');
var request = require('sync-request');
var arequest = require('request');
var diagnosis = JSON.parse(fs.readFileSync('diagnosisQJSON.json', 'utf8'))[0];
var mapping = JSON.parse(request('GET', 'https://ci-couch.zaya.in/lessonsdb/localized_mapping').getBody().toString()).mapping;
var couch_server = 'https://zaya-couch:zayaayaz1234@ci-couch.zaya.in/diagnosis_translations/'
// for(var qId in mapping){
// 	if(mapping.hasOwnProperty(qId)){
// 		console.log(qId);
// 		console.log(mapping[qId]);
// 		break;
// 	}
// }
// console.log(typeof mapping)
var counter = 0;
function saveQuestion(question) {
	console.log("qid is",question.node.id)
arequest({
      url: couch_server + question.node.id, //URL to hit
      method: 'PUT',
      //Lets post the following key/values as form
      json: {
        question: question
      }
    }, function(error, response, body) {
      // console.log('response',response)
      if (error) {
      } else {
        console.log("success",counter++)
      }
    });
	// body...
}
var translations = {};
var list = [];
for (var qId in diagnosis) {
	if (diagnosis.hasOwnProperty(qId)) {
		translations[qId] = mapping[qId];
		list.push(qId);
		for (var tId in mapping[qId]) {
			if (mapping[qId].hasOwnProperty(tId)) {
				list.push(mapping[qId][tId]);
			}
		}
	}
}
var content = {};
console.log("list length",list.length)
for (var i = 0; i < list.length; i++) {
	arequest.get('https://cc-test.zaya.in/api/v1/accounts/0429fb91-4f3c-47de-9adb-609996962188/questions/' + list[i], {'headers': {'Authorization': 'Token 773eb851acd383f32e5323086ff1293629cb5da2','Content-Type': 'application/json'}},function (error,response,body) {
		console.log("R completed")	
		if(JSON.parse(body).node)
			saveQuestion(JSON.parse(body))
	})
	// content[question.id] = question;
}
// console.log(content);