(function() {
  'use strict';

  angular
    .module('zaya')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      //Authentication - > Main, Signin, Signup, Forgot
      .state('auth',{
        url : '/auth',
        abstract : true,
        template : "<ion-nav-view name='state-auth'></ion-nav-view>",
      })
      .state('auth.main',{
        url : '/main',
        views : {
          'state-auth' : {
            templateUrl : CONSTANT.PATH.AUTH+"/auth.main."+CONSTANT.VIEW
          }
        }
      })
      .state('auth.signin', {
        url: '/signin',
        views : {
          'state-auth' : {
            templateUrl: CONSTANT.PATH.AUTH+'/auth.signin.'+CONSTANT.VIEW,
            controller : 'authController as authCtrl'
          }
        }
      })
      .state('auth.signup',{
        url : '/signup',
        views : {
          'state-auth' : {
            templateUrl : CONSTANT.PATH.AUTH+'/auth.signup.'+CONSTANT.VIEW,
            controller : 'authController as authCtrl'
          }
        }
      })
      .state('auth.forgot',{
        url : '/forgot',
        nativeTransitions: {
            "type": "slide",
            "direction": "up"
        },
        views : {
          'state-auth' : {
            templateUrl : CONSTANT.PATH.AUTH+'/auth.forgot.'+CONSTANT.VIEW,
            controller : 'authController as authCtrl'
          }
        }
      })
      // end : Authentication

      // Practice
      // end : Practice

      // Quiz
      // .state('quiz',{
      //   url : '/quiz/:id',
      //   abstract : true,
      //   cache: false,
      //   template : '<ion-nav-view name="state-quiz"></ion-nav-view>',
      //   resolve: {
      //       quiz: ['$stateParams', 'Rest', function($stateParams, Rest) {
      //           return Rest.one('assessments', $stateParams.id).get().then(function(quiz) {
      //               return quiz.plain();
      //           })
      //       }]
      //   }
      // })
      // .state('quiz.start',{
      //   url : '/start',
      //   views : {
      //     'state-quiz' : {
      //       templateUrl : CONSTANT.PATH.QUIZ+'/quiz.start.'+CONSTANT.VIEW,
      //       controller : 'QuizController as quizCtrl'
      //     }
      //   }
      // })
      // .state('quiz.questions',{
      //   url : '/questions',
      //   views : {
      //     'state-quiz' : {
      //       templateUrl : CONSTANT.PATH.QUIZ+'/quiz.questions.'+CONSTANT.VIEW,
      //       controller : 'QuizController as quizCtrl'
      //     }
      //   }
      // })
      // .state('quiz.summary',{
      //   url : '/summary',
      //   params: {
      //     report: null
      //   },
      //   views : {
      //     'state-quiz' : {
      //       templateUrl : CONSTANT.PATH.QUIZ+'/quiz.summary.'+CONSTANT.VIEW,
      //       controller : 'QuizController as quizCtrl'
      //     }
      //   }
      // })
      // end : Quiz


      //landing
      .state('user',{
        url :'/user',
        abstract : true,
        template: '<ion-nav-view name="state-user"></ion-nav-view>'
      })
      // personalisation for all
      .state('user.personalise',{
        url : '/personalise',
        abstract : true,
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise.'+CONSTANT.VIEW,
          }
        }
      })
      .state('user.personalise.usertype',{
        url : '/usertype',
        views : {
          'state-personalise':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise.usertype.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.personalise.usersubject',{
        url : '/usersubject',
        views : {
          'state-personalise':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise.usersubject.'+CONSTANT.VIEW
          }
        }
      })
      // learn app
      .state('user.main',{
        url : '/main',
        abstract : true,
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.USER+'/main.'+CONSTANT.VIEW,
            controller : 'userMainController as UserMain'
          }
        }
      })
      // .state('user.main.profile',{
      //   url : '/profile',
      //   abstract : true,
      //   templateUrl : CONSTANT.PATH.AUTH+'/profile.'+CONSTANT.VIEW
      // })
      // .state('user.main.profile.groups',{
      //   url : '/groups',
      //   views : {
      //     'group-tab' : {
      //       templateUrl : CONSTANT.PATH.AUTH+'/profile.group.'+CONSTANT.VIEW
      //     }
      //   }
      // })
      // .state('user.main.profile.badges',{
      //   url : '/badges',
      //   views : {
      //     'badge-tab':{
      //       templateUrl : CONSTANT.PATH.AUTH+'/profile.badge.'+CONSTANT.VIEW
      //     }
      //   }
      // })
      .state('user.main.playlist',{
        url : '/playlist',
        views : {
          'state-user-sections':{
            templateUrl : 'templates/playlist/playlist.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main.home',{
        url : '/home',
        views : {
          'state-user-sections':{
            templateUrl : 'templates/home/home.'+CONSTANT.VIEW,
            controller : 'homeController as homeCtrl'
          }
        }
      })
      .state('user.main.result',{
        url : '/result',
        views : {
          'state-user-sections':{
            templateUrl : 'templates/result/result.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main.search',{
        url : '/search',
        views : {
          'state-user-sections':{
            templateUrl : 'templates/search/search.'+CONSTANT.VIEW
          }
        }
      })

    $urlRouterProvider.otherwise('/auth/main');
    // $urlRouterProvider.otherwise('/splash');
  }
})();
