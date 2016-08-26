/**
 * @ngdoc controller
 * @name map.controller:mapController
 * @function
 *
 * @description
 * Controller takes care of the navigation map.
 * Note: The controller gets called before map.main.js
 */
(function() {
  'use strict';

  angular
    .module('zaya-map')
    .controller('mapController', mapController);

  mapController.$inject = [
    '$scope',
    '$rootScope',
    '$log',
    '$ionicPopup',
    '$ionicModal',
    '$state',
    'lessons',
    'scores',
    'skills',
    'extendLesson',
    'Rest',
    'CONSTANT',
    '$sce',
    '$ionicLoading',
    '$timeout',
    '$ionicBackdrop',
    'orientation',
    'Auth',
    'lessonutils',
    'audio',
    'data',
    'ml',
    'lessonLocked',
    '$ionicPlatform',
    'demo',
    '$controller',
    'settings',
    'mediaManager',
    '$stateParams',
    'analytics',
    '$q'
];

  function mapController(
        $scope,
        $rootScope,
        $log,
        $ionicPopup,
        $ionicModal,
        $state,
        lessons,
        scores,
        skills,
        extendLesson,
        Rest,
        CONSTANT,
        $sce,
        $ionicLoading,
        $timeout,
        $ionicBackdrop,
        orientation,
        Auth,
        lessonutils,
        audio,
        data,
        ml,
        lessonLocked,
        $ionicPlatform,
        demoFactory,
        $controller,
        settings,
        mediaManager,
        $stateParams,
        analytics,
        $q
    ) {


    $scope.audio = audio;
    $log.debug('settings', settings);
    $scope.settings = settings;
    var temp = JSON.parse(localStorage.getItem('user_details'));
    temp.name = temp.first_name + ' ' + temp.last_name;
    $scope.settings.user = temp
    $scope.orientation = orientation;
    $scope.activatedLesson = $stateParams.activatedLesson;
    $scope.progress = localStorage.getItem('progress');
    var mapCtrl = this;
    var lessonList = CONSTANT.LOCK ? lessonLocked : lessons;
    // $state.current.data && lessonList.unshift($state.current.data.litmus);
    mapCtrl.dataFactory = data;
    mapCtrl.authFactory = Auth;
    mapCtrl.lessons = lessonList;
    // mapCtrl.userCtrl = $controller('userCtrl');
    // mapCtrl.resetNode = resetNode;
    $scope.lessonutils = lessonutils;
    mapCtrl.backdrop = false;
    mapCtrl.showScore = -1;
    mapCtrl.skillSet = skills;
    mapCtrl.changeGrade = changeGrade;
    mapCtrl.animationExpand = {};
    mapCtrl.animationExpand['expand'] = expand;
    mapCtrl.animationExpand['shrink'] = shrink;
    mapCtrl.showResult = true;
    mapCtrl.getNodeProperty = getNodeProperty;
    mapCtrl.demoFactory = demoFactory;
    mapCtrl.animateStar = {
      "activeFlag": -1,
      // "resetFlag" : -1
    }
    mapCtrl.animateStar["resetColor"] = resetColor;
    // $log.debug("selectedNode",selectedNode);
    mapCtrl.setAnimateStarFlag = setAnimateStarFlag;

    /**
    * @ngdoc property
    * @name mapCtrl.setAnimateStarFlag
    * @propertyOf map.controller:mapController
    * @description
    * Initializes animateStar flag in localStorage
    *
    */

    function setAnimateStarFlag() {
      var animateStarFlag = {
          isCurrentNode : true,
          clickedNodeStar : 0
      }
      localStorage.setItem("animateStarFlag",JSON.stringify(animateStarFlag));
    }

    /**
    * @ngdoc method
    * @name mapCtrl.getNodeProperty
    * @methodOf map.controller:mapController
    * @description
    * Finds node property values in localstorage and then returns them
    * @param {string} propertyString A string to define the property of the node. It can take the values 'x', 'y', 'width', 'height', 'node', 'type'
    * @returns {string} Value of the property stored in localStorage. If nothing is found value 0 is returned
    */

    function getNodeProperty(prop) {
      if (prop == 'x')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).x : 0;
      if (prop == 'y')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).y : 0;
      if (prop == 'width')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).width : 0;
      if (prop == 'height')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).height : 0;
      if (prop == 'node')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).node : 0;
      if (prop == 'type')
        return localStorage.demo_node ? JSON.parse(localStorage.demo_node).type : 0;
    }

    $ionicPlatform.registerBackButtonAction(function(event) {
      event.preventDefault();
    }, 100);

    $log.debug("Lessons in mapCtrl", mapCtrl.lessons)
    $scope.$on('removeLoader',function() {
      $ionicLoading.hide();
      $log.info("Loader Hidden")
    })

    $scope.$on('openNode', function(event, node, currentPos) {
      // audio.stop('demo-1')
      //   $scope.demo.isShown() && $scope.demo.hide();
      if (currentPos)
        currentPos.lessonType = node.tag;

      if (node.content_type_name == 'litmus') {
        $state.go('quiz.questions', {
          id: node.id,
          type: 'litmus'
        });
      } else {
        $ionicLoading.show({
          // hideOnStateChange: true
        });
        $scope.lessonutils.getLesson(node.id, $scope).then(

          function(response) {
              analytics.log(
                  {
                      name : 'LESSON',
                      type : 'START',
                      id : node.id
                  },
                  {
                      time : new Date()
                  }
              )

            $log.debug("Starts", node)
            var d = new Date();
            var promise;
            if(node.meta.intros && node.meta.intros.sound  && node.meta.intros.sound[0]){
              $log.debug("has sound")
              promise = mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER + node.meta.intros.sound[0])
            } else {
              promise = $q.resolve();
              $log.debug("not has sound")
            }

            promise.then(function(s) {

            $log.debug("Resolves", new Date() - d, s)
            node.meta.parsed_sound = s;
            $log.debug("Download intro here",node)
            audio.setVolume('background', 0.1);
            if(currentPos)
            {
              $log.debug("CurrentPos")
              mapCtrl.animationExpand.expand(currentPos,node);
              $scope.selectedNode = response;
            }else{
              $log.debug("Not CurrentPos")

              $scope.openNodeMenu(node);
              $scope.selectedNode = response;
            }
              // $ionicLoading.hide()
            }).catch(function(error) {
              $ionicPopup.alert({
                title: 'Please try again',
                template: "No internet conection found"
              })
              $log.debug("Error opening node", error)
              // $ionicLoading.hide()
            })

            // $log.debug("NODENODE ",$scope.selectedNode.node.tag);
          }
        );
      }
    })

    $log.info("MapControl Skill Set", mapCtrl.skillSet.length);
    $scope.$on('animateStar', function() {
      $log.info("Animate Star Event detected,");
      for (var i = 0; i < mapCtrl.skillSet.length; i++) {
        $log.info("Loop", i, "\nskillSetTag : ", mapCtrl.skillSet[i].title.toLowerCase(), "\nactivatedLessonTag : ", $stateParams.activatedLesson.node.tag.toLowerCase())
        if (mapCtrl.skillSet[i].title.toLowerCase() == $stateParams.activatedLesson.node.tag.toLowerCase()) {
          mapCtrl.animateStar.activeFlag = i;
          // mapCtrl.animateStar.animateFlag = i;
          break;
        }
      }
    })


    /**
    * @ngdoc method
    * @name mapCtrl.animateStar.resetColor
    * @methodOf map.controller:mapController
    * @description
    * Used for resetting color flag. The color flag determines whether the previous attempted lesson tag gets highlighted in the HUD.
    * @param {int} index The index of the current element in the lessons array
    * @returns {boolean} True if the flag is successfully reset else false
    *
    */

    function resetColor(index) {
      $log.debug("Resetting Color Flag ...", index);
      if ($stateParams.activatedLesson && mapCtrl.skillSet[index].title.toLowerCase() == $stateParams.activatedLesson.node.tag.toLowerCase()) {
        mapCtrl.animateStar.activeFlag = -2;
        return true;
        // mapCtrl.animateStar.animateFlag = -1;
      }
      return false;
    }


    $scope.openNodeMenu = function(node) {
      $log.debug("Opening node menu")
      lessonutils.playDemoAudio(node);

      $scope.nodeMenu.show();
      $ionicLoading.hide();
      $log.debug("Force closing loading");
      return true;
    }
    $scope.closeNodeMenu = function() {
      $scope.nodeMenu.hide().then(function() {
        mapCtrl.closeDemo();
      });
      return true;
    }


    /**
    * @ngdoc method
    * @name mapCtrl.openDemo
    * @methodOf map.controller:mapController
    * @description
    * starts the demo on the navigation map by triggering the demo modal.
    * @returns {boolean} True every time
    *
    */

    mapCtrl.openDemo = function() {
      $scope.demo.show().then(function() {
        $ionicLoading.hide();
      });
      $log.debug("Playing audio")
      return true;
    }

    /**
    * @ngdoc method
    * @name mapCtrl.closeDemo
    * @methodOf map.controller:mapController
    * @description
    * ends the demo on the navigation map by closing the demo modal.
    * @returns {boolean} True every time
    *
    */

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

    function expand(currentPos,node) {
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
          $scope.openNodeMenu(node);
        });
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
    $scope.$on('show_demo', function() {
      // $ionicLoading.show();
      demoFactory.show().then(function(result) {
          mapCtrl.demoShown = result;
          if (result && demoFactory.getStep() == '1') {
            $timeout(function() {
              $scope.demo.show().then(function() {
                angular.element("#audioplayer")[0].pause();
                angular.element("#audioSource")[0].src = 'sound/voice_letstart.mp3';
                angular.element("#audioplayer")[0].load();
                angular.element("#audioplayer")[0].play();
                demoFactory.setStep(2)
              });
            })
          }
        })
        .finally(function() {
          //   $ionicLoading.hide();
        })
    })

    function changeGrade(newGrade){
      $log.debug("here")
      $ionicLoading.show({
        hideOnStateChange: true
      })
      mapCtrl.dataFactory.changeGrade(newGrade).then(function(){
        $scope.settingsModal.hide();
        localStorage.removeItem('currentPosition');
        location.reload()

      });
      //
      // $rootScope.$broadcast('reloadMap');
      // $state.go('map.navigate')
      // $state.reload()
    }

  }
})();
