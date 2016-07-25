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
            return [];
            // var d = new Date();
            // $log.debug("here")
            // return data.getLessonsList(Auth.getLocalProfile().grade).then(function(result){
            //   $log.debug(new Date()- d,"secornds lessons",result)
            //
            //   return result
            // })
          }],
          lessonLocked: ['Rest', '$log', '$http', 'data','extendLesson','Auth', function(Rest, $log, $http, data,extendLesson,Auth) {
            var d = new Date();
            $log.debug("HERE")
            return data.getLessonsList(Auth.getLocalProfile().grade).then(function(lessons){
              $log.debug(new Date()- d,"secornds lessonlocked 1")

              return extendLesson.getLesson(lessons,[]).then(function(result){
                $log.debug(new Date()- d,"secornds lessonlocked")
                  return result;
              });
            })
          }],
          scores: ['Rest', '$log', 'data', function(Rest, $log, data) {
            return [];
        }],
        skills : ['Rest', '$log','network','data','Auth', function(Rest, $log, network,data,Auth){
                var d = new Date();
          return data.getSkills({'userId':Auth.getProfileId()}).then(function(response){
            $log.debug(new Date()- d,"secornds skills")

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
      params: {"activatedLesson" : null},
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
        //   if(localStorage.getItem('region')>'3409'){
        //   }
        //   else{
        //       audio.play('three_star');
        //   }
        }],
        onExit: ['audio', function(audio) {
          audio.stop('background');
          // audio.stop('demo-2');
          // audio.stop('demo-4');
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
