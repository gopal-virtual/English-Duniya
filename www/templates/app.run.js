(function() {
  'use strict';
  angular
    .module('zaya')
    .run(runConfig);

  function runConfig($ionicPlatform, $rootScope, $timeout, $log, $state, $http, $cookies, Auth, $window, $cordovaFile, data) {

    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    //$http.defaults.headers.common['Access-Control-Request-Headers'] = 'accept, auth-token, content-type, xsrfcookiename';
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

      $log.debug('state changed ', toState.name);
      $log.debug(Auth.isAuthorised(), Auth.isVerified(), Auth.hasProfile())
        //if not authenticated, redirect to login page
      if (!Auth.isAuthorised() && toState.name != 'auth.signin' && toState.name != 'auth.signup' && toState.name != 'auth.forgot') {
        $log.debug("You are not authorized");
        event.preventDefault();
        $state.go('auth.signin');
      }

      // if authenticated but not verified clear localstorage and redirect to login
      if (Auth.isAuthorised() && !Auth.isVerified() && toState.name != 'auth.verify.phone' && toState.name != 'auth.forgot_verify_otp' && toState.name != 'auth.change_password') {
        $log.debug("User account not verified");
        event.preventDefault();
        localStorage.clear();
        $state.go('auth.signin');
      }



      //if authenticated and verified but has no profile, redirect to user.personalise
      if (Auth.isAuthorised() && Auth.isVerified() && !Auth.hasProfile() && (toState.name != 'user.personalise')) {
        $log.debug("Account authorised and verfified , profile not complete");
        event.preventDefault();
        $state.go('user.personalise');
      }
      //if authenticated, verified and has profile, redirect to userpage

      if (Auth.isAuthorised() && Auth.isVerified() && Auth.hasProfile() && (toState.name == 'auth.signin' || toState.name == 'auth.signup' || toState.name == 'intro' || toState.name == 'auth.verify.phone' || toState.name == 'auth.forgot' || toState.name == 'auth.change_password' || toState.name == 'auth.forgot_verify_otp' || toState.name == 'user.personalise')) {
        $log.debug("Account authorised , verififed and profile completed");
        event.preventDefault();
        $state.go('map.navigate');
      }
      // block access to quiz summary page if there is no quiz data
      if (toState.name == 'quiz.questions' && !toParams.quiz) {
        $log.debug("Quiz : No quiz data present");
        event.preventDefault();
        $state.go('map.navigate');
      }
      if (toState.name == 'quiz.start' && !toParams.quiz) {
        $log.debug("Quiz summary page cannot be accessed : No quiz data present");
        event.preventDefault();
        $state.go('map.navigate');
      }
      if (toState.name == 'quiz.summary' && !toParams.report) {
        $log.debug("Quiz summary page cannot be accessed : No quiz data present");
        event.preventDefault();
        $state.go('map.navigate');
      }
      if (toState.name == 'quiz.practice.summary' && !toParams.report) {
        $log.debug("Practice summary page cannot be accessed : No quiz data present");
        // event.preventDefault();
        // $state.go('map.navigate');
      }
      // block content state
      if (toState.name == 'content.video' && !toParams.video) {
        $log.debug("Video value is not present");
        event.preventDefault();
        $state.go('map.navigate');
      }

      if (toState.name == 'auth.verify.phone') {
        $log.debug("verify");
        $ionicPlatform.ready(function() {
          if (SMS) SMS.startWatch(function() {
            $log.debug('watching', 'watching started');
          }, function() {
            $log.debug('failed to start watching');
          });
        })

      }

      // if (Auth.isAuthorised() && Auth.isVerified() && Auth.hasProfile()) {
      //   data.putUserifNotExist({
      //     'userId': Auth.getProfileId()
      //   })
      //   .then(function(data){
      //     $log.debug("putUserifNotExist complete",data)
      //   })
      //   .catch(function(error){
      //     $log.debug("putUserifNotExist error",error)
      //   })
      //   if (localStorage.getItem('reportSyncComplete') !== 'true') {
      //     $log.debug("here")
      //     // data.startReportSyncing({'userId':Auth.getProfileId()});
      //   }
      // }
    });
    $ionicPlatform.ready(function() {

      data.createIfNotExistsLessonDB()
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
        if (Auth.isAuthorised() && Auth.isVerified() && Auth.hasProfile()) {
          data.startReportSyncing({
            'userId': Auth.getProfileId()
          })
        }
      })
      localStorage.setItem('reportSync',JSON.stringify({'progress':false,'updated':false}))
      if (window.Connection) {
        if (navigator.connection.type == Connection.NONE) {
          $ionicPopup.confirm({
              title: "Internet Disconnected",
              content: "The internet is disconnected on your device."
            })
            .then(function(result) {
              if (!result) {
                ionic.Platform.exitApp();
              }
            });
        } else {
          $log.debug('App ready : online;');

        }
      }
      if (Auth.isAuthorised() && Auth.isVerified() && Auth.hasProfile()) {
        data.startReportSyncing({
          'userId': Auth.getProfileId()
        })
      }
      //   if (window.StatusBar) {
      //     StatusBar.hide();
      //   }
      // detect app activity
      if (navigator.splashscreen) {
        navigator.splashscreen.hide();
      }

      document.addEventListener('onSMSArrive', function(e) {
        $rootScope.$broadcast('smsArrived', e);
        $log.debug(e);
      });

      //   document.addEventListener("pause", function(){
      //     $log.debug("paused");
      //     try{
      //       var video = document.querySelector('video');
      //       if(!video.paused){
      //         video.pause();
      //       }
      //     }
      //     catch(e){
      //       $log.debug(e);
      //     }
      //   }, false);
      // sms watch
      //   try{
      //     SMS && SMS.startWatch(function () {
      //       $log.debug('start watching sms');
      //     }, function () {
      //       $log.debug('Failed to start sms watching');
      //     });
      //   }
      //   catch(error){
      //     $log.debug(error);
      //   }

      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    })

  }
})();
