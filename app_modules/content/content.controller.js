(function() {
  'use strict';
  angular
    .module('zaya-content')
    .controller('contentController', contentController);
  contentController.$inject = [
    '$stateParams',
    'orientation',
    '$log',
    '$scope',
    'CONSTANT',
    '$ionicModal',
    'lessonutils',
    '$timeout',
    'audio',
    '$ionicPlatform',
    '$ionicLoading',
    'analytics',
    'User',
    '$q',
    'Utilities',
    '$state',
    'localized'
  ];
  /* @ngInject */
  function contentController(
    $stateParams,
    orientation,
    $log,
    $scope,
    CONSTANT,
    $ionicModal,
    lessonutils,
    $timeout,
    audio,
    $ionicPlatform,
    $ionicLoading,
    analytics,
    User,
    $q,
    Utilities,
    $state,
    localized
  ) {
    var contentCtrl = this;
    $scope.audio = audio;
    $scope.video_id = $stateParams.video.id;
    $scope.orientation = orientation;
    contentCtrl.onPlayerReady = onPlayerReady;
    contentCtrl.onStateChange = onStateChange;
    contentCtrl.play = play;
    $scope.lessonutils = lessonutils;
    $scope.userGender = User.getActiveProfileSync().data.profile.gender;
    $scope.resultStarFlag = [];
    // $scope.currentState = $state.current.name;
    $scope.selectedNode = $stateParams.video.resource;
    contentCtrl.toggleControls = toggleControls;
    contentCtrl.onVideoComplete = onVideoComplete;
    $scope.utilities = Utilities;
    $scope.goToMap = goToMap;
    contentCtrl.playStarSound = playStarSound;
    contentCtrl.videoCompleted = false;
    $scope.analytics_quit_data = {
      name: 'VIDEO',
      type: 'QUIT',
      id: $stateParams.video.id
    };
    $scope.logResume = function() {
      analytics.log({
          name: 'VIDEO',
          type: 'RESUME',
          id: $stateParams.video.id
        }, {
          time: new Date()
        },
        User.getActiveProfileSync()._id
      )
    }
    var timeout = '';
    $log.debug('$stateParams', $stateParams)
    contentCtrl.config = {
      sources: [$stateParams.video],
      autoplay: false,
      plugins: {
        controls: {
          showControl: true
        },
      },
      theme: "lib/videogular-themes-default/videogular.css"
    };
    timeout = $timeout(function() {
      contentCtrl.config.plugins.controls.showControl = false;
    }, 2000);
    //   $ionicPlatform.registerBackButtonAction(function(event) {
    //     try {
    //       contentCtrl.API.pause();
    //       $scope.modal.show();
    //     } catch (error) {
    //       ;
    //     }
    // }, 101);
    // $log.debug("selectednode",$scope.selectedNode)
    // $log.debug("Hello from the other side")
    // $log.debug("User USER",User.getActiveProfileSync().data.profile.gender);
    // $log.debug("lessonutils",$scope.lessonutils.user)
    // $log.debug("lessonutils",$scope.lessonutils.getGender())
    // $log.debug("STATE",$state)
    // function playStarAnimation(index){
    //   var star = 0;
    //   if ($scope.summary.stars) {
    //     star = $scope.summary.stars;
    //   }else if ($scope.summary.score.percent) {
    //     star = $scope.summary.score.percent > CONSTANT.STAR.THREE ? 3 : $scope.summary.score.percent > CONSTANT.STAR.TWO ? 2 : $scope.summary.score.percent > CONSTANT.STAR.ONE ? 1 : 0;
    //   }else {
    //     star = 0;
    //   }
    //   for (var i = 0; i < star.length; i++) {
    //   }
    //   angular.element("#audioplayer")[0].pause();
    //   angular.element("#audioSource")[0].src = $stateParams.video.resource.node.parsed_sound;
    //   angular.element("#audioplayer")[0].load();
    //   angular.element("#audioplayer")[0].play();
    // }
    function playStarSound() {
      var starSound = ["one_star", "two_star", "three_star"];
      var star = 0;
      if ($scope.summary.stars) {
        star = $scope.summary.stars;
      } else if ($scope.summary.score.percent) {
        star = $scope.summary.score.percent > CONSTANT.STAR.THREE ? 3 : $scope.summary.score.percent > CONSTANT.STAR.TWO ? 2 : $scope.summary.score.percent > CONSTANT.STAR.ONE ? 1 : 0;
      } else {
        star = 0;
      }
      $log.debug("playing star sound", star);
      for (var i = 0; i < star; i++) {
        $log.debug("sound source", starSound[i]);
        (function(count) {
          timeout = $timeout(function() {
            $scope.resultStarFlag[count] = true;
            $log.debug("sound source", starSound, count, starSound[count]);
            $log.debug("count,star,count==star-1", count, star, count == star - 1);
            audio.player.play("sound/" + starSound[count] + ".mp3");
            if (count == star - 1) {
              $scope.resultPageNextShow = true;
            }
          }, (count + 1) * 1000);
        })(i)
      }
    }
    $log.debug('video object', $stateParams.video.resource)

    function goToMap() {
      analytics.log({
          name: 'VIDEO',
          type: 'SWITCH',
          id: $stateParams.video.id
        }, {
          time: new Date()
        },
        User.getActiveProfileSync()._id
      )
      $ionicLoading.show({
        hideOnStateChange: true
      });
      $scope.closeResult()
      $state.go('map.navigate', {
        activatedLesson: $stateParams.video.resource
      });
    }

    function toggleControls() {
      contentCtrl.config.plugins.controls.showControl = !contentCtrl.config.plugins.controls.showControl;;
    }
    // $ionicPlatform.onHardwareBackButton(function(event) {
    $scope.$on('backButton', function() {
        try {
          if (!$scope.ribbon_modal.isShown() && !$scope.resultMenu.isShown()) {
            $log.debug("HERE")
            contentCtrl.API.pause();
            $scope.openNodeMenu();
          }
          $log.debug("HERE2")
        } catch (error) {;
        }
      })
      // })
    function onVideoComplete() {
      $log.debug("onvideocompleted");
      contentCtrl.config.plugins.controls.showControl = false;
      contentCtrl.videoCompleted = true;
      $scope.summary = {
        stars: 3
      }
      orientation.setPortrait();
      submitReport();
      audio.player.play(CONSTANT.PATH.LOCALIZED_AUDIO + localized.audio.Video.LearnedFromVideo.lang[User.getActiveProfileSync().data.profile.language], function() {
        contentCtrl.playStarSound();
      })
      timeout = $timeout(function() {
        $scope.resultPageNextShow = false;
        $scope.ribbon_modal.hide();
        !$scope.resultMenu.isShown() && $scope.resultMenu.show().then(function() {
          $log.debug('ANIMATION. result menu was open');
          resultButtonAnimation();
        });
        analytics.log({
            name: 'VIDEO',
            type: 'END',
            id: $stateParams.video.id
          }, {
            time: new Date()
          },
          User.getActiveProfileSync()._id
        )
      })
    }

    function submitReport() {
      $log.debug("video in submitReport", $stateParams.video)
      if (!$stateParams.video.resource.isPlayed) {
        challenge.addPoints(User.getActiveProfileSync()._id, 50, 'node_complete',$stateParams.video.resource.node.id);
      }
      var lesson = lessonutils.getLocalLesson();
      var promise = null;
      if (!lesson.score || !lesson.score[$stateParams.video.resource.node.id]) {
        promise = User.skills.update({
          profileId: User.getActiveProfileSync()._id,
          lessonId: $stateParams.video.resource.node.parent,
          score: $stateParams.video.resource.node.type.score,
          totalScore: $stateParams.video.resource.node.type.score,
          skill: lesson.node.tag
        })
      } else {
        promise = $q.resolve();
      }
      promise
        .then(function() {
          return User.scores.update({
            profileId: User.getActiveProfileSync()._id,
            lessonId: $stateParams.video.resource.node.parent,
            id: $stateParams.video.resource.node.id,
            score: $stateParams.video.resource.node.type.score,
            totalScore: $stateParams.video.resource.node.type.score,
            type: 'resource',
            skill: lesson.node.tag,
            playlist_index: $stateParams.video.resource.node.playlist_index
          })
        }).then(function() {
          return User.reports.save({
            'score': $stateParams.video.resource.node.type.score,
            'profileId': User.getActiveProfileSync()._id,
            'node': $stateParams.video.resource.node.id
          })
        })
    }

    function intro_end_video() {
      $log.debug("ENDED");
      $scope.nodeRibbonFlag = false;
      $scope.ribbon_modal.hide();
      contentCtrl.play();
      audio.player.removeCallback();
      // angular.element("#audioSource")[0].src = '';
      // $log.debug("Remove even listener video");
      // angular.element("#audioplayer")[0].removeEventListener('ended',intro_end_video,false);
    }

    function onPlayerReady(API) {
      $log.debug("API", API)
      contentCtrl.API = API;
      $ionicModal.fromTemplateUrl(CONSTANT.PATH.CONTENT + '/content.modal-ribbon' + CONSTANT.VIEW, {
        scope: $scope,
        // animation: 'slide-in-up',
        backdropClickToClose: false,
        hardwareBackButtonClose: false
      }).then(function(modal) {
        $scope.ribbon_modal = modal;
        modal.show();
        if ($stateParams.video.resource.node.parsed_sound) {
          $scope.nodeRibbonFlag = true;
          audio.player.play($stateParams.video.resource.node.parsed_sound);
          // angular.element("#audioplayer")[0].pause();
          // $log.debug("setting",$stateParams.video.resource.node.parsed_sound);
          // angular.element("#audioSource")[0].src = ;
          // angular.element("#audioplayer")[0].load();
          // $log.debug($stateParams.video.resource.node.parsed_sound);
          // angular.element("#audioplayer")[0].play();
          // $log.debug(angular.element("#audioplayer")[0].duration,"duration");
          // $log.debug("Add even listener video");
          angular.element("#audioplayer")[0].onended = intro_end_video;
        } else {
          $log.debug(contentCtrl.API, "here");
          timeout = $timeout(function() {
            intro_end_video()
            contentCtrl.play();
          }, 1000)
        }
      })
    }

    function play() {
      contentCtrl.API.play();
    }

    function onStateChange(state) {
      if (state == 'play') {
        timeout = $timeout(function() {
          orientation.setLandscape();
        })
      }
      //   if (state == 'pause') {
      //     $timeout(function() {
      //       orientation.setPortrait();
      //     })
      //   }
    }
    $scope.openNodeMenu = function() {
      analytics.log({
          name: 'VIDEO',
          type: 'PAUSE',
          id: $stateParams.video.id
        }, {
          time: new Date()
        },
        User.getActiveProfileSync()._id
      )
      if (contentCtrl.API.currentState == 'pause') {
        // orientation.setPortrait()        ;
        $scope.nodeMenu.show().then(function() {
          audio.player.play(CONSTANT.PATH.LOCALIZED_AUDIO + localized.audio.app.ExitResource.lang[User.getActiveProfileSync().data.profile.language]);
        });
      }
      return true;
    }
    $scope.closeNodeMenu = function() {
      $scope.nodeMenu.hide().then(function() {
        audio.player.stop();
      });
      return true;
    }
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.nodeMenu = modal;
    });
    $scope.openResult = function() {
      if (contentCtrl.API.currentState == 'pause') {
        orientation.setPortrait();
        $scope.resultMenu.show().then(function() {
          $log.debug('ANIMATION. result menu was open');
          resultButtonAnimation();
        });
      }
      return true;
    }
    $scope.closeResult = function() {
      $scope.resultMenu.hide();
      return true;
    }
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.COMMON + '/common.modal-result' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.resultMenu = modal;
    });
    $scope.$on('appResume', function() {
      if (!$scope.ribbon_modal.isShown() && !$scope.resultMenu.isShown()) {
        contentCtrl.API.pause();
        $scope.openNodeMenu();
      } else if ($scope.ribbon_modal.isShown()) {
        audio.player.resume();
        angular.element("#audioplayer")[0].onended = intro_end_video;
      } else if ($scope.resultMenu.isShown()) {
        // contentCtrl.onVideoComplete();
      } else {}
    })
    $scope.$on('appPause', function() {
      audio.player.removeCallback();
      audio.player.stop();
      $timeout.cancel(timeout);
    })

    function resultButtonAnimation() {
      $log.debug("ANIMATION. Inside button animation")
      $timeout(function() {
        $scope.resultButtonAnimationFlag = 1;
      }, 3000).then(function() {
        $timeout(function() {
          $scope.resultButtonAnimationFlag = 2;
        }, 400)
      })
    }
  }
})();