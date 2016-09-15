(function () {
  'use strict';

  angular
    .module('zaya-auth')
    .config(authRoute);

  function authRoute($stateProvider, $urlRouterProvider, CONSTANT) {
    $stateProvider
      .state('auth', {
        url: '/auth',
        abstract: true,
        template: "<ion-nav-view name='state-auth'></ion-nav-view>",
      })

      .state('auth.autologin', {
        url: '/autologin',
        views: {
          'state-auth': {
            templateUrl: CONSTANT.PATH.COMMON + '/common.loader' + CONSTANT.VIEW,
          }
        },
        onEnter: ['Auth', '$state', '$log', 'User', 'device', function (Auth, $state, $log, User, device) {
          // var user_credentials = {
          //   username: device.uuid,
          //   password1: device.uuid,
          //   password2: device.uuid,
          //   device_id: device.uuid
          // };

          // Auth.autoLogin(user_credentials)
          // .then(function() {
          //   return Auth.getUser();
          // })
          // .then(function() {
          //   return Auth.getProfile();
          // })
          // .then(function(){
          //   return
          // })
          
          User.profile.getAll.then(function(response){

            if(response.length){
              
              $state.go('user.personalise')
            }else{
              
              $state.go('user.personalise')
            }
          });

          // dataFactory.putUserifNotExist({
          //   'userId': Auth.getProfileId()
          // })
          //   .then(function () {
          //     return dataFactory.createLessonDBIfNotExists()
          //   })
          //   .then(function () {
          //     return demo.show()
          //   })
          //   .then(function (show) {
          //
          //     if (!show) {
          //       !localStorage.getItem('demo_flag') && localStorage.setItem('demo_flag', 5);
          //     } else {
          //       !localStorage.getItem('demo_flag') && localStorage.setItem('demo_flag', 1);
          //     }
          //     $state.go('map.navigate', {});
          //   })
          //   .catch(function (error) {
          //
          //     if (error.message === 'no_profile') {
          //       $state.go('user.personalise')
          //     }
          //     else {
          //       $ionicPopup.alert({
          //         title: "Could not login",
          //         template: error || "Please try again"
          //       });
          //       //   authCtrl.audio.play('wrong');
          //     }
          //   })
        }]
      })
      // intro is now the main screen
      // .state('auth.main', {
      //   url: '/main',
      //   views: {
      //     'state-auth': {
      //       templateUrl: CONSTANT.PATH.AUTH + "/auth.main" + CONSTANT.VIEW
      //     }
      //   }
      // })
      .state('auth.signin', {
        url: '/signin',
        nativeTransitions: {
          "type": "slide",
          "direction": "left",
          "duration": 300
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.signin' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.signin.social' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.signup', {
        url: '/signup',
        nativeTransitions: {
          "type": "slide",
          "direction": "left",
          "duration": 300
        },
        views: {
          'state-auth': {
            templateUrl: CONSTANT.PATH.AUTH + '/auth.signup' + CONSTANT.VIEW,
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.signup.social' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.forgot', {
        url: '/forgot',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration": 400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot.social' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.forgot_verify_otp', {
        url: '/verifyotp',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration": 400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot.verify' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.change_password', {
        url: '/changepassword',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration": 400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.changepassword' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.verify', {
        abstract: true,
        url: '/verify',
        views: {
          "state-auth": {
            template: "<ion-nav-view name='state-auth-verify'></ion-nav-view>"
          }
        }
      })
      .state('auth.verify.phone', {
        url: '/phone',
        nativeTransitions: {
          "type": "slide",
          "direction": "left",
          "duration": 400
        },
        views: {
          'state-auth-verify': {
            templateUrl: CONSTANT.PATH.AUTH + '/auth.verify.phonenumber' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
  }
})();
