/**
 * @ngdoc controller
 * @name map.controller:mapController
 * @function
 *
 * @description
 * Controller takes care of the navigation map.
 * Note: The controller gets called before map.main.js
 */
(function() {
  'use strict';
  angular
    .module('zaya-map')
    .controller('mapController', mapController);
  mapController.$inject = [
    '$scope',
    '$rootScope',
    '$log',
    '$ionicPopup',
    '$ionicModal',
    '$state',
    'lessons',
    'scores',
    'skills',
    'CONSTANT',
    '$ionicLoading',
    '$timeout',
    'orientation',
    'Auth',
    'lessonutils',
    'audio',
    'User',
    'ml',
    'lessonLocked',
    '$ionicPlatform',
    'settings',
    'mediaManager',
    '$stateParams',
    'analytics',
    '$q',
    'queue',
    'content',
    '$cordovaLocalNotification',
    'notification',
    'device',
    'multiUser',
    '$ionicSlideBoxDelegate',
    '$interval'
];

  function mapController(
        $scope,
        $rootScope,
        $log,
        $ionicPopup,
        $ionicModal,
        $state,
        lessons,
        scores,
        skills,
        CONSTANT,
        $ionicLoading,
        $timeout,
        orientation,
        Auth,
        lessonutils,
        audio,
        User,
        ml,
        lessonLocked,
        $ionicPlatform,
        settings,
        mediaManager,
        $stateParams,
        analytics,
        $q,
        queue,
        content,
        $cordovaLocalNotification,
        notification,
        device,
        multiUser,
        $ionicSlideBoxDelegate,
        $interval
    ) {
    $scope.audio = audio;
    $scope.settings = settings;
    var temp = JSON.parse(localStorage.getItem('profile')).data.profile;
    temp.name = temp.first_name + ' ' + temp.last_name;
    $scope.settings.user = temp
    $scope.multiUser = multiUser;
    $scope.user = User;
    multiUser.getProfiles();
    $scope.orientation = orientation;
    $scope.activatedLesson = $stateParams.activatedLesson;
    $scope.progress = localStorage.getItem('progress');
    var mapCtrl = this;
    mapCtrl.gender = JSON.parse(localStorage.getItem('profile')).data.profile.gender;
    mapCtrl.rootScope = $rootScope;
    $log.debug("map ctrl scope", $scope.mediaSyncStatus)
    var lessonList = CONSTANT.LOCK ? lessonLocked.lockedLesson : lessons;
    mapCtrl.totalStars = CONSTANT.LOCK ? lessonLocked.total_star : 0;
    $log.debug("Stars", mapCtrl.totalStars)
      // $state.current.data && lessonList.unshift($state.current.data.litmus);
    mapCtrl.User = User;
    mapCtrl.demo = User.demo;
    // mapCtrl.loading = $ionicLoading;
    mapCtrl.authFactory = Auth;
    mapCtrl.queue = queue;
    mapCtrl.lessons = lessonList;
    mapCtrl.content = content;
    $log.debug("mapCtrl lessons", lessonList);
    mapCtrl.ml = ml;
    // mapCtrl.userCtrl = $controller('userCtrl');
    // mapCtrl.resetNode = resetNode;
    $scope.lessonutils = lessonutils;
    mapCtrl.backdrop = false;
    mapCtrl.showScore = -1;
    mapCtrl.skillSet = skills;
    mapCtrl.updateProfile = updateProfile;
    mapCtrl.animationExpand = {};
    mapCtrl.animationExpand['expand'] = expand;
    mapCtrl.animationExpand['shrink'] = shrink;
    mapCtrl.showResult = true;
    mapCtrl.getNodeProperty = getNodeProperty;
    mapCtrl.animateStar = {
      "activeFlag": -1,
      // "resetFlag" : -1
    };
    mapCtrl.animateStar["resetColor"] = resetColor;
    // ;
    mapCtrl.setAnimateStarFlag = setAnimateStarFlag;
    mapCtrl.emitNode = emitNode;
    // port node
    mapCtrl.first_node_index = parseInt(localStorage.first_node_index) || 0;
    mapCtrl.last_node_index = parseInt(localStorage.last_node_index) || mapCtrl.lessons.length - 1;
    $log.debug("LLL", parseInt(localStorage.last_node_index) || mapCtrl.lessons.length - 1)
    mapCtrl.nodeColors = {
      "vocabulary": "blue",
      "grammar": "green",
      "listening": "darkblue",
      "reading": "orange"
    }
    mapCtrl.goToChooseProfile = goToChooseProfile;
    mapCtrl.onBackButtonPress = onBackButtonPress;
    $scope.exitChooseProfile = exitChooseProfile;

    $scope.onProfileCardClick = onProfileCardClick;


    $scope.changeNumberFlag = (function(){return User.user.getPhoneNumber() != '';})()
    $scope.currentState = $state.current.name;
    // $scope.goToPhoneNumber = goToPhoneNumber;
    // $scope.exitPhoneNumber = exitPhoneNumber;
    // mapCtrl.notification = notification;
    $scope.phone = {
      number : (function(){return User.user.getPhoneNumber()})(),
      numberErrorText : '',
      isVerified : (function(){return User.user.getDetails().is_verified})(),
      otp : '',
      otpErrorText : '',
      otpInterval : 90000,
      otpResendCount : 3,
      otpResendFlag : 0,
      resendOtp : resendOtp,
      submitNumber : submitPhoneNumber,
      disableSwipe : disableSwipe,
      verifyOtp : verifyOtp,
      nextSlide : nextSlide,
      exit : exitPhoneNumber,
      open : goToPhoneNumber,
    }

    $scope.exitModal = {
      message : 'Do you want to exit?'
    }

    // $log.debug("ISVERIFIED",$scope.phone.number.length < 10,$scope.phone.number == User.user.getPhoneNumber(), $scope.phone.isVerified)
    $log.debug("PHONE. changed number flag",$scope.changeNumberFlag);
    var tempCount = 1;

    function goToPhoneNumber() {
      if ($scope.profileScreen.isShown()) {
        $scope.profileScreen.hide()
      }
      $scope.phoneNumberScreen.show().then(function(){
        analytics.log({
          name : 'PHONENUMBER',
          type : 'OPEN',
        },{
          time : new Date(),
        },User.getActiveProfileSync()._id);
      });
      // $scope.phone.isVerified = User.user.getDetails().is_verified;
      // $log.debug("PHONE.is verified",$scope.phone.isVerified);
      analytics.log(
        {
            name : 'PHONENUMBER',
            type : $scope.changeNumberFlag == true ? 'TAP:CHANGE' : 'TAP_ADD',
            id : null
        },
        {
            time : new Date()
        },
        User.getActiveProfileSync()._id
      );
    }

    function exitPhoneNumber() {
      if ($scope.profileScreen.isShown()) {
        $scope.profileScreen.hide()
      }
      $scope.phoneNumberScreen.hide().then(function(){
        $ionicSlideBoxDelegate.slide(0);
        $scope.phone.otp = '';
        $scope.phone.otpErrorText = '';
        tempCount = 1;
        audio.loop('background');
        analytics.log({
            name : 'PHONENUMBER',
            type : 'CLOSE'
        }, {
          time : new Date()
        }, User.getActiveProfileSync()._id);
      });

    }

    function submitPhoneNumber(num){
      if (num[0] != '9' && num[0] != '8' && num[0] != '7') {
        $log.debug("in rejection")
        $scope.phone.numberErrorText = "Please enter a valid mobile number";
        return ;
      }
      analytics.log({
          name : 'PHONENUMBER',
          type : 'NUMBER_SUBMIT'
      }, {
        time : new Date(),
        number : num
      }, User.getActiveProfileSync()._id)
      // $log.debug("not in rejection")
      $scope.phone.numberErrorText = "";
      if(!$scope.phone.isVerified && $scope.phone.number == User.user.getPhoneNumber()){
        $log.debug('PHONE. asking for otp')
        resendOtp(num,$scope.phone.otpInterval);
        nextSlide();
      }else{
        $log.debug('PHONE. Patching phone')
        sendPhoneNumber(num);
      }
    }

    function sendPhoneNumber(num){
      // $log.debug(num[0]);
      // $log.debug(num[0] != '9',num[0] != '8',num[0] != '7');
      // $log.debug(num[0] != '9' && num[0] != '8' && num[0] != '7');

      User.user.patchPhoneNumber(num).then(function(response){
        $log.debug("We successfully added the phone number. Requesting otp",response,num);
        nextSlide();
        resetResendFlag();
        User.user.updatePhoneLocal(response.data.phone_number);
        User.user.setIsVerified(response.data.is_verified);
        // $scope.changeNumberFlag = User.user.getPhoneNumber() == '';
        analytics.log({
          name : 'PHONENUMBER',
          type : 'NUMBER_SUCCESS',
        },{
          time : new Date()
        },User.getActiveProfileSync()._id);
      }, function(err){
       if(err.status == 400){
          $scope.phone.numberErrorText = err.data.details;
        }else{
          $scope.phone.numberErrorText = JSON.stringify(err.data);
        }
        analytics.log({
          name : 'PHONENUMBER',
          type : 'NUMBER_ERROR',
        },{
          time : new Date()
        },User.getActiveProfileSync()._id);
      })
    }

    function resendOtp(num,interval){
      $log.debug("Asking for otp again")
      User.user.resendOtp(num).then(function(response){
        analytics.log({
          name : 'PHONENUMBER',
          type : 'OTP_RESEND',
        },{
          time : new Date()
        },User.getActiveProfileSync()._id);
        $log.debug("Otp request was sent",response)
        
      })
      resetResendFlag();
    }

    function resetResendFlag(){
      $log.debug('disabling resend');
      $scope.phone.otpResendFlag = 0
      if (tempCount > $scope.phone.otpResendCount-1) {
        return ;
      } 
      tempCount++;
      $timeout(function() {
        $log.debug('activating resend')
        $scope.phone.otpResendFlag = 1;
      }, $scope.phone.otpInterval);
    }

    // function askForOtpCycle(num, interval, count){
    //   var tempCount = 1;
    //   var lastOtpCycle;
    //   var otpCycle = $interval(function(){
    //     $log.debug("Asking for otp again")
    //     if($ionicSlideBoxDelegate.$getByHandle('slide-phone').currentIndex() != 1){
    //       $interval.cancel(otpCycle);
    //       $log.debug('Killed otp request cycle',$interval.cancel(otpCycle))
    //     }
    //     if (tempCount == count) {
    //       $log.debug("timeout inside interval")
    //       lastOtpCycle = $timeout(function() {
    //         $ionicPopup.alert({
    //           title: 'Sorry about that!',
    //           template: 'Hey, looks like some error occured with sms server. Please try later'
    //         }).then(function(){
    //           exitPhoneNumber();
    //         });  
    //       }, interval);
    //     }
    //     tempCount++;
    //     // User.user.resendOtp(num).then(function(response){
    //     //   $log.debug("Otp request was sent",response)
    //     // })
    //   },interval,count);
    // }

    function verifyOtp(otp,successInterval){
      analytics.log({
        name : 'PHONENUMBER',
        type : 'OTP_SUBMIT',
      },{
        time : new Date(),
        otp : otp
      },User.getActiveProfileSync()._id);
      User.user.verifyOtp(otp).then(function(response){
        $log.debug("Verified otp",response);
        // $log.debug("Please cancel interval",$interval.cancel(otpCycle));
        User.user.setIsVerified(true);
        // $scope.phone.isVerified = User.user.getDetails().is_verified
        nextSlide();
        if (!successInterval) {
          successInterval = 1000;
        }
        $log.debug("Before timeout")
        $timeout(function() {
          $log.debug("In timeout")
          exitPhoneNumber();
        },successInterval);
        analytics.log({
          name : 'PHONENUMBER',
          type : 'OTP_SUCCESS',
        },{
          time : new Date(),
          otp : otp
        },User.getActiveProfileSync()._id);
      }, function(err){
        if(err.status == 400){
          $scope.phone.otpErrorText = err.data.details
        }else{
          $log.error(err)
        }
        analytics.log({
          name : 'PHONENUMBER',
          type : 'OTP_ERROR',
        },{
          time : new Date(),
          otp : otp
        },User.getActiveProfileSync()._id);
      })
    }

    function disableSwipe() {
      $ionicSlideBoxDelegate.enableSlide(false);
    }

    function nextSlide() {
      $ionicSlideBoxDelegate.$getByHandle('slide-phone').next();
    }

    // notification.createDb();
    // notification.init();
    // notification.defineTypes();
    // notification.dbDestroy();
    // notification.smartContentSet();
    // $log.debug("DB LOADING",notification.db.load());
    // $scope.$on('pageRegion', mapCtrl.setLessonRange )
    $scope.$on('backButton', mapCtrl.onBackButtonPress)

    function onBackButtonPress() {
      // $log.debug('Do you want to exit?')
      // if ($scope.profileScreen.isShown()) {
      //   $scope.profileScreen.hide();
      // } else {
      //   analytics.log({
      //     name: 'APP',
      //     type: 'EXIT_MODAL_SHOW'
      //   }, {},User.getActiveProfileSync()._id);
      //   var confirmExit = $ionicPopup.confirm({
      //     title: 'Exit',
      //     template: 'Do you want to exit?'
      //   });
      //   confirmExit.then(function(res) {
      //     if (res) {
      //       ionic.Platform.exitApp();
      //     } else {
      //       analytics.log({
      //     name: 'APP',
      //     type: 'EXIT_MODAL_HIDE'
      //   }, {},User.getActiveProfileSync()._id);
      //       console.log('You are not sure');
      //     }
      //   });
      // }
      $log.warn('Clicked on back button on map');
      $scope.exitApp.show();
    }
    notification.getFromServer({
      dev_id: device.uuid
    }).then(function(response) {
      $log.debug("We got this", response)
    }, function(response) {
      $log.error("We couldn't get", response)
      if (response.status == 404) {
        $log.warn("No worries, we kust register your device")
      } else {}
    });
    $log.debug("This is the lesson list")
    $log.debug(JSON.stringify(lessonList))
    $log.debug(lessonList.length)
    $log.debug(JSON.stringify(lessonList[lessonList.length - 1]))
      // $log.debug("FETCHINGDOCBYID",notification.fetchDocById())
    notification.fetchDocById(lessonList[lessonList.length - 1].node.parent).then(function(doc) {
        $log.debug("FETCHING DOC complete", doc)
        if (lessonutils.resourceType(lessonList[lessonList.length - 1]) != 'practice') {
          $log.debug('discovered', notification.defineType(doc, 'discovered'))
        } else {
          $log.debug('undiscovered', notification.defineType(doc, 'undiscovered'))
        }
        localStorage.setItem('scheduleNotification', JSON.stringify(notification.defineType(doc, lessonutils.resourceType(lessonList[lessonList.length - 1]) != 'practice' ? 'discovered' : 'undiscovered')))
          // localStorage.setItem('offlineNotif',JSON.stringify(doc));
      })
      // $log.debug("Defining types in map",notification.defineTypes());
      // $scope.$on('nextRegion', mapCtrl.setLessonRange )
      // end : port node
      /**
       * @ngdoc property
       * @name mapCtrl.setAnimateStarFlag
       * @propertyOf map.controller:mapController
       * @description
       * Initializes animateStar flag in localStorage
       *
       */
    function setAnimateStarFlag() {
      var animateStarFlag = {
        isCurrentNode: true,
        clickedNodeStar: 0
      };
      localStorage.setItem("animateStarFlag", JSON.stringify(animateStarFlag));
    }
    /**
     * @ngdoc method
     * @name mapCtrl.getNodeProperty
     * @methodOf map.controller:mapController
     * @description
     * Finds node property values in localstorage and then returns them
     * @param {string} propertyString A string to define the property of the node. It can take the values 'x', 'y', 'width', 'height', 'node', 'type'
     * @returns {string} Value of the property stored in localStorage. If nothing is found value 0 is returned
     */
    // $log.debug("lessons HAHA",mapCtrl.lessons[lessons.length-1].node);
    function getNodeProperty(prop) {
      if (prop == 'x')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).x : 0;
      if (prop == 'y')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).y : 0;
      if (prop == 'width')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).width : 0;
      if (prop == 'height')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).height : 0;
      if (prop == 'node')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).node : 0;
      if (prop == 'type')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).type : 0;
    }
    // $ionicPlatform.registerBackButtonAction(function(event) {
    //   event.preventDefault();
    // }, 100);
    $scope.$on('removeLoader', function(showHud) {
      $ionicLoading.hide();
    });
    if (CONSTANT.CONTENT_TEST) {
      $scope.$emit('removeLoader');
      $log.debug("content test lessons", mapCtrl.lessons)
    }

    function emitNode(resource) {
      $log.debug("Opening node", resource)
      $scope.$emit('openNode', resource)
    }
    $scope.$on('openNode', function(event, node) {
      $log.debug("Opennode Triggered");
      $ionicLoading.show({
        // noBackdrop: false
        hideOnStateChange: true
      });
      $scope.demo.isShown() && $scope.demo.hide();
      $scope.selectedNode = node;
      //   $scope.demo.isShown() && $scope.demo.hide();
      var promise;
      $log.debug('intro sound', node.node.intro_sound, node)
      if (node.node.intro_sound) {
        promise = mediaManager.downloadIfNotExists(node.node.intro_sound)
      } else {
        promise = $q.resolve();
      }
      promise.then(function(s) {
          $log.debug("Intro sound downloaded if not exist", s);
          if (s) {
            node.node.parsed_sound = s;
          }
          $log.debug(node);
          lessonutils.playResource(node);
          return content.getLesson(node.node.parent);
        })
        .then(function(lesson) {
          lessonutils.setLocalLesson(JSON.stringify(lesson))
        }).catch(function(e) {
          $ionicLoading.hide()
          $log.debug("error is here");
          $ionicPopup.alert({
            title: CONSTANT.ERROR_MESSAGES.DEFAULT_TITLE,
            template: e.message ? e.message : CONSTANT.ERROR_MESSAGES.DEFAULT
          })
        });
      //   if (currentPos)
      //     currentPos.lessonType = node.tag;
      //
      //   if (node.content_type_name == 'litmus') {
      //     $state.go('quiz.questions', {
      //       id: node.id,
      //       type: 'litmus'
      //     });
      //   } else {
      //     $ionicLoading.show({
      //       // hideOnStateChange: true
      //     });
      //     $scope.user = User;
      //     $scope.lessonutils.getLesson(node.id, $scope).then(
      //
      //       function(response) {
      //
      //
      //         analytics.log(
      //               {
      //                   name : 'LESSON',
      //                   type : 'START',
      //                   id : node.id
      //               },
      //               {
      //                   time : new Date()
      //               },
      //               User.getActiveProfileSync()._id
      //           );
      //
      //         var promise;
      //         if(node.meta.intros && node.meta.intros.sound  && node.meta.intros.sound[0]){
      //
      //           promise = mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER + node.meta.intros.sound[0])
      //         } else {
      //           promise = $q.resolve();
      //         }
      //
      //         promise.then(function(s) {
      //           if(s){
      //             node.meta.parsed_sound = s;
      //           }
      //
      //           audio.setVolume('background', 0.1);
      //         if(currentPos)
      //         {
      //
      //           mapCtrl.animationExpand.expand(currentPos,node);
      //         }else{
      //           $scope.openNodeMenu(node);
      //           $scope.selectedNode = response;
      //         }
      //         }).catch(function(error) {
      //
      //           $ionicLoading.hide();
      //           $ionicPopup.alert({
      //             title: 'Please try again',
      //             template: "No internet conection found"
      //           });
      //         });
      //       }
      //     );
      //   }
      //
    });
    $scope.$on('animateStar', function() {
      // for (var i = 0; i < mapCtrl.skillSet.length; i++) {
      //   $log.info("Loop", i, "\nskillSetTag : ", mapCtrl.skillSet[i].title.toLowerCase(), "\nactivatedLessonTag : ", $stateParams.activatedLesson.node.tag.toLowerCase())
      //   if (mapCtrl.skillSet[i].title.toLowerCase() == $stateParams.activatedLesson.node.tag.toLowerCase()) {
      //     mapCtrl.animateStar.activeFlag = i;
      //     // mapCtrl.animateStar.animateFlag = i;
      //     break;
      //   }
      // }
    });
    /**
     * @ngdoc method
     * @name mapCtrl.animateStar.resetColor
     * @methodOf map.controller:mapController
     * @description
     * Used for resetting color flag. The color flag determines whether the previous attempted lesson tag gets highlighted in the HUD.
     * @param {int} index The index of the current element in the lessons array
     * @returns {boolean} True if the flag is successfully reset else false
     *
     */
    function resetColor(index) {
      if ($stateParams.activatedLesson && mapCtrl.skillSet[index].title.toLowerCase() == $stateParams.activatedLesson.node.tag.toLowerCase()) {
        mapCtrl.animateStar.activeFlag = -2;
        return true;
        // mapCtrl.animateStar.animateFlag = -1;
      }
      return false;
    }
    $scope.openNodeMenu = function(node) {
      $log.debug("this")
      lessonutils.playDemoAudio(node);
      $scope.nodeMenu.show();
      $ionicLoading.hide();
      return true;
    };
    $scope.closeNodeMenu = function() {
      analytics.log({
          name: 'LESSON',
          type: 'END',
          id: $scope.selectedNode.node.id
        }, {
          time: new Date()
        },
        User.getActiveProfileSync()._id
      );
      //
      $scope.nodeMenu.hide().then(function() {
        mapCtrl.closeDemo();
      });
      return true;
    };
    /**
     * @ngdoc method
     * @name mapCtrl.openDemo
     * @methodOf map.controller:mapController
     * @description
     * starts the demo on the navigation map by triggering the demo modal.
     * @returns {boolean} True every time
     *
     */
    mapCtrl.openDemo = function() {
      $scope.demo.show().then(function() {
        $ionicLoading.hide();
      });
      return true;
    };
    /**
     * @ngdoc method
     * @name mapCtrl.closeDemo
     * @methodOf map.controller:mapController
     * @description
     * ends the demo on the navigation map by closing the demo modal.
     * @returns {boolean} True every time
     *
     */
    mapCtrl.closeDemo = function() {
      $scope.demo.hide().then(function() {
        location.reload();
      });
      return true;
    };

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.COMMON + '/common.modal-exit' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(nodeMenu) {
      $scope.exitApp = nodeMenu;
    });

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(nodeMenu) {
      $scope.nodeMenu = nodeMenu;
    });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.USER + '/user.chooseProfile' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(profileScreen) {
      $scope.profileScreen = profileScreen;

    });

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.USER + '/user.phoneNumber' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(phoneNumberScreen) {
      $scope.phoneNumberScreen = phoneNumberScreen;
    });

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.demo' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false,
      hideOnStateChange: true
    }).then(function(demo) {
      $scope.demo = demo;
    });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.settings' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose: false
    }).then(function(settings) {
      $scope.settingsModal = settings;
    });
    // function openSettings() {
    //   $scope.settings.show();
    // }
    //
    // function closeSettings() {
    //   $scope.settings.hide();
    // }
    // $timeout(function(){
    //     mapCtrl.openDemo();
    // },2000)
    // function resetNode() {
    //   $timeout(function() {
    //     $scope.selectedNode = {};
    //   }, 500)
    // }
    // $timeout(function functionName() {
    //   if (mapCtrl.lessons && localStorage.lesson) {
    //     $scope.openNodeMenu();
    //     $scope.selectedNode = $scope.lessonutils.getLocalLesson();
    //   }
    // });
    // $scope.test = {"phone_number":"+919393939193"};
    // updateProfile($scope.test);
    function expand(currentPos, node) {
      // alert(JSON.stringify(e));
      mapCtrl.showResult = false;
      // $mapCtrl.animationExpand.lessonType = currentPos.lessonType
      mapCtrl.animationExpand.containerStyle = {
        "margin-left": currentPos.x - 30 + "px",
        "margin-top": currentPos.y - 30 + "px",
        "opacity": 1
      }
      $timeout(function() {
        mapCtrl.animationExpand.iconTranslateOffset = {
          "transform": "translate(" + ((screen.width / 2) - currentPos.x) + "px," + (40 - currentPos.y) + "px) scale3d(2,2,2)",
          "transition": "transform 0.5s ease-in-out"
        };
        mapCtrl.animationExpand.expandContainer = 1;
      }, 50).then(function() {
        $timeout(function() {
          $scope.openNodeMenu(node);
        });
      });
    }

    function shrink() {
      mapCtrl.showResult = true;
      mapCtrl.animationExpand.iconTranslateOffset = {
        "transform": "translate(0px,0px) scale3d(1,1,1)",
        "transition": "transform 0.4s ease-in-out"
      };
      mapCtrl.animationExpand.expandContainer = 0;
      $timeout(function() {
        mapCtrl.animationExpand.containerStyle = {
          "margin-left": "0px",
          "margin-top": "0px",
          "opacity": 0
        }
      }, 400);
    }
    $scope.$on('show_demo', function() {
      // $ionicLoading.show();
      if (User.demo.isShown() && User.demo.getStep() == '1') {
        $timeout(function() {
          $scope.demo.show().then(function() {
            angular.element("#audioplayer")[0].pause();
            angular.element("#audioSource")[0].src = 'sound/voice_letstart.mp3';
            angular.element("#audioplayer")[0].load();
            angular.element("#audioplayer")[0].play();
            User.demo.setStep(2)
          });
        })
      }
    });

    function updateProfile(profileData) {
      //If conflict arises. Don't delete this
      //
      //
      if (profileData.grade != JSON.parse(localStorage.profile).data.profile.grade) {
        $ionicLoading.show({
          hideOnStateChange: true
        });
        localStorage.setItem("currentPosition", 4000);
        localStorage.removeItem("regionPage");
        User.profile.update(mapCtrl.User.getActiveProfileSync()._id, profileData).then(function() {
          $scope.settingsModal.hide();
          location.reload()
        });
      } else {
        $scope.settingsModal.hide();
      }
      //
      // $rootScope.$broadcast('reloadMap');
      // $state.go('map.navigate')
      // $state.reload()
    }

    function goToChooseProfile() {
    $log.debug("PHONE. changed number flag",$scope.changeNumberFlag);

        analytics.log({
          name : 'CHOOSEPROFILE',
          type : 'TAP',
        },{
          time : new Date(),
        },User.getActiveProfileSync()._id);
        multiUser.getProfiles()
        $scope.profileScreen.show().then(function(){
          analytics.log({
            name : 'CHOOSEPROFILE',
            type : 'OPEN',
          },{
            time : new Date(),
          },User.getActiveProfileSync()._id);
          audio.stop('background');
        });
        // analytics.log({

        // })
    //   $state.go('user.chooseProfile');
    }

    function exitChooseProfile() {
      $scope.profileScreen.hide().then(function(){
        audio.loop('background');
        analytics.log({
            name : 'CHOOSEPROFILE',
            type : 'CLOSE',
          },{
            time : new Date(),
          },User.getActiveProfileSync()._id);
      });
    }

    function onProfileCardClick() {
      analytics.log({
        name : 'CHOOSEPROFILE',
        type : 'PROFILE_TAP',
      },{
        time : new Date(),
      },User.getActiveProfileSync()._id);
    }

    
  }
})();