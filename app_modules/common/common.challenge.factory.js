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
      points: parseInt(localStorage.getItem('points' + User.getActiveProfileSync()._id)) | 0
    };

    function addPoints(profileID, points, action, nodeId) {
      var oldPoints = parseInt(localStorage.getItem('points' + profileID)) | 0;
      localStorage.setItem('points' + profileID, parseInt(points) + oldPoints);
      getPoints(profileID);
      pointsQueue.push({
        action: action,
        score: points,
        object_id: nodeId
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
    return challengeProperties;
  }
})();