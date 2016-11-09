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

          
       
        }],
      data : {
          personaliseFormValidations: {
            // 'gender': ['required'],
            // 'firstName': ['required'],
            'grade': ['required'],
            // 'motherTongue': ['required']
          }
      }
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
        },
        data: {
          skills: [{
            "id": "6ef60d7e-64a2-4779-8aba-eae1d2de9246",
            "title": "Vocabulary",
            "lesson_scores": 220,
            "question_scores": 0
          }, {
            "id": "d711986f-0451-46d3-b68b-2d2500a1bb1e",
            "title": "Reading",
            "lesson_scores": 180,
            "question_scores": 0
          }, {
            "id": "152df66c-0f88-4932-86f2-592fa9d58b0e",
            "title": "Grammar",
            "lesson_scores": 200,
            "question_scores": 0
          }, {
            "id": "a28050a4-adb8-4b0c-8505-3b79d0db8128",
            "title": "Listening",
            "lesson_scores": 100,
            "question_scores": 0
          }]
        }
      })
  }
})();
