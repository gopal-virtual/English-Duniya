(function() {
  'use strict';

  angular
    .module('common')
    .factory('mediaManager', mediaManager)

  function mediaManager($cordovaNativeAudio, $log, $cordovaFile, $cordovaFileTransfer, $q) {
    return {
      getSound: function(url) {
        var filename = url.split("/").pop();
        var target = cordova.file.dataDirectory + 'media/' + filename;
        $log.debug(target)
        return target;
      },
      getPath: function(url) {
        var filename = url.split("/").pop();
        var target = cordova.file.dataDirectory + 'media/' + filename;
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
        var target = cordova.file.dataDirectory + 'media/' + filename;
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
