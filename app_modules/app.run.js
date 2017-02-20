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
    $ionicPopup,
    // $document,
    $cordovaSocialSharing,
    Rest,
    clevertap,
    lessonutils,
    challenge
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
      $log.debug("play resource state change", toState, toParams)
        // analytics.log({
        //   name: 'STATE',
        //   type: 'CHANGE_START'
        // }, {
        //   toState: toState,
        //   toParams: toParams,
        //   fromState: fromState,
        //   fromParams: fromParams
        // },User.getActiveProfileSync() && User.getActiveProfileSync()._id)
      if (localStorage.version !== CONSTANT.APP.VERSION) {
        event.preventDefault();
        $log.debug("tag First tim entering the app")
        $log.debug("Local storage !== ", CONSTANT.APP.VERSION);
        $ionicLoading.show({
            hideOnStateChange: true
          })
        localStorage.removeItem('regionPage');
          // content.deleteLessonDB().then(function() {
          //     $log.debug("tag Deleted lesson db");
          //     return content.createDependentDBs();
          //   })
        content.createDependentDBs()
          .then(function() {
            $log.debug("tag Created lessondb", toState, toParams);
            localStorage.setItem('version', CONSTANT.APP.VERSION);
            $state.go(toState.name, toParams);
          })
          .catch(function(err) {
            $rootScope.$broadcast('lowDiskSpace')
            $log.debug("Tag error", err)
          })
        notification.db.load();
        User.user.setNotifyPhone(1);
        // new PouchDB('lessonsDB').erase();
        // Check if user has updated app and delete older lesson db then add new db
        // content.createOrUpdateLessonDB()
      } else {
        content.replicateLessonDB();
        notification.db.replicate();
        $log.debug("tag here");
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
                  // $log.debug("CHECK 5")
                  // notification.online.set();
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
      }
    });
    // $rootScope.$on('$stateChangeSuccess',
    //   function(event, toState, toParams, fromState, fromParams) {
    //     analytics.log({
    //       name: 'STATE',
    //       type: 'CHANGE_COMPLETE'
    //     }, {
    //       toState: toState,
    //       toParams: toParams,
    //       fromState: fromState,
    //       fromParams: fromParams
    //     },User.getActiveProfileSync() && User.getActiveProfileSync()._id)
    //   })
    //  $rootScope.$on('$stateChangeError',
    //   function(event, toState, toParams, fromState, fromParams, error) {
    //     analytics.log({
    //       name: 'STATE',
    //       type: 'CHANGE_ERROR'
    //     }, {
    //       toState: toState,
    //       toParams: toParams,
    //       fromState: fromState,
    //       fromParams: fromParams,
    //       error : error
    //     },User.getActiveProfileSync() && User.getActiveProfileSync()._id)
    //   })
    $ionicPlatform.ready(function() {

      // $ionicLoading.show({hideOnStateChange:true});
      // $log.debug('CLEVERTAP. document',$document)
      // document.addEventListener('onPushNotification', function(e) {
      //   $rootScope.$apply(function(){
      //     $log.debug('CLEVERTAP. Notification',e.notification);
      //   })
      // }, false);


    $rootScope.showChallengeModal = true;

      window.addEventListener('message', function(event) {
        $log.debug(event);
        if (event.data.name === 'backToMap') {
          $log.debug("Here")
          $ionicLoading.show({
            hideOnStateChange: true
          });
          $state.go('map.navigate');
        }
        if (event.data.name === 'share') {
          var shareoptions = {
            message: 'I won ' + event.data.points + ' points in the English Duniya Scholarship Competition! You can win too!  Download the app now to participate ', // not supported on some apps (Facebook, Instagram)
            subject: 'English Duniya Scholarship Challenge', // fi. for email
            // files: ['img/assets/scholarship_share_image.png'], // an array of filenames either locally or remotely
            // url: 'https://play.google.com/store/apps/details?id=com.ionicframework.zayamobile694033'
              // chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
          };
          // var onSuccess = function(result) {
          //   $log.debug("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
          //   $log.debug("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
          // }
          // var onError = function(msg) {
          //   $log.debug("Sharing failed with message: " + msg);
          // }
          // $log.debug("share", shareoptions, onSuccess, onError);
          $cordovaSocialSharing
            .share(shareoptions.message, shareoptions.subject, 'https://s3-ap-southeast-1.amazonaws.com/zaya-builds/production-images/englishduniya-scholarship-challenge.png', 'http://referral.englishduniya.com/?referral='+event.data.referal_code+'&campaign_name=scholarship_challenge') // Share via native share sheet
            .then(function(result) {
              $log.debug(challenge.isChallengeActive());
              if (result && challenge.isChallengeActive()) {
                $http.post(CONSTANT.CHALLENGE_SERVER+'points/', {
                  client_id: User.getActiveProfileSync()._id,
                  points: [{
                    action: 'share',
                    score: 5
                  }]
                });
              }
              $log.debug("Share completed? " + result); // On Android apps mostly return false even while it's true
              // Success!
            }, function(err) {
              $log.debug("Sharing failed with message: ", err);
              // An error occured. Show a message to the user
            });
          // window.plugins.socialsharing.shareWithOptions(shareoptions, onSuccess, onError);
        }
      });

      analytics.getLocation().then(function(location) {
        $log.debug("Location", location);
      })
      $rootScope.inBackground = false;
      



      // User.getActiveProfileSync
      // notification.online.clevertapProfile();
      // notification.online.CleverTapLocation();
      clevertap.registerPush();      
      if (User.getActiveProfileSync()) {
        User.profile.setId(User.getActiveProfileSync()._id).then(function(profileId){
          $log.debug('profileId ' + profileId)
          var profile = User.getActiveProfileSync().data.profile;
          clevertap.profileSet({
              "Identity": profileId,
              "ts": Date.now().toString(),       // user creation date, or just leave this field out to set the time has current
              "Name": profile.first_name+" "+profile.last_name,
              "Gender": profile.gender,
              "type": "profile",
              "Phone": "+91"+User.user.getPhoneNumber(),
              // "profileData": {
              // }
            })
        }).catch(function(err){
          $log.warn('error occured app run, getting profile id',err);
        });
        // notification.online.clevertapRegister();
        // $log.debug("CHECK 2")
        //DO NOT REMOVE THIS CODE IT IS THERE INCASE CLEVERTAP IS REMOVED
        // notification.online.set();
      }

      //DO NOT REMOVE THIS CODE IT IS THERE INCASE CLEVERTAP IS REMOVED
      // $rootScope.$on('$cordovaPushV5:notificationReceived', function(event, data) {
      //   event.preventDefault();
      //   $log.warn("NOTIFICATION. Some notification arrived. This is the data", event, data);
      //   // $log.warn("ROCK YOU2 event", event);
      //   notification.online.log('received');
      //   // notification.schedule({
      //   //   id: 'notif-online-1',
      //   //   text: data.message,
      //   //   title: data.title,
      //   //   icon: 'res://icon',
      //   //   smallIcon: 'res: //ic_stat_english_duniya'
      //   // });
      //   if (data.additionalData.coldstart) {
      //     $log.debug("NOTIFICATION. App was started by tapping on notification");
      //     notification.online.log('tapped');
      //     if(data.additionalData.extra_params.redirect){
      //       $state.go(data.additionalData.extra_params.redirect);
      //     }
      //   }else{
      //     $log.debug("NOTIFICATION. Though notification was received, app wasn\'t started by clicking on notification")
      //     // localStorage.setItem("Hello2","Hello coldstart false")
      //   }


      // });
      // $rootScope.$on('$cordovaPushV5:errorOcurred', function(event, error) {
      //     $log.error("Error occured online notification", event, error);
      //   })

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
          //DON NOT REMOVE THIS CODE IT IS THERE INCASE CLEVERTAP IS REMOVED
          // $log.debug("CHECK 1");
          // notification.online.set();
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
        analytics.log({
          name: 'FAILURE',
          type: 'LOW_DISK_SPACE'
        }, {}, User.getActiveProfileSync() && User.getActiveProfileSync()._id);
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
      $log.debug('OFFLINE, hello')
      if($rootScope.toBeScheduled){
        $log.debug('OFFLINE. notification set')
        notification.offline.scheduleMulti($rootScope.toBeScheduled);
      }else{
        $log.warn('OFFLINE. no offline notification in queue');
      }
      $rootScope.inBackground = true;
      try {
        notification.schedule(JSON.parse(localStorage.scheduleNotification), JSON.parse(localStorage.scheduleNotification).at);
      } catch (err) {
        $log.warn("Looks like offline notifications haven\'t been set yet")
      }

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