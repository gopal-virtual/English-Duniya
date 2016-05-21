(function() {
  'use strict';

  angular
    .module('common')
    .factory('audio', audio)

  function audio($cordovaNativeAudio) {
    return {
      play: function(sound) {
        try {
          $cordovaNativeAudio.play(sound);
          console.log('sound played');
        } catch (error) {
          console.log(error);
        }
      },
      loop: function(sound) {
        try {
          $cordovaNativeAudio.loop(sound);
          console.log('sound looping');
        } catch (error) {
          console.log(error);
        }
      },
      stop: function(sound) {
        try {
          $cordovaNativeAudio.stop(sound);
          console.log('sound stopped');
        } catch (error) {
          console.log(error);
        }
      }
    };
  }
})();
