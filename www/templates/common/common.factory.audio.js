(function () {
  'use strict';

  angular
    .module('common')
    .factory('audio',audio)

    function audio($cordovaNativeAudio) {
      return {
        play : function (sound) {
          try{
            $cordovaNativeAudio.play(sound);
            console.log('sound played');
          }
          catch(error){
            console.log(error);
          }
        }
      };
    }
})();
