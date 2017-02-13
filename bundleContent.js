console.log("==== Bundling media ====");
console.log("==== Note : www/bundled/ should be empty before this operation. ====");
var fs = require('fs');
var argv = require('yargs').argv;
var fs_extra = require('fs-extra');
var target_folder = 'www/bundled/';
var ncp = require('ncp').ncp;
var source_folder = argv.source_folder;
var request = require('sync-request');
var diagnosis_db = argv.diagnosis_db;
var lessons_db = argv.lessons_db;
var diagnosis_docs_list = JSON.parse(request('GET', diagnosis_db + '_all_docs').getBody().toString());
var lesson_docs_list = JSON.parse(request('GET', lessons_db + '_all_docs').getBody().toString()).rows;
var languages = argv.languages;

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
    if (lesson_docs_list[i].id !== 'localized_mapping' && lesson_docs_list[i].id !== '_design/_auth') {
      console.log(lesson_docs_list[i].id)
      var lesson_doc = JSON.parse(request('GET', lessons_db + lesson_docs_list[i].id).getBody().toString()).lesson;
      // Add Intros to media[]
      if (lesson_doc.node.meta && lesson_doc.node.meta.intros && lesson_doc.node.meta.intros.sound) {
        media = media.concat(lesson_doc.node.meta.intros.sound);
      }
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
        if (lesson_doc.objects[j].node.content_type_name == 'vocabulary') {
          for (var l = 0; l < lesson_doc.objects[j].objects.length; l++) {
            // vocab sounds
            if (lesson_doc.objects[j].objects[l].node.type.sound) {
              for (var soundIndex in lesson_doc.objects[j].objects[l].node.type.sound) {
                media.push(lesson_doc.objects[j].objects[l].node.type.sound[soundIndex].path)
              }
            }
            //vocab images
            if (lesson_doc.objects[j].objects[l].node.type.image) {
              media.push(lesson_doc.objects[j].objects[l].node.type.image.path)
            }
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
  var doc = JSON.parse(request('GET', diagnosis_db + id).getBody().toString());
  // console.log("Doc", doc.question);
  // console.log(doc.question.node.localize.source);
  if (languages.indexOf(doc.question.node.localize.source) >= 0) {
    for (var media_type in doc.question.node.type.content.widgets) {
      if (doc.question.node.type.content.widgets.hasOwnProperty(media_type)) {
        for (var media_file in doc.question.node.type.content.widgets[media_type]) {
          //console.log(doc.question.node.type.content.widgets[media_type][media_file])
          media.push(doc.question.node.type.content.widgets[media_type][media_file]);
        }
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
  fs_extra.copy(getSourceNameFromURL(media[i]), target_folder + filename, function(error) {
    if (error) {
      console.log("Error Occured", error);
    }
  });
}