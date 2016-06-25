(function() {
  'use strict';

  angular
    .module('common')
    .factory('data', data);

  data.$inject = ['pouchDB', '$http', '$log', 'Rest', 'CONSTANT', '$q', '$ImageCacheFactory', 'mediaManager', '$interval', 'network', 'Auth','widgetParser'];

  /* @ngInject */
  function data(pouchDB, $http, $log, Rest, CONSTANT, $q, $ImageCacheFactory, mediaManager, $interval, network, Auth,widgetParser) {
    // var diagnosisQuestionsDB = pouchDB('diagnosisQuestions');
    // var kmapsDB = pouchDB('kmaps');

    var diagLitmusMappingDB = pouchDB('diagLitmusMapping');
    var kmapsJSONDB = pouchDB('kmapsJSON');
    var dqJSONDB = pouchDB('dqJSON');
    var lessonDB = pouchDB('lessonDB');
    var appDB = pouchDB('appDB');
    var resourceDB = pouchDB('resourceDB');


    var data = {
      // createDiagnosisQuestionDB: createDiagnosisQuestionDB(),
      // createKmapsDB: createKmapsDB(),
      createDiagLitmusMappingDB: createDiagLitmusMappingDB(),
      createKmapsJSON: createKmapsJSON(),
      createDiagQJSON: createDiagQJSON(),
      createLessonDB: createLessonDB,
      // getDiagnosisQuestionById: getDiagnosisQuestionById,
      // getDiagnosisQuestionByLevelNSkill: getDiagnosisQuestionByLevelNSkill,
      getDiagnosisLitmusMapping: getDiagnosisLitmusMapping,
      getTestParams: getTestParams,
      // getFromKmapsBySr: getFromKmapsBySr,
      getKmapsJSON: getKmapsJSON,
      getDQJSON: getDQJSON,
      // diagnosisQuestionsDB: diagnosisQuestionsDB,
      // kmapsDB: kmapsDB,
      // diagLitmusMappingDB: diagLitmusMappingDB
      getQuizScore: getQuizScore,
      getLessonScore: getLessonScore,
      getLessonsScore: getLessonsScore,
      getLessonsList: getLessonsList,
      getAssessment: getAssessment,
      getSkills: getSkills,
      saveReport: saveReport,
      saveAttempts: saveAttempts,
      // getResults : getResults, // for results in hud screen
      downloadLesson: downloadLesson,
      getLesson: getLesson,
      updateLesson: updateLesson,
      isLessonDownloaded: isLessonDownloaded,
      updateScore: updateScore,
      updateSkills: updateSkills,
      // addNewUser: addNewUser
      putUserifNotExist: putUserifNotExist,
      startReportSyncing: startReportSyncing
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
      var promise = $http.get(CONSTANT.PATH.DATA + '/diagnosticLitmusMapping.json').success(function(data) {
        return diagLitmusMappingDB.put({
            "_id": "diagnostic_litmus_mapping",
            "diagnostic_litmus_mapping": data[0]
          })
          .then(function() {
          })
          .catch(function(err) {
          });
      });
      return promise;
    };

    function createKmapsJSON() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/kmapsJSON.json').success(function(data) {
        return kmapsJSONDB.put({
            "_id": "kmapsJSON",
            "kmapsJSON": data[0]
          })
          .then(function() {
          })
          .catch(function(err) {
          });
      });
      return promise;
    };

    function createDiagQJSON() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/diagnosisQJSON.json').success(function(data) {
        return dqJSONDB.put({
            "_id": "dqJSON",
            "dqJSON": data[0]
          })
          .then(function() {
          })
          .catch(function(err) {
          });
      });
      return promise;
    }

    function getDQJSON() {
      var result = dqJSONDB.get("dqJSON")
        .then(function(doc) {
          return doc.dqJSON;
        })
      return result;
    }

    function getKmapsJSON() {
      var result = kmapsJSONDB.get("kmapsJSON")
        .then(function(doc) {
          return doc.kmapsJSON;
        })
      return result;
    }

    function getDiagnosisLitmusMapping() {
      var result = diagLitmusMappingDB.get("diagnostic_litmus_mapping")
        .then(function(doc) {
          return doc.diagnostic_litmus_mapping;
        })
      return result;
    }

    function createLessonDB() {
      var d = $q.defer();
      var promises = []
      var promisesDelete = []
      lessonDB.allDocs().then(function(result) {
        angular.forEach(result.rows, function(row) {
          promisesDelete.push(lessonDB.remove(row.id, row.value.rev))
        })
      })
      $q.all(promisesDelete).then(function() {
        $http.get('templates/common/lessons.json').success(function(data) {
          for (var i = 0; i < data.length; i++) {
            data[i].key = i;
            if (data[i].node.type.grade == Auth.getLocalProfile().grade) {
              promises.push(lessonDB.put({
                "_id": data[i].node.id,
                "lesson": data[i]
              }));
            }
            $q.all(promises).then(function() {
                d.resolve("Lesson Db created");
              })
              .catch(function(E) {
              })
          }
        });
      })
      return d.promise;
    }

    function putUserifNotExist(data) {
      return Rest.one('profiles', JSON.parse(localStorage.user_details).profile).all('scores').all('skills').getList().then(function(profile) {
          return profile.plain();
        })
        .then(function(skills) {
          return appDB.get(data.userId)
            .then(function(doc) {
              doc.data.skills = skills
              return appDB.put({
                '_id': data.userId,
                '_rev': doc._rev,
                'data': doc.data
              })
            })
            .catch(function(error) {
              if (error.status === 404) {
                return appDB.put({
                  '_id': data.userId,
                  'data': {
                    'scores': {},
                    'reports': {},
                    'skills': skills
                  }
                })
              }
            })
        })


    }

    function updateSkills(data) {
      return appDB.get(data.userId).then(function(response) {
          var doc = response.data;
          angular.forEach(doc.skills, function(skill, key) {
            if (skill.title == data.skill) {
              doc.skills[key].lesson_scores += data.score;
            }
          })

          return appDB.put({
            '_id': data.userId,
            '_rev': response._rev,
            'data': doc
          })
        })
        .catch(function(error) {
        })
    }

    function updateScore(data) {
      return appDB.get(data.userId).then(function(response) {
        var doc = response.data;
        if (!doc.scores.hasOwnProperty(data.lessonId)) {
          doc.scores[data.lessonId] = {};
        }
        doc.scores[data.lessonId][data.id] = {
          'score': data.score,
          'totalScore': data.totalScore
        };

        return appDB.put({
          '_id': data.userId,
          '_rev': response._rev,
          'data': doc
        }).catch(function(e) {});
      }).catch(function(e) {})

    }

    function getLessonScore(data) {
      return appDB.get(data.userId).then(function(response) {
        return response.data.scores[data.lessonId];
      })
    }

    function getQuizScore(data) {
      var d = $q.defer();
      appDB.get(data.userId).then(function(response) {
        var result = null;
        if (response.data.scores.hasOwnProperty(data.lessonId)) {
          if (response.data.scores[data.lessonId].hasOwnProperty(data.id)) {
            result = response.data.scores[data.lessonId][data.id]
          }
        }
        d.resolve(result);
      }).catch(function(e) {
        d.reject();
      })
      return d.promise;
    }

    function getLessonsScore(limit) {
      return Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('profiles', JSON.parse(localStorage.user_details).profile).customGET('lessons-score', {
        limit: limit
      }).then(function(score) {
        return score.plain().results;
      }, function(error) {})
    }

    function getLessonsList(limit) {
      var d = $q.defer();
      lessonDB.allDocs({
          include_docs: true
        }).then(function(data) {
          var lessons = [];
          for (var i = 0; i < data.rows.length; i++) {
            data.rows[i].doc.lesson.node.key = data.rows[i].doc.lesson.key
            lessons.push(data.rows[i].doc.lesson.node);
          }
          lessons = _.sortBy(lessons, 'key');
          d.resolve(lessons)
        })
        .catch(function(error) {
          d.reject(error)
        })
      return d.promise;
    }

    function getAssessment(quiz) {
      var d = $q.defer();
      var promises = []


      for (var index = 0; index < quiz.objects.length; index++) {
        $log.debug("loop",index)
        promises.push(widgetParser.parseToDisplay(quiz.objects[index].node.title, index, quiz).then(
          function(result){
            $log.debug("here")
            quiz.objects[index].node.widgetHtml = result;
          }

      ))
        quiz.objects[index].node.widgetSound = widgetParser.getSoundId(quiz.objects[index].node.title);
        for (var j = 0; j < quiz.objects[index].node.type.content.options.length; j++) {
          promises.push(widgetParser.parseToDisplay(quiz.objects[index].node.type.content.options[j].option, index, quiz).then(function(result){
            quiz.objects[index].node.type.content.options[j].widgetHtml = result;
          }))
          quiz.objects[index].node.type.content.options[j].widgetSound = widgetParser.getSoundId(quiz.objects[index].node.type.content.options[j].option);
        }
      }
      $q.all(promises).then(function(){
        $log.debug("here")
        d.resolve(quiz)
      })
      return d.promise;
    }

    function getSkills(data) {
      return appDB.get(data.userId)
        .then(function(doc) {
          return doc.data.skills;
        })
    }

    function saveAttempts(data) {
      return Rest.all('attempts').post(data);
    }

    function saveReport(data) {
      return appDB.get(data.userId).then(function(response) {
          var doc = response.data;
          if (!doc.reports.hasOwnProperty(data.node)) {
            doc.reports[data.node] = [];
          }
          doc.reports[data.node].push({
            'score': data.score,
            'attempts': data.attempts
          });

          return appDB.put({
            '_id': data.userId,
            '_rev': response._rev,
            'data': doc
          })
        })
        .then(function(data) {
          localStorage.setItem('reportSyncComplete', false)
        })
    }

    function downloadQuiz(id) {}

    function getLesson(id) {
      var d = $q.defer();
      lessonDB.get(id).then(function(data) {
        d.resolve(data.lesson)

      }).catch(function(error) {
        d.reject(error)
      })
      return d.promise;
    }

    function updateLesson(lesson) {
      lessonDB.get(lesson.node.id).then(function(doc) {
        return lessonDB.put({
          _id: lesson.node.id,
          _rev: doc._rev,
          lesson: lesson
        });
      });
    }

    function downloadLesson(id, mediaTypes) {
      var d = $q.defer();
      var promises = [];
      data.getLesson(id).then(function(response) {
        angular.forEach(response.media, function(file) {
          if (!mediaTypes || (mediaTypes.length > 0 && mediaTypes.indexOf(file.url.split('.').pop()) >= 0)) {
            try {
              promises.push(
                mediaManager.download(CONSTANT.RESOURCE_SERVER + file.url).then(function() {
                  file.downloaded = true;
                })

              );
            } catch (e) {}
          }
        })
        $q.all(promises).then(function(success) {
            return data.updateLesson(response);
          }).then(function(data) {
            d.resolve(data);
          })
          .catch(function(err) {});
      })

      return d.promise;

    }

    function isLessonDownloaded(id, mediaTypes) {

      var d = $q.defer();
      lessonDB.get(id).then(function(data) {
          var downloaded = true;
          for (var i = 0; i < data.lesson.media.length; i++) {
            if ((!mediaTypes || mediaTypes.length > 0 || mediaTypes.indexOf(file.url.split('.').pop()) >= 0) && data.lesson.media[i].downloaded === false) {
              downloaded = false;
              break;
            }
          }
          d.resolve(downloaded);
        })
        .catch(function(err) {
          d.reject(err);
        })
      return d.promise;
    }

    function startReportSyncing(data) {
      return appDB.get(data.userId).then(function(response) {
          var doc = response.data;
          for (var key in doc.reports) {
            if (doc.reports.hasOwnProperty(key)) {
              Rest.all('reports').post({
                  'score': doc.score,
                  'person': data.userId,
                  'node': key
                })
                .then(function(report) {
                  doc.reports.id = report.id;
                  var attempts = [];
                  angular.forEach(doc.reports[key].attempts, function(attempt) {
                    attempts.push({
                      "answer": attempt.answer,
                      "status": attempt.status,
                      "person": data.userId,
                      "report": report.id,
                      "node": attemp.node
                    })
                  })
                  Rest.all('attempts').post(attempts);
                })
            }
          }

        })
        .then(function(data) {
        })
    }
  }
})();
