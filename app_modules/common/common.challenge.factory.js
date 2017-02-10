(function() {
  'use strict';
  angular
    .module('common')
    .factory('challenge', challenge);
  challenge.$inject = [
    'pouchDB',
    '$log',
    'CONSTANT',
    '$q',
    '$interval',
    'User',
    'widgetParser',
    'extendLesson',
    '$http',
    '$rootScope',
    'pointsQueue'
  ];
  /* @ngInject */
  function challenge(pouchDB,
    $log,
    CONSTANT,
    $q,
    $interval,
    User,
    widgetParser,
    extendLesson,
    $http,
    $rootScope,
    pointsQueue
  ) {
    var challengeProperties = {
      addPoints: addPoints,
      getPoints: getPoints,
      points: parseInt(localStorage.getItem('points' + User.getActiveProfileSync()._id)) | 0,
      isUserEligible : isUserEligible
    };

    function addPoints(profileID, points, action, nodeId) {
      var oldPoints = parseInt(localStorage.getItem('points' + profileID)) | 0;
      localStorage.setItem('points' + profileID, parseInt(points) + oldPoints);
      getPoints(profileID);
      pointsQueue.push({
        client_id: User.getActiveProfileSync()._id,
        points: [{
          action: action,
          score: points,
          object_id: nodeId,
          content_type: 'node'
        }]
      }).then(function() {
        $log.debug("pushPointsQueue success")
      });
    }

    function getPoints(profileID) {
      // return User.scores.getScoreList().then(function(scoresList){
      //   $log.debug()
      // })
      challengeProperties.points = parseInt(localStorage.getItem('points' + profileID));
      return challengeProperties.points;
    }
    function isUserEligible(){
      if(['2','3','4','5'].indexOf(User.getActiveProfileSync().data.profile.grade) >= 0){
        return true;
      }else{
        return false;
      }
    }
    return challengeProperties;
  }
})();