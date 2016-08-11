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
              return target = CONSTANT.BACKEND_SERVICE_DOMAIN + url;
            });
        } catch (e) {
          return Promise.resolve(CONSTANT.BACKEND_SERVICE_DOMAIN + url);
        }

      },
      play: function(sound) {
        try {
          $cordovaNativeAudio.play(sound);
        } catch (error) {}
      },
      downloadIfNotExists: function(url) {
        $log.debug("downloadIfNotExists")
        var d = $q.defer();
        var filename = url.split("/").pop();
        try {
          $log.debug("downloadIfNotExists 1")

          var target = cordova.file.dataDirectory + 'media/' + filename;
          $cordovaFile.checkFile(cordova.file.dataDirectory, 'media/' + filename).then(function(result) {
              $log.debug("downloadIfNotExists 2")

              d.resolve(target);
            })
            .catch(function(e) {
              $log.debug("downloadIfNotExists 3", e, network.isOnline())

              if (e.message === 'NOT_FOUND_ERR') {
                if (!network.isOnline()) {
                  $log.debug("downloadIfNotExists 4")

                  d.reject({
                    "error": true,
                    "message": "offline"
                  });
                } else {
                  $log.debug("downloadIfNotExists 5")

                  $cordovaFileTransfer.download(url, target)
                    .then(function(result) {
                      d.resolve(target);
                    }, function(err) {
                      $log.debug(err)
                      d.reject("Error Downlaoding " + target);
                    }, function(progress) {
                      localStorage.setItem('progress',parseInt((progress.loaded/progress.total) * 100))
                      // $log.debug(progress,(progress.loaded/progress.total) * 100);
                    });
                }

              } else {

                d.reject("Error Downlaoding " + target);
              }
            })

        } catch (e) {

          d.resolve(url);
        }

        return d.promise;

      },
    };
  }
})();
