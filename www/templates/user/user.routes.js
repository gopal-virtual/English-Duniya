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
      .state('user.personalise',{
        url : '/personalise',
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.USER+'/user.personalise'+CONSTANT.VIEW,
            controller : 'userController as userCtrl'
          }
        }
      })
      .state('user.profile',{
        url : '/profile',
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.USER+'/user.profile'+CONSTANT.VIEW,
            controller : 'userController as userCtrl'
          }
        }
      })
  }
})();
