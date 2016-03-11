(function() {
  'use strict';

  angular
    .module('zaya-user')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('user',{
        url :'/user',
        abstract : true,
        templateUrl: CONSTANT.PATH.USER+'/user.'+CONSTANT.VIEW,
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
      .state('user.main',{
        url : '/main',
        abstract : true,
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.USER+'/main.'+CONSTANT.VIEW,
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
          'playlist-tab':{
            templateUrl : 'templates/playlist/playlist.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main.home',{
        url : '/home',
        views : {
          'home-tab':{
            templateUrl : 'templates/home/home.'+CONSTANT.VIEW,
            controller : 'homeController as homeCtrl'
          }
        }
      })
      .state('user.main.result',{
        url : '/result',
        views : {
          'result-tab':{
            templateUrl : 'templates/result/result.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main.search',{
        url : '/search',
        views : {
          'search-tab':{
            templateUrl : 'templates/search/search.'+CONSTANT.VIEW
          }
        }
      })
  }
})();
