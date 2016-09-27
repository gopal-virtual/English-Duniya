(function() {
  'use strict';

  angular
    .module('zaya-content')
    .controller('contentController', contentController);

  contentController.$inject = [
                '$stateParams',
                'orientation',
                '$log',
                '$scope',
                'CONSTANT',
                '$ionicModal',
                'lessonutils',
                '$timeout',
                'audio',
                '$ionicPlatform',
                'analytics',
                'User',
                '$q'
       ];

  /* @ngInject */
  function contentController(
                $stateParams,
                orientation,
                $log,
                $scope,
                CONSTANT,
                $ionicModal,
                lessonutils,
                $timeout,
                audio,
                $ionicPlatform,
                analytics,
                User,
                $q
           ) {
    var contentCtrl = this;
    $scope.audio = audio;
    $scope.orientation = orientation;
    contentCtrl.onPlayerReady = onPlayerReady;
    contentCtrl.onStateChange = onStateChange;
    contentCtrl.play = play;
    $scope.lessonutils = lessonutils;
    $scope.selectedNode = lessonutils.getLocalLesson();
    contentCtrl.toggleControls = toggleControls;
    contentCtrl.onVideoComplete = onVideoComplete;
    contentCtrl.config = {
      sources: [$stateParams.video],
      autoplay: true,
      plugins: {
        controls: {
          showControl : true
        },
      },
      theme: "lib/videogular-themes-default/videogular.css"
    };
    $timeout(function(){
        contentCtrl.config.plugins.controls.showControl = false;
    },2000);
  //   $ionicPlatform.registerBackButtonAction(function(event) {
  //     try {
  //       contentCtrl.API.pause();
  //       $scope.modal.show();
  //     } catch (error) {
  //       ;
  //     }
  // }, 101);

  function toggleControls(){
      contentCtrl.config.plugins.controls.showControl=!contentCtrl.config.plugins.controls.showControl;
      ;
  }

  $ionicPlatform.onHardwareBackButton(function(event) {
      try {
        contentCtrl.API.pause();
        $scope.openNodeMenu();
      } catch (error) {
        ;
      }
  })

    function onVideoComplete() {
      submitReport()
        $timeout(function() {
          orientation.setPortrait();
          // $scope.nodeMenu.show();
			analytics.log(
              {
                  name : 'VIDEO',
                  type : 'END',
                  id : $stateParams.video.id
              },
              {
                  time : new Date()
              },
        User.getActiveProfileSync()._id

      )
        })
    }

    function submitReport(){
      var  lesson = lessonutils.getLocalLesson();
      var promise = null;
      if(!lesson.score || !lesson.score[$stateParams.video.resource.node.id]){

        promise = User.skills.update({
          profileId: User.getActiveProfileSync()._id,
          lessonId: lesson.node.id,
          score: $stateParams.video.resource.node.type.score,
          totalScore: $stateParams.video.resource.node.type.score,
          skill: lesson.node.tag
        })
      }
      else{
        promise = $q.resolve();
      }
      promise
        .then(function(){

          return User.scores.update({
            profileId: User.getActiveProfileSync()._id,
            lessonId: lesson.node.id,
            id: $stateParams.video.resource.node.id,
            score: $stateParams.video.resource.node.type.score,
            totalScore: $stateParams.video.resource.node.type.score,
            type: 'resource'
          })
        }).then(function(){
          return User.reports.save({
            'score': $stateParams.video.resource.node.type.score,
            'profileId': User.getActiveProfileSync()._id,
            'node': $stateParams.video.resource.node.id
          })
        })
    }

    function onPlayerReady(API) {
      contentCtrl.API = API;
    }

    function play(){
        analytics.log(
            {
                name : 'VIDEO',
                type : 'START',
                id : $stateParams.video.resource.node.id
            },
            {
                time : new Date()
            },
          User.getActiveProfileSync()._id

        )
        contentCtrl.API.play();
    }
    function onStateChange(state) {
      if (state == 'play') {
        $timeout(function() {
          orientation.setLandscape();
        })
      }
    //   if (state == 'pause') {
    //     $timeout(function() {
    //       orientation.setPortrait();
    //     })
    //   }
    }



    $scope.openNodeMenu = function() {
      if (contentCtrl.API.currentState == 'pause') {
        orientation.setPortrait();
        $scope.nodeMenu.show();
      }
      return true;
    }
    $scope.closeNodeMenu = function() {
      $scope.nodeMenu.hide();
      return true;
    }
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.nodeMenu = modal;
      $log.debug($scope.selectedNode);
    });




    $ionicModal.fromTemplateUrl(CONSTANT.PATH.CONTENT + '/content.modal-ribbon' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
      backdropClickToClose: true
    }).then(function(modal){
      modal.show();
    })

  }

})();
