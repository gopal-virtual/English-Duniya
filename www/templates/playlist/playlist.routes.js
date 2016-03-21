(function() {
  'use strict';

  angular
    .module('zaya-playlist')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {
    // $stateProvider
    //   .state('playlist',{
    //     url : '/playlist',
    //     views : {
    //       'playlist-tab':{
    //         templateUrl : CONSTANT.PATH.PLAYLIST+'/playlist'+CONSTANT.VIEW,
    //         controller : 'playlistController as playlistCtrl'
    //       }
    //     }
    //   })
  }
})();
