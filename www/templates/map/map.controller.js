(function() {
  'use strict';

  angular
    .module('zaya-map')
    .controller('mapController', mapController);

  mapController.$inject = ['$scope', '$rootScope', '$log', '$ionicPopup','$ionicModal', '$state', 'lessons', 'scores', 'skills', 'extendLesson', 'Rest', 'CONSTANT', '$sce', '$ionicLoading', '$timeout', '$ionicBackdrop', 'orientation', 'Auth', 'lessonutils', 'audio', 'data', 'ml', 'lessonLocked', '$ionicPlatform','demo'];

  function mapController($scope, $rootScope, $log, $ionicPopup, $ionicModal, $state, lessons, scores, skills, extendLesson, Rest, CONSTANT, $sce, $ionicLoading, $timeout, $ionicBackdrop, orientation, Auth, lessonutils, audio, data, ml, lessonLocked, $ionicPlatform, demoFactory) {

    $scope.audio = audio;
    $scope.orientation = orientation;
    var mapCtrl = this;
    var lessonList = CONSTANT.LOCK ? lessonLocked : lessons;
    // $state.current.data && lessonList.unshift($state.current.data.litmus);
    mapCtrl.lessons = lessonList;
    // mapCtrl.resetNode = resetNode;
    $scope.lessonutils = lessonutils;
    mapCtrl.backdrop = false;
    mapCtrl.showScore = -1;
    mapCtrl.skillSet = skills;

    mapCtrl.animationExpand = {};
    mapCtrl.animationExpand['expand'] = expand;
    mapCtrl.animationExpand['shrink'] = shrink;
    mapCtrl.showResult = true;
    mapCtrl.getNodeProperty = getNodeProperty;
    mapCtrl.demoFactory = demoFactory;

    function getNodeProperty(prop){
      if(prop == 'x')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).x : 0;
      if(prop == 'y')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).y : 0;
      if(prop == 'width')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).width : 0;
      if(prop == 'height')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).height : 0;
      if(prop == 'node')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).node : 0;
      if(prop == 'type')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).type : 0;
    }
    // mapCtrl.animationShrink.shrink = animationShrink;


    // $ionicPlatform.registerBackButtonAction(function(event) {
    //   if (mapCtrl.animationExpand.expandContainer == 1) {
    //     $scope.closeNodeMenu();
    //     $timeout(function() {
    //       mapCtrl.animationExpand.shrink();
    //     }, 200);
    //   }
    // }, 210);
    $ionicPlatform.registerBackButtonAction(function(event) {
        event.preventDefault();
    //     if ($state.is('map.navigate')) { // your check here
    //     $ionicPopup.confirm({
    //       title: 'System warning',
    //       template: 'Are you sure you want to exit?'
    //     }).then(function(res) {
    //       if (res) {
    //         ionic.Platform.exitApp();
    //       }
    //     })
    //   }
  }, 100);

    $log.debug("LEssons in mapCtrl", mapCtrl.lessons)


    $scope.$on('openNode', function(event, node, currentPos) {
      lessonutils.playDemoAudio();
    //   $scope.demo.isShown() && $scope.demo.hide();
      if(currentPos)
        currentPos.lessonType = node.tag;

      if (node.content_type_name == 'litmus') {
        $state.go('quiz.questions', {
          id: node.id,
          type: 'litmus'
        });
      } else {
        $scope.lessonutils.getLesson(node.id, $scope, function(response) {
          $scope.openNodeMenu();
          if(currentPos)
          mapCtrl.animationExpand.expand(currentPos);
          $scope.selectedNode = response;
          // $log.debug("NODENODE ",$scope.selectedNode.node.tag);
        });
      }
    })

    $scope.openNodeMenu = function() {
      $scope.nodeMenu.show();
      return true;
    }
    $scope.closeNodeMenu = function() {
      $scope.nodeMenu.hide().then(function() {
        mapCtrl.closeDemo();
      });
      return true;
    }
    mapCtrl.openDemo = function() {
      $scope.demo.show().then(function(){
          $ionicLoading.hide();
      });
      $log.debug("Playing audio")
      return true;
    }
    mapCtrl.closeDemo = function() {
      $log.debug('close the demo');
      $scope.demo.hide();
      return true;
        }

        $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
            scope: $scope,
            animation: 'slide-in-down',
            hardwareBackButtonClose: false
        }).then(function(nodeMenu) {
            $scope.nodeMenu = nodeMenu;
        });

        $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.demo' + CONSTANT.VIEW, {
            scope: $scope,
            animation: 'slide-in-down',
            hardwareBackButtonClose: false
        }).then(function(demo) {
            $scope.demo = demo;
        });

        // $timeout(function(){
        //     mapCtrl.openDemo();
        // },2000)


        // function resetNode() {
        //   $timeout(function() {
        //     $scope.selectedNode = {};
        //   }, 500)
        // }

        // $timeout(function functionName() {
        //   if (mapCtrl.lessons && localStorage.lesson) {
        //     $scope.openNodeMenu();
        //     $scope.selectedNode = $scope.lessonutils.getLocalLesson();
        //   }
        // });
        // $scope.test = {"phone_number":"+919393939193"};

        // updateProfile($scope.test);

        function expand(currentPos) {
            // alert(JSON.stringify(e));
            mapCtrl.showResult = false;
            $log.debug("X coords: " + currentPos.x + ", Y coords: " + currentPos.y);
            // $mapCtrl.animationExpand.lessonType = currentPos.lessonType
            mapCtrl.animationExpand.containerStyle = {
                "margin-left": currentPos.x - 30 + "px",
                "margin-top": currentPos.y - 30 + "px",
                "opacity": 1
            }

            $log.debug(mapCtrl.animationExpand.containerStyle);
            $timeout(function() {
                mapCtrl.animationExpand.iconTranslateOffset = {
                    "transform": "translate(" + ((screen.width / 2) - currentPos.x) + "px," + (40 - currentPos.y) + "px) scale3d(2,2,2)",
                    "transition": "transform 0.5s ease-in-out"
                }
                mapCtrl.animationExpand.expandContainer = 1;
            }, 50).then(function() {
                $timeout(function() {
                    $scope.openNodeMenu();
                }, 1000);
            });

        }


        function shrink() {
            mapCtrl.showResult = true;
            mapCtrl.animationExpand.iconTranslateOffset = {
                "transform": "translate(0px,0px) scale3d(1,1,1)",
                "transition": "transform 0.4s ease-in-out"
            }
            mapCtrl.animationExpand.expandContainer = 0;

            $timeout(function() {
                mapCtrl.animationExpand.containerStyle = {
                    "margin-left": "0px",
                    "margin-top": "0px",
                    "opacity": 0
                }
            }, 400);
        }
        $scope.$on('show_demo',function(){
        // $ionicLoading.show();
          demoFactory.show().then(function(result){
            mapCtrl.demoShown = result;
            if(result && demoFactory.getStep() == '1'){
              $timeout(function(){
                  $scope.demo.show().then(function(){
                      audio.play('demo-1');
                      demoFactory.setStep(2)
                  });
              })
            }
          }
      )
      .finally(function(){
        //   $ionicLoading.hide();
      })
        })


    }
})();
