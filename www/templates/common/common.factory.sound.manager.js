(function() {
  'use strict';

  angular
    .module('common')
    .factory('soundManager', soundManager)

  function soundManager($cordovaNativeAudio, $log, $cordovaFile, $cordovaFileTransfer, $q) {
    return {
    
    };
  }
})();
