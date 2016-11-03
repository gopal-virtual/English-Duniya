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
    mediaManager.getFileNameFromURlPatched = getFileNameFromURlPatched;
    function getFileNameFromURl(url){
      return url.split('/')[url.split('/').length-2]+'-'+url.split('/')[url.split('/').length-1];
    }
    function getFileNameFromURlPatched(url){
      return url.split('/')[url.split('/').length-1];
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
      var filename_patch = mediaManager.getFileNameFromURlPatched(url)

      var target = null;

      var d = $q.defer();
      try {

          var target_patch = cordova.file.dataDirectory + 'media/' + filename_patch;
        mediaManager.isBundled(filename).then(function(result) {


          if (result) {

            d.resolve('bundled/' + filename);
          } else {
            try{


              mediaManager.isBundled(filename_patch).then(function(result){
               if(result){


                 d.resolve('bundled/'+filename_patch);
               }
                else{


                 $cordovaFile.checkFile(cordova.file.dataDirectory, 'media/' + filename)
                   .then(function(success) {



                     d.resolve(cordova.file.dataDirectory + 'media/' + filename)
                   })
                   .catch(function(error) {


                     $cordovaFile.checkFile(cordova.file.dataDirectory, 'media/' + filename_patch)
                       .then(function(){


                         d.resolve(cordova.file.dataDirectory+ 'media/' + filename_patch);
                       })
                       .catch(function(){


                         d.resolve(CONSTANT.RESOURCE_SERVER + url)
                       })
                   });
               }
              })
              ;


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
      var filename_patch = mediaManager.getFileNameFromURlPatched(url)
      try {
        var target = cordova.file.dataDirectory + 'media/' + filename;
        var target_patch = cordova.file.dataDirectory + 'media/' + filename_patch;


        mediaManager.isBundled(filename).then(function(result) {


          if (result) {


            d.resolve('bundled/' + filename);

          } else {


            mediaManager.isBundled(filename_patch).then(function(result) {
              if (result) {


                d.resolve('bundled/' + filename_patch);
              }
              else {


                $log.debug("downloadIfnot exists called 4", url, cordova.file.dataDirectory, 'media/' + filename);

                $cordovaFile.checkFile(cordova.file.dataDirectory, 'media/' + filename)

                  .then(function (result) {
                    $log.debug("downloadIfnot exists called 5", url, cordova.file.dataDirectory, 'media/' + filename);


                    d.resolve(target);
                  })
                  .catch(function (e) {
                    $log.debug("downloadIfnot exists called 5 fsil", url, cordova.file.dataDirectory, 'media/' + filename);
                    $log.debug("downloadIfnot exists called 5 patch init", url, cordova.file.dataDirectory, 'media/' + filename_patch);

                    $cordovaFile.checkFile(cordova.file.dataDirectory, 'media/' + filename_patch)
                      .then(function () {
                        $log.debug("downloadIfnot exists called 5 patch", url, cordova.file.dataDirectory, 'media/' + filename_patch);
                        d.resolve(target_patch);
                      })
                      .catch(function (e) {
                        $log.debug("downloadIfnot exists called 5 patch fail", url, cordova.file.dataDirectory, 'media/' + filename_patch);

                        if (e.message === 'NOT_FOUND_ERR') {
                          if (!network.isOnline()) {




                            d.reject({
                              "error": true,
                              "message": "offline"
                            });
                          } else {


$log.debug("downloading file",url,target)

                            $cordovaFileTransfer.download(url, target)
                              .then(function (result) {
                                  $log.debug("FILE DOWNLOADED",url,target)

                                d.resolve(target);
                              }, function (err) {

$log.debug("Error downloading",url,target,err)
                                d.reject("Error Downlaoding " + target);
                              }, function (progress) {
                                localStorage.setItem('progress', parseInt((progress.loaded / progress.total) * 100))
                              });
                          }

                        } else {


                          d.reject("Error Downlaoding " + target);
                        }
                      })


                  })
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
