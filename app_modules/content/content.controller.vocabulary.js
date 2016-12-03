(function() {
  'use strict';

  angular
    .module('zaya-content')
    .controller('vocabularyCardController', vocabularyCardController);

  vocabularyCardController.$inject = ['$log', '$state', 'audio', '$timeout', '$interval', '$scope', '$stateParams', 'CONSTANT', 'lessonutils', 'User', 'analytics', 'orientation', '$ionicModal', 'Utilities', '$ionicLoading'];

  /* @ngInject */
  function vocabularyCardController($log, $state, audio, $timeout, $interval, $scope, $stateParams, CONSTANT, lessonutils, User, analytics, orientation, $ionicModal, Utilities, $ionicLoading) {
    var vocabCardCtrl = this;
    vocabCardCtrl.prev = prev;
    vocabCardCtrl.next = next;
    vocabCardCtrl.currentIndex = 0;
    vocabCardCtrl.playDelayed = playDelayed;
    vocabCardCtrl.vocab_data = $stateParams.vocab_data.objects;
    vocabCardCtrl.audio = audio;
    vocabCardCtrl.CONSTANT = CONSTANT;
    vocabCardCtrl.getSoundArr = getSoundArr;
    vocabCardCtrl.submitReport = submitReport;
    vocabCardCtrl.onVocabComplete = onVocabComplete;
    vocabCardCtrl.playStarSound = playStarSound;
    $scope.resultStarFlag = [];
    $scope.goToMap = goToMap;
    $scope.utilities = Utilities;
    $scope.audio = audio;
    $scope.openPauseMenu = openPauseMenu;
    $scope.openNodeMenu = openPauseMenu;
    $scope.closePauseMenu = closePauseMenu;
    $scope.closeNodeMenu = closePauseMenu;
    $scope.lessonutils = lessonutils;
    $scope.$on('backButton', backButton);

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.COMMON + '/common.modal-result' + CONSTANT.VIEW, {
        scope: $scope,
        animation: 'slide-in-down',
        hardwareBackButtonClose: false
    }).then(function(modal) {
        $scope.resultMenu = modal;
    });

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.pauseMenu = modal;
    });

    function backButton() {
      try {
        if (!$scope.resultMenu.isShown()) {
          $scope.openPauseMenu();
        }
      } catch (error) {}
    }

    function openPauseMenu() {
      $scope.pauseMenu.show().then(function(){
          audio.player.play('sound/pause_menu.mp3');
      });
    }

    function closePauseMenu() {
      $scope.pauseMenu.hide().then(function(){
        audio.player.stop();
      });
    }


    function goToMap() {
      $log.debug('going to map.navigate');
      $ionicLoading.show({
        hideOnStateChange: true
      });
      $scope.resultMenu.hide();
      $state.go('map.navigate', {
        activatedLesson: $stateParams.vocab_data
      });
    }

    function prev() {
      $log.debug('Clicked : Prev')
      vocabCardCtrl.currentIndex = (vocabCardCtrl.currentIndex > 0) ? --vocabCardCtrl.currentIndex : vocabCardCtrl.currentIndex;
    }

    function next() {
      $log.debug('Clicked : Next')
      vocabCardCtrl.currentIndex = (vocabCardCtrl.currentIndex < vocabCardCtrl.vocab_data.length - 1) ? ++vocabCardCtrl.currentIndex : vocabCardCtrl.currentIndex;
    }

    function getSoundArr(soundArr) {
      var soundArrPath = [];
      for (var i = 0; i < soundArr.length; i++) {
        soundArrPath.push(soundArr[i].path)
      }
      return soundArrPath;
    }

    function playDelayed(sound) {
      $timeout(function() {
        vocabCardCtrl.audio.player.chain(0, getSoundArr(sound))
      }, 100)
    }

    function submitReport() {
      var lesson = lessonutils.getLocalLesson();
      var promise = null;
      $log.debug('vocab parent lesson : ', lesson)
      if (!lesson.score || !lesson.score[$stateParams.vocab_data.node.id]) {

        promise = User.skills.update({
          profileId: User.getActiveProfileSync()._id,
          lessonId: lesson.node.id,
          score: $stateParams.vocab_data.node.type.score,
          totalScore: $stateParams.vocab_data.node.type.score,
          skill: lesson.node.tag
        })
      } else {
        promise = $q.resolve();
      }
      promise
        .then(function() {

          return User.scores.update({
            profileId: User.getActiveProfileSync()._id,
            lessonId: lesson.node.id,
            id: $stateParams.vocab_data.node.id,
            score: $stateParams.vocab_data.node.type.score,
            totalScore: $stateParams.vocab_data.node.type.score,
            type: 'vocabulary',
            skill: lesson.node.tag,
            playlist_index: $stateParams.vocab_data.node.playlist_index
          })
        }).then(function() {
          return User.reports.save({
            'score': $stateParams.vocab_data.node.type.score,
            'profileId': User.getActiveProfileSync()._id,
            'node': $stateParams.vocab_data.node.id
          })
        })
    }




    function playStarSound() {
      var starSound = ["one_star", "two_star", "three_star"];
      var star = 0;
      if ($scope.summary.stars) {
        star = $scope.summary.stars;
      } else if ($scope.summary.score.percent) {
        star = $scope.summary.score.percent > CONSTANT.STAR.THREE ? 3 : $scope.summary.score.percent > CONSTANT.STAR.TWO ? 2 : $scope.summary.score.percent > CONSTANT.STAR.ONE ? 1 : 0;
      } else {
        star = 0;
      }
      $log.debug("playing star sound", star);
      for (var i = 0; i < star; i++) {
        // $log.debug("sound source", starSound[i]);
        (function(count) {
             $timeout(function() {
            $scope.resultStarFlag[count] = true;
            $log.debug("sound source", starSound, count, starSound[count]);
            $log.debug("count,star,count==star-1",count,star,count == star-1);
            if(count == star-1){
              $log.debug("HEREEE");
            audio.player.play("sound/" + starSound[count] + ".mp3",function(){
              $log.debug("Setting resultPageNextShow");
              $scope.resultPageNextShow = true;
            });
            }else{
              $log.debug("HEREEE 1");

            audio.player.play("sound/" + starSound[count] + ".mp3");
            }
            // angular.element("#audioplayer")[0].pause();
            // angular.element("#audioSource")[0].src = ;
            // angular.element("#audioplayer")[0].load();
            // angular.element("#audioplayer")[0].play();
          }, (count + 1) * 1000);
        })(i)
      }
    }

    function onVocabComplete() {
      $scope.summary = {
        stars: 3
      }
      vocabCardCtrl.playStarSound();
      submitReport()
      $timeout(function() {
        orientation.setPortrait();
        //   $scope.ribbon_modal.hide();
        $scope.resultPageNextShow = false;
        $scope.resultMenu.show();
        analytics.log({
            name: 'VOCABULARY',
            type: 'END',
            id: $stateParams.vocab_data.node.id
          }, {
            time: new Date()
          },
          User.getActiveProfileSync()._id
        )
      })
    }

    playDelayed(vocabCardCtrl.vocab_data[vocabCardCtrl.currentIndex].node.type.sound);


  }
})();
