(function () {
  'use strict';

  angular
    .module('common')
    .factory('mediaManager', mediaManager);

  function mediaManager( $log, $cordovaFile, $cordovaFileTransfer, $q, CONSTANT, network) {

    var mediaManager = {};

    mediaManager.getPath = getPath;
    mediaManager.downloadIfNotExists = downloadIfNotExists;
    mediaManager.bundledMedia = CONSTANT.DIAGNOSIS_MEDIA;


    function getFileNameFromURl(url) {
      var a = url.split('/');
      return a.join('/').substr(1);
    }

    function getFileNameFromURlPatch(url) {
      return url.split('/')[url.split('/').length-2]+'-'+url.split('/')[url.split('/').length-1];
    }

    function isBundled(filename) {

      if(CONSTANT.BUNDLED || mediaManager.bundledMedia.indexOf('/'+filename) >= 0){
        $log.debug("file is bundled",CONSTANT.BUNDLED,mediaManager.bundledMedia.indexOf('/'+filename) >= 0);
      return $q.when('bundled/'+filename);
      }
      else{
      return $q.reject();
      }
    }

    function isBundledPatch(filenamePatch){
      var d = $q.defer();
      var url = 'bundled/' + filenamePatch;
      var request = new XMLHttpRequest();
      request.open('HEAD', url, true);
      request.onload = function(e) {
        if (request.readyState === 4) {
          if (request.status === 200) {
            d.resolve('bundled/'+filenamePatch);
          } else {
            d.reject(false);
          }
        }
      };
      request.onerror = function(e) {
        d.reject(false);
      };
      request.send(null);

      return d.promise;
    }

    function isDownloaded(filename){
      try{
      return $cordovaFile.checkFile(cordova.file.dataDirectory,filename).then(function (success) {
        return $q.when(success.nativeURL);
      }, function (error) {
          return $q.reject()
      });
       
      }
      catch(e){
        return $q.reject();
      }
    }

    function isDownloadedPatch(filenamePatch) {
      try{
      return $cordovaFile.checkFile(cordova.file.dataDirectory,'media/'+filenamePatch).then(function (success) {
        return $q.when(success.nativeURL);
      }, function (error) {
          return $q.reject()
      });
      }
      catch(e){
        return $q.reject();
      }
    }

    function isAvailableOffline(url){
        $log.debug("downlaodifnotexists",url)

      var filename = getFileNameFromURl(url);
      var filenamePatch = getFileNameFromURlPatch(url);
      return isBundled(filename)
      .catch(function(){
        return isBundledPatch(filenamePatch);
      })
      .catch(function(){
        return isDownloaded(filename);
      })
      .catch(function(){
        return isDownloadedPatch(filenamePatch);
      });

    }


    function getPath(url) {
        return isAvailableOffline(url)
      .then(function(response){
        return $q.when(response)  
      })
      .catch(function(){
        return $q.reject(CONSTANT.RESOURCE_SERVER + url);
      });

    }

    function downloadFile(url){
      try{
        var filename = getFileNameFromURl(url);
      var target = cordova.file.dataDirectory + filename;
      
        $log.debug("source is",CONSTANT.RESOURCE_SERVER+url,"target is",target);
      return $cordovaFileTransfer.download(CONSTANT.RESOURCE_SERVER+url,target).then(
        function(){
          $log.debug("cordovafiletransfer returns ",target)
          return $q.when(target);        
      }, function(err){
          return $q.reject({ 
                "error": true,
                "message": err.code? CONSTANT.ERROR_MESSAGES['CORDOVA_FILE_TRANSFER'][err.code]: CONSTANT.ERROR_MESSAGES['DEFAULT_FILE_ERROR']
          });
      });
      }
      catch(err){
        return $q.reject();
      }
    }
   
    function downloadIfNotExists(url) {
        $log.debug("downlaodifnotexists",url)
      return isAvailableOffline(url)
      .catch(function(){
        return network.isOnline()?downloadFile(url):$q.reject({"error": true,"message": CONSTANT.ERROR_MESSAGES['OFFLINE']['DEFAULT']});
      }).then(function(result){
        $log.debug("downloadifnotexists success",result)
        return $q.when(result);
      })

      

    }

    return mediaManager;
  }
})();
