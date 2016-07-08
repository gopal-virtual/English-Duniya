(function() {
  'use strict';

  angular
    .module('zaya-content')
    .controller('contentController', contentController);

  contentController.$inject = ['$stateParams', 'orientation', '$log', '$scope', 'CONSTANT', '$ionicModal', 'lessonutils', '$timeout', 'audio', '$ionicPlatform'];

  /* @ngInject */
  function contentController($stateParams, orientation, $log, $scope, CONSTANT, $ionicModal, lessonutils, $timeout, audio, $ionicPlatform) {
    var contentCtrl = this;
    $scope.audio = audio;
    $scope.orientation = orientation;
    contentCtrl.onPlayerReady = onPlayerReady;
    contentCtrl.onStateChange = onStateChange;
    $scope.lessonutils = lessonutils;
    $scope.selectedNode = lessonutils.getLocalLesson();
    contentCtrl.config = {
      sources: [$stateParams.video],
      autoplay: true,
      plugins: {
        controls: {
          autoHide: true,
          autoHideTime: 1000,
        },
      },
      theme: "lib/videogular-themes-default/videogular.css"
    };
  //   $ionicPlatform.registerBackButtonAction(function(event) {
  //     try {
  //       contentCtrl.API.pause();
  //       $scope.modal.show();
  //     } catch (error) {
  //       $log.debug(error);
  //     }
  // }, 101);

  $ionicPlatform.onHardwareBackButton(function(event) {
      try {
        contentCtrl.API.pause();
        $scope.modal.show();
      } catch (error) {
        $log.debug(error);
      }
  })

    function onPlayerReady(API) {
      contentCtrl.API = API;
    }

    function onStateChange(state) {
      if (state == 'play') {
        $timeout(function() {
          orientation.setLandscape();
        })
      }
      if (state == 'pause') {
        $timeout(function() {
          orientation.setPortrait();
        })
      }
      if (state == 'stop') {
        $timeout(function() {
          orientation.setPortrait();
          $scope.modal.show();
        })
      }
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
