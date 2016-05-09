(function() {
  'use strict';

  angular
    .module('zaya-map')
    .factory('extendLesson', extendLesson);

  extendLesson.$inject = ['$log', 'CONSTANT'];

  /* @ngInject */
  function extendLesson($log, CONSTANT) {
    var extendLesson = {
      getLesson: getLesson
    };

    return extendLesson;

    function setLock(key, lesson, bool) {
      lesson.locked = bool;
    }

    function setStar(key, lesson, count) {
      lesson.stars = count;
    }

    function getLesson(lessons, scores) {

      angular.forEach(lessons, function(value, key) {
        setLock(key, value, true);
      })
      angular.forEach(lessons, function(value, key) {
        if (scores[key].total_score > 0) {
          var score = (scores[key].obtained_score / scores[key].total_score) * 100;

          // if score is > 80%, unlock the next lessons
          if (score >= CONSTANT.STAR.ONE) {
            if (lessons[key + 1])
              setLock(key, lessons[key + 1], false);
          }

          // give stars
          if (scores[key].obtained_score == 0) {
            setStar(key, lessons[key], -1);
          } else if (score > 0 && score < CONSTANT.STAR.ONE) {
            setStar(key, lessons[key], 0);
          } else if (score >= CONSTANT.STAR.ONE && score < CONSTANT.STAR.TWO) {
            setStar(key, lessons[key], 1);
          } else if (score >= CONSTANT.STAR.TWO && score < CONSTANT.STAR.THREE) {
            setStar(key, lessons[key], 2);
          } else if (score >= CONSTANT.STAR.THREE) {
            setStar(key, lessons[key], 3);
          } else {}

          // unlock first lessons
          if (key == 0) {
            setLock(key, value, false);
          }
        }
      })

      return lessons;
    }

  }
})();
