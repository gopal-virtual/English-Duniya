(function() {
  'use strict';

  angular
    .module('common')
    .factory('mediaManager', mediaManager)

  function mediaManager($cordovaNativeAudio, $log, $cordovaFile, $cordovaFileTransfer, $q, CONSTANT, network) {
    return {

      getPath: function(url) {
        var filename = url.split('/').pop();
        var target = null;
        try {

          return $cordovaFile.checkFile(cordova.file.dataDirectory, 'media/' + filename)
            .then(function(success) {
              return target = cordova.file.dataDirectory + 'media/' + filename;
            })
            .catch(function(error) {
              return target = CONSTANT.RESOURCE_SERVER + url;
            });
        } catch (e) {
          return Promise.resolve(CONSTANT.RESOURCE_SERVER + url);
        }

      },
      play: function(sound) {
        try {
          $cordovaNativeAudio.play(sound);
        } catch (error) {}
      },
      downloadIfNotExists: function(url) {
        var d = $q.defer();
        var filename = url.split("/").pop();
        try {
          var target = cordova.file.dataDirectory + 'media/' + filename;
          $cordovaFile.checkFile(cordova.file.dataDirectory,'media/' + filename).then(function(result) {
              d.resolve(result);
            })
            .catch(function(e) {
              if (e.message === 'NOT_FOUND_ERR') {
                if(!network.isOnline())
                {
                  d.reject({"error":true,"message":"offline"});
                }
                $cordovaFileTransfer.download(url, target)
                  .then(function(result) {
                    d.resolve("Downloaded " + target);
                  }, function(err) {
                    d.reject("Error Downlaoding " + target);
                  }, function(progress) {});
              } else {

                d.reject("Error Downlaoding " + target);
              }
            })

        } catch (e) {

          d.resolve("Cordova not found");
        }
        return d.promise;

      },
    };
  }
})();
