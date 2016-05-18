(function() {
  'use strict';

  angular
    .module('zaya-map')
    .controller('mapController', mapController);

  mapController.$inject = ['$scope', '$rootScope', '$log', '$ionicModal', '$state', 'lessons', 'scores', 'extendLesson', 'Rest', 'CONSTANT', '$sce', '$ionicLoading', '$timeout', '$ionicBackdrop', 'orientation', 'Auth'];

  function mapController($scope, $rootScope, $log, $ionicModal, $state, lessons, scores, extendLesson, Rest, CONSTANT, $sce, $ionicLoading, $timeout, $ionicBackdrop, orientation, Auth) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
      orientation.setPortrait();
    });
    var mapCtrl = this;
    mapCtrl.lessons = CONSTANT.LOCK ? extendLesson.getLesson(lessons, scores) : lessons;
    mapCtrl.getLesson = getLesson;
    mapCtrl.getSrc = getSrc;
    mapCtrl.resetNode = resetNode;
    mapCtrl.getIcon = getIcon;
    mapCtrl.resourceType = resourceType;
    mapCtrl.playResource = playResource;
    mapCtrl.logout = logout;
    mapCtrl.backdrop = false;
    mapCtrl.showScore = -1;
    mapCtrl.user = JSON.parse(localStorage.user_details) || {};
    mapCtrl.user['name'] = mapCtrl.user.first_name + ' ' + mapCtrl.user.last_name;

    // mapCtrl.openModal = openModal;
    // mapCtrl.closeModal = closeModal;
    mapCtrl.openSettings = openSettings;
    mapCtrl.closeSettings = closeSettings;

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

    function logout(type) {
      mapCtrl.closeSettings();
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      if(type=='clean'){
          Auth.clean(function(){
              $state.go('auth.signin', {})
          })
      }
      else{
          Auth.logout(function() {
              $state.go('auth.signin', {})
          }, function() {
              // body...
          })
      }
    }

    function openSettings() {
      $scope.settings.show();
    }

    function closeSettings() {
      $scope.settings.hide();
    }

    function playResource(resource) {
      $scope.closeModal();
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      if (mapCtrl.resourceType(resource) == 'assessment') {
        $timeout(function() {
          $state.go('quiz.questions', {
            id: resource.node.id
          });
        });
      }
      else if(mapCtrl.resourceType(resource) == 'practice'){
          $timeout(function() {
            $state.go('quiz.practice.questions', {
              id: resource.node.id
            });
          });
      }
      else if(mapCtrl.resourceType(resource) == 'video') {
        $timeout(function() {
          $state.go('content.video', {
            video: {
              src: mapCtrl.getSrc(resource.node.type.path),
              type: 'video/mp4'
            }
          });
        });
        //   mapCtrl.config.sources[0].src = mapCtrl.getSrc(resource.node.type.path);
      }
      else{}
    }

    function resourceType(resource) {
      if (resource.node.content_type_name == 'assessment' && resource.node.type.type == 'assessment') {
        return 'assessment';
      }
      else if(resource.node.content_type_name == 'assessment' && resource.node.type.type == 'practice'){
          return 'practice';
      }
      else if (resource.node.content_type_name == 'resource' && resource.node.type.file_type == 'mp4') {
        return 'video';
      } else {}
    }

    function getSrc(src) {
      return $sce.trustAsResourceUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + src);
    }

    function getIcon(resource) {
      if (resource.node.content_type_name == 'assessment' && resource.node.type.type == 'assessment') {
        return CONSTANT.ASSETS.IMG.ICON + '/quiz.png';
      } else if (resource.node.content_type_name == 'assessment' && resource.node.type.type == 'practice') {
        return CONSTANT.ASSETS.IMG.ICON + '/practice.png';
      } else if (resource.node.content_type_name == 'resource' && resource.node.type.file_type == 'mp4') {
        return CONSTANT.ASSETS.IMG.ICON + '/video.png';
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
      //   hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.settings' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
      //   hardwareBackButtonClose: false
    }).then(function(settings) {
      $scope.settings = settings;
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
      if (mapCtrl.lessons && localStorage.lesson) {
        $scope.openModal();
        mapCtrl.selectedNode = JSON.parse(localStorage.lesson);
      }
    });

  }
})();
