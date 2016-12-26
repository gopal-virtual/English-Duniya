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
        onEnter: ['Auth', '$state', '$log', 'User', 'device', function (Auth, $state, $log, User, device) {



        }]
      })
      .state('user.nointernet',{
          url : '/nointernet',
          views : {
              'state-user' : {
                  templateUrl : CONSTANT.PATH.USER + '/user.nointernet' + CONSTANT.VIEW,
                  controller: ['$rootScope','$cordovaNetwork','$state',function($rootScope, $cordovaNetwork, $state){
                    $rootScope.$on('$cordovaNetwork:online',function(event, networkState){
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
          'state-user' : {
            templateUrl: CONSTANT.PATH.USER + '/user.chooseProfile' + CONSTANT.VIEW,
            controller: ['multiUser','$scope','User',function(multiUser,$scope,User){
                $scope.changeNumberFlag = User.user.getPhoneNumber() == '' ? 0 : 1;
                $scope.multiUser = multiUser;
                multiUser.getProfiles();
            }],
            controllerAs : 'profileCtrl'
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
            controller: ['$scope','$timeout','$log','User','$ionicSlideBoxDelegate','$state','$ionicLoading',function($scope,$timeout,$log,User,$ionicSlideBoxDelegate,$state,$ionicLoading){
              $scope.phone = {
                number : '',
                numberErrorText : '',
                otp : '',
                otpErrorText : '',
                otpInterval : 90000,
                otpResendCount : 3,
                otpResendFlag : 0,
                resendOtp : resendOtp,
                sendNumber : sendPhoneNumber,
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
                $ionicLoading.show();
              }

              function sendPhoneNumber(num){
                if (num[0] != '9' && num[0] != '8' && num[0] != '7') {
                  $log.debug("in rejection")
                  $scope.phone.numberErrorText = "Please enter a valid mobile number";
                  return ;
                }
                // $log.debug("not in rejection")
                $scope.phone.numberErrorText = "";
                User.user.patchPhoneNumber("+91"+num).then(function(response){
                  $log.debug("We successfully added the phone number. Requesting otp",response,num);
                  nextSlide();
                  resetResendFlag();
                  User.user.updatePhoneLocal(response.data.phone_number);
                })
              }

              function resendOtp(num,interval){
                $log.debug("Asking for otp again")
                User.user.resendOtp(num).then(function(response){
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
                User.user.verifyOtp(otp).then(function(response){
                  $log.debug("Verified otp",response);
                  // $log.debug("Please cancel interval",$interval.cancel(otpCycle));
                  nextSlide();
                  if (!successInterval) {
                    successInterval = 1000;
                  }
                  $log.debug("Before timeout")
                  $timeout(function() {
                    $log.debug("In timeout")
                    exitPhoneNumber();
                  },successInterval);
                }, function(err){
                  if(err.status == 400){
                    $scope.phone.otpErrorText = err.data.details
                  }else{
                    $log.error(err)
                  }
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
