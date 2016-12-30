(function() {
  'use strict';
  angular
    .module('zaya-user')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {
    $stateProvider
    // parent state after authentication
      .state('user', {
        url: '/user',
        abstract: true,
        template: '<ion-nav-view name="state-user"></ion-nav-view>',
      })
      .state('user.personalise', {
        url: '/personalise',
        views: {
          'state-user': {
            templateUrl: CONSTANT.PATH.USER + '/user.personalise' + CONSTANT.VIEW,
            // templateUrl: CONSTANT.PATH.USER + '/user.personalise.grade' + CONSTANT.VIEW,
            controller: 'userController as userCtrl'
          }
        },
        onEnter: ['Auth', '$state', '$log', 'User', 'device', function(Auth, $state, $log, User, device) {}]
      })
      .state('user.nointernet', {
        url: '/nointernet',
        views: {
          'state-user': {
            templateUrl: CONSTANT.PATH.USER + '/user.nointernet' + CONSTANT.VIEW,
            controller: ['$rootScope', '$cordovaNetwork', '$state', function($rootScope, $cordovaNetwork, $state) {
              $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
                $state.go('auth.autologin');
              })
            }]
          }
        }
      })
      .state('user.profile', {
        url: '/profile',
        views: {
          'state-user': {
            templateUrl: CONSTANT.PATH.USER + '/user.profile' + CONSTANT.VIEW,
            controller: 'userController as userCtrl'
          }
        }
      })
      .state('user.chooseProfile', {
        url: '/chooseProfile',
        views: {
          'state-user': {
            templateUrl: CONSTANT.PATH.USER + '/user.chooseProfile' + CONSTANT.VIEW,
            controller: ['multiUser','$scope','User','analytics','audio',function(multiUser,$scope,User,analytics,audio){
                $scope.changeNumberFlag = User.user.getPhoneNumber() == '' ? 0 : 1;
                $scope.multiUser = multiUser;
                multiUser.getProfiles();
                $scope.onProfileCardClick = onProfileCardClick;
                function onProfileCardClick() {
                  analytics.log({
                    name : 'CHOOSEPROFILE',
                    type : 'PROFILE_TAP',
                  },{
                    time : new Date(),
                  },User.getActiveProfileSync()._id);
                }
            }],
            controllerAs: 'profileCtrl'
          }
        },
        params: {
          profiles: null
        }
      })
      .state('user.phoneNumber', {
        url: '/phoneNumber',
        views: {
          'state-user' : {
            templateUrl: CONSTANT.PATH.USER + '/user.phoneNumber' + CONSTANT.VIEW,
            controller: ['$scope','$timeout','$log','User','$ionicSlideBoxDelegate','$state','$ionicLoading','analytics','audio',function($scope,$timeout,$log,User,$ionicSlideBoxDelegate,$state,$ionicLoading,analytics,audio){
              $scope.audio = audio;
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
              var tempCount = 1;

              function goToPhoneNumber() {
                $log.debug('Whoosh! open')
              }

              function exitPhoneNumber() {
                $log.debug('Going to map')
                $state.go('map.navigate');
                analytics.log({
                    name : 'PHONENUMBER',
                    type : 'CLOSE'
                }, {
                  time : new Date()
                }, User.getActiveProfileSync()._id);
                $ionicLoading.show();
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
                  $scope.changeNumberFlag = User.user.getPhoneNumber() == '';
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

            }],
            controllerAs: 'phoneCtrl'
          }
        }
      })
  }
})();