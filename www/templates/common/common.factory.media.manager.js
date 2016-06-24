(function() {
  'use strict';

  angular
    .module('common')
    .factory('mediaManager', mediaManager)

  function mediaManager($cordovaNativeAudio, $log, $cordovaFile, $cordovaFileTransfer, $q,CONSTANT) {
    return {

      getPath: function(url) {
         if(url){
             var filename = url.split('/').pop();
             return cordova.file.dataDirectory + 'media/' + filename;
         }
        // var filename = url.split('/').pop();
        // try{
        //
        // $cordovaFile.checkFile(cordova.file.dataDirectory, 'media/' + filename)
        //   .then(function(success) {
        //     target = cordova.file.dataDirectory + 'media/' + filename;
        //   }, function(error) {
        //     target = CONSTANT.RESOURCE_SERVER + url;
        //   })
        //   .catch(function(error){
        //     target = CONSTANT.RESOURCE_SERVER + url;
        //
        //   }).finally(function(){
        //     return target;
        //   })
        //   ;
        // }catch(e){
        //   return CONSTANT.RESOURCE_SERVER + url;
        // }

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
                $log.debug("Downloaded " + target)
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
