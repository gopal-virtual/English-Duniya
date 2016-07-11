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
          lessons: ['Rest', '$log', '$http', 'data','Auth', function(Rest, $log, $http, data, Auth) {
            return data.getLessonsList(Auth.getLocalProfile().grade)
          }],
          lessonLocked: ['Rest', '$log', '$http', 'data','extendLesson','Auth', function(Rest, $log, $http, data,extendLesson,Auth) {

            return data.getLessonsList(Auth.getLocalProfile().grade).then(function(lessons){

              return extendLesson.getLesson(lessons,[]).then(function(result){
                  return result;
              });
            })
          }],
          scores: ['Rest', '$log', 'data', function(Rest, $log, data) {
            return [];
        }],
        skills : ['Rest', '$log','network','data','Auth', function(Rest, $log, network,data,Auth){
          return data.getSkills({'userId':Auth.getProfileId()}).then(function(response){

            return response;
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
      },
        onEnter: ['$state', 'lessons', 'audio', '$ionicLoading', 'orientation','CONSTANT', function($state, lessons, audio, $ionicLoading, orientation, CONSTANT) {
          orientation.setPortrait();
          // $ionicLoading.show({
          //   templateUrl: 'templates/common/common.loader.view.html',
          //   duration: 8000
          // });
          // if (!lessons) {
          //   $state.go('map.unauthorised');
          // }
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
