(function() {
  'use strict';
  angular
    .module('zaya')
    .run(runConfig);

  function runConfig($ionicPlatform, $rootScope,  $log, $state, $http, $cookies, Auth,  data, audio,  analytics, network, User, queue) {


    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    //$http.defaults.headers.common['Access-Control-Request-Headers'] = 'accept, auth-token, content-type, xsrfcookiename';
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

        //if not authenticated, redirect to login page
      // if (!Auth.isAuthorised() && toState.name != 'auth.signin' && toState.name != 'auth.signup' && toState.name != 'auth.forgot') {
      //   ;
      //   event.preventDefault();
      //   $state.go('auth.signup');
      // }
    //   if (!Auth.isAuthorised() && network.isOnline() && toState.name != 'auth.autologin') {
    //     event.preventDefault();
    //     $state.go('auth.autologin');
    //   }
    //   if (!Auth.isAuthorised() && !network.isOnline() && toState.name != 'user.nointernet') {
    //     event.preventDefault();
    //     $state.go('user.nointernet');
    //   }
      // if authenticated but not verified clear localstorage and redirect to login
    //   if (Auth.isAuthorised() && !Auth.isVerified() && toState.name != 'auth.verify.phone' && toState.name != 'auth.forgot_verify_otp' && toState.name != 'auth.change_password') {
    //     ;
    //     event.preventDefault();
    //     Auth.cleanLocalStorage();
    //     $state.go('auth.signup');
    //   }
      //if authenticated and verified but has no profile, redirect to user.personalise
      // if (Auth.isAuthorised() && !Auth.hasProfile() && (toState.name != 'user.personalise')) {
      //   event.preventDefault();
      //   $state.go('user.personalise');
      // }
      //if authenticated, verified and has profile, redirect to userpage

      if (Auth.isAuthorised() && Auth.hasProfile() && (toState.name == 'auth.signin' || toState.name == 'auth.signup' || toState.name == 'intro' || toState.name == 'auth.verify.phone' || toState.name == 'auth.forgot' || toState.name == 'auth.change_password' || toState.name == 'auth.forgot_verify_otp' || toState.name == 'user.personalise')) {
        event.preventDefault();
        $state.go('map.navigate');
      }
      // block access to quiz summary page if there is no quiz data
      if (toState.name == 'quiz.questions' && !toParams.quiz) {
        event.preventDefault();
        $state.go('map.navigate');
      }
      if (toState.name == 'quiz.start' && !toParams.quiz) {
        event.preventDefault();
        $state.go('map.navigate');
      }
      if (toState.name == 'quiz.summary' && !toParams.report) {
        event.preventDefault();
        $state.go('map.navigate');
      }
      if (toState.name == 'quiz.practice.summary' && !toParams.report) {
        // event.preventDefault();
        // $state.go('map.navigate');
      }
      // block content state
      if (toState.name == 'content.video' && !toParams.video) {
        event.preventDefault();
        $state.go('map.navigate');
      }

      if (toState.name == 'auth.verify.phone') {
        // $ionicPlatform.ready(function() {
        //   if (SMS) SMS.startWatch(function() {
        //   }, function() {
        //   });
        // })

      }

    });
    $ionicPlatform.ready(function() {
        // analytics.log(
        //     {
        //         name : 'APP',
        //         type : 'START',
        //         id : null
        //     },
        //     {
        //         time : new Date()
        //     },
        //   (User.getActiveProfileSync() && User.getActiveProfileSync()._id ),
        //   User.user.getIdSync()
        //
        //
        // );
      queue.startSync()

      $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
          // data.queueSync()
      });

      if (Auth.isAuthorised() && Auth.hasProfile()) {
        data.createLessonDBIfNotExists()
      }
      if (navigator.splashscreen) {
        navigator.splashscreen.hide();
      }
      // document.addEventListener('onSMSArrive', function(e){
      //   $rootScope.$broadcast('smsArrived', e);
      // });

        document.addEventListener("pause", function(){
          audio.stop('background');
        }, false);



      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)

    });
    // $ionicPlatform.on('resume', function(){
    //      analytics.log(
    //         {
    //             name : 'APP',
    //             type : 'START',
    //             id : null
    //         },
    //         {
    //             time : new Date()
    //         },
    //        (User.getActiveProfileSync() && User.getActiveProfileSync()._id ),
    //        User.user.getIdSync()
    //
    //
    //
    //      )
    // });
    // $ionicPlatform.on('pause', function(){
    //     angular.element("#audioplayer")[0].pause();
    //      analytics.log(
    //         {
    //             name : 'APP',
    //             type : 'END',
    //             id : null
    //         },
    //         {
    //             time : new Date()
    //         },
    //        (User.getActiveProfileSync() && User.getActiveProfileSync()._id ),
    //        User.user.getIdSync()
    //
    //     )
    // });
  }
})();
