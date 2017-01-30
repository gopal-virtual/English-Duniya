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
          lessons: ['$log', 'content', 'User', function($log, content, User) {
            return []
              // return content.getResourceList(User.getActiveProfileSync().data.profile.grade).then(function(result){
              //   return result
              // })
          }],
          lessonLocked: ['$log', 'content', 'extendLesson', 'User', function($log, content, extendLesson, User) {
            extendLesson.initStar();
            if (CONSTANT.CONTENT_TEST) {
              return content.getLessonsList().then(function(lessons) {
                $log.debug('modified lesson list', lessons)
                return {
                  lockedLesson: lessons,
                  total_star: 999
                };
              })
            } else {
              return content.getResourceList(User.getActiveProfileSync().data.profile.grade).then(function(lessons) {
                return extendLesson.getLesson(lessons).then(function(result) {
                  $log.debug("Result is ", result)
                  return {
                    lockedLesson: result,
                    total_star: extendLesson.getTotalStar()
                  };
                });
              })
            }
            // return content.getResourceList(User.getActiveProfileSync().data.profile.grade).then(function(result){
            //   $log.debug("HERE",result);
            //       return result;
            // })
          }],
          scores: ['Rest', '$log', 'content', function(Rest, $log, content) {
            return [];
          }],
          skills: ['$log', 'content', 'User', function($log, content, User) {
            return User.skills.get(User.getActiveProfileSync()._id).then(function(response) {
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
        data: {
          litmus: {
            "id": "001",
            "content_type_name": "litmus",
            "tag": "Litmus",
            "locked": false
          },
        },
        onEnter: ['$state', 'lessons', 'audio', '$ionicLoading', 'orientation', 'CONSTANT', '$log', function($state, lessons, audio, $ionicLoading, orientation, CONSTANT, $log) {
          orientation.setPortrait();
          $ionicLoading.show({
            templateUrl: 'templates/common/common.loader.view.html',
          });
          if (!lessons) {
            $state.go('map.unauthorised');
          }
          if (localStorage.getItem('diagnosis_flag') == 'false') {
            $ionicLoading.hide();
            $state.go('litmus_start');
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
            // templateUrl: CONSTANT.PATH.MAP + '/map' + CONSTANT.VIEW,
            templateUrl: function($stateParams) {
              return CONSTANT.CONTENT_TEST ? CONSTANT.PATH.MAP + '/map.list' + CONSTANT.VIEW : CONSTANT.PATH.MAP + '/map' + CONSTANT.VIEW;
            },
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
      .state('repaint', {
        url: '/repaint',
        onEnter: ['$state', '$timeout', '$log', '$ionicLoading', function($state, $timeout, $log, $ionicLoading) {
          $timeout(function() {
            $state.go('map.navigate', {})
          }, 1000)
        }],
        template: "<ion-nav-view></ion-nav-view>"
      })
      .state('weekly-challenge', {
        url: '/weekly-challenge',
        templateProvider: function($timeout, $stateParams, $log, User) {
          $log.debug("weekly challenge template provider");
          return $timeout(function() {
            return "<ion-nav-view><iframe style='width:100vw;height:100vh' src='http://challenge.englishduniya.in/#!/0429fb91-4f3c-47de-9adb-609996962188/" + User.getActiveProfileSync()._id + "/" + localStorage.getItem('Authorization') + "'></iframe></ion-nav-view>"
          }, 100);
        },
        controller: ['$state','$log', function($state,$log) {

        }]
      });
  }
})();
