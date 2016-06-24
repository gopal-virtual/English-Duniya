(function() {
  'use strict';

  angular
    .module('zaya-map')
    .controller('mapController', mapController);

  mapController.$inject = ['$scope', '$rootScope', '$log', '$ionicModal', '$state', 'lessons', 'scores', 'skills', 'extendLesson', 'Rest', 'CONSTANT', '$sce', '$ionicLoading', '$timeout', '$ionicBackdrop', 'orientation', 'Auth', 'lessonutils', 'audio', 'data', 'ml','lessonLocked'];

  function mapController($scope, $rootScope, $log, $ionicModal, $state, lessons, scores, skills, extendLesson, Rest, CONSTANT, $sce, $ionicLoading, $timeout, $ionicBackdrop, orientation, Auth, lessonutils, audio, data, ml, lessonLocked) {
    $scope.audio = audio;
    $scope.orientation = orientation;
    var mapCtrl = this;
    var lessonList = CONSTANT.LOCK ? lessonLocked : lessons;
    // $state.current.data && lessonList.unshift($state.current.data.litmus);
    mapCtrl.lessons = lessonList;
    mapCtrl.resetNode = resetNode;
    $scope.lessonutils = lessonutils;
    mapCtrl.backdrop = false;
    mapCtrl.showScore = -1;
    mapCtrl.skillSet = skills;
    mapCtrl.isLessonDownloaded = null;

    mapCtrl.animationExpand = {};
    mapCtrl.animationExpand['expand'] = expand;
    mapCtrl.animationExpand['shrink'] = shrink;
    mapCtrl.showResult = true;
    // mapCtrl.animationShrink.shrink = animationShrink;


    $log.debug("LEssons in mapCtrl",mapCtrl.lessons)


    $scope.$on('openNode', function(event, node, currentPos) {
      currentPos.lessonType = node.tag;
      $log.debug("GAME: ",currentPos);
      data.isLessonDownloaded(node.id).then(function(response) {
        mapCtrl.isLessonDownloaded = response;
      }).catch(function(error) {
        mapCtrl.isLessonDownloaded = false;
      });
      $log.debug('open node emitted', node);
      if (node.content_type_name == 'litmus') {
        $state.go('quiz.questions', {
          id: node.id,
          type: 'litmus'
        });
      } else {
        $scope.lessonutils.getLesson(node.id, $scope, function(response) {
          // $scope.openNodeMenu();
          mapCtrl.animationExpand.expand(currentPos);
          $scope.selectedNode = response;
          // $log.debug("NODENODE ",$scope.selectedNode.node.tag);
        });
      }
    })
    $scope.$on('downloadNode', function(event, node) {
      $log.debug("Download node triggered");
      data.isLessonDownloaded(node.id).then(function(response) {
        if (response === false) {
          lessonutils.downloadLesson(node.id,[]);
        }
      }).catch(function(error) {
        $log.debug("error", error)
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


    // $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal' + CONSTANT.VIEW, {
    //   scope: $scope,
    //   animation: 'slide-in-up',
    // }).then(function(modal) {
    //   $scope.modal = modal;
    // });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
        hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.modal = modal;
    });


    function resetNode() {
      $timeout(function() {
        $scope.selectedNode = {};
      }, 500)
    }


    // $timeout(function functionName() {
    //   if (mapCtrl.lessons && localStorage.lesson) {
    //     $scope.openNodeMenu();
    //     $scope.selectedNode = $scope.lessonutils.getLocalLesson();
    //   }
    // });
    // $scope.test = {"phone_number":"+919393939193"};

    // updateProfile($scope.test);

    function expand(currentPos){
      // alert(JSON.stringify(e));
      mapCtrl.showResult = false;
      $log.debug("X coords: " + currentPos.x + ", Y coords: " + currentPos.y);
        // $mapCtrl.animationExpand.lessonType = currentPos.lessonType
        mapCtrl.animationExpand.containerStyle = {
          "margin-left" : currentPos.x-30+"px",
          "margin-top" : currentPos.y-30+"px",
          "opacity" : 1
        }

        $log.debug(mapCtrl.animationExpand.containerStyle);
        $timeout(function() {
          mapCtrl.animationExpand.iconTranslateOffset = {
            "transform" : "translate("+((screen.width/2)-currentPos.x)+"px,"+(90-currentPos.y)+"px)",
            "transition" : "transform 0.5s ease-in-out"
          }
        mapCtrl.animationExpand.expandContainer = 1;
        }, 50).then( function(){
          $timeout(function(){
              $scope.openNodeMenu();
          },1000);
        });

      }

      function shrink(){
        mapCtrl.showResult = true;
        mapCtrl.animationExpand.iconTranslateOffset = {
          "transform" : "translate(0px,0px)",
          "transition" : "transform 0.4s ease-in-out"
        }
        mapCtrl.animationExpand.expandContainer = 0;

        $timeout(function() {
          mapCtrl.animationExpand.containerStyle = {
              "margin-left" : "0px",
              "margin-top" : "0px",
              "opacity" : 0
            }
        }, 400);
      }


  }
})();
