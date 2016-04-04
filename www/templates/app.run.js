(function(){
  'use strict';

  angular
    .module('zaya')
    .run(runConfig);

  function runConfig($ionicPlatform,$rootScope, $timeout) {
    $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
        if(toState.name!='user.main.playlist'){
          try {
            var canvas = document.querySelector('#map_canvas');
            canvas.parentNode.removeChild(canvas);
          }
          catch(e){

          }
        }
        //if not authenticated, redirect to login page
        // if(!Auth.isAuthorised() && toState.name!='authenticate.signin' && toState.name!='authenticate.signup' && toState.name!='authenticate.recover'){
        //   event.preventDefault();
        //   $state.go('authenticate.signin');
        // }
        //if authenticated, redirect to userpage
        // if(Auth.isAuthorised() && (toState.name=='authenticate.signin' || toState.name=='authenticate.signup')){
        //   event.preventDefault();
        //   $state.go('view.user');
        // }
        //
        // if(toState.name == 'view.quiz.summary' && !toParams.quizSummary){
        //     event.preventDefault();
        // }

    })
    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  }

})();
