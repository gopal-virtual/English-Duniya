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
    var lessonDB = null;
    if (Auth.hasProfile()) {
      lessonDB = pouchDB('lessonsGrade' + Auth.getLocalProfile().grade, {
        adapter: 'websql'
      });
    }

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
      startReportSyncing: startReportSyncing,
      demo_question: {
        "node": {
          "id": "demo",
          "content_type_name": "json question",
          "type": {
            "id": "demo",
            "created": "2016-07-08T14:44:19.871339Z",
            "updated": "2016-07-08T14:44:19.871370Z",
            "microstandard": "ELL.1.RE.V.9.MOB",
            "is_critical_thinking": false,
            "level": 1,
            "answer": [2],
            "score": 10,
            "content": {
              "is_multiple": false,
              "widgets": {
                "videos": {},
                "sounds": {},
                "images": {
                  "1": "/media/ell/images/dog_O5P4I8.png",
                  "2": "/media/ell/images/person_GLUMUY.png",
                  "3": "/media/ell/images/place_KJMRCN.png",
                  "4": "/media/ell/images/animal_2W0HQG.png",
                  "5": "/media/ell/images/thing_DV4JY6.png"
                }
              },
              "instruction": null,
              "options": [{
                "option": "person [[img id=2]]",
                "key": 1
              }, {
                "option": "place [[img id=3]]",
                "key": 3
              }, {
                "option": "animal [[img id=4]]",
                "key": 2
              }, {
                "option": "thing [[img id=5]]",
                "key": 4
              }],
              "tags": [],
              "hints": "[]"
            },
            "type": "choicequestion"
          },
          "tag": null,
          "created": "2016-07-08T14:44:19.881208Z",
          "updated": "2016-07-08T14:44:19.881242Z",
          "title": "dog [[img id=1]]",
          "description": "",
          "object_id": "e3ea1ecb-997a-4d2f-9a45-378fa3201e57",
          "status": "PUBLISHED",
          "lft": 936,
          "rght": 937,
          "tree_id": 1,
          "level": 3,
          "parent": "29f41d84-fda3-4964-94be-25a6800d93a3",
          "content_type": 21,
          "account": "150c906a-c3ef-4e2b-a19d-c77fdabf2015"
        },
        "objects": []
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
      // var ddoc = {
      //   _id: '_design/index',
      //   views: {
      //     by_grade: {
      //       map: function(doc) {
      //         emit(doc.lesson.node.type.grade);
      //       }.toString()
      //     }
      //   }
      // };
      lessonDB = pouchDB('lessonsGrade' + Auth.getLocalProfile().grade, {
        adapter: 'websql'
      });
      $log.debug("in lessons make db ")
      return lessonDB.get('_local/preloaded').then(function(doc) {
        $log.debug("lessons db found ")

      }).catch(function(err) {
        if (err.name !== 'not_found') {
          throw err;
        }
        var filename = CONSTANT.PATH.DATA + '/lessonsGrade' + Auth.getLocalProfile().grade + '.db';
        return lessonDB.load(filename).then(function() {
            return lessonDB.put({
              _id: '_local/preloaded'
            });
          })
          .then(function() {
            $log.debug("lessons db created")
              // return lessonDB.put(ddoc).then(function() {
              // }).catch(function(err) {
              //
              // });
          });
      })

    }


    function putUserifNotExist(details) {
      var records = {
        scores: {}
      };
      var d = $q.defer();
      Rest.one('profiles', JSON.parse(localStorage.user_details).profile).all('scores').all('skills').getList()
        .then(function(skills) {
          $log.debug("skills", skills.plain())
          records.skills = skills.plain();
          return data.getLessonsScore();
        })
        .then(function(scores) {
          records.scores = {};
          $log.debug("scores", scores)
          angular.forEach(scores, function(row) {
            // $log.debug("row", row.contents.assessment)
            for (var property in row.contents.assessment) {
              if (row.contents.assessment.hasOwnProperty(property)) {
                $log.debug(row.contents.assessment[property])
                records.scores[row.id] = {};
                records.scores[row.id][property] = {
                  score: row.contents.assessment[property].obtained_score,
                  totalScore: row.contents.assessment[property].total_score
                }
              }
            }
          })

          return appDB.get(details.userId)
        })
        .then(function(doc) {
          $log.debug("Found userdb")
          doc.data.skills = records.skills;
          doc.data.scores = records.scores;
          return appDB.put({
            '_id': details.userId,
            '_rev': doc._rev,
            'data': doc.data
          })
        })
        .then(function() {
          d.resolve();
        })
        .catch(function(error) {
          $log.debug("Not Found userdb", error)
          if (error.status === 404) {
            $log.debug("MAking user db")
            return appDB.put({
                '_id': details.userId,
                'data': {
                  'scores': records.scores,
                  'reports': [],
                  'skills': records.skills
                }
              }).then(function() {
                d.resolve()
                $log.debug("MAde user db")
              })
              .catch(function(e) {
                d.reject();
                $log.debug("Error making user db", e)
              })
          }
        })
      return d.promise;

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

    function getLessonsScore() {
      return Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('profiles', JSON.parse(localStorage.user_details).profile).customGET('lessons-score').then(function(score) {
        return score.plain();
      }, function(error) {})
    }

    function getLessonsList(grade) {
      $log.debug("getting lessons")
      var start = new Date();
      var d = $q.defer();
      lessonDB.allDocs({
          include_docs: true
        }).then(function(data) {
          $log.debug("Time taken 1", new Date() - start, data)
          var lessons = [];
          for (var i = 0; i < data.rows.length; i++) {
            data.rows[i].doc.lesson.node.key = data.rows[i].doc.lesson.key
            lessons.push(data.rows[i].doc.lesson.node);
          }
          lessons = _.sortBy(lessons, 'key');
          $log.debug("Time taken", new Date() - start)
          d.resolve(lessons)
        })
        .catch(function(error) {
          d.reject(error)
          $log.debug(error)
        })
      return d.promise;
    }

    function getAssessment(quiz) {
      var d = $q.defer();
      var promises = []
      for (var index = 0; index < quiz.objects.length; index++) {
        if (quiz.objects[index].node.meta.instructions && quiz.objects[index].node.meta.instructions.sounds[0] && localStorage.getItem(quiz.objects[index].node.meta.instructions.sounds[0]) != 'played') {
          localStorage.setItem(quiz.objects[index].node.meta.instructions.sounds[0],'played');

          promises.push(mediaManager.getPath(quiz.objects[index].node.meta.instructions.sounds[0]).then(

            function(index) {

              return function(path) {
                quiz.objects[index].node.instructionSound = path
              }
            }(index)

          ))
        }
        // quiz.objects[index].node.instructionSound = CONSTANT.RESOURCE_SERVER + quiz.objects[index].node.meta.instructions.sounds[0];

        $log.debug(quiz.objects[index].node.meta, "Instruction")
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
      // var id = localStorage.getItem('report_id')
      // var r = new ReportResource({
      // id: localStorage.getItem('report_id')
      // });
      // localStorage.setItem('report_id', parseInt(localStorage.getItem('report_id') )+ 1);
      // var r = {};
      // r.node = report.node;
      // r.score = report.score;
      // r.attempt = report.attempts;
      // r.person = report.userId;
      // r.local_id = id;
      // return $http.post(CONSTANT.BACKEND_SERVICE_DOMAIN+'api/v1/reports/',r,{offline: true})
      // localStorage.setItem('report_id',parseInt(localStorage.getItem('report_id')) + 1)


      // r.$save();
      // (function(local_id){
      //   r.$promise.then(
      //     function(s) {
      //       localStorage.removeItem('cachedResource://reportResource?id=' + s.id);
      //     }
      //   );
      // })(id)

      // return appDB.get(report.userId).then(function(response) {
      //     var doc = response.data;
      //     doc.reports.push({
      //       'node': report.node,
      //       'score': report.score,
      //       'attempts': report.attempts
      //     });

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
        // })
        .then(function() {
          if (network.isOnline()) {
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
      $log.debug("downloadAssessment")
      var d = $q.defer();
      var promises = [];
      var mediaTypes = ['videos', 'sounds', 'images']
      var mediaArray = []
      var count = 0;

      angular.forEach(assessment.objects, function(object) {
        $log.debug("Check this", object);
        if (object.node.meta.instructions) {
          promises.push(
            mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER + object.node.meta.instructions.sounds[0])
          );
        }
        angular.forEach(object.node.type.content.widgets, function(widget) {
          angular.forEach(widget, function(file) {
            if (mediaArray.indexOf(file) < 0) {
              $log.debug(file);
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
          d.reject(err)
        });
      return d.promise;

    }



    function syncReport(report) {
      report.attempt = report.attempts;
      report.person = report.user;
      // return Rest.all('reports').post({
      //   'score': report.score,
      //   'person': user.userId,
      //   'node': report.node
      // }).then(function(success) {
      //   var attempts = [];
      //   angular.forEach(report.attempts, function(attempt) {
      //     attempts.push({
      //       "answer": attempt.answer,
      //       "status": attempt.status,
      //       "person": user.userId,
      //       "report": success.id,
      //       "node": attempt.node
      //     })
      //   })
      // return Promise.resolve();

      return Rest.all('reports').post(report);
      // })
    }

    function startReportSyncing() {
      return reportsDB.allDocs({
          include_docs: true
        }).then(function(response) {
          var d = $q.defer();
          // angular.forEach(response.rows, function(row) {
          if (response.rows.length == 0) {
            d.reject("No reports");
          } else {
            var report = response.rows[0].doc.data;
            syncReport(report).then(function() {
                var callback = false;
                if (response.rows.length > 2) {
                  callback = true;
                }
                d.resolve({
                  'report_doc': response.rows[0].doc,
                  'callback': callback
                })
              })
              .catch(function(error) {
                d.reject(error)
              })

          }
          return d.promise;
          // })
        })
        .then(function(response) {
          return reportsDB.remove(response.report_doc)
        })
        .then(function(response) {
          data.startReportSyncing()
        })
        .catch(function(e) {})
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
        //     appData.data.reports = appData.data.reports.splice(0,0);
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
        //       return true
        //     }
        //   })
        //   .catch(function(e) {
        //     if(e === 'No data to sync'){
        //     }
        //   })
    }
  }
})();
