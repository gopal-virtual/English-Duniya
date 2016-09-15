var http = require('http');
var fs = require('fs');
var request = require('request');
var wget = require('wget-improved');
var target_folder = 'content/';
var getFileNameFromURl = function(url){
    return url.split('/')[url.split('/').length-2]+'-'+url.split('/')[url.split('/').length-1];
};
var json = [];
var lessons = process.argv[2];
var media = [];
media.push('/media/ell/images/dog_O5P4I8.png');
media.push('/media/ell/images/person_GLUMUY.png');
media.push('/media/ell/images/place_KJMRCN.png');
media.push('/media/ell/images/animal_2W0HQG.png');
media.push('/media/ell/images/thing_DV4JY6.png');

// Delete all the contents of the folder first
var dir_contents = (fs.readdirSync(target_folder))
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
      continue;
    }
  }
  // console.log(media)
  console.log("Retained " + media_retained + " media files");
  console.log("Deleted " + media_deleted + " media files");
  console.log("Please wait while we download " + media.length + " media files");
  console.log(media)
  // exit();
  // console.log(media);
  // fileWrite = [];
  // multiDownload(media);
  // downloadAll(media);
  // if(media.length){
  //   i = 0;
  //   console.log("Starting "+'http://cc-test.zaya.in'+media[i] + ' inside '  + 'www/bundled/'+filename)
  //   var m = media.shift();
  //   download('http://cc-test.zaya.in'+media[i], 'www/bundled/'+filename, function(){
  //   });
  //
  // }
  // wget.download('https://cc-test.zaya.in/media/ell/sounds/drinks.mp3','www/bundled/drinks.mp3' , {});

  // for(i = 0 ; i < media.length ; i++){
  // console.log(media)

  var d = [];
  var count = 0;
  var mediaSize = 0;
  var errors = [];
  var mediaDownloadedSize = 0;
  var percent = [];
  var percentage = 0;
  var new_media = 0;
  var start = (new Date()).getTime();
  var callback_end = function() {
    count++;
    // console.log("Download ended");
    console.log(parseInt(percentage/media.length*100)+ " %" + " Total size : " + mediaSize + " Completed " + count + " files of " + media.length + " Errors : " + errors.length + " Time "  + parseInt(((new Date()).getTime() - start)/1000) + "\r")
    if (count == media.length - errors.length) {
      clearInterval(interval);
      console.log("Completed in " + ((new Date()).getTime() - start) / 1000 + " with following errors", errors)
      console.log("Downloaded", media.length, "Errors", errors.length, "Retained", media_retained, "Deleted", media_deleted)
    }

  }

  var interval = setInterval(function() {
    percentage = 0;
    for (var j in percent) {
      if(percent[j])
      percentage += percent[j]
    }
  }, 1000);

  var callback_start = function(fileSize) {
    console.log(parseInt(percentage/media.length*100)+ " %" + " Total size : " + mediaSize + " Completed " + count + " files of " + media.length + " Errors : " + errors.length+ " Time "  + parseInt(((new Date()).getTime() - start)/1000) + "\r")
    mediaSize += parseInt(fileSize);
  }
  for (i in media) {
    var filename = getFileNameFromURl(media[i]);
    // console.log(dir_contents.indexOf(filename));
    // if (dir_contents.indexOf(filename) >= 0) {
    //   continue;
    // }
    // new_media++;

    d[i] = wget.download('https://eg-api.zaya.in/' + media[i], target_folder + filename, {});
    d[i].on('end', callback_end);
    d[i].on('start', callback_start);

    (function(i) {
      d[i].on('progress', function(chunk) {
        percent[i] = chunk;
        console.log(parseInt(percentage/media.length*100)+ " %" + " Total size : " + mediaSize + " Completed " + count +" files of " + media.length + " Errors : " + errors.length+ " Time " + parseInt(((new Date()).getTime() - start)/1000) + "\r")
      });
      d[i].on('error', function(error) {
        errors.push(media[i])
        console.log(i, error);
        if (count == media.length - errors.length) {
          clearInterval(interval);
          console.log("Completed in " + ((new Date()).getTime() - start) / 1000 + " with following errors", errors)
          console.log("Downloaded", media.length, "Errors", errors.length, "Retained", media_retained, "Deleted", media_deleted)
        }
      });
    })(i)
  }
  if (media.length === 0) {
    console.log("Completed in " + ((new Date()).getTime() - start) / 1000 + " with following errors", errors)
    console.log("Downloaded", media.length, "Errors", errors.length, "Retained", media_retained, "Deleted", media_deleted)
    clearInterval(interval);
  }
});
