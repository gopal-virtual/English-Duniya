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
            controller: ['multiUser', '$scope', 'User', 'analytics', 'audio', '$ionicModal', function(multiUser, $scope, User, analytics, audio, $ionicModal) {
              $scope.changeNumberFlag = User.user.getPhoneNumber() == '' ? 0 : 1;
              $scope.multiUser = multiUser;
              $scope.audio = audio
              multiUser.getProfiles();
              $scope.onProfileCardClick = onProfileCardClick;
              $ionicModal.fromTemplateUrl(CONSTANT.PATH.COMMON + '/common.modal-exit' + CONSTANT.VIEW, {
                scope: $scope,
                animation: 'slide-in-up',
                hardwareBackButtonClose: false
              }).then(function(nodeMenu) {
                $scope.createProfileModal = nodeMenu;
              });
              $scope.exitModal = {
                message: 'Do you want to create<br>a new profile?',
                dismiss: createProfileModalDismiss,
                confirm: createProfileModalConfirm
              }
              $scope.showCreateProfileModal = function() {
                $scope.createProfileModal.show();
              }

              function createProfileModalDismiss() {
                $scope.createProfileModal.hide();
              }

              function createProfileModalConfirm() {
                $scope.createProfileModal.hide();
                $scope.multiUser.goToCreateNewProfile();
              }

              function onProfileCardClick() {
                analytics.log({
                  name: 'CHOOSEPROFILE',
                  type: 'PROFILE_TAP',
                }, {
                  time: new Date(),
                }, User.getActiveProfileSync()._id);
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
          'state-user': {
            templateUrl: CONSTANT.PATH.USER + '/user.phoneNumber' + CONSTANT.VIEW,
            controller: 'userPhoneNumberController as phoneCtrl'
          }
        }
      })
  }
})();