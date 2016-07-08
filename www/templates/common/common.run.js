(function(){
  'use strict';

  angular
    .module('common')
    .run(runConfig);

  function runConfig($ionicPlatform,$cordovaNativeAudio) {
    $ionicPlatform.ready(function() {
      try{
        $cordovaNativeAudio.preloadSimple('water-drop', 'sound/water-drop.mp3');
        $cordovaNativeAudio.preloadSimple('correct', 'sound/correct.mp3');
        $cordovaNativeAudio.preloadSimple('wrong', 'sound/wrong.wav');
        $cordovaNativeAudio.preloadComplex('background', 'sound/background.mp3',0.5,1,0,function(){});
        $cordovaNativeAudio.preloadSimple('one_star', 'sound/one_star.mp3');
        $cordovaNativeAudio.preloadSimple('two_star', 'sound/two_star.mp3');
        $cordovaNativeAudio.preloadSimple('three_star', 'sound/three_star.mp3');
        $cordovaNativeAudio.preloadSimple('locked', 'sound/locked.mp3');
        $cordovaNativeAudio.preloadSimple('press', 'sound/press.mp3');
        $cordovaNativeAudio.preloadSimple('demo-1', 'sound/demo-1.mp3');
      }
      catch(error){
        console.log('native audio not supported');
      }


    });
  }

})();
