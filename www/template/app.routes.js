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
        template : '<ion-nav-view animation="slide-left-right"></ion-nav-view>'
      })
      .state('auth.main',{
        url : '/main',
        templateUrl : CONSTANT.PATH.AUTH+"/auth.main."+CONSTANT.VIEW
      })
      .state('auth.signin', {
        url: '/signin',
        templateUrl: CONSTANT.PATH.AUTH+'/auth.signin.'+CONSTANT.VIEW,
        controller : 'authController as authCtrl'
      })
      .state('auth.signup',{
        url : '/signup',
        templateUrl : CONSTANT.PATH.AUTH+'/auth.signup.'+CONSTANT.VIEW,
        controller : 'authController as authCtrl'
      })
      .state('auth.forgot',{
        url : '/forgot',
        templateUrl : CONSTANT.PATH.AUTH+'/auth.forgot.'+CONSTANT.VIEW,
        controller : 'authController as authCtrl'
      })
      // end : Authentication

      // Practice
      // end : Practice

      // Quiz
      .state('quiz',{
        url : '/quiz/:id',
        abstract : true,
        cache: false,
        template : '<ion-nav-view></ion-nav-view>',
        resolve: {
            quiz: ['$stateParams', 'Rest', function($stateParams, Rest) {
                return Rest.one('assessments', $stateParams.id).get().then(function(quiz) {
                    return quiz.plain();
                })
            }]
        }
      })
      .state('quiz.start',{
        url : '/start',
        templateUrl : CONSTANT.PATH.QUIZ+'/quiz.start.'+CONSTANT.VIEW,
        controller : 'QuizController as quizCtrl'
      })
      .state('quiz.questions',{
        url : '/questions',
        templateUrl : CONSTANT.PATH.QUIZ+'/quiz.questions.'+CONSTANT.VIEW,
        controller : 'QuizController as quizCtrl'
      })
      .state('quiz.summary',{
        url : '/summary',
        templateUrl : CONSTANT.PATH.QUIZ+'/quiz.summary.'+CONSTANT.VIEW,
        params: {
          report: null
        },
        controller : 'QuizController as quizCtrl'
      })
      // end : Quiz


      //landing
      .state('user',{
        url :'/user',
        abstract : true,
        template: '<ion-nav-view></ion-nav-view>'
      })
      // personalisation for all
      .state('user.personalise',{
        url : '/personalise',
        abstract : true,
        templateUrl : 'template/profile/personalise.'+CONSTANT.VIEW,
      })
      .state('user.personalise.usertype',{
        url : '/usertype',
        templateUrl : 'template/profile/personalise.usertype.'+CONSTANT.VIEW
      })
      .state('user.personalise.usersubject',{
        url : '/usersubject',
        templateUrl : 'template/profile/personalise.usersubject.'+CONSTANT.VIEW
      })
      // learn app
      .state('user.main',{
        url : '/main',
        abstract : true,
        templateUrl : 'template/user/main.'+CONSTANT.VIEW,
        controller : 'userMainController as UserMain'
      })
      .state('user.main.profile',{
        url : '/profile',
        abstract : true,
        templateUrl : 'template/profile/profile.'+CONSTANT.VIEW
      })
      .state('user.main.profile.groups',{
        url : '/groups',
        views : {
          'group-tab' : {
            templateUrl : 'template/profile/profile.group.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main.profile.badges',{
        url : '/badges',
        views : {
          'badge-tab':{
            templateUrl : 'template/profile/profile.badge.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main.playlist',{
        url : '/playlist',
        templateUrl : 'template/playlist/playlist.'+CONSTANT.VIEW
      })
      .state('user.main.home',{
        url : '/home',
        templateUrl : 'template/home/home.'+CONSTANT.VIEW,
        controller : 'homeController as homeCtrl'
      })
      .state('user.main.result',{
        url : '/result',
        templateUrl : 'template/result/result.'+CONSTANT.VIEW
      })
      .state('user.main.search',{
        url : '/search',
        templateUrl : 'template/search/search.'+CONSTANT.VIEW
      })

    $urlRouterProvider.otherwise('/auth/main');
    // $urlRouterProvider.otherwise('/splash');
  }
})();
