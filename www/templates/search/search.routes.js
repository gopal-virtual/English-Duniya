(function() {
  'use strict';

  angular
    .module('zaya-quiz')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('tabslide',{
        url : '/tabslide',
        templateUrl : CONSTANT.PATH.SEARCH + '/search.tabslide' + CONSTANT.VIEW
      })
      .state('search',{
        url : '/search',
        abstract : true,
        template : '<ion-nav-view name="state-search"></ion-nav-view>'
      })
      .state('search.main',{
        url : '/main',
        abstract : true,
        views : {
          'state-search' : {
            templateUrl : CONSTANT.PATH.SEARCH + '/search' + CONSTANT.VIEW
          }
        }
      })
      .state('search.main.nodes',{
        url : '/nodes',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration" :  400
        },
        views : {
          'state-search-tab' : {
            templateUrl : CONSTANT.PATH.SEARCH + '/search.nodes' + CONSTANT.VIEW
          }
        }
      })
      .state('search.main.groups',{
        url : '/groups',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration" :  400
        },
        views : {
          'state-search-tab' : {
            templateUrl : CONSTANT.PATH.SEARCH + '/search.groups' + CONSTANT.VIEW
          }
        }
      })
      .state('search.main.users',{
        url : '/users',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration" :  400
        },
        views : {
          'state-search-tab' : {
            templateUrl : CONSTANT.PATH.SEARCH + '/search.users' + CONSTANT.VIEW
          }
        }
      })
  }
})();
