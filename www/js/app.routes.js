(function() {
  'use strict';

  angular
    .module('zaya')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: './template/login/login.view.html',
        controller : 'authController as Auth'
      })
      .state('user',{
        url :'/user',
        abstract : true,
        template: '<ion-nav-view></ion-nav-view>'
      })
      .state('user.main',{
        url : '/main',
        abstract : true,
        templateUrl : './template/user/main.view.html',
        controller : 'userMainController as UserMain'
      })
      .state('user.main.profile',{
        url : '/profile',
        templateUrl : './template/profile/profile.view.html'
      })
      .state('user.main.playlist',{
        url : '/playlist',
        templateUrl : './template/playlist/playlist.view.html'
      })
      .state('user.main.home',{
        url : '/home',
        templateUrl : './template/home/home.view.html'
      })
      .state('user.main.result',{
        url : '/result',
        templateUrl : './template/result/result.view.html'
      })
      .state('user.main.search',{
        url : '/search',
        templateUrl : './template/search/search.view.html'
      })

    $urlRouterProvider.otherwise('/login');
  }
})();
