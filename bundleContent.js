console.log("==== Bundling media ====");
console.log("==== Note : www/bundled/ should be empty before this operation. ====");
var fs = require('fs');
var argv = require('yargs').argv;
var fs_extra = require('fs-extra');
var target_folder = 'www/bundled/';
var ncp = require('ncp').ncp;
var env = argv.env ? argv.env : 'production';
var source_folder = env === 'production' ? '/media/zaya-mobile-custom-build/media-production' : '/media/zaya-mobile-custom-build/media-test';
var request = require('sync-request');
var diagnosis_docs_list = JSON.parse(request('GET', 'http://ci-couch.zaya.in/diagnosis_translations/_all_docs').getBody().toString());
var lesson_docs_list = JSON.parse(request('GET', 'http://ci-couch.zaya.in/lessonsdb/_all_docs').getBody().toString()).rows;

function getFileNameFromURl(url) {
  var a = url.split('/');
  return a.join('/').substr(1);
}

function gerDirectoryFromURL(url) {
  var a = url.split('/');
  a.splice(-1);
  a.shift();
  return target_folder + a.join('/');
}

function getSourceNameFromURL(url) {
  var a = url.split('/');
  a[1] = source_folder;
  return a.join('/').substr(1);
}
var lessons = argv.lessons;
var media = [];
media.push('/media/ell/images/dog_O5P4I8.png');
media.push('/media/ell/images/person_9FDOFJ.png');
media.push('/media/ell/images/place_KJMRCN.png');
media.push('/media/ell/images/animal_7C4FVV.png');
media.push('/media/ell/images/thing_0IS1M4.png');
var counter = [0, 0, 0, 0];
if (lessons == 'all') {
  for (var i = 0; i < lesson_docs_list.length; i++) {
    if(lesson_docs_list[i].id !== 'localized_mapping')
    var lesson_doc = JSON.parse(request('GET', 'http://ci-couch.zaya.in/lessonsdb/' + lesson_docs_list[i].id).getBody().toString());
    for (var j = 0; j < lesson_doc.objects.length; j++) {
      //if Video
      if (lesson_doc.objects[j].node.content_type_name == 'resource') {
        // add video to media[]
        media.push(lesson_doc.objects[j].node.type.path)
      }
      // If assessment
      if (lesson_doc.objects[j].node.content_type_name == 'assessment') {
        //Iterate questions
        for (var k = 0; k < lesson_doc.objects[j].objects.length; k++) {
          // add widgets to media[]
          if (lesson_doc.objects[j].objects[k].node.type.content && lesson_doc.objects[j].objects[k].node.type.content.widgets) {
            for (var mediaType in lesson_doc.objects[j].objects[k].node.type.content.widgets) {
              if (lesson_doc.objects[j].objects[k].node.type.content.widgets.hasOwnProperty(mediaType)) {
                for (var file in lesson_doc.objects[j].objects[k].node.type.content.widgets[mediaType]) {
                  media.push(lesson_doc.objects[j].objects[k].node.type.content.widgets[mediaType][file]);
                }
              }
            }
          }
          //add instructions to media[]
          if (lesson_doc.objects[j].objects[k].node.meta && lesson_doc.objects[j].objects[k].node.meta.instructions && lesson_doc.objects[j].objects[k].node.meta.instructions.sounds) {
            media = media.concat(lesson_doc.objects[j].objects[k].node.meta.instructions.sounds);
          }
        }
      }
    }
  }
}
//Iterate diagnsosis questions json
for (var i = 0; i < diagnosis_docs_list.rows.length; i++) {
  // console.log("Value", docs_list.rows[i].id);
  var id = diagnosis_docs_list.rows[i].id;
  var doc = JSON.parse(request('GET', 'http://ci-couch.zaya.in/diagnosis_translations/' + id).getBody().toString());
  // console.log("Doc", doc.question);
  for (var media_type in doc.question.node.type.content.widgets) {
    if (doc.question.node.type.content.widgets.hasOwnProperty(media_type)) {
      for (var media_file in doc.question.node.type.content.widgets[media_type]) {
        //console.log(doc.question.node.type.content.widgets[media_type][media_file])
        media.push(doc.question.node.type.content.widgets[media_type][media_file]);
      }
    }
  }
}
media = media.reduce(function(a, b) {
  if (a.indexOf(b) < 0) a.push(b);
  return a;
}, []);
console.log("Please wait while we bundle " + media.length + " media files");
for (i in media) {
  var filename = getFileNameFromURl(media[i]);
  var directory = gerDirectoryFromURL(media[i]);
  fs_extra.ensureDirSync(directory)
  console.log(getSourceNameFromURL(media[i]), ' to ', target_folder + filename);
  ncp(getSourceNameFromURL(media[i]), target_folder + filename, function(error) {
    if (error) {
      console.log("Error Occured", error);
    }
  });
}