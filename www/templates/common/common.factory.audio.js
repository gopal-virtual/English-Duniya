(function() {
  'use strict';

  angular
    .module('common')
    .factory('audio', audio)

  function audio($cordovaNativeAudio, $log) {
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
      },
      unload: function(sound) {
        try {
          $cordovaNativeAudio.unload(sound);
          console.log('sound unloaded');
        } catch (error) {
          console.log(error);
        }
      },
      preloadComplex : function(sound){
        try {
          $cordovaNativeAudio.preloadComplex(sound, 'sound/'+sound+'.mp3');
          console.log('sound preloaded complex');
        } catch (error) {
          console.log(error);
        }
      },
      preloadSimple : function(sound){
        $log.debug('sound getting loaded');
        try {
          $cordovaNativeAudio.preloadSimple(sound, 'sound/'+sound+'.mp3');
          $log.debug('sound preloaded simple');
        } catch (error) {
          console.log(error);
        }
      }
    };
  }
})();
