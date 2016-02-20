// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
(function () {
  'use strict';

  angular
    .module('zaya', [
      'ionic',
    ]);

})();

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider"];
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

(function(){
  'use strict';

  runConfig.$inject = ["$ionicPlatform"];
  angular
    .module('zaya')
    .run(runConfig);

  function runConfig($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  }

})();

(function(){
  'use strict';

  angular
    .module('zaya')
    .controller('authController', authController)

    authController.$inject = ['$state'];

  function authController($state) {
    var auth = this;

    auth.login = function (){
      $state.go('user.main.home',{});
    }
  }
})();

(function(){
  'use strict';

  angular
    .module('zaya')
    .controller('userMainController',userMainController)

  userMainController.$inject = ['$state'];

  function userMainController($state) {
    var UserMain = this;

    UserMain.goToProfile = function(){ $state.go('user.main.profile',{})}
    UserMain.goToPlaylist = function(){ $state.go('user.main.playlist',{})}
    UserMain.goToHome = function(){ $state.go('user.main.home',{})}
    UserMain.goToResult = function(){ $state.go('user.main.result',{})}
    UserMain.goToSearch = function(){ $state.go('user.main.search',{})}
  }
})();
