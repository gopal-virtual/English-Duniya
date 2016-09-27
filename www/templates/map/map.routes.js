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
          lessons: ['$log','content','User', function($log,content,User) {
            

            return content.getLessonsList(User.getActiveProfileSync().data.profile.grade).then(function(result){
              

              return result
            })
          }],
          lessonLocked: ['$log','content','extendLesson','User', function($log, content,extendLesson,User) {
            

            return content.getLessonsList(User.getActiveProfileSync().data.profile.grade).then(function(lessons){
              

              return extendLesson.getLesson(lessons,[]).then(function(result){
                

                return result;
              });
            })
          }],
          scores: ['Rest', '$log', 'content', function(Rest, $log, content) {
            return [];
        }],
        skills : ['$log','content','User', function($log,content,User){
          

          return User.skills.get(User.getActiveProfileSync()._id).then(function(response){
            

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
        onEnter: ['$state', 'lessons', 'audio', '$ionicLoading', 'orientation','CONSTANT','$log', function($state, lessons, audio, $ionicLoading, orientation, CONSTANT, $log) {
          orientation.setPortrait();
          $ionicLoading.show({
            templateUrl: 'templates/common/common.loader.view.html',
            // duration: 3000
          });
          if (!lessons) {
            $state.go('map.unauthorised');
          }
          
          // audio.play('background');
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
