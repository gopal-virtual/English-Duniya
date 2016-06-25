(function() {
  'use strict';

  angular
    .module('common')
    .factory('lessonutils', lessonutils);

  lessonutils.$inject = ['$ionicLoading', '$state', '$stateParams', 'Rest', '$log', 'CONSTANT', '$timeout', '$sce', '$ionicPopup', 'data', 'mediaManager'];

  /* @ngInject */
  function lessonutils($ionicLoading, $state, $stateParams, Rest, $log, CONSTANT, $timeout, $sce, $ionicPopup, data, mediaManager) {
    var utils = {
      leaveLesson: leaveLesson,
      getLesson: getLesson,
      getLocalLesson: getLocalLesson,
      setLocalLesson: setLocalLesson,
      resourceType: resourceType,
      getIcon: getIcon,
      playResource: playResource,
      getSrc: getSrc,
      currentState: currentState,
      getGender: getGender,
    };

    return utils;

    function getGender() {
      return localStorage.profile ? JSON.parse(localStorage.profile).gender : false;
    }

    function leaveLesson() {
      !$state.is('map.navigate') &&
        $ionicLoading.show({
          noBackdrop: false,
          hideOnStateChange: true
        });
      $timeout(function() {
        $state.go('map.navigate');
      }, 1000)
    }

    function currentState(resource) {
      if ($stateParams.type == 'assessment' && utils.resourceType(resource) == 'assessment' && $state.current.name != 'quiz.summary') {
        return true;
      } else if ($stateParams.type == 'practice' && utils.resourceType(resource) == 'practice' && $state.current.name != 'quiz.summary') {
        return true;
      } else if ($state.is('content.video') && utils.resourceType(resource) == 'video') {
        return true;
      } else {
        return false;
      }
    }

    function getLesson(id, scope, callback) {
      $ionicLoading.show({
        noBackdrop: false,
      });
      data.getLesson(id).then(function(response) {
        $ionicLoading.hide();

        utils.setLocalLesson(JSON.stringify(response));
        callback && callback(response);
      }, function(error) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Sorry',
          template: 'You need to be online!'
        });
      })
    }

    function getLocalLesson() {
      return localStorage.lesson ? JSON.parse(localStorage.lesson) : {};
    }

    function setLocalLesson(lesson) {
      localStorage.setItem('lesson', lesson);
    }

    function resourceType(resource) {
      if (resource.node.content_type_name == 'assessment' && resource.node.type.type == 'assessment') {
        return 'assessment';
      } else if (resource.node.content_type_name == 'assessment' && resource.node.type.type == 'practice') {
        return 'practice';
      } else if (resource.node.content_type_name == 'resource' && resource.node.type.file_type == 'mp4') {
        return 'video';
      } else {}
    }

    function getIcon(resource) {
      if (resource.node.content_type_name == 'assessment' && resource.node.type.type == 'assessment') {
        return CONSTANT.ASSETS.IMG.ICON + '/quiz.png';
      } else if (resource.node.content_type_name == 'assessment' && resource.node.type.type == 'practice') {
        return CONSTANT.ASSETS.IMG.ICON + '/practice.png';
      } else if (resource.node.content_type_name == 'resource' && resource.node.type.file_type == 'mp4') {
        return CONSTANT.ASSETS.IMG.ICON + '/video.png';
      } else {

      }
    }

    function playResource(resource, video) {
      $log.debug(resource,"Resource",utils.resourceType(resource))
      $ionicLoading.show({
        // noBackdrop: false
        hideOnStateChange: true
      });
      if (utils.resourceType(resource) == 'assessment') {
        data.downloadAssessment(resource)
        .then(function() {
          $timeout(function() {
            $stateParams.type != 'assessment' &&
              $state.go('quiz.start', {
                id: resource.node.id,
                type: 'assessment',
                quiz: resource
              });
            $stateParams.type == 'assessment' && $ionicLoading.hide();
          });
        })

      } else if (utils.resourceType(resource) == 'practice') {
      data.downloadAssessment(resource).then(function() {
          $timeout(function() {
            $stateParams.type != 'practice' &&
              $state.go('quiz.start', {
                id: resource.node.id,
                type: 'practice',
                quiz: resource
              });
            $stateParams.type == 'practice' && $ionicLoading.hide();
          });
        })

      } else if (utils.resourceType(resource) == 'video') {
        data.downloadVideo(resource).then(function() {
          $timeout(function() {
            !$state.is('content.video') &&
              $state.go('content.video', {
                video: {
                  src: utils.getSrc(resource.node.type.path),
                  type: 'video/mp4'
                }
              });
            if ($state.is('content.video')) {
              video.play();
            }
          });
          utils.config.sources[0].src = utils.getSrc(resource.node.type.path);
        })

      } else {}
    }



    function getSrc(src) {
      return $sce.trustAsResourceUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + src);
    }
  }
})();
