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
            lessons : ['Rest','$log','extendLesson',function(Rest, $log, extendLesson){
              return Rest.one('accounts', CONSTANT.CLIENTID.ELL).getList('lessons').then(function(lessons) {
                $log.debug(extendLesson);
                $log.debug(extendLesson.getLesson(lessons.plain()));
                return extendLesson.getLesson(lessons.plain());
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
