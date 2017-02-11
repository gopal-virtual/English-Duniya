(function() {
  'use strict';

  angular
    .module('zaya-content')
    .controller('vocabularyCardController', vocabularyCardController);

  vocabularyCardController.$inject = ['$log', '$state', 'audio', '$timeout', '$interval', '$scope', '$stateParams', 'CONSTANT', 'lessonutils', 'User', 'analytics', 'orientation', '$ionicModal', 'Utilities', '$ionicLoading','challenge'];

  /* @ngInject */
  function vocabularyCardController($log, $state, audio, $timeout, $interval, $scope, $stateParams, CONSTANT, lessonutils, User, analytics, orientation, $ionicModal, Utilities, $ionicLoading, challenge) {
    var vocabCardCtrl = this;
    var timeout = '';
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
    vocabCardCtrl.logCard = logCard;
    vocabCardCtrl.enable = false;
    $scope.resultStarFlag = [];
    $scope.goToMap = goToMap;
    $scope.utilities = Utilities;
    $scope.audio = audio;
    $scope.userGender = User.getActiveProfileSync().data.profile.gender;
    $scope.openPauseMenu = openPauseMenu;
    $scope.openNodeMenu = openPauseMenu;
    $scope.closePauseMenu = closePauseMenu;
    $scope.closeNodeMenu = closePauseMenu;
    $scope.lessonutils = lessonutils;
    $scope.analytics_quit_data = {name : 'VOCABULARY', type : 'QUIT', id : $stateParams.vocab_data.node.id};
    $scope.$on('backButton', backButton);
    $scope.logResume = function(){
        analytics.log({
            name: 'VOCABULARY',
            type: 'RESUME',
            id: $stateParams.vocab_data.node.id
          }, {
            time: new Date()
          },
          User.getActiveProfileSync()._id
        )
    }

    $scope.isPlayed = $stateParams.vocab_data.isPlayed;
    $scope.hasUserJoinedChallenge = User.hasJoinedChallenge();
    $scope.resultButtonAnimationFlag = 0;
    // $scope.resultButtonAnimation = resultButtonAnimation;
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
        analytics.log({
            name: 'VOCABULARY',
            type: 'PAUSE',
            id: $stateParams.vocab_data.node.id
          }, {
            time: new Date()
          },
          User.getActiveProfileSync()._id
        )
      $scope.pauseMenu.show().then(function(){
        audio.player.play('sound/'+localized.audio.app.ExitResource.lang[User.getActiveProfileSync().data.profile.language]);
      });
    }

    function closePauseMenu() {
      $scope.pauseMenu.hide().then(function(){
        audio.player.stop();
      });
    }

    function goToMap() {
        analytics.log({
            name: 'VOCABULARY',
            type: 'SWITCH',
            id: $stateParams.vocab_data.node.id
          }, {
            time: new Date()
          },
          User.getActiveProfileSync()._id
        )
      $log.debug('going to map.navigate');
      $ionicLoading.show({
        hideOnStateChange: true
      });
      $scope.resultMenu.hide();
      $state.go('map.navigate', {
        activatedLesson: $stateParams.vocab_data
      });
    }
    vocabCardCtrl.logCard(0, 'START');
    function logCard(index, type) {
      analytics.log({
          name: 'VOCABULARY_CARD',
          type: type,
          id: vocabCardCtrl.vocab_data[index].node.id
        }, {
          time: new Date()
        },
        User.getActiveProfileSync()._id
      )
    }
    function prev() {
      $log.debug('Clicked : Prev')
      vocabCardCtrl.enable = false;
      if(vocabCardCtrl.currentIndex > 0){
          vocabCardCtrl.logCard(vocabCardCtrl.currentIndex, 'END');
          vocabCardCtrl.logCard(vocabCardCtrl.currentIndex - 1, 'START');
      }
      vocabCardCtrl.currentIndex = (vocabCardCtrl.currentIndex > 0) ? --vocabCardCtrl.currentIndex : vocabCardCtrl.currentIndex;
    }

    function next() {
      $log.debug('Clicked : Next')
      vocabCardCtrl.enable = false;
      if((vocabCardCtrl.currentIndex < vocabCardCtrl.vocab_data.length - 1)){
          vocabCardCtrl.logCard(vocabCardCtrl.currentIndex, 'END');
          vocabCardCtrl.logCard(vocabCardCtrl.currentIndex + 1, 'START');
      }
      vocabCardCtrl.currentIndex = (vocabCardCtrl.currentIndex < vocabCardCtrl.vocab_data.length - 1) ? ++vocabCardCtrl.currentIndex : vocabCardCtrl.currentIndex;
    }

    function getSoundArr(soundArr) {
      var soundArrPath = [];
      for (var i = 0; i < soundArr.length; i++) {
        soundArrPath.push(soundArr[i].path)
      }
      return soundArrPath;
    }

    function getLastSound(soundArr) {
        var soundArrPath = [];
        soundArrPath.push(soundArr[soundArr.length - 1].path);
        return soundArrPath;
    }

    function playDelayed(sound, userinput, index) {
        userinput && analytics.log({
            name: 'VOCABULARY_CARD',
            type: 'PLAY',
            id: vocabCardCtrl.vocab_data[index].node.id
          }, {
            time: new Date(),
            file : getLastSound(sound)
          },
          User.getActiveProfileSync()._id
        )
      vocabCardCtrl.enable = false;
      timeout = $timeout(function() {
        vocabCardCtrl.audio.player.chain(0, getLastSound(sound), function(){
            vocabCardCtrl.enable = true;
        })
      }, 100)
    }

    function submitReport() {
      var lesson = lessonutils.getLocalLesson();
      var promise = null;
      $log.debug("$stateParams.vocab_data.isPlayed",$stateParams.vocab_data.isPlayed)
      if(!$stateParams.vocab_data.isPlayed && $scope.hasUserJoinedChallenge){
      challenge.addPoints(User.getActiveProfileSync()._id,50,'node_complete',$stateParams.vocab_data.node.id);
      }

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
             timeout = $timeout(function() {
            $scope.resultStarFlag[count] = true;
            $log.debug("sound source", starSound, count, starSound[count]);
            $log.debug("count,star,count==star-1",count,star,count == star-1);
            audio.player.play("sound/" + starSound[count] + ".mp3");
            if(count == star-1){
              $scope.resultPageNextShow = true;
            }
          }, (count + 1) * 1000);
        })(i)
      }
    }

    function onVocabComplete() {
      vocabCardCtrl.logCard(vocabCardCtrl.currentIndex, 'END');
      analytics.log({
          name: 'VOCABULARY',
          type: 'END',
          id: $stateParams.vocab_data.node.id
        }, {
          time: new Date()
        },
        User.getActiveProfileSync()._id
      ),
      $scope.summary = {
        stars: 3
      },
      vocabCardCtrl.playStarSound();
      submitReport()
      timeout = $timeout(function() {
        orientation.setPortrait();
        //   $scope.ribbon_modal.hide();
        $scope.resultPageNextShow = false;
        $scope.resultMenu.show().then(function(){
          resultButtonAnimation()
        });
      })
    }

    playDelayed(vocabCardCtrl.vocab_data[vocabCardCtrl.currentIndex].node.type.sound, false);

    $scope.$on('appResume', function(){
        // show pause menu
        vocabCardCtrl.audio.player.removeCallback();
        vocabCardCtrl.audio.player.stop();
        vocabCardCtrl.enable = true;
        if(!$scope.resultMenu.isShown()){
            openPauseMenu();
        }
    })
    $scope.$on('appPause', function(){
        vocabCardCtrl.audio.player.removeCallback();
        vocabCardCtrl.audio.player.stop();
        vocabCardCtrl.enable = true;
        $timeout.cancel( timeout );
    })

    function resultButtonAnimation() {
      $log.debug("ANIMATION. Inside button animation")
      $timeout(function() {
        $scope.resultButtonAnimationFlag = 1;
      },3000).then(function(){
        $timeout(function(){
          $scope.resultButtonAnimationFlag = 2;
        },400)
      })
    }

  }
})();
