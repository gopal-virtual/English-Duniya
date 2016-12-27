(function() {
  'use strict';

  angular
    .module('common')
    .factory('lessonutils', lessonutils);

  lessonutils.$inject = [
    '$ionicLoading',
    '$state',
    '$stateParams',
    '$log',
    'CONSTANT',
    '$timeout',
    '$sce',
    '$ionicPopup',
    'content',
    'mediaManager',
    'analytics',
    'User'
  ];

  /* @ngInject */
  function lessonutils(
    $ionicLoading,
    $state,
    $stateParams,
    $log,
    CONSTANT,
    $timeout,
    $sce,
    $ionicPopup,
    content,
    mediaManager,
    analytics,
    User
  ) {
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
      isState: isState,
      playDemoAudio: playDemoAudio,
      canClickDemo: canClickDemo,
      getVideo: getVideo,
      user: User,
      demoShown: demoShown
    };
    // utils. = User.demo.isShown();
    return utils;

    function demoShown() {
      User.demo.isShown();
    }

    function getGender() {
      return localStorage.profile ? JSON.parse(localStorage.profile).gender : false;
    }

    function isState(state) {
      return $state.is(state);
    }

    function canClickDemo(resource) {
      if (
        (utils.resourceType(resource) == 'video') &&
        (User.demo.getStep() == 2 || User.demo.getStep() == 3)
      ) {
        return true;
      }
      if (
        (utils.resourceType(resource) == 'practice') &&
        (User.demo.getStep() == 4)
      ) {
        return true;
      }
      return false;
    }

    function leaveLesson() {
      angular.element("#audioplayer")[0].pause();
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

    function getLesson(id, scope) {
      // $ionicLoading.show();
      var lesson = null;
      return content.getLesson(id).then(function(response) {

          lesson = response;

          return User.scores.getScoreOfLesson(id, User.getActiveProfileSync()._id);
        })
        .then(function(score) {
          lesson.score = score;
          utils.setLocalLesson(JSON.stringify(lesson));
          return lesson;
          // $ionicLoading.hide();
          // callback && callback(lesson);
        })
        .catch(function(e) {
          // $ionicLoading.hide();

          $ionicPopup.alert({
            title: CONSTANT.ERROR_MESSAGES.DEFAULT_TITLE,
            template: e.message ? e.message : CONSTANT.ERROR_MESSAGES.DEFAULT
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
      } else if (resource.node.content_type_name == 'resource' && (resource.node.type.file_type == 'mp4' || resource.node.type.file_type == 'video/mp4')) {
        return 'video';
      } else if (resource.node.content_type_name == 'vocabulary') {
        return 'vocabulary';
      } else {}
    }

    function getVideo() {
      var lesson = utils.getLocalLesson();
      var resources = lesson.objects;
      for (var i = 0, count = resources.length; i < count; i++) {
        if (resourceType(resources[i]) == 'video') {
          return resources[i];
        }
      }
      return null;
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

    function playResource(resource, video, callback) {
      angular.element("#audioplayer")[0].pause();
        // playDemoAudio(resource);

      //   if (utils.resourceType(resource) == 'practice' && (User.demo.isShown() && [2, 3].indexOf(User.demo.getStep()) >= 0)) {
      //     return;
      //   }
      //
      //   if (utils.resourceType(resource) == 'video' && (User.demo.isShown() && [4].indexOf(User.demo.getStep() ) >= 0)) {
      //     return;
      //   }


      // to do
  
      $log.debug("Play Resource",utils.resourceType(resource));
      if (utils.resourceType(resource) == 'vocabulary') {
        content.downloadVocabulary(resource)
        .then(function() {
          analytics.log({
                name: 'VOCABULARY',
                type: 'START',
                id: resource.node.id
              }, {
                time: new Date()
              },
              User.getActiveProfileSync()._id

            ) &&
            content.getVocabulary(resource).then(function(resource){
                $state.go('content.vocabulary.intro', {
                    vocab_data: resource
                });
            }).catch(function(e) {
            $log.debug("We need to check", e)

            $ionicPopup.alert({
              title: CONSTANT.ERROR_MESSAGES.DEFAULT_TITLE,
              template: e.message ? e.message : CONSTANT.ERROR_MESSAGES.DEFAULT
            }).then(function() {
              if (callback) {

                callback();
              }
            });
          })
          .finally(function() {


            $ionicLoading.hide();
          })
        })
      } else if (utils.resourceType(resource) == 'assessment') {
        $log.debug("play resource asseessmnet")
        content.downloadAssessment(resource)
          .then(function() {
            $timeout(function() {
              $stateParams.type != 'assessment' &&
                analytics.log({
                    name: 'QUIZ',
                    type: 'START',
                    id: resource.node.id
                  }, {
                    time: new Date()
                  },
                  User.getActiveProfileSync()._id

                ) &&
                $state.go('quiz.questions', {
                  id: resource.node.id,
                  type: 'assessment',
                  quiz: resource
                });
              $stateParams.type == 'assessment' && $ionicLoading.hide();
            });
          })
          .catch(function(e) {

          })

      } else if (utils.resourceType(resource) == 'practice') {
        $log.debug("Play resource practice found")
        content.downloadAssessment(resource).then(function() {
            $log.debug("Play resource practice downlaoded",resource.node.id,resource)

            $timeout(function() {
              $log.debug("play resource")
              
                $state.go('quiz.start', {
                  id: resource.node.id,
                  type: 'practice',
                  quiz: resource
                });
              $stateParams.type == 'practice' && $ionicLoading.hide();
            });
          }).catch(function(e) {
            $log.debug("play resource error", e)

            $ionicPopup.alert({
              title: CONSTANT.ERROR_MESSAGES.DEFAULT_TITLE,
              template: e.message ? e.message : CONSTANT.ERROR_MESSAGES.DEFAULT
            }).then(function() {
              if (callback) {

                callback();
              }
            });
          })
          .finally(function() {


            $ionicLoading.hide();
          })
      } else if (utils.resourceType(resource) == 'video') {
        content.downloadVideo(resource).then(function() {
            mediaManager.getPath(resource.node.type.path).then(function(path) {
              $timeout(function() {
                !$state.is('content.video') &&
                  analytics.log({
                      name: 'VIDEO',
                      type: 'START',
                      id: resource.node.id
                    }, {
                      time: new Date()
                    },
                    User.getActiveProfileSync()._id

                  ) &&
                  $state.go('content.video', {
                    video: {
                      src: utils.getSrc(path),
                      type: 'video/mp4',
                      id: resource.node.id,
                      "resource": resource
                    }
                  });
                if ($state.is('content.video')) {
                  video.play();
                  $ionicLoading.hide();
                }
                User.demo.getStep() != 5 && User.demo.setStep(3);
              });
            });
          })
          .catch(function(e) {

            $ionicPopup.alert({
              title: CONSTANT.ERROR_MESSAGES.DEFAULT_TITLE,
              template: e.message ? e.message : CONSTANT.ERROR_MESSAGES.DEFAULT
            }).then(function() {
              if (callback) {

                callback();
              }
            });
          })
          .finally(function() {
            $ionicLoading.hide();
          })
      } else {
        $ionicLoading.hide();
      }
    }



    function getSrc(src) {
      return $sce.trustAsResourceUrl(src);
    }

    function playDemoAudio(node) {

      //
      // if (User.demo.isShown() ) {
      //   if (User.demo.getStep() == 2) {
      //     angular.element("#audioplayer")[0].pause();
      //     angular.element("#audioSource")[0].src = 'sound/demo-2.mp3';
      //     angular.element("#audioplayer")[0].load();
      //     angular.element("#audioplayer")[0].play();
      //   } else if (User.demo.getStep() == 4) {
      //     angular.element("#audioplayer")[0].pause();
      //     angular.element("#audioSource")[0].src = 'sound/demo-4.mp3';
      //     angular.element("#audioplayer")[0].load();
      //     angular.element("#audioplayer")[0].play();
      //   } else if (node.meta && node.meta.parsed_sound) {
      //     angular.element("#audioSource")[0].src = node.meta.parsed_sound;
      //     angular.element("#audioplayer")[0].load();
      //     angular.element("#audioplayer")[0].play();
      //   }
      // } else {

      if (node.node && node.node.parsed_sound) {

        angular.element("#audioSource")[0].src = node.node.parsed_sound;
        angular.element("#audioplayer")[0].load();
        angular.element("#audioplayer")[0].play();
      }
      // }
    }
  }
})();
