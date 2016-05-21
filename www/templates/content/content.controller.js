(function() {
  'use strict';

  angular
    .module('zaya-content')
    .controller('contentController', contentController);

  contentController.$inject = ['$stateParams', 'orientation', '$log','$scope','CONSTANT','$ionicModal','lessonutils'];

  /* @ngInject */
  function contentController($stateParams, orientation, $log, $scope, CONSTANT, $ionicModal, lessonutils) {
    var contentCtrl = this;
    contentCtrl.onPlayerReady = onPlayerReady;
    contentCtrl.onStateChange = onStateChange;
    $scope.lessonutils = lessonutils;
    $scope.selectedNode = lessonutils.getLocalLesson();
    function preload(arrayOfImages) {
          $(arrayOfImages).each(function(){
              $('<img/>')[0].src = this;
          });
      }
      preload([
          '/img/assets/avatar-boy.png',
          '/img/assets/pause_menu_y_top.png',
          '/img/assets/pause_menu_y_middle.png',
          '/img/assets/pause_menu_y_bottom.png'
      ]);
    contentCtrl.config = {
      sources: [$stateParams.video],
      autoplay : true,
      plugins : {
          controls: {
              autoHide: true,
              autoHideTime: 500,
          },
      },
      theme: "lib/videogular-themes-default/videogular.css"
    };

    function onPlayerReady(API) {
      contentCtrl.API = API;
    }
    function onStateChange(state){
        $log.debug(state);
        if(state == 'pause'){
            $scope.openNodeMenu();
        }
    }

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
      orientation.setLandscape();
    });

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    $scope.openNodeMenu = function() {
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
