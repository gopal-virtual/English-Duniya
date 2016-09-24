var http = require('http');
var fs = require('fs');
// var request = require('request');
// var wget = require('wget-improved');
var source_folder = 'content/'
var target_folder = 'www/bundled/';
var ncp = require('ncp').ncp;
var getFileNameFromURl = function(url){
  return url.split('/')[url.split('/').length-2]+'-'+url.split('/')[url.split('/').length-1];
};
var json = [];
var lessons = process.argv[2];
var media = [];

media.push('/media/ell/images/dog_O5P4I8.png');
media.push('/media/ell/images/person_9FDOFJ.png');
media.push('/media/ell/images/place_KJMRCN.png');
media.push('/media/ell/images/animal_7C4FVV.png');
media.push('/media/ell/images/thing_0IS1M4.png');


// Delete all the contents of the target folder first
var dir_contents = (fs.readdirSync(target_folder));
// for(var i in dir_contents){
//   fs.unlinkSync(target_folder+dir_contents[i])
// }
// console.log(dir_contents);
// wait();
// Read the lessons json
fs.readFile('lesson.json', 'utf8', function(err, data) {
  if (err) {
    return console.log(err);
  }
  json = JSON.parse(data);
  // console.log(json)
  var counter = [0, 0, 0, 0]
  // Iterate lessons
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
            // console.log(json[i].objects[j].objects[k].node.type.content.widgets);
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
              // console.log("a",json[i].objects[j].objects[k].node.meta.instructions.sounds, typeof json[i].objects[j].objects[k].node.meta.instructions.sounds,media)
              media = media.concat(json[i].objects[j].objects[k].node.meta.instructions.sounds);
              // console.log("a",json[i].objects[j].objects[k].node.meta.instructions.sounds, typeof json[i].objects[j].objects[k].node.meta.instructions.sounds,media)

            }
          }


        }
      }
      // Increase Counter
      counter[json[i].node.type.grade]++;
    }
  }
  var media_deleted = 0;
  var media_retained = 0;
  var strip_media = [];
  media = media.reduce(function(a,b){
    if (a.indexOf(b) < 0 ) a.push(b);
    return a;
  },[]);
  console.log("Found " + media.length + " media files");

  for (i in media) {
    strip_media[i] = getFileNameFromURl(media[i]);
  }
  for (i in dir_contents) {

    // console.log(dir_contents[i])
    // console.log(strip_media.indexOf(dir_contents[i]));
    if (strip_media.indexOf(dir_contents[i]) < 0) {
      media_deleted++;
      // console.log("Deleted",dir_contents[i])
      fs.unlinkSync(target_folder + dir_contents[i])
    } else {
      // console.log("Retained",dir_contents[i])
      media_retained++;
      // if(dir_contents[i] === '002.mp3' || dir_contents[i] ===  '001.mp3'){
      //   console.log("we have found",dir_contents[i],strip_media.indexOf(dir_contents[i]),media.length)
      // }
      media.splice(strip_media.indexOf(dir_contents[i]), 1);
      strip_media.splice(strip_media.indexOf(dir_contents[i]), 1);
      // if(dir_contents[i] === '002.mp3' || dir_contents[i] ===  '001.mp3'){
      //   console.log(media.length)
      //   console.log("we have found",dir_contents[i],strip_media.indexOf(dir_contents[i]),media.length)
      // }
    }
    if(strip_media.indexOf(dir_contents[i]) >= 0){
      console.log("Found again")
      i--;
    }
  }
  // console.log(media)
  console.log("Retained " + media_retained + " media files");
  console.log("Deleted " + media_deleted + " media files");
  console.log("Please wait while we bundle " + media.length + " media files");


  for (i in media) {
    var filename = getFileNameFromURl(media[i]);
    ncp(source_folder+filename, target_folder+filename,function(error){
      if(error){
        console.log("Error Occured",error)
      }
    });
  }

});
