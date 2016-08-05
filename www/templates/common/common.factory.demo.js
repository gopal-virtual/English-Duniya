(function() {
  'use strict';

  angular
    .module('common')
    .factory('demo', demo)

  function demo($log, data, Auth, $q) {
    return {
      show: function(step) {
          var deferred = $q.defer();
        $log.debug("demoFactory OP", Auth.getProfileId())
        return data.getSkills({
            'userId': Auth.getProfileId()
          })
          .then(function(skills) {
            var score = 0;
            $log.debug("demoFactory skills", skills)
            angular.forEach(skills, function(skill) {
              score = score + skill.lesson_scores;
            })
            if(step && step === 5 && score === 50){
              deferred.resolve(true);
              return deferred.promise;
            }
            score  ? deferred.resolve(false) : deferred.resolve(true);
            return deferred.promise;

            // $log.debug("demoFactory  score", score,score > 50 ? false : true)
          }).catch(function(e) {
            $log.debug("demo skills error", e)
          })
      },
      getStep: function() {
        // if (localStorage.getItem('demo_flag') === null) {
        //   localStorage.setItem('demo_flag', 1);
        // }
        return parseInt(localStorage.getItem('demo_flag'));
      },
      setStep: function(step) {
        $log.debug("setting step")
        localStorage.setItem('demo_flag', step);
      }
    };
  }
})();
