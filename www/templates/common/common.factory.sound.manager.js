(function() {
  'use strict';

  angular
    .module('common')
    .factory('soundManager', soundManager)

  function soundManager($cordovaNativeAudio, $log, $cordovaFile, $cordovaFileTransfer) {
    return {
      download: function(url){
        // $log.debug('Free space' ,cordova.getFreeDiskSpace());
        // $log.debug('Free space' ,cordova.getFreeDiskSpace());
        var filename = url.split("/").pop();
        var target = cordova.file.dataDirectory + 'sounds/' + filename;
        $cordovaFileTransfer.download(url, target)
            .then(function(result) {
              // var soundMap =
              $log.debug("Success",target)
            }, function(err) {
              $log.debug("Error in Sound Manager",err)
            }, function (progress) {
              $log.debug("Progress",progress.loaded)
            });
      },
      getSound: function(url){

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
