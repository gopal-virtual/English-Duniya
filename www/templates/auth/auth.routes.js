(function() {
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
          "duration" :  400
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
          "duration" :  400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.signup' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.signup.social' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.forgot', {
        url: '/forgot',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration" :  400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot.social' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.verify',{
        abstract : true,
        url : '/verify',
        views : {
          "state-auth" : {
            template : "<ion-nav-view name='state-auth-verify'></ion-nav-view>"
          }
        }
      })
      .state('auth.verify.phone', {
        url: '/phone',
        nativeTransitions: {
          "type": "slide",
          "direction": "left",
          "duration" :  400
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
