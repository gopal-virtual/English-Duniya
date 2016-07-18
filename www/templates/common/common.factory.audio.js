(function() {
  'use strict';

  angular
    .module('common')
    .factory('audio', audio)

  function audio($cordovaNativeAudio, $log, ngAudio) {

    return {
        // 'background' : ngAudio.load("sound/background.wav"),
        'demo-1' : ngAudio.load('sound/demo-1.mp3'),
        'demo-2' : ngAudio.load('sound/demo-2.mp3'),
        'demo-3' : ngAudio.load('sound/demo-3.mp3'),
        'demo-4' : ngAudio.load('sound/demo-4.mp3'),
        'demo-quiz-1' : ngAudio.load('sound/demo-quiz-1.mp3'),
        'demo-quiz-2' : ngAudio.load('sound/demo-quiz-2.mp3'),
        'demo-quiz-3' : ngAudio.load('sound/demo-quiz-3.mp3'),
        // 'water-drop': ngAudio.load( 'sound/water-drop.mp3'),
        // 'correct': ngAudio.load( 'sound/correct.mp3'),
        // 'wrong': ngAudio.load( 'sound/wrong.wav'),
        // 'one_star': ngAudio.load( 'sound/one_star.mp3'),
        // 'two_star': ngAudio.load( 'sound/two_star.mp3'),
        // 'three_star': ngAudio.load( 'sound/three_star.mp3'),
        // 'locked': ngAudio.load( 'sound/locked.mp3'),
        // 'press': ngAudio.load( 'sound/press.mp3'),
      play: function(sound) {
        try {
          $log.debug("audio play",sound)

          $cordovaNativeAudio.play(sound);
          $log.debug('sound played');
        } catch (error) {
          $log.debug(error);
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
        $log.debug("Stop triggered",sound)
        try {
          $cordovaNativeAudio.stop(sound);
        } catch (error) {
          $log.debug(error);
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
