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
          lessonLocked: ['Rest', '$log', '$http', 'data','extendLesson', function(Rest, $log, $http, data,extendLesson) {
            return data.getLessonsList(25).then(function(lessons){

              return extendLesson.getLesson(lessons,[])
            })
          }],
          scores: ['Rest', '$log', 'data', function(Rest, $log, data) {
            return [];
        }],
        skills : ['Rest', '$log','network','data','Auth', function(Rest, $log, network,data,Auth){
          $log.debug("Resolvingd skills")
          return data.getSkills({'userId':Auth.getProfileId()}).then(function(response){
            return response;
          })
            // if(network.isOnline()){
            //     return Rest.one('profiles', JSON.parse(localStorage.user_details).profile).all('scores').all('skills').getList().then(function(profile) {
            //         return profile.plain();
            //     });
            // }

            //     if(!network.isOnline()) {
            //         return [{
            //     	"id": "6ef60d7e-64a2-4779-8aba-eae1d2de9246",
            //     	"title": "Vocabulary",
            //     	"lesson_scores": 0,
            //     	"question_scores": 0
            //     }, {
            //     	"id": "d711986f-0451-46d3-b68b-2d2500a1bb1e",
            //     	"title": "Reading",
            //     	"lesson_scores": 0,
            //     	"question_scores": 0
            //     }, {
            //     	"id": "152df66c-0f88-4932-86f2-592fa9d58b0e",
            //     	"title": "Grammar",
            //     	"lesson_scores": 0,
            //     	"question_scores": 0
            //     }, {
            //     	"id": "44f8ded7-c6e6-41e2-9b6b-4bb2a8abe1dd",
            //     	"title": "No tag",
            //     	"lesson_scores": 0,
            //     	"question_scores": 0
            //     }, {
            //     	"id": "a28050a4-adb8-4b0c-8505-3b79d0db8128",
            //     	"title": "Listening",
            //     	"lesson_scores": 0,
            //     	"question_scores": 0
            //     }]
            // }
                //     return [{
                // 	"id": "6ef60d7e-64a2-4779-8aba-eae1d2de9246",
                // 	"title": "Vocabulary",
                // 	"lesson_scores": 220,
                // 	"question_scores": 0
                // }, {
                // 	"id": "d711986f-0451-46d3-b68b-2d2500a1bb1e",
                // 	"title": "Reading",
                // 	"lesson_scores": 180,
                // 	"question_scores": 0
                // }, {
                // 	"id": "152df66c-0f88-4932-86f2-592fa9d58b0e",
                // 	"title": "Grammar",
                // 	"lesson_scores": 200,
                // 	"question_scores": 0
                // }, {
                // 	"id": "a28050a4-adb8-4b0c-8505-3b79d0db8128",
                // 	"title": "Listening",
                // 	"lesson_scores": 100,
                // 	"question_scores": 0
                // }]
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
