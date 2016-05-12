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

        var total_score = 0;
        var obtained_score = 0;

        angular.forEach(scores[key].contents.assessment, function(value, key) {
          total_score += value.total_score;
          obtained_score += value.obtained_score;
        })

        if (total_score > 0) {
          var score = (obtained_score / total_score) * 100;

          // if score is > 80%, unlock the next lessons
          if (score >= CONSTANT.STAR.ONE) {
            if (lessons[key + 1])
              setLock(key, lessons[key + 1], false);
          }

          // give stars
          if (obtained_score == 0) {
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
