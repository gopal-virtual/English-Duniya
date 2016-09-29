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
                '$state'
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
                $state
           ) {
    var contentCtrl = this;
    $scope.audio = audio;
    $scope.orientation = orientation;
    contentCtrl.onPlayerReady = onPlayerReady;
    contentCtrl.onStateChange = onStateChange;
    contentCtrl.play = play;
    $scope.lessonutils = lessonutils;
    $scope.selectedNode = lessonutils.getLocalLesson();
    contentCtrl.toggleControls = toggleControls;
    contentCtrl.onVideoComplete = onVideoComplete;
    contentCtrl.utilities = Utilities;
    contentCtrl.next = next;
    contentCtrl.config = {
      sources: [$stateParams.video],
      autoplay: false,
      plugins: {
        controls: {
          showControl : true
        },
      },
      theme: "lib/videogular-themes-default/videogular.css"
    };
    contentCtrl.playStarSound = playStarSound;
    $timeout(function(){
        contentCtrl.config.plugins.controls.showControl = false;
    },2000);
  //   $ionicPlatform.registerBackButtonAction(function(event) {
  //     try {
  //       contentCtrl.API.pause();
  //       $scope.modal.show();
  //     } catch (error) {
  //       ;
  //     }
  // }, 101);

  function playStarSound() {
      if (quizCtrl.summary.stars) {
        star = quizCtrl.summary.stars;
      } else if (quizCtrl.summary.score.percent) {
        star = quizCtrl.summary.score.percent > CONSTANT.STAR.THREE ? 3 : quizCtrl.summary.score.percent > CONSTANT.STAR.TWO ? 2 : quizCtrl.summary.score.percent > CONSTANT.STAR.ONE ? 1 : 0;
      } else {
        star = 0;
      }
      $log.debug("Hello");
      for (var i = 0; i < star; i++) {
        (i + 1) == 1 && $timeout(function() {
          audio.play('one_star')
        }, 1000);
        (i + 1) == 2 && $timeout(function() {
          audio.play('two_star')
        }, 2000);
        (i + 1) == 3 && $timeout(function() {
          audio.play('three_star')
        }, 3000);
      }
    }

  $log.debug('video object',$stateParams.video.resource)
  function next() {
      $ionicLoading.show({
          hideOnStateChange: true
      });
      $scope.closeResult()
      $state.go('map.navigate', {activatedLesson : $stateParams.video.resource});
  }

  function toggleControls(){
      contentCtrl.config.plugins.controls.showControl=!contentCtrl.config.plugins.controls.showControl;
      ;
  }

  $ionicPlatform.onHardwareBackButton(function(event) {
      try {
        contentCtrl.API.pause();
        $scope.openNodeMenu();
      } catch (error) {
        ;
      }
  })

    function onVideoComplete() {
        contentCtrl.summary = {
            stars : 3
        }
      submitReport()
        $timeout(function() {
          orientation.setPortrait();
          $scope.resultMenu.show();
			analytics.log(
              {
                  name : 'VIDEO',
                  type : 'END',
                  id : $stateParams.video.id
              },
              {
                  time : new Date()
              },
        User.getActiveProfileSync()._id

      )
        })
    }

    function submitReport(){
      var  lesson = lessonutils.getLocalLesson();
      var promise = null;
      if(!lesson.score || !lesson.score[$stateParams.video.resource.node.id]){

        promise = User.skills.update({
          profileId: User.getActiveProfileSync()._id,
          lessonId: lesson.node.id,
          score: $stateParams.video.resource.node.type.score,
          totalScore: $stateParams.video.resource.node.type.score,
          skill: lesson.node.tag
        })
      }
      else{
        promise = $q.resolve();
      }
      promise
        .then(function(){

          return User.scores.update({
            profileId: User.getActiveProfileSync()._id,
            lessonId: lesson.node.id,
            id: $stateParams.video.resource.node.id,
            score: $stateParams.video.resource.node.type.score,
            totalScore: $stateParams.video.resource.node.type.score,
            type: 'resource'
          })
        }).then(function(){
          return User.reports.save({
            'score': $stateParams.video.resource.node.type.score,
            'profileId': User.getActiveProfileSync()._id,
            'node': $stateParams.video.resource.node.id
          })
        })
    }
    function intro_end_video(){
      $log.debug("ENDED");
      $scope.nodeRibbonFlag = false;
      $scope.ribbon_modal.hide();
      contentCtrl.play();
      angular.element("#audioSource")[0].src = '';
      $log.debug("Remove even listener video");

      angular.element("#audioplayer")[0].removeEventListener('ended',intro_end_video,false);
    }
    function onPlayerReady(API) {
      $log.debug("API",API)
      contentCtrl.API = API;

      $ionicModal.fromTemplateUrl(CONSTANT.PATH.CONTENT + '/content.modal-ribbon' + CONSTANT.VIEW, {
        scope: $scope,
        // animation: 'slide-in-up',
        backdropClickToClose: true
      }).then(function(modal){
        $scope.ribbon_modal = modal;
        if($stateParams.video.resource.node.parsed_sound){
          $scope.nodeRibbonFlag = true;
          modal.show();
          angular.element("#audioplayer")[0].pause();
          $log.debug("setting",$stateParams.video.resource.node.parsed_sound);
          angular.element("#audioSource")[0].src = $stateParams.video.resource.node.parsed_sound;
          angular.element("#audioplayer")[0].load();
          $log.debug($stateParams.video.resource.node.parsed_sound);
          angular.element("#audioplayer")[0].play();
          $log.debug(angular.element("#audioplayer")[0].duration,"duration")
          $log.debug("Add even listener video");

          angular.element("#audioplayer")[0].addEventListener('ended',intro_end_video,false);
        }else{
          $log.debug(contentCtrl.API,"here");
          // contentCtrl.API.pause();
          $timeout(function () {
            contentCtrl.play();
          },100)
        }
      })
    }

    function play(){
        analytics.log(
            {
                name : 'VIDEO',
                type : 'START',
                id : $stateParams.video.resource.node.id
            },
            {
                time : new Date()
            },
          User.getActiveProfileSync()._id

        )
        contentCtrl.API.play();
    }
    function onStateChange(state) {
      if (state == 'play') {
        $timeout(function() {
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
      if (contentCtrl.API.currentState == 'pause') {
        orientation.setPortrait();
        $scope.nodeMenu.show();
      }
      return true;
    }
    $scope.closeNodeMenu = function() {
      $scope.nodeMenu.hide();
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
            $scope.resultMenu.show();
        }
        contentCtrl.playStarSound();
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


    // $scope.nodeRibbon;


  }

})();
