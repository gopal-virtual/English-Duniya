(function() {
  'use strict';

  angular
    .module('common')
    .factory('soundManager', soundManager)

  function soundManager($cordovaNativeAudio, $log, $cordovaFile, $cordovaFileTransfer, $q) {
    return {
      download: function(url) {
        // $log.debug('Free space' ,cordova.getFreeDiskSpace());
        // $log.debug('Free space' ,cordova.getFreeDiskSpace());
        var filename = url.split("/").pop();
        var target = cordova.file.dataDirectory + 'sounds/' + filename;
        $log.debug("here")
        var sounds = JSON.parse(localStorage.getItem('sounds') || '{}');
        sounds[url] = target;
        localStorage.setItem('sounds',JSON.stringify(sounds));
        var d = $q.defer();
        $cordovaFileTransfer.download(url, target)
          .then(function(result) {
            d.resolve("Downloaded " + target);
          }, function(err) {
            d.reject("Error Downlaoding " + target);
          }, function(progress) {});
        return d.promise;
      },
      getSound: function(url) {
        var sounds = JSON.parse(localStorage.getItem('sounds'));
        return sounds[url];
      },

      play: function(sound) {
        try {
          $cordovaNativeAudio.play(sound);
          console.log('sound played');
        } catch (error) {
          console.log(error);
        }
      }
    };
  }
})();
