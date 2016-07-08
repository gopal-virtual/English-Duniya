(function() {
  'use strict';

  angular
    .module('common')
    .factory('demo', demo)

  function demo($log,data, Auth) {
    return {
      show: function(){
        $log.debug("demo skills OP",Auth.getProfileId())
        return data.getSkills({'userId':Auth.getProfileId()}).then(function(skills){
          var score = 0;
          $log.debug("demo skills",skills)
          angular.forEach(skills,function(skill){
              $log.debug("demo skills",score)
            score = score + skill.lesson_scores;
          })
          return score ? false : true;
        }).catch(function(e){
          $Log.debug("demo skills error",e)
        })
      },
      getStep: function(){
        if(localStorage.getItem('demo_flag') === null){
          localStorage.setItem('demo_flag',1);
        }
        return  parseInt(localStorage.getItem('demo_flag'));
      },
      setStep: function(step){
          localStorage.setItem('demo_flag',step);
      }
    };
  }
})();
