(function() {
  'use strict';
  angular
    .module('zaya')
    .run(runConfig);

  function runConfig($ionicPlatform, $rootScope,  $log, $state, $http, $cookies, Auth,  data, audio,  analytics, network, User, queue, content, Raven, device,pouchDB, $ionicLoading, CONSTANT) {


    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    $ionicPlatform.registerBackButtonAction(function(event){
      event.preventDefault();
      // event.stopPropagation();
      $log.warn("pressed hardware back button");
      $rootScope.$broadcast("backButton");
    },510)
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

      // if (Auth.isAuthorised() && Auth.hasProfile() && (toState.name == 'auth.signin' || toState.name == 'auth.signup' || toState.name == 'intro' || toState.name == 'auth.verify.phone' || toState.name == 'auth.forgot' || toState.name == 'auth.change_password' || toState.name == 'auth.forgot_verify_otp' || toState.name == 'user.personalise')) {
      //   event.preventDefault();
      //   $state.go('map.navigate');
      // }
      // block access to quiz summary page if there is no quiz data
//
      $log.debug("State change",toState.name)

      if(localStorage.version !== '0.1.8') {
        $log.debug("Local storage !== 0.1.8")

        new PouchDB('lessonsDB').erase();
        localStorage.setItem('version', '0.1.8');

      }
        if(network.isOnline() && !User.getActiveProfileSync()){
          $ionicLoading.show({
          });
          $log.debug("Ionic loading show")

          event.preventDefault();
          content.createOrUpdateLessonDB().then(function () {
            User.checkIfProfileOnline().then(function(){
              $ionicLoading.hide();
              $log.debug("Ionic loading hide, go to map navigate")

              $state.go('map.navigate');
            })
          });
        }
      else{
        if(toState.name !== 'user.personalise' && localStorage.getItem('profile') === null ){
          $log.debug("toState.name !== 'user.personalise' && localStorage.getItem('profile') === null ")

          event.preventDefault();

          $state.go('user.personalise');
        }
        if(toState.name !== 'user.personalise' && localStorage.getItem('profile') !== null && JSON.parse(localStorage.getItem(('profile')))._id === undefined){
          $log.debug("toState.name !== 'user.personalise' && localStorage.getItem('profile') !== null && JSON.parse(localStorage.getItem(('profile')))._id === undefined");
          event.preventDefault();

          var user = {
            name : JSON.parse(localStorage.getItem(('profile'))).first_name,
            grade : JSON.parse(localStorage.getItem(('profile'))).grade,
            gender :JSON.parse(localStorage.getItem(('profile'))).gender
          };
          $log.debug("patching profile");
          User.profile.patch(user,JSON.parse(localStorage.getItem(('profile'))).id).then(function(response){
            $log.debug("patched profile");

            $state.go('map.navigate');
          });
        }
      }




      if (toState.name == 'quiz.questions' && toParams.type=='practice' && !toParams.quiz) {
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
        event.preventDefault();
        $state.go('map.navigate');
      }
      // block content state
      if (toState.name == 'content.video' && !toParams.video) {
        event.preventDefault();
        $state.go('map.navigate');
      }

      // if (toState.name == 'auth.verify.phone') {
        // $ionicPlatform.ready(function() {
        //   if (SMS) SMS.startWatch(function() {
        //   }, function() {
        //   });
        // })

      // }

    });
    $ionicPlatform.ready(function() {
      // $ionicLoading.show()
      if(localStorage.profile && localStorage.profile._id){
        Raven.setUserContext({
          device_id: device.uuid,
          user: localStorage.profile._id
        })
      }

        analytics.log(
            {
                name : 'APP',
                type : 'START',
                id : null
            },
            {
                time : new Date()
            }
        );
      network.isOnline() && queue.startSync();
      // User.checkIfProfileOnline();

      $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
          // data.queueSync()

        queue.startSync()

      });
      // if (Auth.isAuthorised() && Auth.hasProfile()) {
      //   data.createLessonDBIfNotExists()
      // }
      PouchDB.replicate(CONSTANT.LESSONS_DB_SERVER,'lessonsDB',{live: true,
        retry: true}).on('change', function (info) {
        $log.debug("Change in pouch",info);
        // $ionicLoading.show({template:'Change in pouch'})
      }).on('paused', function (err) {
        $log.debug("paused",err)
        $ionicLoading.hide();
        // replication paused (e.g. replication up to date, user went offline)
      }).on('active', function (a) {
        $log.debug("Active",a)
        // $ionicLoading.show({template:'Change in pouch'});
        // replicate resumed (e.g. new changes replicating, user went back online)
      }).on('denied', function (err) {
        $ionicLoading.hide();
        // a document failed to replicate (e.g. due to permissions)
      }).on('complete', function (info) {
        $ionicLoading.hide();
        // handle complete
      }).on('error', function (err) {
        $ionicLoading.hide();
        // handle error
      });
      if (navigator.splashscreen) {
        navigator.splashscreen.hide();
      }
      // document.addEventListener('onSMSArrive', function(e){
      //   $rootScope.$broadcast('smsArrived', e);
      // });

        document.addEventListener("pause", function(){
          $log.debug("The app is paused");
          audio.stop('background');
          audio.player.stop();
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
    $ionicPlatform.on('resume', function(){
      $rootScope.$broadcast('appResume');
      $log.debug("Current state",$state.current)
      if($state.current.name === 'content.video'){
        // angular.element("#audioplayer")[0].play();
      }
         analytics.log(
            {
                name : 'APP',
                type : 'START',
                id : null
            },
            {
                time : new Date()
            }
         )
    });
    $ionicPlatform.on('pause', function(){
      $log.debug("paused")
        angular.element("#audioplayer")[0].pause();
         analytics.log(
            {
                name : 'APP',
                type : 'END',
                id : null
            },
            {
                time : new Date()
            }
         )
    });
  }
})();
