(function() {
  'use strict';

  angular
    .module('zaya-content')
    .controller('contentController', contentController);

  contentController.$inject = ['$stateParams', 'orientation', '$log','$scope','CONSTANT','$ionicModal','lessonutils','$timeout','audio'];

  /* @ngInject */
  function contentController($stateParams, orientation, $log, $scope, CONSTANT, $ionicModal, lessonutils,$timeout,audio) {
    var contentCtrl = this;
    $scope.audio = audio;
    $scope.orientation=orientation;
    contentCtrl.onPlayerReady = onPlayerReady;
    contentCtrl.onStateChange = onStateChange;
    $scope.lessonutils = lessonutils;
    $scope.selectedNode = lessonutils.getLocalLesson();
    contentCtrl.config = {
      sources: [$stateParams.video],
      autoplay : true,
      plugins : {
          controls: {
              autoHide: true,
              autoHideTime: 1000,
          },
      },
      theme: "lib/videogular-themes-default/videogular.css"
    };

    function onPlayerReady(API) {
      contentCtrl.API = API;
    }
    function onStateChange(state){
        $timeout(function(){
            if(state == 'pause'){
                // $scope.openNodeMenu();
            }
        })
        $timeout(function(){
            if(state == 'stop'){
                $log.debug('video ended',state);
                $scope.modal.show();
            }
        })
    }

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    $scope.openNodeMenu = function() {
        if(contentCtrl.API.currentState == 'pause')
              $scope.modal.show();
      return true;
    }
    $scope.closeNodeMenu = function() {
      $scope.modal.hide();
      return true;
    }
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
    }).then(function(modal) {
      $scope.modal = modal;
    });

  }

})();
