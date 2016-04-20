(function() {
  'use strict';

  angular
    .module('zaya-map')
    .controller('mapController', mapController);

  mapController.$inject = ['$scope', '$log', '$ionicModal', '$state', 'lessons', 'Rest', 'CONSTANT', '$sce'];

  function mapController($scope, $log, $ionicModal, $state, lessons, Rest, CONSTANT, $sce) {
    var mapCtrl = this;
    mapCtrl.lessons = lessons;
    mapCtrl.playVideo = playVideo;
    mapCtrl.getLesson = getLesson;
    mapCtrl.getSrc = getSrc;
    // mapCtrl.openModal = openModal;
    // mapCtrl.closeModal = closeModal;

    function getSrc(src){
      return $sce.trustAsResourceUrl('http://192.168.10.194:9000'+src);
    }
    $scope.$on('openNode', function(event, node) {
      $scope.openModal();
      $log.debug(mapCtrl.getLesson(node.id));
    })
    $scope.openModal = function() {
      $scope.modal.show();
    }
    $scope.closeModal = function() {
      $scope.modal.hide();
    }
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    function getLesson(id) {
      Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('lessons', id).get().then(function(response) {
        $log.debug(response.plain());
        mapCtrl.selectedNode = response.plain();
      })
    }

    function playVideo() {
      $state.go('content.video');
    }
  }
})();
