(function() {
  'use strict';

  angular
    .module('zaya-map')
    .controller('mapController', mapController);

  mapController.$inject = ['$scope', '$rootScope', '$log', '$ionicModal', '$state', 'lessons', 'scores', 'extendLesson', 'Rest', 'CONSTANT', '$sce', '$ionicLoading', '$timeout', '$ionicBackdrop', 'orientation', 'Auth','lessonutils','audio','data', 'ml'];

  function mapController($scope, $rootScope, $log, $ionicModal, $state, lessons, scores, extendLesson, Rest, CONSTANT, $sce, $ionicLoading, $timeout, $ionicBackdrop, orientation, Auth, lessonutils, audio, data, ml) {
    $scope.audio = audio;
    $scope.orientation= orientation;
    var mapCtrl = this;
    var lessonList = CONSTANT.LOCK ? extendLesson.getLesson(lessons, scores) : lessons;
    lessonList.unshift($state.current.data.litmus);
    mapCtrl.lessons = lessonList;
    $log.debug('lessons',mapCtrl.lessons);
    mapCtrl.resetNode = resetNode;
    $scope.lessonutils = lessonutils;
    mapCtrl.logout = logout;
    mapCtrl.backdrop = false;
    mapCtrl.showScore = -1;
    mapCtrl.user = JSON.parse(localStorage.user_details) || {};
    mapCtrl.user['name'] = mapCtrl.user.first_name + ' ' + mapCtrl.user.last_name;

    mapCtrl.openSettings = openSettings;
    mapCtrl.closeSettings = closeSettings;
	mapCtrl.updateProfile = updateProfile;
    mapCtrl.skillSet = $state.current.data.skillset;

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
        $log.debug('open node emitted',node);
        if(node.content_type_name == 'litmus'){
            $state.go('quiz.questions',{
                id: node.id,
                type : 'litmus'
            });
        }
        else{
            $scope.lessonutils.getLesson(node.id, $scope, function(response){
                $scope.openNodeMenu();
                $scope.selectedNode = response;
            });
        }
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


    // $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal' + CONSTANT.VIEW, {
    //   scope: $scope,
    //   animation: 'slide-in-up',
    // }).then(function(modal) {
    //   $scope.modal = modal;
    // });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
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
    // $scope.test = {"phone_number":"+919393939193"};
    function updateProfile(params) {
      $log.log(JSON.stringify(params));
      var updateParams = {
        "phone_number" : params.phone_number,
        "name" : params.name,
        "email" : params.email          
      };
      Rest.one('users', params.id).patch(updateParams).then(function(){

        $scope.user.mapCtrl.user.phone_number = params.phone_number;
        $scope.user.mapCtrl.user.name = params.name;
        $scope.user.mapCtrl.user.email = params.email;
      }).catch(

      );
    }
    // updateProfile($scope.test);

  }
})();
