(function() {
  'use strict';

  angular
    .module('zaya-map')
    .factory('extendLesson', extendLesson);

  extendLesson.$inject = ['$log', 'CONSTANT','$q','User'];

  /* @ngInject */
  function extendLesson($log, CONSTANT, $q, User) {
    var total_star = 0;
    var extendLesson = {
      getLesson: getLesson,
      getTotalStar : getTotalStar,
      initStar : initStar
    };

    return extendLesson;

    function initStar() {
        total_star = 0
    }

    function setLock(key, lesson, bool) {
      lesson.locked = bool;
    }

    function setStar(key, lesson, count) {
      lesson.stars = count;
      if(count != -1)
        total_star += count;
    }

    function getTotalStar(){
        return total_star;
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
        User.scores.getScoreOfResource(value.node.parent, value.node.id,User.getActiveProfileSync()._id).then(function(score) {

          if (score) {
              // need score for both video and assessment
              total_score = total_score + score.totalScore;
              obtained_score = obtained_score + score.score;


              $log.debug("Lesson to check",lessons[key])
              if (total_score > 0) {
                var percent = (obtained_score / total_score) * 100;

                // if score is >  80%, unlock the next lessons
                if (percent >= CONSTANT.STAR.ONE) {
                  if (lessons[key] && lessons[key + 1]){
                      setLock(key, lessons[key], false);
                      setLock(key, lessons[key + 1], false);
                  }
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
            if (key == 0 || lessons[key].node.content_type_name === 'resource') {
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
