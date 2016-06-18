(function() {
  'use strict';

  angular
    .module('common')
    .factory('mediaManager', mediaManager)

  function mediaManager($cordovaNativeAudio, $log, $cordovaFile, $cordovaFileTransfer, $q,CONSTANT) {
    return {
      getSound: function(url) {
        var filename = url.split("/").pop();
        try {
          var target = cordova.file.dataDirectory + 'media/' + filename;

        } catch (e) {

        } finally {

        }
        $log.debug(target)
        return target;
      },
      getPath: function(url) {
        var filename = url.split("/").pop();
        try {
          var target = cordova.file.dataDirectory + 'media/' + filename;

        } catch (e) {

        } finally {

        }
        return target;
      },
      play: function(sound) {
        try {
          $cordovaNativeAudio.play(sound);
          console.log('sound played');
        } catch (error) {
          console.log(error);
        }
      },
      download: function(url) {
        var filename = url.split("/").pop();
        try {
          var target = cordova.file.dataDirectory + 'media/' + filename;

        } catch (e) {

        } finally {

        }
        // $log.debug("here")
        // var sounds = JSON.parse(localStorage.getItem('sounds') || '{}');
        // sounds[url] = target;
        // localStorage.setItem('sounds',JSON.stringify(sounds));
        var d = $q.defer();
        $cordovaFileTransfer.download(url, target)
          .then(function(result) {
            d.resolve("Downloaded " + target);
          }, function(err) {
            d.reject("Error Downlaoding " + target);
          }, function(progress) {});
        return d.promise;
      },
    };
  }
})();
