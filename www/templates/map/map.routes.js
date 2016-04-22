(function() {
  'use strict';

  angular
    .module('zaya-map')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('map',{
        url : '/map',
        abstract : true,
          resolve : {
            lessons : ['Rest','$log',function(Rest, $log){
              return Rest.one('accounts', CONSTANT.CLIENTID.ELL).getList('lessons').then(function(lessons) {
                $log.debug(lessons.plain());
                return lessons.plain();
              })
            }]
          },
        template : '<ion-nav-view name="state-map"></ion-nav-view>'
      })
      .state('map.navigate',{
        url : '/navigate',
        views : {
          'state-map' : {
            templateUrl : CONSTANT.PATH.MAP + '/map' + CONSTANT.VIEW,
            controller : 'mapController as mapCtrl'
          }
        }
      })
  }
})();
