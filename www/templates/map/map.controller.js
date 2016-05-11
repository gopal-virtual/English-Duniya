(function() {
  'use strict';

  angular
    .module('zaya-map')
    .controller('mapController', mapController);

  mapController.$inject = ['$scope', '$rootScope', '$log', '$ionicModal', '$state', 'lessons', 'scores', 'extendLesson', 'Rest', 'CONSTANT', '$sce', '$ionicLoading', '$timeout', '$ionicBackdrop', 'orientation'];

  function mapController($scope, $rootScope, $log, $ionicModal, $state, lessons, scores, extendLesson, Rest, CONSTANT, $sce, $ionicLoading, $timeout, $ionicBackdrop, orientation) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
      orientation.setPortrait();
    });
    var mapCtrl = this;
    mapCtrl.lessons = extendLesson.getLesson(lessons, scores);
    mapCtrl.getLesson = getLesson;
    mapCtrl.getSrc = getSrc;
    mapCtrl.resetNode = resetNode;
    mapCtrl.getIcon = getIcon;
    mapCtrl.resourceType = resourceType;
    mapCtrl.playResource = playResource;
    mapCtrl.backdrop = false;
    mapCtrl.showScore = -1;

    // mapCtrl.openModal = openModal;
    // mapCtrl.closeModal = closeModal;

    mapCtrl.skillSet = [{
      name: 'reading',
      score: 300
    }, {
      name: 'listening',
      score: 200
    }, {
      name: 'vocabulary',
      score: 250
    }, {
      name: 'grammar',
      score: 3000
    }];

    function playResource(resource) {
      $scope.closeModal();
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      if (mapCtrl.resourceType(resource) != 'video') {
        $timeout(function() {
          $state.go('quiz.questions', {
            id: resource.node.id
          });
        }, 500);
      } else {
        $timeout(function() {
          $state.go('content.video', {
            video: {
              src: mapCtrl.getSrc(resource.node.type.path),
              type: 'video/mp4'
            }
          });
        }, 500);
        //   mapCtrl.config.sources[0].src = mapCtrl.getSrc(resource.node.type.path);
      }
    }

    function resourceType(resource) {
      if (resource.node.content_type_name == 'assessment') {
        return 'assessment';
      } else if (resource.node.content_type_name == 'resource') {
        if (resource.node.type.file_type.substring(0, resource.node.type.file_type.indexOf('/')) == 'video') {
          return 'video';
        }
      } else {}
    }

    function getSrc(src) {
      return $sce.trustAsResourceUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + src);
    }

    function getIcon(resource) {
      if (resource.node.content_type_name == 'assessment') {
        return CONSTANT.ASSETS.IMG.ICON + '/quiz.png';
      } else if (resource.node.content_type_name == 'resource') {
        if (resource.node.type.file_type.substring(0, resource.node.type.file_type.indexOf('/')) == 'video') {
          return CONSTANT.ASSETS.IMG.ICON + '/video.png';
        }
      } else {

      }
    }

    $scope.$on('logout', function() {
      $state.go('user.main.settings', {});
    })
    $scope.$on('openNode', function(event, node) {
      mapCtrl.getLesson(node.id);
    })
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    $scope.openModal = function() {
      $scope.modal.show();
      return true;
    }
    $scope.closeModal = function() {
      $scope.modal.hide();
      return true;
    }

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.modal = modal;
    });

    function resetNode() {
      mapCtrl.selectedNode = {};
    }

    function getLesson(id) {
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('lessons', id).get().then(function(response) {
        $ionicLoading.hide();
        $scope.openModal();
        mapCtrl.selectedNode = response.plain();
        $log.debug('get lesson', response.plain());
        localStorage.setItem('lesson', JSON.stringify(mapCtrl.selectedNode));
      })
    }

    $timeout(function functionName() {
      if (localStorage.lesson) {
        $scope.openModal();
        mapCtrl.selectedNode = JSON.parse(localStorage.lesson);
      }
    });

  }
})();
