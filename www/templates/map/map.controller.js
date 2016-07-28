(function() {
  'use strict';

  angular
    .module('zaya-map')
    .controller('mapController', mapController);

  mapController.$inject = ['$scope', '$rootScope', '$log', '$ionicPopup','$ionicModal', '$state', 'lessons', 'scores', 'skills', 'extendLesson', 'Rest', 'CONSTANT', '$sce', '$ionicLoading', '$timeout', '$ionicBackdrop', 'orientation', 'Auth', 'lessonutils', 'audio', 'data', 'ml', 'lessonLocked', '$ionicPlatform','demo', '$controller','settings','mediaManager','$stateParams','$q'];

  function mapController($scope, $rootScope, $log, $ionicPopup, $ionicModal, $state, lessons, scores, skills, extendLesson, Rest, CONSTANT, $sce, $ionicLoading, $timeout, $ionicBackdrop, orientation, Auth, lessonutils, audio, data, ml, lessonLocked, $ionicPlatform, demoFactory, $controller, settings, mediaManager, $stateParams,$q) {

    $scope.audio = audio;
    $log.debug('settings', settings);
    $scope.settings = settings;
    $scope.orientation = orientation;
    $scope.activatedLesson = $stateParams.activatedLesson;

    var mapCtrl = this;
    var lessonList = CONSTANT.LOCK ? lessonLocked : lessons;
    // $state.current.data && lessonList.unshift($state.current.data.litmus);
    
    mapCtrl.lessons = lessonList;
    // mapCtrl.userCtrl = $controller('userCtrl');
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
    mapCtrl.animateStar = {
      "activeFlag" : -1,
      // "resetFlag" : -1
    }
    mapCtrl.animateStar["resetColor"] = resetColor;
    // $log.debug("selectedNode",selectedNode);
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
      // audio.stop('demo-1')
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
          $ionicLoading.show();
          $log.debug("Starts",node)
          var d = new Date();
          var promise;
          if(node.meta.intros  && node.meta.intros.sound[0]){
            $log.debug("has sound")
            promise = mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER+node.meta.intros.sound[0])
          }else{
            $log.debug("not has sound")

            promise = $q.resolve();
          }

          promise.then(function(s){
            $log.debug("Resolves", new Date() - d, s)
          node.meta.parsed_sound = s;
          $log.debug("Download intro here",node)
          audio.setVolume('background', 0.1);
          if(currentPos)
          {
            $log.debug("CurrentPos")
            mapCtrl.animationExpand.expand(currentPos);
            lessonutils.playDemoAudio(node);
            $scope.selectedNode = response;
          }else{
            lessonutils.playDemoAudio(node);
            $scope.openNodeMenu();
            $scope.selectedNode = response;
          }
          $ionicLoading.hide()
        }).catch(function(error){
          $ionicPopup.alert({
            title: 'Please try again',
            template: "No internet conection found"
          })
            $log.debug("Error opening node",error)
            $ionicLoading.hide()
        })

          // $log.debug("NODENODE ",$scope.selectedNode.node.tag);
        });
      }
    })

    $log.info("MapControl Skill Set",mapCtrl.skillSet.length);
    $scope.$on('animateStar', function(){
      $log.info("Animate Star Event detected,");
      for (var i = 0; i < mapCtrl.skillSet.length; i++) {
        $log.info("Loop",i,"\nskillSetTag : ",mapCtrl.skillSet[i].title.toLowerCase(),"\nactivatedLessonTag : ",$stateParams.activatedLesson.node.tag.toLowerCase())
        if (mapCtrl.skillSet[i].title.toLowerCase() == $stateParams.activatedLesson.node.tag.toLowerCase()) {
          mapCtrl.animateStar.activeFlag = i;
          // mapCtrl.animateStar.animateFlag = i;
          break;
        }
      }
    })

    function resetColor(index) {
      $log.debug("Resetting Color Flag ...",index);
      if ($stateParams.activatedLesson && mapCtrl.skillSet[index].title.toLowerCase() == $stateParams.activatedLesson.node.tag.toLowerCase()) {
        mapCtrl.animateStar.activeFlag = -2;
        // mapCtrl.animateStar.animateFlag = -1;
      }
    }


    $scope.openNodeMenu = function() {
      $log.debug("Opening node menu")
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

        $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.settings' + CONSTANT.VIEW, {
          scope: $scope,
          animation: 'slide-in-up',
            hardwareBackButtonClose: true
        }).then(function(settings) {
          $scope.settingsModal = settings;
        });

        // function openSettings() {
        //   $scope.settings.show();
        // }
        //
        // function closeSettings() {
        //   $scope.settings.hide();
        // }

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
                    $log.debug('aaaaaa');

                      audio['demo-1'].play();
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
