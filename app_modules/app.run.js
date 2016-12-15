(function() {
  'use strict';
  angular
    .module('zaya')
    .run(runConfig);

  function runConfig($ionicPlatform,
    $rootScope,
    $log,
    $state,
    $http,
    $cookies,
    Auth,
    data,
    audio,
    analytics,
    network,
    User,
    queue,
    content,
    Raven,
    device,
    $cordovaPushV5,
    $cordovaLocalNotification,
    CONSTANT,
    pouchDB,
    $ionicLoading,
    notification,
    $ionicPopup
  ) {
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    $ionicPlatform.registerBackButtonAction(function(event) {
      event.preventDefault();
      // event.stopPropagation();
      $log.warn("pressed hardware back button");
      $rootScope.$broadcast("backButton");
    }, 510);
    //$http.defaults.headers.common['Access-Control-Request-Headers'] = 'accept, auth-token, content-type, xsrfcookiename';
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if (localStorage.version !== CONSTANT.APP.VERSION) {
        $log.debug("Local storage !== ", CONSTANT.APP.VERSION);
        notification.db.load();
        new PouchDB('lessonsDB').erase();
        localStorage.setItem('version', CONSTANT.APP.VERSION);
        content.createOrUpdateLessonDB()
      } else {
        content.replicateLessonDB();
      }
      if (localStorage.first_time !== undefined) {
        User.startProfileSync();
      }
      $log.debug(toState.name !== 'user.personalise', !User.getActiveProfileSync());
      if (toState.name == 'map.navigate' && !User.getActiveProfileSync()) {
        event.preventDefault();
        $log.debug("Ionic loading show with hide on state change", localStorage.getItem('first_time') == undefined, network.isOnline());
        if (network.isOnline()) {
          $ionicLoading.show({
            hideOnStateChange: true
          });
          localStorage.setItem('first_time', 'no');
          User.checkIfProfileOnline().then(function() {
            $log.debug("Checked if profile online")
            localStorage.setItem('profiles_fetched', 'true');
            User.profile.getAll().then(function(profiles) {
              if (profiles.length == 0) {
                $log.debug("Going to user personalise");
                $state.go('user.personalise');
              } else {
                $state.go('user.chooseProfile', {
                  'profiles': profiles
                });
                $log.debug("CHECK 5")
                notification.online.set();
              }
            });
          });
        } else {
          $state.go('user.personalise');
        }
      }
      if (toState.name === 'user.personalise' && User.getActiveProfileSync()) {
        event.preventDefault();
        $state.go('map.navigate');
      }
      if (toState.name !== 'user.personalise' && localStorage.getItem('profile') !== null && JSON.parse(localStorage.getItem(('profile')))._id === undefined) {
        $log.debug("toState.name !== 'user.personalise' && localStorage.getItem('profile') !== null && JSON.parse(localStorage.getItem(('profile')))._id === undefined");
        event.preventDefault();
        var user = {
          name: JSON.parse(localStorage.getItem(('profile'))).first_name,
          grade: JSON.parse(localStorage.getItem(('profile'))).grade,
          gender: JSON.parse(localStorage.getItem(('profile'))).gender
        };
        $log.debug("patching profile");
        User.profile.patch(user, JSON.parse(localStorage.getItem(('profile'))).id).then(function(response) {
          $log.debug("patched profile");
          $state.go('map.navigate');
        });
      }
      // if(toState.name == 'litmus_result' && !toParams.average_level){
      //   event.preventDefault();
      //   $state.go('user.personalise')
      // }
      if (toState.name == 'content.vocabulary.intro' && !toParams.vocab_data) {
        event.preventDefault();
        $state.go('map.navigate');
      }
      if (toState.name == 'content.vocabulary.instruction' && !toParams.vocab_data) {
        event.preventDefault();
        $state.go('map.navigate');
      }
      if (toState.name == 'content.vocabulary.overview' && !toParams.vocab_data) {
        event.preventDefault();
        $state.go('map.navigate');
      }
      if (toState.name == 'content.vocabulary.card' && !toParams.vocab_data) {
        event.preventDefault();
        $state.go('map.navigate');
      }
      if (toState.name == 'quiz.questions' && toParams.type == 'practice' && !toParams.quiz) {
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
    });
    $ionicPlatform.ready(function() {
      $rootScope.inBackground = false;
      if (User.getActiveProfileSync()) {
        $log.debug("CHECK 2")
        notification.online.set();
      }
      $rootScope.$on('$cordovaPushV5:notificationReceived', function(event, data) {
        event.preventDefault();
        $log.warn("ROCK YOU", data);
        $log.warn("ROCK YOU2 event", event);
        notification.schedule({
          id: 'notif-online-1',
          text: data.message,
          title: data.title,
          icon: 'res://icon',
          smallIcon: 'res: //ic_stat_english_duniya'
        })
      });

      $rootScope.$on('$cordovaPushV5:errorOcurred', function(event, error){
        $log.error("Error occured online notification", event, error);
      })
      //
      $rootScope.mediaSyncStatus = {
        size: null,
        mediaToDownload: []
      };
      // $ionicLoading.show()
      // if (localStorage.profile && localStorage.profile._id) {
      Raven.setTagsContext({
        device_id: device.uuid,
        profile: User.getActiveProfileSync() && User.getActiveProfileSync()._id ? User.getActiveProfileSync()._id : 'na'
      });
      // }
      notification.cancelAll();
      analytics.log({
        name: 'APP',
        type: 'START',
        id: null
      }, {
        time: new Date()
      });
      network.isOnline() && queue.startSync();
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
        // data.queueSync()
        $log.debug("This app is online dude")
        queue.startSync();
        if (User.getActiveProfileSync()) {
          $log.debug("CHECK 1");
          notification.online.set();
        }
        if (localStorage.profiles_fetched === undefined) {
          $log.debug("User online fetching profiles now");
          User.checkIfProfileOnline().then(function() {
            localStorage.setItem('profiles_fetched', 'true');
          });
        }
      });
      $rootScope.$on('lowDiskSpace', function(event, networkState) {
        $ionicLoading.hide()
        $log.debug("Disk space full on app");
        $ionicPopup.alert({
          title: CONSTANT.ERROR_MESSAGES.LOW_DISK_SPACE.TITLE,
          template: CONSTANT.ERROR_MESSAGES.LOW_DISK_SPACE.MESSAGE
        }).then(function() {
          ionic.Platform.exitApp()
        });
      });
      if (navigator.splashscreen) {
        navigator.splashscreen.hide();
      }
      // document.addEventListener('onSMSArrive', function(e){
      //   $rootScope.$broadcast('smsArrived', e);
      // });
      document.addEventListener("pause", function() {
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
      // notification.log();
      // notification.init();
      $log.debug('Yahoo');
      //Local Notfication
      // try{
      //   // (function () {
      //     var user = User.getActiveProfileSync().data.profile;
      //     var ntfnText = "Hey "+user.first_name+", we are missing you. \nLet's do a lesson together.";
      //     $cordovaLocalNotification.schedule({
      //       id: 1,
      //       text: ntfnText,
      //       title: 'Let\'s play',
      //       every: 'minute'
      //     }).then(function () {
      //       $log.debug("Notification was placed");
      //       // alert("Instant Notification set");
      //     });
      //   // })();
      // }catch(err){
      //   $log.warn(err)
      // }
    });
    $ionicPlatform.on('resume', function() {
      notification.cancelAll();
      $rootScope.$broadcast('appResume');
      $rootScope.inBackground = false;
      $log.debug("Current state", $state.current)
      if ($state.current.name === 'content.video') {
        // angular.element("#audioplayer")[0].play();
      }
      analytics.log({
        name: 'APP',
        type: 'START',
        id: null
      }, {
        time: new Date()
      })
    });
    $ionicPlatform.on('pause', function() {
      $rootScope.$broadcast('appPause');
      $rootScope.inBackground = true;
      notification.schedule(JSON.parse(localStorage.scheduleNotification), JSON.parse(localStorage.scheduleNotification).at);
      // content.getActiveResource().then(function(resource){
      //   $log.debug("LOGGING ACTIVE",resource)
      //   activeResource = resource;
      // })
      // if (User.getActiveProfileSync()) {
      // $log.debug("THIS IS OBJ AFTER THE END",activeResource)
      // if (activeResource.ty) {}
      // notification.set('undiscovered');
      // $log.debug("Paused after reg")
      // }
      $log.debug("paused")
      angular.element("#audioplayer")[0].pause();
      analytics.log({
        name: 'APP',
        type: 'END',
        id: null
      }, {
        time: new Date()
      })
    });
  }
})();