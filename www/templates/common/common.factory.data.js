(function () {
  'use strict';

  angular
    .module('common')
    .factory('data', data);

  data.$inject = [
    'pouchDB',
    '$http',
    '$log',
    'Rest',
    'CONSTANT',
    '$q',
    'mediaManager',
    '$interval',
    'network',
    'User',
    'widgetParser'
  ];

  /* @ngInject */
  function data(pouchDB,
                $http,
                $log,
                Rest,
                CONSTANT,
                $q,
                mediaManager,
                $interval,
                network,
                User,
                widgetParser) {

    var diagLitmusMappingDB = pouchDB('diagLitmusMapping');
    var kmapsJSONDB = pouchDB('kmapsJSON');
    var dqJSONDB = pouchDB('dqJSON');
    var lessonDB = null;
    if (User.getActiveProfileSync()) {
      lessonDB = pouchDB('lessonsGrade' + User.getActiveProfileSync().data.profile.grade, {
        adapter: 'websql'
      });
    }
    var queueDB = pouchDB('queueDB');
    var appDB = pouchDB('appDB');
    var resourceDB = pouchDB('resourceDB');
    var reportsDB = pouchDB('reportsDB');
    var data = {
      createDiagLitmusMappingDB: createDiagLitmusMappingDB(),
      createKmapsJSON: createKmapsJSON(),
      createDiagQJSON: createDiagQJSON(),
      getDiagnosisLitmusMapping: getDiagnosisLitmusMapping,
      getTestParams: getTestParams,
      getKmapsJSON: getKmapsJSON,
      getDQJSON: getDQJSON,
      getQuizScore: getQuizScore,
      getLessonScore: getLessonScore,
      getLessonsScore: getLessonsScore,
      getSkills: getSkills,
      saveReport: saveReport,
      updateScore: updateScore,
      updateSkills: updateSkills,
      putUserifNotExist: putUserifNotExist,
      changeGrade: changeGrade,
      skills: [
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
      ],
      queuePush: queuePush,
      queueSync: queueSync,
      queueUploadRecord: queueUploadRecord,
      local: {
        getProfiles: getLocalProfiles,
        createProfile: createLocalProfile
      }
    };

    return data;


    function getTestParams(realTimeGrade) {

      function setPreviousAnswerCallback(tests, x) {
        tests["previousAnswer"] = x[0];
        tests["count"]++;
        if (x[0] == 1) {
          x[1].test[0]["qSet"][x[1]["actualLevel"]] = {
            "sr": x[1].qSr,
            "answered": "right"
          };
        } else {
          x[1].test[0]["qSet"][x[1]["actualLevel"]] = {
            "sr": x[1].qSr,
            "answered": "wrong"
          };
        }
      }

      return [{
        "skill": "vocabulary",
        "qSet": {},
        "level": parseInt(realTimeGrade),
        "previousAnswer": null,
        "actualLevel": 0,
        "count": 0,
        set setPreviousAnswer(x) {
          this["previousAnswer"] = x;
          this["count"]++;
        }
      }, {
        "skill": "reading",
        "qSet": {},
        "level": parseInt(realTimeGrade),
        "previousAnswer": null,
        "actualLevel": 0,
        "count": 0,
        set setPreviousAnswer(x) {
          this["previousAnswer"] = x;
          this["count"]++;
        }
      }, {
        "skill": "grammar",
        "qSet": {},
        "level": parseInt(realTimeGrade),
        "previousAnswer": null,
        "actualLevel": 0,
        "count": 0,
        set setPreviousAnswer(x) {
          this["previousAnswer"] = x;
          this["count"]++;
        }
      }, {
        "skill": "listening",
        "qSet": {},
        "level": parseInt(realTimeGrade),
        "previousAnswer": null,
        "actualLevel": 0,
        "count": 0,
        set setPreviousAnswer(x) {
          this["previousAnswer"] = x;
          this["count"]++;
        }
      }];
    }

    function createDiagLitmusMappingDB() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/diagnosticLitmusMapping.json').success(function (data) {
        return diagLitmusMappingDB.put({
          "_id": "diagnostic_litmus_mapping",
          "diagnostic_litmus_mapping": data[0]
        })
          .then(function () {
          })
          .catch(function (err) {
          });
      });
      return promise;
    }

    function createKmapsJSON() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/kmapsJSON.json').success(function (data) {
        return kmapsJSONDB.put({
          "_id": "kmapsJSON",
          "kmapsJSON": data[0]
        })
          .then(function () {
          })
          .catch(function (err) {
          });
      });
      return promise;
    }

    function createDiagQJSON() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/diagnosisQJSON.json').success(function (data) {
        return dqJSONDB.put({
          "_id": "dqJSON",
          "dqJSON": data[0]
        })
          .then(function () {
          })
          .catch(function (err) {
          });
      });
      return promise;
    }

    function getDQJSON() {
      var result = dqJSONDB.get("dqJSON")
        .then(function (doc) {
          return doc.dqJSON;
        })
      return result;
    }

    function getKmapsJSON() {
      var result = kmapsJSONDB.get("kmapsJSON")
        .then(function (doc) {
          return doc.kmapsJSON;
        })
      return result;
    }

    function getDiagnosisLitmusMapping() {
      var result = diagLitmusMappingDB.get("diagnostic_litmus_mapping")
        .then(function (doc) {
          return doc.diagnostic_litmus_mapping;
        });
      return result;
    }

    function createLessonDBIfNotExists() {

      lessonDB = pouchDB('lessonsGrade' + User.getActiveProfileSync().data.profile.grade, {
        adapter: 'websql'
      });




      return lessonDB.get('_local/preloaded').then(function (doc) {
      }).catch(function (err) {
        if (err.name !== 'not_found') {
          throw err;
        }
        return lessonDB.load(CONSTANT.PATH.DATA + '/lessonsGrade' + User.getActiveProfileSync().data.profile.grade + '.db').then(function () {
          return lessonDB.put({
            _id: '_local/preloaded'
          });
        })

      })
    }

    function putUserifNotExist(details) {
      var records = {
        scores: {}
      };
      var d = $q.defer();
      Rest.one('profiles', JSON.parse(localStorage.user_details).profile).all('scores').all('skills').getList()
        .then(function (skills) {
          records.skills = skills.plain();
          return data.getLessonsScore();
        })
        .then(function (scores) {
          records.scores = {};
          angular.forEach(scores, function (row) {
            if (row.contents.assessment || row.contents.resource) {
              records.scores[row.id] = {};
            }
            for (var property in row.contents.assessment) {
              if (row.contents.assessment.hasOwnProperty(property)) {

                records.scores[row.id][property] = {
                  score: row.contents.assessment[property].obtained_score,
                  totalScore: row.contents.assessment[property].total_score,
                  type: 'assessment'
                }
              }
            }
            for (property in row.contents.resource) {
              if (row.contents.resource.hasOwnProperty(property)) {
                records.scores[row.id][property] = {
                  score: row.contents.resource[property].obtained_score,
                  totalScore: row.contents.resource[property].total_score,
                  type: 'resource'
                }
              }
            }
          });

          return appDB.get(details.userId)
        })
        .then(function (doc) {
          doc.data.skills = records.skills;
          doc.data.scores = records.scores;

          return appDB.put({
            '_id': details.userId,
            '_rev': doc._rev,
            'data': doc.data
          })
        })
        .then(function () {
          d.resolve();
        })
        .catch(function (error) {
          if (error.status === 404) {
            return appDB.put({
              '_id': details.userId,
              'data': {
                'scores': records.scores,
                'reports': [],
                'skills': records.skills
              }
            }).then(function () {
              d.resolve()
            })
              .catch(function (e) {
                d.reject();
              })
          }
        });
      return d.promise;

    }

    function updateSkills(data) {
      return appDB.get(data.userId).then(function (response) {
        var doc = response.data;
        angular.forEach(doc.skills, function (skill, key) {
          if (skill.title == data.skill) {
            doc.skills[key].lesson_scores += data.score;
          }
        });
        return appDB.put({
          '_id': data.userId,
          '_rev': response._rev,
          'data': doc
        })
      })
        .catch(function (error) {
        })
    }

    function updateScore(data) {
      return appDB.get(data.userId).then(function (response) {
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

        return appDB.put({
          '_id': data.userId,
          '_rev': response._rev,
          'data': doc
        });
      })
        .catch(function (e) {
        })

    }

    function getLessonScore(data) {

      return appDB.get(data.userId).then(function (response) {
        return response.data.scores[data.lessonId];
      })
    }

    function getQuizScore(data) {
      var d = $q.defer();
      appDB.get(data.userId).then(function (response) {
        var result = null;
        if (response.data.scores.hasOwnProperty(data.lessonId)) {
          if (response.data.scores[data.lessonId].hasOwnProperty(data.id)) {
            result = response.data.scores[data.lessonId][data.id]
          }
        }
        d.resolve(result);
      }).catch(function () {
        d.reject();
      });
      return d.promise;
    }

    function getLessonsScore() {
      return Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('profiles', JSON.parse(localStorage.user_details).profile).customGET('lessons-score').then(function (score) {
        return score.plain();
      }, function (error) {
      })
    }

    function getLessonsList() {
      var d = $q.defer();
      lessonDB.allDocs({
        include_docs: true
      }).then(function (data) {


        var lessons = [];
        for (var i = 0; i < data.rows.length; i++) {
          data.rows[i].doc.lesson.node.key = data.rows[i].doc.lesson.key;
          lessons.push(data.rows[i].doc.lesson.node);
        }
        lessons = _.sortBy(lessons, 'key');

        d.resolve(lessons)
      })
        .catch(function (error) {
          d.reject(error)
        });

      return d.promise;
    }

    function getAssessment(quiz) {
      var d = $q.defer();
      var promises = [];
      for (var index = 0; index < quiz.objects.length; index++) {
        if (quiz.objects[index].node.meta && quiz.objects[index].node.meta.instructions && quiz.objects[index].node.meta.instructions.sounds[0] && localStorage.getItem(quiz.objects[index].node.meta.instructions.sounds[0]) != 'played') {
          localStorage.setItem(quiz.objects[index].node.meta.instructions.sounds[0], 'played');
          promises.push(mediaManager.getPath(quiz.objects[index].node.meta.instructions.sounds[0]).then(
            function (index) {
              return function (path) {
                quiz.objects[index].node.instructionSound = path
              }
            }(index)
          ))
        }

        promises.push(widgetParser.parseToDisplay(quiz.objects[index].node.title, index, quiz).then(
          function (index) {
            return function (result) {
              quiz.objects[index].node.widgetHtml = result;
            }
          }(index)
        ));
        quiz.objects[index].node.widgetSound = null;
        if (widgetParser.getSoundId(quiz.objects[index].node.title)) {
          promises.push(widgetParser.getSoundSrc(widgetParser.getSoundId(quiz.objects[index].node.title), index, quiz).then(
            function (index) {
              return function (result) {
                quiz.objects[index].node.widgetSound = result;
              }
            }(index)
          ))
        }

        for (var j = 0; j < quiz.objects[index].node.type.content.options.length; j++) {
          promises.push(widgetParser.parseToDisplay(quiz.objects[index].node.type.content.options[j].option, index, quiz).then(
            function (index, j) {
              return function (result) {
                quiz.objects[index].node.type.content.options[j].widgetHtml = result;
              }
            }(index, j)
          ));
          quiz.objects[index].node.type.content.options[j].widgetSound = null;

          if (widgetParser.getSoundId(quiz.objects[index].node.type.content.options[j].option)) {
            promises.push(widgetParser.getSoundSrc(widgetParser.getSoundId(quiz.objects[index].node.type.content.options[j].option), index, quiz).then(
              function (index, j) {
                return function (result) {
                  quiz.objects[index].node.type.content.options[j].widgetSound = result;
                }
              }(index, j)
            ))
          }
        }
      }
      $q.all(promises).then(function () {
        d.resolve(quiz)
      });
      return d.promise;
    }

    function getSkills(data) {
      return appDB.get(data.userId)
        .then(function (doc) {
          return doc.data.skills;
        })
    }

    function saveReport(report) {
      return data.queuePush({
        'report': {
          'user': report.userId,
          'node': report.node,
          'score': report.score,
          'attempts': report.attempts
        }
      });
    }

    function getLesson(id) {
      return lessonDB.get(id).then(function (data) {
        return data.lesson;
      });
    }

    function downloadVideo(video) {

      return mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER + video.node.type.path)
    }

    function downloadAssessment(assessment) {

      var d = $q.defer();
      var promises = [];
      var mediaArray = [];

      angular.forEach(assessment.objects, function (object) {
        if (object.node.meta.instructions && object.node.meta.instructions.sounds) {
          promises.push(
            mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER + object.node.meta.instructions.sounds[0])
          );
        }
        angular.forEach(object.node.type.content.widgets, function (widget) {
          angular.forEach(widget, function (file) {
            if (mediaArray.indexOf(file) < 0) {
              mediaArray.push(file);
              promises.push(
                mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER + file)
              );
            }
          })
        })
      });
      $q.all(promises).then(function (success) {
        d.resolve(data);
      })
        .catch(function (err) {
          d.reject(err)
        });
      return d.promise;

    }

    function queuePush(record) {
      return queueDB.post({
        'data': record
      })
    }

    function queueSync() {

      return queueDB.allDocs({
        include_docs: true
      }).then(function (response) {
        var d = $q.defer();
        if (response.rows.length == 0) {
          d.reject("No data");
        } else {
          var record = response.rows[0].doc.data;
          queueUploadRecord(record).then(function () {

            d.resolve({
              'record_doc': response.rows[0].doc,
            })
          })
            .catch(function (error) {
              d.reject(error)
            })
        }
        return d.promise;
      })
        .then(function (response) {

          return queueDB.remove(response.record_doc)
        })
        .then(function (response) {
          data.queueSync()
        })
        .catch(function (e) {
        })
    }

    function queueUploadRecord(record) {
      return Rest.all(record.url).post(record.data);
    }

    function changeGrade(newGrade) {
      var profile = User.getLocalProfile();
      profile.grade = newGrade;
      User.updateProfile(profile);

      return data.createLessonDBIfNotExists()

    }

    function createLocalProfile(profile) {
      var record = {
        "_id": data.generateUUID(),
        "data": {
          "scores": {},
          "reports": [],
          "skills": data.skills,
          "profile" : profile
        }
      };

       return profilesDB.put(record).then(function(){
         return record;
       })

    }

    function getLocalProfiles() {
      return profilesDB.allDocs({
        include_docs: true
      }).then(function (response) {
        return response.rows;
      })
    }
  }

})();
