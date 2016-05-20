(function() {
  'use strict';

  angular
    .module('common')
    .factory('lessonutils', lessonutils);

  lessonutils.$inject = ['$ionicLoading', '$state', 'Rest', '$log', 'CONSTANT', '$timeout', '$sce'];

  /* @ngInject */
  function lessonutils($ionicLoading, $state, Rest, $log, CONSTANT, $timeout, $sce) {
    var utils = {
      getLesson: getLesson,
      getLocalLesson: getLocalLesson,
      setLocalLesson: setLocalLesson,
      resourceType: resourceType,
      getIcon: getIcon,
      playResource: playResource,
      getSrc: getSrc
    };

    return utils;

    function getLesson(id, scope, callback) {
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('lessons', id).get().then(function(response) {
        $ionicLoading.hide();
        utils.setLocalLesson(JSON.stringify(response.plain()));
        callback && callback(response.plain());
      })
    }

    function getLocalLesson() {
      return JSON.parse(localStorage.lesson);
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

    function playResource(resource) {
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      if (utils.resourceType(resource) == 'assessment') {
        $timeout(function() {
          $state.go('quiz.questions', {
            id: resource.node.id
          });
        });
      } else if (utils.resourceType(resource) == 'practice') {
        $timeout(function() {
          $state.go('quiz.practice.questions', {
            id: resource.node.id
          });
        });
      } else if (utils.resourceType(resource) == 'video') {
        $timeout(function() {
          $state.go('content.video', {
            video: {
              src: utils.getSrc(resource.node.type.path),
              type: 'video/mp4'
            }
          });
        });
        //   utils.config.sources[0].src = utils.getSrc(resource.node.type.path);
      } else {}
    }

    function getSrc(src) {
      return $sce.trustAsResourceUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + src);
    }
  }
})();
