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
      isUserEligible: isUserEligible,
      isChallengeActive: isChallengeActive,
      showChallengeButton: showChallengeButton
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

    function isUserEligible() {
      if (['2', '3', '4', '5'].indexOf(User.getActiveProfileSync().data.profile.grade) >= 0) {
        return true;
      } else {
        return false;
      }
    }

    function isChallengeActive() {
      var challengeEndDate = new Date(CONSTANT.CHALLENGE_END.YEAR, CONSTANT.CHALLENGE_END.MONTH, CONSTANT.CHALLENGE_END.DATE);
      var challengeEndDateText = new Date(challengeEndDate.getFullYear(), challengeEndDate.getMonth(), challengeEndDate.getDate());
      var today = new Date();
      var todayText = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      var daysRemaining = daysBetween(todayText, challengeEndDateText);
      if (daysRemaining < 0) {
        return false;
      } else {
        return true;
      }
    }

    function showChallengeButton() {
      var challengeEndDate = new Date(CONSTANT.CHALLENGE_END.YEAR, CONSTANT.CHALLENGE_END.MONTH, CONSTANT.CHALLENGE_END.DATE);
      var challengeEndDateText = new Date(challengeEndDate.getFullYear(), challengeEndDate.getMonth(), challengeEndDate.getDate());
      var today = new Date();
      var todayText = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      var daysRemaining = daysBetween( challengeEndDateText, todayText);
      
      $log.debug("show challenge button",daysRemaining,challengeEndDateText);
      if (daysRemaining < 14) {
        return true;
      } else {
        return false;
      }
    }

    function daysBetween(date1, date2) {
      //Get 1 day in milliseconds
      var one_day = 1000 * 60 * 60 * 24;
      // Convert both dates to milliseconds
      var date1_ms = date1.getTime();
      var date2_ms = date2.getTime();
      // Calculate the difference in milliseconds
      var difference_ms = date2_ms - date1_ms;
      // Convert back to days and return
      return Math.round(difference_ms / one_day);
    }
    //Set the two dates
    //displays 726
    return challengeProperties;
  }
})();