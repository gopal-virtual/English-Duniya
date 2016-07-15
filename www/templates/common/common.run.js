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
        $cordovaNativeAudio.preloadSimple('one_star', 'sound/one_star.mp3');
        $cordovaNativeAudio.preloadSimple('two_star', 'sound/two_star.mp3');
        $cordovaNativeAudio.preloadSimple('three_star', 'sound/three_star.mp3');
        $cordovaNativeAudio.preloadSimple('locked', 'sound/locked.mp3');
        $cordovaNativeAudio.preloadSimple('press', 'sound/press.mp3');
        //
        $cordovaNativeAudio.preloadComplex('background', 'sound/background.wav',0.4,1,0,false, false);
        // $cordovaNativeAudio.preloadComplex('demo-1', 'sound/demo-1.mp3',1.0,0,0,false, false);
        // $cordovaNativeAudio.preloadComplex('demo-2', 'sound/demo-2.mp3',1.0,0,0,false, false);
        // $cordovaNativeAudio.preloadComplex('demo-3', 'sound/demo-3.mp3',1.0,0,0,false, false);
        // $cordovaNativeAudio.preloadComplex('demo-4', 'sound/demo-4.mp3',1.0,0,0,false, false);
        // $cordovaNativeAudio.preloadComplex('demo-quiz-1', 'sound/demo-quiz-1.mp3',1.0,0,0,false, false);
        // $cordovaNativeAudio.preloadComplex('demo-quiz-2', 'sound/demo-quiz-2.mp3',1.0,0,0,false, false);
        // $cordovaNativeAudio.preloadComplex('demo-quiz-3', 'sound/demo-quiz-3.mp3',1.0,0,0,false, false);
      }
      catch(error){
        console.log('native audio not supported');
      }


    });
  }

})();
