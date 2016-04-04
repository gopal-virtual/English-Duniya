(function() {
  'use strict';

  angular
    .module('zaya-map')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('map',{
        url : '/map',
        templateUrl : CONSTANT.PATH.MAP + '/map' + CONSTANT.VIEW,
        controller : 'mapController as mapCtrl'
      })
  }
})();
