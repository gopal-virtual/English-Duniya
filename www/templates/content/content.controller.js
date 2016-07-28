(function() {
  'use strict';

  angular
    .module('zaya-content')
    .controller('contentController', contentController);

  contentController.$inject = ['$stateParams', 'orientation', '$log', '$scope', 'CONSTANT', '$ionicModal', 'lessonutils', '$timeout', 'audio', '$ionicPlatform','Auth','data'];

  /* @ngInject */
  function contentController($stateParams, orientation, $log, $scope, CONSTANT, $ionicModal, lessonutils, $timeout, audio, $ionicPlatform, Auth, dataFactory) {
    var contentCtrl = this;
    $scope.audio = audio;
    $scope.orientation = orientation;
    contentCtrl.onPlayerReady = onPlayerReady;
    contentCtrl.onStateChange = onStateChange;
    $scope.lessonutils = lessonutils;
    $scope.selectedNode = lessonutils.getLocalLesson();
    contentCtrl.toggleControls = toggleControls;
    contentCtrl.onVideoComplete = onVideoComplete;
    contentCtrl.config = {
      sources: [$stateParams.video],
      autoplay: true,
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
  //       $log.debug(error);
  //     }
  // }, 101);

  function toggleControls(){
      contentCtrl.config.plugins.controls.showControl=!contentCtrl.config.plugins.controls.showControl;
      $log.debug(contentCtrl.config.plugins.controls.showControl);
  }
  $log.debug($stateParams)
  $ionicPlatform.onHardwareBackButton(function(event) {
      try {
        contentCtrl.API.pause();
        $scope.openNodeMenu();
      } catch (error) {
        $log.debug(error);
      }
  })

    function onVideoComplete() {
      submitReport()
        $timeout(function() {
          orientation.setPortrait();
          $scope.modal.show();

        })
    }

    function submitReport(){
      var  lesson = lessonutils.getLocalLesson();
        dataFactory.updateSkills({
          userId: Auth.getProfileId(),
          lessonId: lesson.node.id,
          score: $stateParams.video.resource.node.type.score,
          totalScore: $stateParams.video.resource.node.type.score,
          skill: lesson.node.tag
        }).then(function(){
          return dataFactory.updateScore({
            userId: Auth.getProfileId(),
            lessonId: lesson.node.id,
            id: $stateParams.video.resource.node.id,
            score: $stateParams.video.resource.node.type.score,
            totalScore: $stateParams.video.resource.node.type.score,
          })
        }).then(function(){
          return dataFactory.saveReport({
            'score': $stateParams.video.resource.node.type.score,
            'userId': Auth.getProfileId(),
            'node': $stateParams.video.resource.node.id
          })
        })
    }

    function onPlayerReady(API) {
      contentCtrl.API = API;
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
        $scope.modal.show();
      }
      return true;
    }
    $scope.closeNodeMenu = function() {
      $scope.modal.hide();
      return true;
    }
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.modal = modal;
    });

  }

})();
