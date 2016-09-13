(function() {
  'use strict';

  angular
    .module('common')
    .factory('mediaManager', mediaManager)

  function mediaManager($cordovaNativeAudio, $log, $cordovaFile, $cordovaFileTransfer, $q, CONSTANT, network) {

    var mediaManager = {};

    mediaManager.getPath = getPath;
    mediaManager.downloadIfNotExists = downloadIfNotExists;
    mediaManager.isBundled = isBundled;
    mediaManager.getFileNameFromURl = getFileNameFromURl;

    function getFileNameFromURl(url){
      return url.split('/')[url.split('/').length-2]+'-'+url.split('/')[url.split('/').length-1];
    }

    function isBundled(filename) {

      var d = $q.defer();
      var url = 'bundled/' + filename;
      var request = new XMLHttpRequest();
      request.open('HEAD', url, true);
      request.onload = function(e) {

        if (request.readyState === 4) {
          if (request.status === 200) {
            d.resolve(true);
          } else {
            d.resolve(false);
          }
        }
      };
      request.onerror = function(e) {
        d.resolve(false);
      };
      request.send(null);

      return d.promise;
    }

    function getPath(url) {
      var filename = mediaManager.getFileNameFromURl(url)

      var target = null;
      var d = $q.defer();
      try {

        mediaManager.isBundled(filename).then(function(result) {

          if (result) {

            d.resolve('bundled/' + filename);
          } else {
            try{
              $cordovaFile.checkFile(cordova.file.dataDirectory, 'media/' + filename)
                .then(function(success) {

                  d.resolve(cordova.file.dataDirectory + 'media/' + filename)
                })
                .catch(function(error) {

                  d.resolve(CONSTANT.RESOURCE_SERVER + url)
                });
            }
            catch (e) {

              d.resolve(CONSTANT.RESOURCE_SERVER + url);
            }

          }
        })

      } catch (e) {

        d.resolve(CONSTANT.RESOURCE_SERVER + url);
      }
      return d.promise;
    }

    function downloadIfNotExists(url) {
      var d = $q.defer();
      var filename = mediaManager.getFileNameFromURl(url)
      try {
        var target = cordova.file.dataDirectory + 'media/' + filename;

        mediaManager.isBundled(filename).then(function(result) {

          if (result) {

            d.resolve('bundled/' + filename);

          } else {

            $cordovaFile.checkFile(cordova.file.dataDirectory, 'media/' + filename)

              .then(function(result) {



                d.resolve(target);
              })
              .catch(function(e) {


                if (e.message === 'NOT_FOUND_ERR') {
                  if (!network.isOnline()) {


                    d.reject({
                      "error": true,
                      "message": "offline"
                    });
                  } else {


                    $cordovaFileTransfer.download(url, target)
                      .then(function(result) {
                        d.resolve(target);
                      }, function(err) {

                        d.reject("Error Downlaoding " + target);
                      }, function(progress) {
                        localStorage.setItem('progress', parseInt((progress.loaded / progress.total) * 100))
                      });
                  }

                } else {

                  d.reject("Error Downlaoding " + target);
                }
              })
          }
        })


      } catch (e) {

        d.resolve(url);
      }

      return d.promise;

    }

    return mediaManager;
  }
})();
