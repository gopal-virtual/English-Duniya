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
        $cordovaNativeAudio.preloadSimple('wrong', 'sound/wrong.mp3');
        $cordovaNativeAudio.preloadSimple('background', 'sound/background.mp3');
      }
      catch(error){
        console.log('native audio not supported');
      }


    });
  }

})();
