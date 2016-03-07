(function () {
  'use strict';

  angular
    .module('zaya')
    .factory('audio',audio)

    function audio($cordovaNativeAudio) {
      return {
        play : function (sound) {
          try{
            $cordovaNativeAudio.play(sound);
          }
          catch(error){
            console.log(error);
          }
        }
      };
    }
})();
