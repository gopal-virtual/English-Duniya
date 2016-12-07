console.log("==== Bundling media ====");
console.log("==== Note : www/bundled/ should be empty befor this operation. ====");

var fs = require('fs');
var fs_extra = require('fs-extra');
var source_folder = 'media/ell/';
var target_folder = 'www/bundled/';
var ncp = require('ncp').ncp;

function getFileNameFromURl(url) {
  var a = url.split('/');
  return a.join('/').substr(1);
}
var json = [];
var lessons = process.argv[2];
var media = [];
media.push('/media/ell/images/dog_O5P4I8.png');
media.push('/media/ell/images/person_9FDOFJ.png');
media.push('/media/ell/images/place_KJMRCN.png');
media.push('/media/ell/images/animal_7C4FVV.png');
media.push('/media/ell/images/thing_0IS1M4.png');

fs.readFile('lesson.json', 'utf8', function(err, data) {
  if (err) {
    return console.log(err);
  }
  json = JSON.parse(data);
  fs.readFile('diagnosisQJSON.json', 'utf8', function(err, data) {
    var diagnosis_json = JSON.parse(data);
    var counter = [0, 0, 0, 0]
    for (var i = 0; i < json.length; i++) {
      // Check if lesson is to be bundled
      if (lessons == 'all' || counter[json[i].node.type.grade] < lessons) {
        // Add Intros to media[]
        if (json[i].node.meta && json[i].node.meta.intros && json[i].node.meta.intros.sound) {
          media = media.concat(json[i].node.meta.intros.sound);
        }
        //Iterate Resources
        for (var j = 0; j < json[i].objects.length; j++) {
          //if Video
          if (json[i].objects[j].node.content_type_name == 'resource') {
            // add video to media[]
            media.push(json[i].objects[j].node.type.path)
          }
          // If assessment
          if (json[i].objects[j].node.content_type_name == 'assessment') {
            //Iterate questions
            for (var k = 0; k < json[i].objects[j].objects.length; k++) {
              // add widgets to media[]
              if (json[i].objects[j].objects[k].node.type.content && json[i].objects[j].objects[k].node.type.content.widgets) {
                for (var mediaType in json[i].objects[j].objects[k].node.type.content.widgets) {
                  if (json[i].objects[j].objects[k].node.type.content.widgets.hasOwnProperty(mediaType)) {
                    for (var file in json[i].objects[j].objects[k].node.type.content.widgets[mediaType]) {
                      media.push(json[i].objects[j].objects[k].node.type.content.widgets[mediaType][file]);
                    }
                  }
                }
              }
              //add instructions to media[]
              if (json[i].objects[j].objects[k].node.meta && json[i].objects[j].objects[k].node.meta.instructions && json[i].objects[j].objects[k].node.meta.instructions.sounds) {
                media = media.concat(json[i].objects[j].objects[k].node.meta.instructions.sounds);
              }
            }
          }
        }
        // Increase Counter
        counter[json[i].node.type.grade]++;
      }
    }
    //Iterate diagnsosis questions json
    for (var prop in diagnosis_json[0]) {
      // console.log(prop,diagnosis_json[0][prop])
      for (var media_type in diagnosis_json[0][prop].node.type.content.widgets) {
        if (diagnosis_json[0][prop].node.type.content.widgets.hasOwnProperty(media_type)) {
          for (var media_file in diagnosis_json[0][prop].node.type.content.widgets[media_type]) {
            media.push(diagnosis_json[0][prop].node.type.content.widgets[media_type][media_file]);
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
      // fs_extra.ensureFileSync(target_folder + filename);
      console.log(source_folder + media[i].split('/')[media[i].split('/').length - 2] + '/' + media[i].split('/').pop(),' to ', target_folder + filename);
      ncp(source_folder + media[i].split('/')[media[i].split('/').length - 2] + '/' + media[i].split('/').pop(), target_folder + filename, function(error) {
        if (error) {
          console.log("Error Occured");
        }
      });
    }
  });
});