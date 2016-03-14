(function() {
  'use strict';

  angular
    .module('zaya-auth')
    .config(authRoute);

  function authRoute($stateProvider, $urlRouterProvider, CONSTANT) {
    $stateProvider
      .state('group',{
        url : '/group',
        abstract : true,
        template : '<ion-nav-view name="state-group-admin"></ion-nav-view><ion-nav-view name="state-group-student"></ion-nav-view>'
      })
      .state('group.admin',{
        url : '/admin',
        views : {
          'state-group-admin' : {
            templateUrl : CONSTANT.PATH.GROUP + '/group.admin.' + CONSTANT.VIEW,
            controller : 'groupController as groupCtrl'
          }
        }
      })
      .state('group.student',{
        url : '/student',
        views : {
          'state-group-student' : {
            templateUrl : CONSTANT.PATH.GROUP + '/group.student.' + CONSTANT.VIEW,
            controller : 'groupController as groupCtrl'
          }
        }
      })
  }
})();
