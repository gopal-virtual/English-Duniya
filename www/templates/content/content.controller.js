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

    function onPlayerReady(API) {
      contentCtrl.API = API;
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
      $log.debug($scope.selectedNode);
    });
    $scope.openResult = function() {
        if (contentCtrl.API.currentState == 'pause') {
            orientation.setPortrait();
            $scope.resultMenu.show();
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
      $log.debug('result menu', $scope.resultMenu);
    });


    // $scope.nodeRibbon;

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.CONTENT + '/content.modal-ribbon' + CONSTANT.VIEW, {
      scope: $scope,
      // animation: 'slide-in-up',
      backdropClickToClose: true
    }).then(function(modal){
      $scope.nodeRibbonFlag = true;
      modal.show();
      $timeout(function() {
        $scope.nodeRibbonFlag = false;
        modal.hide();
        contentCtrl.play();
      }, 2000);
    })

  }

})();
