(function() {
  'use strict';

  angular
    .module('zaya-map')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('map', {
        url: '/map',
        abstract: true,
        resolve: {
          lessons: ['Rest', '$log', '$http', function(Rest, $log, $http) {
            return Rest.one('accounts', CONSTANT.CLIENTID.ELL).customGET('lessons', {
              limit: 25
            }).then(function(lessons) {
              return lessons.plain().results;
            }, function(error) {
              $log.debug('some error occured', error);
            })
          }],
          scores: ['Rest', '$log', function(Rest, $log) {
            return Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('profiles', JSON.parse(localStorage.user_details).profile).customGET('lessons-score', {
              limit: 25
            }).then(function(score) {
              $log.debug('scores rest', score.plain());
              return score.plain().results;
            }, function(error) {
              $log.debug('some error occured', error);
            })
          }]

        },
        template: '<ion-nav-view name="state-map"></ion-nav-view>'
      })
      .state('map.navigate', {
        url: '/navigate',
        nativeTransitions: {
          "type": "fade",
          "duration": 1000,
        },
        data : {
            litmus : {
              "id": "001",
              "content_type_name": "litmus",
              "tag": "Litmus",
              "locked": false
          },
          skillset : [{
            name: 'reading',
            score: 300
          }, {
            name: 'listening',
            score: 200
          }, {
            name: 'vocabulary',
            score: 250
          }, {
            name: 'grammar',
            score: 3000
          }]

      },
        onEnter: ['$state', 'lessons', 'audio', '$ionicLoading', 'orientation','CONSTANT', function($state, lessons, audio, $ionicLoading, orientation, CONSTANT) {
          orientation.setPortrait();
          $ionicLoading.show({
            templateUrl: CONSTANT.PATH.COMMON + '/common.loader' + CONSTANT.VIEW,
            duration: 8000
          });
          if (!lessons) {
            $state.go('map.unauthorised');
          }
          audio.play('background');
        }],
        onExit: ['audio', function(audio) {
          audio.stop('background');
        }],
        views: {
          'state-map': {
            templateUrl: CONSTANT.PATH.MAP + '/map' + CONSTANT.VIEW,
            controller: 'mapController as mapCtrl'
          }
        }
      })
      .state('map.unauthorised', {
        url: '/unauthorised',
        views: {
          'state-map': {
            templateUrl: CONSTANT.PATH.MAP + '/map.unauthorised' + CONSTANT.VIEW,
            controller: 'mapController as mapCtrl'
          }
        }
      })
  }
})();
