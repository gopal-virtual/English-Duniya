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
            controller: ['multiUser', '$scope', function(multiUser, $scope) {
              $scope.multiUser = multiUser;
              multiUser.getProfiles();
            }],
            controllerAs: 'profileCtrl'
          }
        },
        params: {
          profiles: null
        }
      })
    
  }
})();