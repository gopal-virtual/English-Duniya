(function() {
  'use strict';

  angular
    .module('zaya-map')
    .directive('diagnosis', diagnosis)

  /* @ngInject */
  function diagnosis(CONSTANT, audio, localized, User) {
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
      var node_1 = document.querySelectorAll('#button_1')
      var node_2 = document.querySelectorAll('#button_2')
      var node_3 = document.querySelectorAll('#button_3')
      var node_4 = document.querySelectorAll('#button_4')
      var node_5 = document.querySelectorAll('#button_5')
      var node_6 = document.querySelectorAll('#button_6')

      var line_1 = document.querySelectorAll('#line_1')
      var line_2 = document.querySelectorAll('#line_2')
      var line_3 = document.querySelectorAll('#line_3')
      var line_4 = document.querySelectorAll('#line_4')
      var line_5 = document.querySelectorAll('#line_5')
      var line_6 = document.querySelectorAll('#line_6')
      var line_7 = document.querySelectorAll('#line_7')
      var line_8 = document.querySelectorAll('#line_8')
      var line_9 = document.querySelectorAll('#line_9')
      var line_10 = document.querySelectorAll('#line_10')
      var timeline = new TimelineMax({
        repeat: 0
      })
      TweenLite.set(node_1, {
        transformOrigin: "50% 50%"
      })
      TweenMax.fromTo(node_1, 2, {
        opacity: 0.6,
        scaleX: 0.9,
        scaleY: 0.9,
        ease: Power0.easeNone,
        repeat: -1
      }, {
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        repeat: -1
      })
      TweenLite.set(node_2, {
        transformOrigin: "50% 50%"
      })
      TweenMax.fromTo(node_2, 2, {
        opacity: 0.6,
        scaleX: 0.9,
        scaleY: 0.9,
        ease: Power0.easeNone,
        repeat: -1,
        delay: 0.5
      }, {
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        repeat: -1,
        delay: 0.5
      })
      TweenLite.set(node_3, {
        transformOrigin: "50% 50%"
      })
      TweenMax.fromTo(node_3, 2, {
        opacity: 0.6,
        scaleX: 0.9,
        scaleY: 0.9,
        ease: Power0.easeNone,
        repeat: -1,
        delay: 1
      }, {
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        repeat: -1,
        delay: 1
      })
      TweenLite.set(node_4, {
        transformOrigin: "50% 50%"
      })
      TweenMax.fromTo(node_4, 2, {
        opacity: 0.6,
        scaleX: 0.9,
        scaleY: 0.9,
        ease: Power0.easeNone,
        repeat: -1,
        delay: 1.5
      }, {
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        repeat: -1,
        delay: 1.5
      })
      TweenLite.set(node_5, {
        transformOrigin: "50% 50%"
      })
      TweenMax.fromTo(node_5, 2, {
        opacity: 0.6,
        scaleX: 0.9,
        scaleY: 0.9,
        ease: Power0.easeNone,
        repeat: -1,
        delay: 2
      }, {
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        repeat: -1,
        delay: 2
      })
      TweenLite.set(node_6, {
        transformOrigin: "50% 50%"
      })
      TweenMax.fromTo(node_6, 2, {
        opacity: 0.6,
        scaleX: 0.9,
        scaleY: 0.9,
        ease: Power0.easeNone,
        repeat: -1,
        delay: 2.5
      }, {
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        repeat: -1,
        delay: 2.5
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


      timeline.fromTo(loader_items, 1, {
        scaleX: 0,
        scaleY: 0,
        ease: Power4.easeOut
      }, {
        scaleX: 1.5,
        scaleY: 1.5,
        ease: Power4.easeOut
      })
      timeline.from(line_1, 0.9, {
        opacity: 0,
        ease: Power4.easeOut
      })
      timeline.from(line_2, 0.9, {
        opacity: 0,
        ease: Power4.easeOut
      }, "-=0.9")
      timeline.from(line_3, 0.9, {
        opacity: 0,
        ease: Power4.easeOut
      }, "-=0.8")
      timeline.from(line_4, 0.9, {
        opacity: 0,
        ease: Power4.easeOut
      }, "-=0.7")
      timeline.from(line_5, 0.9, {
        opacity: 0,
        ease: Power4.easeOut
      }, "-=0.6")
      timeline.from(line_6, 0.9, {
        opacity: 0,
        ease: Power4.easeOut
      }, "-=0.5")
      timeline.from(line_7, 0.9, {
        opacity: 0,
        ease: Power4.easeOut
      }, "-=0.4")
      timeline.from(line_8, 0.9, {
        opacity: 0,
        ease: Power4.easeOut
      }, "-=0.3")
      timeline.from(line_9, 0.9, {
        opacity: 0,
        ease: Power4.easeOut
      }, "-=0.2")
      timeline.from(line_10, 0.9, {
        opacity: 0,
        ease: Power4.easeOut
      }, "-=0.1")
      timeline.from(loader_items, 16, {
        rotationZ: 540,
        ease: Power0.easeNone
      }, "-=16")
      timeline.from(loader_items, 16, {
        rotationX: 2000,
        ease: Power0.easeNone
      }, "-=16")
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
        //   timeline.play();

      function playChimes() {
        audio.player.play('sound/three_star.mp3')
      }

      function playLevelAudio() {
        var audioName ;
        if (scope.level <= 1) {
          audioName = 'level1'
        } else if (scope.level <= 2) {
          audioName = 'level2'
        } else if (scope.level <= 3) {
          audioName = 'level3'
        } else if (scope.level <= 4) {
          audioName = 'level4'
        } else if (scope.level <= 5) {
          audioName = 'level5'
        } else if (scope.level <= 6) {
          audioName = 'level6'
        } else if (scope.level <= 7) {
          audioName = 'level7'
        } else if (scope.level <= 8) {
          audioName = 'level8'
        } else {}
          audio.player.play(CONSTANT.PATH.LOCALIZED_AUDIO+localized.audio.diagnosis[audioName].lang[User.getProfileSync().data.profile.language])
      }
    }
  }

})();
