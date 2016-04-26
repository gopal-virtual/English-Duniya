(function() {
  'use strict';

  angular
    .module('zaya-user')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      // parent state after authentication
      .state('user',{
        url :'/user',
        abstract : true,
        template: '<ion-nav-view name="state-user"></ion-nav-view>',
      })
      // personalisation for all
      .state('user.personalise',{
        url : '/personalise',
        abstract : true,
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise'+CONSTANT.VIEW,
          }
        }
      })
      .state('user.personalise.social',{
        url : '/social',
        views : {
          'state-personalise':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise.social'+CONSTANT.VIEW,
            controller : 'profileController as profileCtrl'
          }
        }
      })
      .state('user.main',{
        url : '/main',
        abstract : true,
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.USER+'/main'+CONSTANT.VIEW,
          }
        }
      })
      .state('user.main.profile',{
        url : '/profile',
        nativeTransitions: {
          "type": "slide",
          "direction" : "right",
          // "duration" :  200
        },
        views : {
          'profile-tab' : {
            templateUrl : CONSTANT.PATH.PROFILE+'/profile'+CONSTANT.VIEW,
            controller : 'profileController as profileCtrl'
          }
        }
      })
      .state('user.main.settings',{
        url : '/settings',
        views : {
          'profile-tab' : {
            templateUrl : CONSTANT.PATH.PROFILE+'/profile.settings'+CONSTANT.VIEW,
            controller : 'profileController as profileCtrl'
          }
        }
      })
      .state('user.main.result',{
        url : '/result',
        nativeTransitions : null,
        views : {
          'result-tab':{
            templateUrl : CONSTANT.PATH.RESULT+'/result'+CONSTANT.VIEW
          }
        }
      })
  }
})();
