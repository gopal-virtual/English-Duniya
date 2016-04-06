(function(){
  'use strict';

  angular
    .module('zaya')
    .run(runConfig);

  function runConfig($ionicPlatform, $rootScope, $timeout, $log, $state,$http,$cookies, Auth) {
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
        // alternative to phaser destroy() ; phaser destroy doesn't remove canvas element
        if(toState.name!='user.main.playlist'){
          try {
            var canvas = document.querySelector('#map_canvas');
            canvas.parentNode.removeChild(canvas);
            $log.debug("Canvas Removed");
          }
          catch(e){}
        }
        //if not authenticated, redirect to login page
        if(!Auth.isAuthorised() && toState.name!='auth.signin' && toState.name!='auth.signup' && toState.name!='auth.forgot'){
          $log.debug("You are not authorized");
          event.preventDefault();
          $state.go('auth.signin');
        }
        //if authenticated, redirect to userpage
        if(Auth.isAuthorised() && (toState.name=='auth.signin' || toState.name=='auth.signup' || toState.name=='intro')){
          $log.debug("You are authorized");
          event.preventDefault();
          $state.go('user.main.home');
        }
        // block access to quiz summary page if there is no quiz data
        if(toState.name == 'quiz.summary' && !toParams.quizSummary){
            $log.debug("Quiz summary page cannot be accessed : No quiz data present");
            event.preventDefault();
        }

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
