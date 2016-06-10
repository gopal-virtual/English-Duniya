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
          lessons: ['Rest', '$log', '$http', 'data', function(Rest, $log, $http, data) {
            return data.getLessonsList(25);
          }],
          scores: ['Rest', '$log', 'data', function(Rest, $log, data) {
            return data.getLessonsScore(25);
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
        onEnter: ['$state', 'lessons', 'audio', '$ionicLoading', 'orientation', function($state, lessons, audio, $ionicLoading, orientation) {
          orientation.setPortrait();
          $ionicLoading.show({
            templateUrl: 'templates/common/common.loader.view.html',
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
