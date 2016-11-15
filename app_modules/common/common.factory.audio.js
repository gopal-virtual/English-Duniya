(function() {
  'use strict';

  angular
    .module('common')
    .factory('audio', audio)

  function audio($cordovaNativeAudio, $log, ngAudio) {

    return {
      // 'background' : ngAudio.load("sound/background.wav"),
      'demo-1': ngAudio.load('sound/demo-1.mp3'),
      'demo-2': ngAudio.load('sound/demo-2.mp3'),
      'demo-3': ngAudio.load('sound/demo-3.mp3'),
      'demo-4': ngAudio.load('sound/demo-4.mp3'),
      'demo-quiz-1': ngAudio.load('sound/demo-quiz-1.mp3'),
      'demo-quiz-2': ngAudio.load('sound/demo-quiz-2.mp3'),
      'demo-quiz-3': ngAudio.load('sound/demo-quiz-3.mp3'),
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
          $cordovaNativeAudio.play(sound);
        } catch (error) {
          $log.warn(sound+" can't be played. Ionic plugins only work on phone")
        }
      },
      loop: function(sound) {
        try {
          $cordovaNativeAudio.loop(sound);
          ;
        } catch (error) {
          ;
        }
      },
      stop: function(sound) {

        try {
          $cordovaNativeAudio.stop(sound);
        } catch (error) {
          ;
        }
      },
      unload: function(sound) {
        try {
          $cordovaNativeAudio.unload(sound);
          ;
        } catch (error) {
          ;
        }
      },
      preloadComplex: function(sound) {
        try {
          $cordovaNativeAudio.preloadComplex(sound, 'sound/' + sound + '.mp3');
          ;
        } catch (error) {
          ;
        }
      },
      preloadSimple: function(sound) {
        ;
        try {
          $cordovaNativeAudio.preloadSimple(sound, 'sound/' + sound + '.mp3');
          ;
        } catch (error) {
          ;
        }
      },
      setVolume: function(sound, volume) {

        try{
          window.plugins.NativeAudio.setVolumeForComplexAsset(sound, volume, function(s){

          }, function(e){

          });
        }
        catch(e){

        }
      },
      stopAll: function(){

      }
      ,
      player: {
        play : playSound,// replaces current sound and removes next sound
        stop: stopSound,
        isPaused: isPaused,
        removeCallback: removeCallback,
        resume: resume
      }



    };

    function playSound(url){
      angular.element("#audioplayer")[0].onended = null;
      angular.element("#audioplayer")[0].pause();
      if(url){
        angular.element("#audioSource")[0].src = url;
        angular.element("#audioplayer")[0].load();
        angular.element("#audioplayer")[0].play();

      }
    }
    function resume(){
      angular.element("#audioplayer")[0].play();
    }
    function stopSound(){
      angular.element("#audioplayer")[0].onended = null;
      angular.element("#audioplayer")[0].pause();
    }
    function isPaused(){
      return angular.element("#audioplayer")[0].paused;
    }
    function removeCallback() {
      angular.element("#audioplayer")[0].onended = null;
    }

  }
})();
