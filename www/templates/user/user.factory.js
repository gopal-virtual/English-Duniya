(function () {
  'use strict';
  angular
    .module('zaya-user')
    .factory('User', User)
  User.$inject = [
    'CONSTANT',
    '$log',
    '$q',
    'pouchDB',
    'queue',
    'device',
    '$injector'

  ];

  function User(
                CONSTANT,
                $log,
                $q,
                pouchDB,
                queue,
                device,
                $injector

  ) {

    var User = {};
    var profilesDB = pouchDB('profilesDB');
    var initial_skills = [
      {
        "id": "fd6044b3-aa49-4599-b1b9-e66d3cb03bce",
        "title": "Vocabulary",
        "lesson_scores": 0,
        "question_scores": 0
      },
      {
        "id": "18059dd6-a37d-44f0-9e92-efca7ec31d3b",
        "title": "Reading",
        "lesson_scores": 0,
        "question_scores": 0
      },
      {
        "id": "d82f6ac3-6401-49f5-b787-642b041cfa9e",
        "title": "Grammar",
        "lesson_scores": 0,
        "question_scores": 0
      },
      {
        "id": "f0f0d75b-8671-49db-b2d0-5b0ba6135be8",
        "title": "Listening",
        "lesson_scores": 0,
        "question_scores": 0
      }
    ];

    function generateProfileID() {
      var d = new Date().getTime();
      var random_uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return device.uuid + '_' + random_uuid
    }

    User.getActiveProfileSync = getActiveProfileSync;
    User.setActiveProfileSync = setActiveProfileSync;
    User.updateActiveProfileSync = updateActiveProfileSync;
    User.user = {
      getIdSync : getUserIdSync
    }
    User.profile = {
      add: addNewProfile,
      update: updateProfile,
      // set: setActiveProfile,
      get: get,
      getAll : getAllProfiles
    };
    User.skills = {
      get: getSkills,
      update: updateSkills
    };
    User.scores = {
      getScoreList: getScoreList,
      getScoreOfLesson: getScoreOfLesson,
      update: updateScores,
      getScoreOfAssessment : getScoreOfAssessment
    };
    User.reports = {
      save : saveReport
    }

    function getUserIdSync(){
      return JSON.parse(localStorage.getItem('user_details')).id
    }

    function getAllProfiles(){
      return profilesDB.allDocs({
        include_docs: true
      }).then(function (response) {
        return response.rows;
      })
    }
    function addNewProfile(profile) {
      var record = {
        "_id": generateProfileID(),
        "data": {
          "scores": {},
          "reports": [],
          "skills": initial_skills,
          "profile": profile
        }
      };
      profile.client_uid = record._id;
      $log.debug(profile)
      return profilesDB.put(record)
        .then(function () {
          $log.debug("gete")

          return queue.push('profiles', profile);
        }).then(function () {
          return record;
        })
        .catch(function(e){
          $log.debug("EE",e)
        })
    }

    function getActiveProfileSync() {
      return JSON.parse(localStorage.getItem('profile'));
    }
    function updateActiveProfileSync(profile) {
      return localStorage.setItem('profile',JSON.stringify(profile));
    }

    function updateProfile(profileId,profileData) {
      $log.debug("updateProfile",profileData,profileId);
      var new_profile;
      return profilesDB.get(profileId).then(function(response){
        new_profile = response;
        new_profile.data.profile = profileData;
        return profilesDB.put(new_profile);
      }).then(function(){
        updateActiveProfileSync(new_profile);
        $log.debug("Here");

        return $injector.get('content').createLessonDBIfNotExists()
      })
        .catch(function (e) {
        $log.debug("Error",e)
      });
        // profile.grade = newGrade;
        // Auth.updateProfile(profile);

        // return data.createIfNotExistsLessonDB()

    }

    function setActiveProfileSync(profile) {
      localStorage.setItem('profile', JSON.stringify(profile));
      return true;
    }

    function get(profileId) {

    }

    function getSkills(profileId) {
      $log.debug("getting skills",profileId)
      return profilesDB.get(profileId).then(function (response) {
            $log.debug(response.data.skills)
        return response.data.skills;
      })
    }


    function updateSkills(data) {
      return profilesDB.get(data.profileId).then(function(response) {
        var doc = response.data;
        angular.forEach(doc.skills, function(skill, key) {
          if (skill.title == data.skill) {
            doc.skills[key].lesson_scores += data.score;
          }
        })

        return profilesDB.put({
          '_id': data.profileId,
          '_rev': response._rev,
          'data': doc
        })
      })
        .catch(function(error) {})
    }


    function getScoreList() {

    }

    function getScoreOfLesson(lessonId, profileId) {

      return profilesDB.get(profileId).then(function (response) {

        return response.data.scores[lessonId];
      })

    }

    function updateScores(data) {
      return profilesDB.get(data.profileId).then(function(response) {
        var doc = response.data;
        if (!doc.scores.hasOwnProperty(data.lessonId)) {
          doc.scores[data.lessonId] = {};
        }
        doc.scores[data.lessonId][data.id] = {
          'score': data.score,
          'totalScore': data.totalScore,
          'type': data.type
        };
        var temp = JSON.parse(localStorage.getItem('lesson'));
        temp.score = doc.scores[data.lessonId];
        $log.debug("updating scores in local",temp,JSON.parse(localStorage.getItem('lesson')))
        localStorage.setItem('lesson',JSON.stringify(temp));
        return profilesDB.put({
          '_id': data.profileId,
          '_rev': response._rev,
          'data': doc
        });
      })


    }

    function saveReport(report) {
        return queue.push('reports',{
          'client_uid': report.profileId,
          'node': report.node,
          'score': report.score,
          'attempts': report.attempts
        })
    }

    function getScoreOfAssessment(assessmentId,lessonId,profileId) {
      return profilesDB.get(profileId).then(function(response) {
        var result = null;
        if (response.data.scores.hasOwnProperty(lessonId)) {
          if (response.data.scores[lessonId].hasOwnProperty(assessmentId)) {
            result = response.data.scores[lessonId][assessmentId]
          }
        }
        return result
      })
    }

    return User;


  }
})();
