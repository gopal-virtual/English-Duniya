(function() {
  'use strict';

  angular
    .module('common')
    .factory('demo', demo)

  function demo($log, User, $q) {
    return {
      show: function(step) {
          var deferred = $q.defer();
        $log.debug("calling user skills",User.getActiveProfileSync()._id)
        return User.skills.get(User.getActiveProfileSync()._id)
          .then(function(skills) {
            $log.debug("HERE")
            var score = 0;

            angular.forEach(skills, function(skill) {
              score = score + skill.lesson_scores;
            });
            if(step && step === 5 && score === 50){
              deferred.resolve(true);
              return deferred.promise;
            }
            score  ? deferred.resolve(false) : deferred.resolve(true);
            return deferred.promise;

            //
          }).catch(function(e) {
            $log.debug("showDmemo Error",e)
          })
      },
      getStep: function() {
        // if (localStorage.getItem('demo_flag') === null) {
        //   localStorage.setItem('demo_flag', 1);
        // }
        return parseInt(localStorage.getItem('demo_flag'));
      },
      setStep: function(step) {

        localStorage.setItem('demo_flag', step);
      }
    };
  }
})();
