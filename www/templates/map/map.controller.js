(function() {
  'use strict';

  angular
    .module('zaya-map')
    .controller('mapController', mapController);

  mapController.$inject = ['$scope', '$rootScope', '$log', '$ionicModal', '$state', 'lessons', 'scores', 'extendLesson', 'Rest', 'CONSTANT', '$sce', '$ionicLoading', '$timeout', '$ionicBackdrop', 'orientation', 'Auth','lessonutils','audio','data', 'ml'];

  function mapController($scope, $rootScope, $log, $ionicModal, $state, lessons, scores, extendLesson, Rest, CONSTANT, $sce, $ionicLoading, $timeout, $ionicBackdrop, orientation, Auth, lessonutils, audio, data, ml) {

     $scope.$on("$ionicView.beforeEnter", function(event, data) {
      orientation.setPortrait();
    });
    // data.createDiagnosisQuestionDB();
    // data.createKmapsDB();
    $scope.audio = audio;
    $scope.orientation= orientation;
    function preload(arrayOfImages) {
          $(arrayOfImages).each(function(){
              $('<img/>')[0].src = this;
          });
      }
      preload([
          '/img/assets/avatar-boy.png',
          '/img/assets/pause_menu_top.png',
          '/img/assets/pause_menu_middle.png',
          '/img/assets/pause_menu_bottom.png'
      ]);
    var mapCtrl = this;
    mapCtrl.lessons = CONSTANT.LOCK ? extendLesson.getLesson(lessons, scores) : lessons;
    mapCtrl.ml = ml;
    // mapCtrl.getLesson = getLesson;
    // mapCtrl.getSrc = getSrc;
    mapCtrl.resetNode = resetNode;
    $scope.lessonutils = lessonutils;
    // mapCtrl.getIcon = getIcon;
    // mapCtrl.resourceType = resourceType;
    // mapCtrl.playResource = playResource;
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

    $scope.$on('logout', function() {
      $state.go('user.main.settings', {});
    })
    $scope.$on('openNode', function(event, node) {
      $scope.lessonutils.getLesson(node.id, $scope, function(response){
          $scope.openNodeMenu();
          $scope.selectedNode = response;
      });
    })
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


    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
    }).then(function(modal) {
      $scope.modal = modal;
    });
    // $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
    //   scope: $scope,
    //   animation: 'slide-in-down',
    // }).then(function(modal) {
    //   $scope.modal = modal;
    // });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.settings' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
      //   hardwareBackButtonClose: false
    }).then(function(settings) {
      $scope.settings = settings;
    });

    function resetNode() {
        $timeout(function(){
            $scope.selectedNode = {};
        },400)
    }

    // $timeout(function functionName() {
    //   if (mapCtrl.lessons && localStorage.lesson) {
    //     $scope.openNodeMenu();
    //     $scope.selectedNode = $scope.lessonutils.getLocalLesson();
    //   }
    // });

  }
})();
