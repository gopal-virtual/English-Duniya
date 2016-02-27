(function() {
  'use strict';

  angular
    .module('zaya')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('main',{
        url : '/main',
        templateUrl : "template/login/main.view.html"
      })
      .state('signin', {
        url: '/signin',
        templateUrl: 'template/login/signin.view.html',
        controller : 'authController as authCtrl'
      })
      .state('signup',{
        url : '/signup',
        templateUrl : 'template/login/signup.view.html',
        controller : 'authController as authCtrl'
      })
      .state('forgot',{
        url : '/forgot',
        templateUrl : 'template/login/forgot.view.html'
      })
      .state('user',{
        url :'/user',
        abstract : true,
        template: '<ion-nav-view></ion-nav-view>'
      })
      // personalisation for all
      .state('user.personalise',{
        url : '/personalise',
        abstract : true,
        templateUrl : 'template/profile/personalise.view.html',
      })
      .state('user.personalise.usertype',{
        url : '/usertype',
        templateUrl : 'template/profile/personalise.usertype.view.html'
      })
      .state('user.personalise.usersubject',{
        url : '/usersubject',
        templateUrl : 'template/profile/personalise.usersubject.view.html'
      })
      // learn app
      .state('user.main',{
        url : '/main',
        abstract : true,
        templateUrl : 'template/user/main.view.html',
        controller : 'userMainController as UserMain'
      })
      .state('user.main.profile',{
        url : '/profile',
        abstract : true,
        templateUrl : 'template/profile/profile.view.html'
      })
      .state('user.main.profile.groups',{
        url : '/groups',
        views : {
          'group-tab' : {
            templateUrl : 'template/profile/profile.group.view.html'
          }
        }
      })
      .state('user.main.profile.badges',{
        url : '/badges',
        views : {
          'badge-tab':{
            templateUrl : 'template/profile/profile.badge.view.html'
          }
        }
      })
      .state('user.main.playlist',{
        url : '/playlist',
        templateUrl : 'template/playlist/playlist.view.html'
      })
      .state('user.main.home',{
        url : '/home',
        templateUrl : 'template/home/home.view.html'
      })
      .state('user.main.result',{
        url : '/result',
        templateUrl : 'template/result/result.view.html'
      })
      .state('user.main.search',{
        url : '/search',
        templateUrl : 'template/search/search.view.html'
      })

    $urlRouterProvider.otherwise('/main');
  }
})();
