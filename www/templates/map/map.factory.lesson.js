(function() {
  'use strict';

  angular
    .module('zaya-map')
    .factory('extendLesson', extendLesson);

  extendLesson.$inject = ['$log', 'CONSTANT', 'data', 'Auth','$q'];

  /* @ngInject */
  function extendLesson($log, CONSTANT, data, Auth, $q) {
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

    function getLesson(lessons) {
      var d = $q.defer();
      var promises = []
      angular.forEach(lessons, function(value, key) {
        setLock(key, value, true);
      })
      angular.forEach(lessons, function(value, key) {
        var total_score = 0;
        var obtained_score = 0;

        promises.push(
        data.getLessonScore({
            'userId': Auth.getProfileId(),
            'lessonId': value.id
          }).then(function(score) {
            if (score) {
              for (var property in score) {
                if (score.hasOwnProperty(property)) {
                  total_score = total_score + score[property].totalScore;
                  obtained_score = obtained_score + score[property].score;
                }
              }
              if (total_score > 0) {
                var percent = (obtained_score / total_score) * 100;

                // if score is >  80%, unlock the next lessons
                if (percent >= CONSTANT.STAR.ONE) {
                  if (lessons[key + 1])
                    setLock(key, lessons[key + 1], false);
                }

                // give stars
                if (obtained_score == 0) {
                  setStar(key, lessons[key], -1);
                } else if (percent > 0 && percent < CONSTANT.STAR.ONE) {
                  setStar(key, lessons[key], 0);
                } else if (percent >= CONSTANT.STAR.ONE && percent < CONSTANT.STAR.TWO) {
                  setStar(key, lessons[key], 1);
                } else if (percent >= CONSTANT.STAR.TWO && percent < CONSTANT.STAR.THREE) {
                  setStar(key, lessons[key], 2);
                } else if (percent >= CONSTANT.STAR.THREE) {
                  setStar(key, lessons[key], 3);
                } else {}

              }
            }
            // unlock first lessons
            if (key == 0) {
              setLock(key, value, false);
            }
            return lessons[key];
          }))
      })

      $q.all(promises).then(function(success) {
        d.resolve(success);
      });
      // include litmus test
      return d.promise;
    }

  }
})();
