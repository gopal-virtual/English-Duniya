(function () {
  'use strict';

  angular
    .module('common')
    .factory('mediaManager', mediaManager);

  function mediaManager( $log, $cordovaFile, $cordovaFileTransfer, $q, CONSTANT, network) {

    var mediaManager = {};

    mediaManager.getPath = getPath;
    mediaManager.downloadIfNotExists = downloadIfNotExists;
    mediaManager.isBundled = isBundled;
    mediaManager.getFileNameFromURl = getFileNameFromURl;
    mediaManager.getFileNameFromURlPatched = getFileNameFromURlPatched;
    mediaManager.bundledMedia = CONSTANT.DIAGNOSIS_MEDIA;
    function getFileNameFromURl(url) {
      var a = url.split('/');
      // a.splice(0,3);
      return a.join('/').substr(1);
      // return url.split('/')[url.split('/').length - 2] + '-' + url.split('/')[url.split('/').length - 1];
    }



    function getFileNameFromURlPatched(url) {
      return url.split('/')[url.split('/').length - 1];
    }

    function isBundled(filename) {

      var d = $q.defer();
      $log.debug("Is Bundled",filename,CONSTANT.BUNDLED ,mediaManager.bundledMedia.indexOf('/'+filename))
      d.resolve(CONSTANT.BUNDLED || mediaManager.bundledMedia.indexOf('/'+filename) >= 0)
      //
      // if(){
      //   d.resolve(true);
      // }
      // else if(){
      //   d.resolve(true);
      // }
      // else{
      //   d.resolve(false);
      // }
      // else {
      //   var url = 'bundled/' + filename;
      //   var request = new XMLHttpRequest();
      //   request.open('HEAD', url, true);
      //   request.onload = function(e) {
      //
      //     if (request.readyState === 4) {
      //       if (request.status === 200) {
      //
      //
      //         d.resolve(true);
      //       } else {
      //
      //
      //         d.resolve(false);
      //       }
      //     }
      //   };
      //   request.onerror = function(e) {
      //
      //
      //     d.resolve(false);
      //   };
      //   request.send(null);
      // }


      return d.promise;
    }

    function getPath(url) {
      var filename = mediaManager.getFileNameFromURl(url);
      $log.debug("URL get path",url)
      var d = $q.defer();
      mediaManager.isBundled(filename).then(function (result) {
        if (result) {
          d.resolve('bundled/' + filename);
        } else if (window.cordova) {
          $cordovaFile.checkFile(cordova.file.dataDirectory, filename)
            .then(function () {
              d.resolve(cordova.file.dataDirectory + filename)
            })
            .catch(function (e) {
              $log.debug("Resolving url 1",e,filename);
              d.resolve(CONSTANT.RESOURCE_SERVER + url)
            });
        }
        else {
          $log.debug("Resolving url 2");
          d.resolve(CONSTANT.RESOURCE_SERVER + url);
        }
      });

      return d.promise;
    }

    function downloadIfNotExists(url) {
      var d = $q.defer();
      $log.debug("URL downloadIfNotExists",url)
      var filename = mediaManager.getFileNameFromURl(url);
      var target = cordova.file.dataDirectory  + filename;
      mediaManager.isBundled(filename).then(function (result) {
        if (result) {
          d.resolve('bundled/' + filename);
        } else if (window.cordova) {
          $log.debug("checking",filename);
          $cordovaFile.checkFile(cordova.file.dataDirectory,   filename)
            .then(function (result) {
              $log.debug("downloaded file found",+ filename,target);
              d.resolve(target);
            })
            .catch(function (e) {
              if (e.message === 'NOT_FOUND_ERR') {
                if (!network.isOnline()) {
                  d.reject({
                    "error": true,
                    "message": "offline"
                  });
                } else {
                  $cordovaFileTransfer.download(CONSTANT.RESOURCE_SERVER+url, target)
                    .then(function (result) {
                      d.resolve(target);
                    }, function (err) {
                      $log.debug("E1",err);
                      d.reject({
                        "error": true,
                        "message": "no-media"
                      });
                    }, function (progress) {
                    });
                }
              } else {
                $log.debug("E2",e);

                d.reject({
                  "error": true,
                  "message": "no-media"
                });
              }
            })
        } else {
          $log.debug("Resolving url 3");
          d.resolve(url);
        }
      });

      return d.promise;

    }

    return mediaManager;
  }
})();
