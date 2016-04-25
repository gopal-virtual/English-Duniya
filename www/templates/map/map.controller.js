(function() {
  'use strict';

  angular
    .module('zaya-map')
    .controller('mapController', mapController);

  mapController.$inject = ['$scope','$rootScope', '$log', '$ionicModal', '$state', 'lessons', 'Rest', 'CONSTANT', '$sce'];

  function mapController($scope, $rootScope, $log, $ionicModal, $state, lessons, Rest, CONSTANT, $sce) {
    var mapCtrl = this;
    mapCtrl.lessons = lessons;
    mapCtrl.getLesson = getLesson;
    mapCtrl.getSrc = getSrc;
    mapCtrl.resetNode = resetNode;
    mapCtrl.getIcon = getIcon;
    mapCtrl.resourceType = resourceType;
    mapCtrl.playResource = playResource;
    // mapCtrl.openModal = openModal;
    // mapCtrl.closeModal = closeModal;

    function playResource (resource) {
      $log.debug('quiz resource', resource);
      $state.go('quiz.questions',{id : resource.node.id});
    }
    function resourceType (resource){
      if(resource.node.content_type_name == 'assessment'){
        return 'assessment';
      }
      else if(resource.node.content_type_name == 'resource'){
        if(resource.node.type.file_type.substring(0,resource.node.type.file_type.indexOf('/')) == 'video'){
          return 'video';
        }
      }
      else {}
    }
    function getSrc(src){
      return $sce.trustAsResourceUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + src);
    }
    function getIcon(resource){
      if(resource.node.content_type_name == 'assessment'){
        return CONSTANT.ASSETS.IMG.ICON + '/quiz.png';
      }
      else if(resource.node.content_type_name == 'resource'){
        if(resource.node.type.file_type.substring(0,resource.node.type.file_type.indexOf('/')) == 'video'){
          return CONSTANT.ASSETS.IMG.ICON + '/video.png';
        }
      }
      else {

      }
    }

    $scope.$on('openNode', function(event, node) {
      $scope.openModal();
      $log.debug('lesson id : ',node.id);
      $log.debug(mapCtrl.getLesson(node.id));
    })
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    $scope.openModal = function() {
      $scope.modal.show();
    }
    $scope.closeModal = function() {
      $scope.modal.hide();
    }

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    function resetNode(){
        mapCtrl.selectedNode = {};
    }

    function getLesson(id) {
      Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('lessons', id).get().then(function(response) {
        $log.debug('lesson details : ',response.plain());
        mapCtrl.selectedNode = response.plain();
        $log.debug('selected node : ', mapCtrl.selectedNode);
      })
    }
  }
})();
