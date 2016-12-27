/**
 * Created by kartik on 5/10/16.
 */
// pouchdb-dump http://localhost:5984/lessonDB > ../zaya-mobile/www/data/lessons.db
var fs = require('fs');
var request = require('request');
var json = [];
// var couch_server = 'http://zaya-couch:zayaayaz1234@ci-couch.zaya.in/lessonsdb/'
var couch_server = 'https://zaya-couch:zayaayaz1234@ci-couch.zaya.in/lessonsdb/'
var i;
var count = 0;
fs.readFile('Lesson26dec_NewContent.json', 'utf8', function(err, data) {
  if (err) {
    return console.log(err);
  }
  // console.log(data)
  json = JSON.parse(data);
  console.log(json.length)
  for (i = 0; i < json.length; i++) {
    // console.log(json[i].node.id);
    // json[i].scores = {};
    // json[i].key = i;
    request({
      url: couch_server + json[i].node.id, //URL to hit
      method: 'PUT',
      //Lets post the following key/values as form
      json: {
        lesson: json[i]
      }
    }, function(error, response, body) {
      // console.log('response',response)
      count++;
      if (error) {
        console.log("Error occured", error,count);
      } else {
        console.log("success",response.body,count)
      }
    });
    // break;
  }
})