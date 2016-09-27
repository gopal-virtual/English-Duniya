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

  function User(CONSTANT,
                $log,
                $q,
                pouchDB,
                queue,
                device,
                $injector) {

    var User = {};
    var profilesDB = pouchDB('profilesDB');
    var appDB = pouchDB('appDB');
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
      getIdSync: getUserIdSync
    }
    User.profile = {
      add: addNewProfile,
      update: updateProfile,
      // set: setActiveProfile,
      get: get,
      getAll: getAllProfiles,
      patch: patchProfile
    };
    User.skills = {
      get: getSkills,
      update: updateSkills
    };
    User.scores = {
      getScoreList: getScoreList,
      getScoreOfLesson: getScoreOfLesson,
      update: updateScores,
      getScoreOfAssessment: getScoreOfAssessment
    };
    User.reports = {
      save: saveReport
    };
    User.demo = {
      isShown: isDemoShown,
      getStep: getDemoStep,
      setStep: setDemoStep
    }

    function getUserIdSync() {
      return JSON.parse(localStorage.getItem('user_details')).id
    }

    function getAllProfiles() {
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


      return profilesDB.put(record)
        .then(function () {


          return queue.push('profiles', profile);
        }).then(function () {
          return record;
        })
        .catch(function (e) {

        })
    }


    function patchProfile(profile, id) {
      $log.debug("inside patche profile")

      var record = {
        "_id": id ? id : generateProfileID(),
        "data": {
          "scores": {},
          "reports": [],
          "skills": initial_skills,
          "profile": profile
        }
      };
      return appDB.get(id).then(function (response) {
        $log.debug("inside patche profile 1", response)
        record.data.scores = response.data.scores;
        record.data.skills = response.data.skills;
        return profilesDB.put(record)
        })
        .then(function () {
          $log.debug("inside patche profile 2", record)
          return record;
        })
      .catch(function(error){
        $log.debug("Error",error)

      })
    }

    function getActiveProfileSync() {
      return JSON.parse(localStorage.getItem('profile'));
    }

    function updateActiveProfileSync(profile) {
      return localStorage.setItem('profile', JSON.stringify(profile));
    }

    function updateProfile(profileId, profileData) {

      var new_profile;
      return profilesDB.get(profileId).then(function (response) {
        new_profile = response;
        new_profile.data.profile = profileData;
        return profilesDB.put(new_profile);
      }).then(function () {
        var temp = new_profile.data.profile;
        delete temp['client_uid'];
        return queue.push('/profiles/' + profileId, temp, 'patch')
      })
        .then(function () {

          updateActiveProfileSync(new_profile);
          return $injector.get('content').createLessonDBIfNotExists()
        })
        .catch(function (e) {

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

      return profilesDB.get(profileId).then(function (response) {

        return response.data.skills;
      })
    }


    function updateSkills(data) {

      return profilesDB.get(data.profileId).then(function (response) {
        var doc = response.data;
        angular.forEach(doc.skills, function (skill, key) {
          if (skill.title == data.skill) {
            doc.skills[key].lesson_scores += data.score;
          }
        })
        updateActiveProfileSync({'_id': data.profileId, 'data': doc});
        return profilesDB.put({
          '_id': data.profileId,
          '_rev': response._rev,
          'data': doc
        })
      })
        .catch(function (error) {
        })
    }


    function getScoreList() {

    }

    function getScoreOfLesson(lessonId, profileId) {

      return profilesDB.get(profileId).then(function (response) {

        return response.data.scores[lessonId];
      })

    }

    function updateScores(data) {
      return profilesDB.get(data.profileId).then(function (response) {
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

        localStorage.setItem('lesson', JSON.stringify(temp));
        return profilesDB.put({
          '_id': data.profileId,
          '_rev': response._rev,
          'data': doc
        });
      })


    }

    function saveReport(report) {
      return queue.push('reports', {
        'client_uid': report.profileId,
        'node': report.node,
        'score': report.score,
        'attempts': report.attempts
      })
    }

    function getScoreOfAssessment(assessmentId, lessonId, profileId) {
      return profilesDB.get(profileId).then(function (response) {
        var result = null;
        if (response.data.scores.hasOwnProperty(lessonId)) {
          if (response.data.scores[lessonId].hasOwnProperty(assessmentId)) {
            result = response.data.scores[lessonId][assessmentId]
          }
        }
        return result
      })
    }


    function isDemoShown(step) {
      return false
      var skills = getActiveProfileSync().data.skills;
      var score = 0;
      angular.forEach(skills, function (skill) {
        score = score + skill.lesson_scores;
      });
      $log.debug(score, skills)
      if (step && step === 5 && score === 50) {
        return true;
      }
      return score ? false : true;
    }

    function getDemoStep() {
      return parseInt(localStorage.getItem('demo_flag'));
    }

    function setDemoStep(step) {
      $log.debug("set Step", step)

      localStorage.setItem('demo_flag', step);
    }

    return User;


  }
})();
