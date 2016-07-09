(function() {
  'use strict';

  angular
    .module('common')
    .factory('data', data);

  data.$inject = ['pouchDB', '$http', '$log', 'Rest', 'CONSTANT', '$q', '$ImageCacheFactory', 'mediaManager', '$interval', 'network', 'Auth', 'widgetParser'];

  /* @ngInject */
  function data(pouchDB, $http, $log, Rest, CONSTANT, $q, $ImageCacheFactory, mediaManager, $interval, network, Auth, widgetParser) {
    // var diagnosisQuestionsDB = pouchDB('diagnosisQuestions');
    // var kmapsDB = pouchDB('kmaps');
    // var inputDB = pouchDB('http://127.0.0.1:5984/lessonDB');
    // var outputDB = pouchDB('turtles.db', {adapter: 'websql'});

    // replicate
    // inputDB.replicate.to(outputDB);
    var diagLitmusMappingDB = pouchDB('diagLitmusMapping');
    var kmapsJSONDB = pouchDB('kmapsJSON');
    var dqJSONDB = pouchDB('dqJSON');
    var lessonDB = pouchDB('lessonDB');
    var appDB = pouchDB('appDB');
    var resourceDB = pouchDB('resourceDB');
    var reportsDB = pouchDB('reportsDB');
    var data = {
      // createDiagnosisQuestionDB: createDiagnosisQuestionDB(),
      // createKmapsDB: createKmapsDB(),
      createDiagLitmusMappingDB: createDiagLitmusMappingDB(),
      createKmapsJSON: createKmapsJSON(),
      createDiagQJSON: createDiagQJSON(),
      createIfNotExistsLessonDB: createIfNotExistsLessonDB,
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
      downloadAssessment: downloadAssessment,
      downloadVideo: downloadVideo,
      getLesson: getLesson,
      updateLesson: updateLesson,
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
          .then(function() {})
          .catch(function(err) {});
      });
      return promise;
    };

    function createKmapsJSON() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/kmapsJSON.json').success(function(data) {
        return kmapsJSONDB.put({
            "_id": "kmapsJSON",
            "kmapsJSON": data[0]
          })
          .then(function() {})
          .catch(function(err) {});
      });
      return promise;
    };

    function createDiagQJSON() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/diagnosisQJSON.json').success(function(data) {
        return dqJSONDB.put({
            "_id": "dqJSON",
            "dqJSON": data[0]
          })
          .then(function() {})
          .catch(function(err) {});
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

    function createIfNotExistsLessonDB() {
      $log.debug("createIfNotExistsLessonDB");
      var ddoc = {
        _id: '_design/index',
        views: {
          by_grade: {
            map: function(doc) {
              emit(doc.lesson.node.type.grade);
            }.toString()
          }
        }
      };
      return lessonDB.get('_local/preloaded').then(function(doc) {
        $log.debug("createIfNotExistsLessonDB Exists",ddoc,pouchDB);

      }).catch(function(err) {
        if (err.name !== 'not_found') {
          throw err;
        }
        return lessonDB.load(CONSTANT.PATH.DATA + '/lessons.db').then(function() {
          return lessonDB.put({
            _id: '_local/preloaded'
          });
        }).then(function(){
          return lessonDB.put(ddoc).then(function() {
            $log.debug("createIfNotExistsLessonDB ddcon made");
            // success!
          }).catch(function(err) {
            $log.debug("createIfNotExistsLessonDB ddoc error",err);

            // some error (maybe a 409, because it already exists?)
          });
        })
        ;
      })
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
                    'reports': [],
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
        .catch(function(error) {})
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

    function getLessonsList(grade) {
      var start = new Date();
      $log.debug("Starts", start)
      var d = $q.defer();

      lessonDB.query('index/by_grade',{
          include_docs: true,
          key : grade
        }).then(function(data) {
          $log.debug("Starts 1", new Date() - start,data)
          var lessons = [];
          for (var i = 0; i < data.rows.length; i++) {
              data.rows[i].doc.lesson.node.key = data.rows[i].doc.lesson.key
              lessons.push(data.rows[i].doc.lesson.node);
          }
          lessons = _.sortBy(lessons, 'key');
          $log.debug("Ends", new Date() - start,lessons)
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
        promises.push(widgetParser.parseToDisplay(quiz.objects[index].node.title, index, quiz).then(
          function(index) {
            return function(result) {
              quiz.objects[index].node.widgetHtml = result;
            }
          }(index)

        ))
        quiz.objects[index].node.widgetSound = null;
        if (widgetParser.getSoundId(quiz.objects[index].node.title)) {
          promises.push(widgetParser.getSoundSrc(widgetParser.getSoundId(quiz.objects[index].node.title), index, quiz).then(

            function(index) {
              return function(result) {
                quiz.objects[index].node.widgetSound = result;
              }
            }(index)

          ))
        }

        for (var j = 0; j < quiz.objects[index].node.type.content.options.length; j++) {
          promises.push(widgetParser.parseToDisplay(quiz.objects[index].node.type.content.options[j].option, index, quiz).then(
            function(index, j) {
              return function(result) {
                quiz.objects[index].node.type.content.options[j].widgetHtml = result;
              }
            }(index, j)
          ))
          quiz.objects[index].node.type.content.options[j].widgetSound = null;

          if (widgetParser.getSoundId(quiz.objects[index].node.type.content.options[j].option)) {
            promises.push(widgetParser.getSoundSrc(widgetParser.getSoundId(quiz.objects[index].node.type.content.options[j].option), index, quiz).then(
              function(index, j) {
                return function(result) {
                  quiz.objects[index].node.type.content.options[j].widgetSound = result;
                }
              }(index, j)

            ))
          }

        }
      }
      $q.all(promises).then(function() {
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

    function saveReport(report) {
      return appDB.get(report.userId).then(function(response) {
          var doc = response.data;
          doc.reports.push({
            'node': report.node,
            'score': report.score,
            'attempts': report.attempts
          });
          return reportsDB.post({
            // '_id': report.userId,
            // '_rev': response._rev,
            'data': {
              'user': report.userId,
              'node': report.node,
              'score': report.score,
              'attempts': report.attempts
            }
          })
        })
        .then(function() {
          var flag = JSON.parse(localStorage.getItem('reportSync'));
          if (flag && flag.progress === true) {
            flag.updated = true;
          } else if (network.isOnline()) {
            data.startReportSyncing({
              'userId': report.userId
            })
          }
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
      $log.debug("Updating lesson", lesson)
      lessonDB.get(lesson.node.id).then(function(doc) {
        return lessonDB.put({
          _id: lesson.node.id,
          _rev: doc._rev,
          lesson: lesson
        });
      });
    }

    function downloadVideo(video) {
      return mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER + video.node.type.path)
    }

    function downloadAssessment(assessment) {
      var d = $q.defer();
      var promises = [];
      var mediaTypes = ['videos', 'sounds', 'images']
      var mediaArray = []
      var count = 0;
      angular.forEach(assessment.objects, function(object) {
        angular.forEach(object.node.type.content.widgets, function(widget) {
          angular.forEach(widget, function(file) {
            if (mediaArray.indexOf(file) < 0) {
              mediaArray.push(file);
              promises.push(
                mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER + file)
              );
            }
          })
        })
      })
      $q.all(promises).then(function(success) {
          d.resolve(data);
        })
        .catch(function(err) {
          d.reject
        });
      return d.promise;


    }



    function syncReport(report, user) {
      return Rest.all('reports').post({
        'score': report.score,
        'person': user.userId,
        'node': report.node
      }).then(function(success) {
        var attempts = [];
        angular.forEach(report.attempts, function(attempt) {
          attempts.push({
            "answer": attempt.answer,
            "status": attempt.status,
            "person": user.userId,
            "report": success.id,
            "node": attempt.node
          })
        })
        return Promise.resolve();
        // Rest.all('attempts').post(attempts);
      })
    }

    function startReportSyncing(user) {
      $log.debug("Report syncing", user)
      var appData;

      return reportsDB.allDocs({
        include_docs: true
      }).then(function(response) {
        var promise;
        // angular.forEach(response.rows, function(row) {
        // var report = row.doc.data.reports[0]for ;
        $log.debug("report", response.rows[0].doc.data);
        // promise = syncReport(report, user);
        // })
      })

      .catch(function(e) {
          $log.debug("Response error", e)
        })
        // return appDB.get(user.userId).then(function(response) {
        //   appData = response;
        //     $log.debug("Here", response)
        //     if (response.data.reports.length) {
        //         syncReport(response.data.reports[0],user)
        //     }else{
        //       return $q.reject("No data to sync")
        //     }
        //   })
        //   .then(function(success) {
        //     $log.debug("OO",appData)
        //     appData.data.reports = appData.data.reports.splice(0,0);
        //     $log.debug(appData)
        //     return appDB.put({
        //       '_id':appData._id,
        //       '_rev': appData._rev,
        //       'data': appData.data
        //     })
        //   })
        //   .then(function() {
        //     if(appData.data.reports.length){
        //       return startReportSyncing({'userId':Auth.getProfileId()});
        //     }else{
        //       $log.debug("sync complete")
        //       return true
        //     }
        //   })
        //   .catch(function(e) {
        //     if(e === 'No data to sync'){
        //       $log.debug(e)
        //     }
        //   })
    }
  }
})();
