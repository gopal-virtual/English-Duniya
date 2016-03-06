(function () {
  'use strict';

  angular
    .module('zaya')
    .factory('audio',audio)

    function audio($cordovaNativeAudio) {
      return {
        play : function (sound) {
          $cordovaNativeAudio.play(sound);
        }
      };
    }
})();
