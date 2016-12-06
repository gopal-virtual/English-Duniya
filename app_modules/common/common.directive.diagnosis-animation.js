(function() {
  'use strict';

  angular
    .module('zaya-map')
    .directive('diagnosis', diagnosis)

  /* @ngInject */
  function diagnosis(CONSTANT, audio) {
    var diagnosis = {
      restrict: 'E',
      templateUrl: CONSTANT.PATH.COMMON + '/common.diagnosis.animation' + CONSTANT.VIEW,
      link: linkFunc,
      scope: {
        level: '=gradeLevel',
        gender: '=gender',
        redirect: '&redirect'
      }
    };

    return diagnosis;

    function linkFunc(scope, el, attr, ctrl) {
      var loader_items = document.querySelector('#loader_item')
      var avatar = document.querySelector('#boy')
      var badge = document.querySelector('#badge')
      var ribbon = document.querySelector('#ribbon')
      var level = document.querySelectorAll('#level-text tspan')
      var button = document.querySelectorAll('#start-map')
      var timeline = new TimelineMax({
        repeat: 0
      })

      var currentLevel = document.querySelector('#level')
      currentLevel.childNodes[0].nodeValue = scope.level;
      console.log(currentLevel.childNodes[0].nodeValue)

      TweenLite.set(avatar, {
        transformOrigin: "50% 50%"
      })
      TweenLite.set(loader_items, {
        transformOrigin: "50% 50%"
      })
      TweenLite.set(badge, {
        transformOrigin: "50% 50%"
      })
      timeline.from(loader_items, 1, {
        scaleX: 0,
        scaleY: 0,
        ease: Power4.easeOut
      })
      timeline.from(loader_items, 6, {
        rotationZ: 540,
        ease: Power0.easeNone
      }, "-=1")
      timeline.fromTo(avatar, 1, {
        opacity: 0,
        y: 1500,
        scaleX: 3,
        scaleY: 3,
        ease: Power4.easeOut
      }, {
        opacity: 1,
        y: 190,
        scaleX: 0.9,
        scaleY: 0.9,
        ease: Power4.easeOut
      }, "-=2")
      timeline.to(loader_items, 1, {
        opacity: 0,
        ease: Power0.easeIn
    }, "-=2")
      timeline.from(badge, 1, {
        opacity: 0,
        ease: Power4.easeOut
      }, "-=1")
      timeline.from(ribbon, 1, {
        y: -20,
        opacity: 0,
        ease: Power4.easeOut,
        onStart: playLevelAudio
      }, "-=1")
      timeline.staggerFrom(level, 0.25, {
        opacity: 0
    }, 0.08, "-=1");
      timeline.from(button, 1, {
        y: 20,
        opacity: 0,
        ease: Power4.easeOut
      })
      timeline.play();

      function playChimes () {
            audio.player.play('sound/three_star.mp3')
      }

      function playLevelAudio() {
        if (scope.level <= 1) {
          audio.player.play('sound/not_bad_you_are_at_level_1.mp3')
        } else if (scope.level <= 2) {
          audio.player.play('sound/yay_you_reached_level_2.mp3')
        } else if (scope.level <= 3) {
          audio.player.play('sound/yay_you_reached_level_3.mp3')
        } else if (scope.level <= 4) {
          audio.player.play('sound/nice_you_reached_level_4.mp3')
        } else if (scope.level <= 5) {
          audio.player.play('sound/yay_you_are_on_level_5.mp3')
        } else if (scope.level <= 6) {
          audio.player.play('sound/yay_you_are_on_level_6.mp3')
        } else if (scope.level <= 7) {
          audio.player.play('sound/yay_you_are_on_level_7.mp3')
        } else if (scope.level <= 8) {
          audio.player.play('sound/yay_you_are_on_level_8.mp3')
        } else {}
      }
    }
  }

})();
