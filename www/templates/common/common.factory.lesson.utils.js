(function() {
  'use strict';

  angular
    .module('common')
    .factory('lessonutils', lessonutils);

  lessonutils.$inject = ['$ionicLoading', '$state', '$stateParams', 'Rest', '$log', 'CONSTANT', '$timeout', '$sce', '$ionicPopup', 'data', 'mediaManager', 'demo', 'audio'];

  /* @ngInject */
  function lessonutils($ionicLoading, $state, $stateParams, Rest, $log, CONSTANT, $timeout, $sce, $ionicPopup, data, mediaManager, demoFactory, audio) {
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
      demoFactory: demoFactory,
       isState: isState,
       playDemoAudio : playDemoAudio,
       canClickDemo : canClickDemo
    };
    demoFactory.show().then(function(result) {
      utils.demoShown = result;
    })
    utils.demoFactory = demoFactory;
    return utils;


    function getGender() {
      return localStorage.profile ? JSON.parse(localStorage.profile).gender : false;
    }

    function isState(state){
      return $state.is(state);
    }
    function canClickDemo(resource){
        if(
            (utils.resourceType(resource) == 'video')
            &&
            (demoFactory.getStep() == 2 || demoFactory.getStep() == 3)
        ){
            return true;
        }
        if(
            (utils.resourceType(resource) == 'practice')
            &&
            (demoFactory.getStep() == 4)
        ){
            return true;
        }
        return false;
    }
    function leaveLesson() {
      !$state.is('map.navigate') &&
        $ionicLoading.show({
          noBackdrop: false,
          hideOnStateChange: true
        });
      $timeout(function() {
        $state.go('map.navigate');
      })
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

      $log.debug("Play audio")
      audio.play('press');

      if (utils.resourceType(resource) == 'practice' && (utils.demoShown && [2,3].indexOf(utils.demoFactory.getStep()) >= 0)) {
        return;
      }

      if (utils.resourceType(resource) == 'video' && (utils.demoShown && [4].indexOf(utils.demoFactory.getStep()) >= 0)) {
        $log.debug("Stopped")

        return;
      }

      // to do
      $log.debug(resource, "Resource", utils.resourceType(resource))
      $ionicLoading.show({
        // noBackdrop: false
        hideOnStateChange: true
      });
      if (utils.resourceType(resource) == 'assessment') {
        data.downloadAssessment(resource)
        .then(function() {
          $timeout(function() {
            $stateParams.type != 'assessment' &&
              $state.go('quiz.questions', {
                id: resource.node.id,
                type: 'assessment',
                quiz: resource
              });
            $stateParams.type == 'assessment' && $ionicLoading.hide();
          });
        })
        .catch(function(e){
          $log.debug("Error playing resource",e)
        })

      } else if (utils.resourceType(resource) == 'practice') {
        $log.debug("PLayed")
        data.downloadAssessment(resource).then(function() {
          $timeout(function() {
            $stateParams.type != 'practice' &&
              $state.go('quiz.questions', {
                id: resource.node.id,
                type: 'practice',
                quiz: resource
              });
            $stateParams.type == 'practice' && $ionicLoading.hide();
          });
        })

      } else if (utils.resourceType(resource) == 'video') {
        data.downloadVideo(resource).then(function() {
          mediaManager.getPath(resource.node.type.path).then(function(path) {
              $timeout(function() {
                !$state.is('content.video') &&
                  $state.go('content.video', {
                    video: {
                      src: utils.getSrc(path),
                      type: 'video/mp4'
                    }
                  });
                if ($state.is('content.video')) {
                  video.play();
                  $ionicLoading.hide();
                }
                utils.demoFactory.getStep() !=5 && utils.demoFactory.setStep(3);
              });
            })
            // utils.config.sources[0].src = utils.getSrc(resource.node.type.path);

        })
      } else {
        $ionicLoading.hide();
      }
    }



    function getSrc(src) {
      return $sce.trustAsResourceUrl(src);
    }

    function playDemoAudio(){
      $log.debug("Playing audio init")
      if(utils.demoShown){
        $log.debug("Playing audio init 1")

        if(utils.demoFactory.getStep() == 2){
          $log.debug("Playing audio init 2")
          audio['demo-1'].stop();
          audio['demo-2'].play();
        }
        if(utils.demoFactory.getStep() == 4){
            audio['demo-3'].stop();
          audio['demo-4'].play();
          $log.debug("Playing audio init 4")

        }
      }
    }


  }
})();
