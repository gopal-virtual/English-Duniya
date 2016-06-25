(function() {
  'use strict';

  angular
    .module('common')
    .factory('mediaManager', mediaManager)

  function mediaManager($cordovaNativeAudio, $log, $cordovaFile, $cordovaFileTransfer, $q,CONSTANT) {
    return {

      getPath: function(url) {
        var filename = url.split('/').pop();
        var target = null;
        try{

        return $cordovaFile.checkFile(cordova.file.dataDirectory, 'media/' + filename)
          .then(function(success) {
            $log.debug("getPath 1",success)
            return target = cordova.file.dataDirectory + 'media/' + filename;
          })
          .catch(function(error){
            $log.debug("getPath 3",error)
            return target = CONSTANT.RESOURCE_SERVER + url;
          })
          ;
        }catch(e){
          return Promise.resolve(CONSTANT.RESOURCE_SERVER + url);
        }

      },
      play: function(sound) {
        try {
          $cordovaNativeAudio.play(sound);
        } catch (error) {
        }
      },
      download: function(url) {
        var filename = url.split("/").pop();
        try {
          var target = cordova.file.dataDirectory + 'media/' + filename;
          var d = $q.defer();
          $cordovaFileTransfer.download(url, target)
            .then(function(result) {
              d.resolve("Downloaded " + target);
            }, function(err) {
              d.reject("Error Downlaoding " + target);
            }, function(progress) {});
          return d.promise;
        } catch (e) {
        }

      },
    };
  }
})();
