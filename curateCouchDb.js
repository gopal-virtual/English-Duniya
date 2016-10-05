/**
 * Created by kartik on 5/10/16.
 */
// pouchdb-dump http://localhost:5984/lessonDB > ../zaya-mobile/www/data/lessons.db
var fs = require('fs');
var request = require('request');
var diff = require('deep-diff')
var json = [];

var i;
fs.readFile('lesson.json', 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  json = JSON.parse(data);

  request({
    url: 'http://127.0.0.1:5984/lessons/',
    method: 'DELETE'
  }, function (error, response, body) {

    if (!error) {

      request({
        url: 'http://127.0.0.1:5984/lessons/',
        method: 'PUT'
      }, function (error, response, body) {
        if (!error) {
          for (i = 0; i < json.length; i++) {
            json[i].scores = {};
            json[i].key = i;
            request({
              url: 'http://127.0.0.1:5984/lessons/' + json[i].node.id, //URL to hit
              method: 'PUT',
              //Lets post the following key/values as form
              json: {lesson: json[i]}
            }, function (error, response, body) {
              if (error) {
                console.log("Error occured");
              } else {
              }
            });
          }
        }
      })

    }
    else {
      console.log(error)
    }
  });


})