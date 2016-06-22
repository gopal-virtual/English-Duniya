(function() {
  'use strict';

  angular
    .module('common')
    .factory('data', data);

  data.$inject = ['pouchDB', '$http', '$log', 'Rest', 'CONSTANT', '$q', '$ImageCacheFactory', 'mediaManager', '$interval','network'];

  /* @ngInject */
  function data(pouchDB, $http, $log, Rest, CONSTANT, $q, $ImageCacheFactory, mediaManager, $interval, network) {
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
        console.log('tests', JSON.stringify(tests));
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

    // function createDiagnosisQuestionDB() {
    //     $http.get('templates/common/questions.json').success(function(data) {
    //         $log.debug('in createDiagnosisQuestionDB');
    //         diagnosisQuestionsDB.bulkDocs(data);
    //     });
    // };

    // function createKmapsDB() {
    //     $http.get('templates/common/kmaps.json').success(function(data) {
    //         $log.debug('in createKmapsDB');
    //         kmapsDB.bulkDocs(data);
    //     });
    // };


    function createDiagLitmusMappingDB() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/diagnosticLitmusMapping.json').success(function(data) {
        $log.debug('in createDiagLitmusMappingDB');
        return diagLitmusMappingDB.put({
            "_id": "diagnostic_litmus_mapping",
            "diagnostic_litmus_mapping": data[0]
          })
          .then(function() {
            $log.debug('createDiagLitmusMappingDB success');
          })
          .catch(function(err) {
            $log.debug('err createDiagLitmusMappingDB', err)
          });
      });
      // $log.debug('promise of createDiagLitmusMappingDB', promise);
      return promise;
    };

    function createKmapsJSON() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/kmapsJSON.json').success(function(data) {
        $log.debug('in createKmapsJSON');
        return kmapsJSONDB.put({
            "_id": "kmapsJSON",
            "kmapsJSON": data[0]
          })
          .then(function() {
            $log.debug('kmapsJSON success');
          })
          .catch(function(err) {
            $log.debug('err kmapsJSON', err)
          });
      });
      // $log.debug('promise of createKmapsJSON', promise);
      return promise;
    };

    function createDiagQJSON() {
      var promise = $http.get(CONSTANT.PATH.DATA + '/diagnosisQJSON.json').success(function(data) {
        $log.debug('in createDiagQJSON');
        return dqJSONDB.put({
            "_id": "dqJSON",
            "dqJSON": data[0]
          })
          .then(function() {
            $log.debug('dqJSONDBdqJSONDB success');
          })
          .catch(function(err) {
            $log.debug('err dqJSONDB', err)
          });
      });
      // $log.debug('promise of createDiagQJSON', promise);
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
      return $http.get('templates/common/lessons.json').success(function(data) {
        for (var i = 0; i < data.length; i++) {
          data[i].key = i;
          promises.push(lessonDB.put({
            "_id": data[i].node.id,
            "lesson": data[i],


          }));
        }
        $q.all(promises).then(function() {
          d.resolve("Lesson Db created");
        })
        return d.promise;
      });
      // $log.debug('promise of createKmapsJSON', promise);

    }

    function putUserifNotExist(data) {
      return Rest.one('profiles', JSON.parse(localStorage.user_details).profile).all('scores').all('skills').getList().then(function(profile) {
          $log.debug("putUserifNotExist Profile",profile.plain())
          return profile.plain();
      })
      .then(function(skills){

        return appDB.get(data.userId)
        .then(function(doc){
          $log.debug("putUserifNotExist AppDBFound",doc,skills)
          doc.data.skills = skills
          return appDB.put({
            '_id': data.userId,
            '_rev': doc._rev,
            'data': doc.data
          })
        })
        .catch(function(error){
          if(error.status === 404){
            $log.debug("putUserifNotExist AppDBNotFound",skills)
            return appDB.put({
              '_id': data.userId,
              'data': {
                'scores': {},
                'reports': {},
                'skills' : skills
              }
            })
          }
        })
      })


    }

    function updateSkills(data){
      $log.debug("updateSkills");
      return appDB.get(data.userId).then(function(response){
        $log.debug("ok")
        var doc = response.data;
        // $log.debug("updateSkills",doc,doc.skills, typeof doc.skills, doc.skills.length, doc.skills[0]);

        $log.debug(data)
        angular.forEach(doc.skills,function(skill,key){

          $log.debug(skill.title,data.skill)
          if(skill.title == data.skill){
            $log.debug("here")
            doc.skills[key].lesson_scores += data.score;
          }
        })

        return appDB.put({
          '_id': data.userId,
          '_rev': response._rev,
          'data': doc
        })
      })
      .catch(function(error){
        $log.debug(error)
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

    function getAssessment(assessmentId) {

      return Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('assessments', assessmentId).get().then(function(quiz) {
        return quiz.plain();
      });
    }

    function getSkills(data){
      return appDB.get(data.userId)
      .then(function(doc){
        return doc.data.skills;
      })
    }
    function saveAttempts(data) {
      return Rest.all('attempts').post(data);
    }

    function saveReport(data) {
      $log.debug("saveReport")
      return appDB.get(data.userId).then(function(response) {
          var doc = response.data;
          $log.debug("doc", doc)

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


      // return Rest.all('reports').post(data);
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
      //
      // return;
      // return Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('lessons', id).get()
      //   .then(function(response) {
      //     lesson = response.plain();
      //     $log.debug('lesson');
      //     return lessonDB.put({
      //       '_id': id,
      //       'lesson': lesson
      //     })
      //   })
      //   .then(function(response) {
      //     var d = $q.defer();
      //     var promises = [];
      //     var index = null;
      //     angular.forEach(lesson.objects, function(object, key) {
      //       promises.push(preloadMedia(object));
      //       if (object.node.content_type_name === 'assessment') {
      //         $log.debug("assessment");
      //         promises.push(quizDB.put({
      //           '_id': object.node.id,
      //           'quiz': object
      //         }));
      //       }
      //       if (object.node.content_type_name === 'resource') {
      //         $log.debug("resource");
      //         promises.push(resourceDB.put({
      //           '_id': object.node.id,
      //           'resource': object
      //         }));
      //       }
      //     })
      //     $q.all(promises).then(function(success) {
      //       d.resolve("Resources Loaded Successfully");
      //     });
      //     return d.promise;
      //   })
      //   .then(function(data) {
      //     $log.debug(data);
      //   })
      //   .catch(function(response) {
      //     $log.debug("err", response)
      //   })
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
      $log.debug("here 1")
      return appDB.get(data.userId).then(function(response) {
          var doc = response.data;
          $log.debug("documents", doc)
          for (var key in doc.reports) {
            $log.debug("keys",key)
            if (doc.reports.hasOwnProperty(key)) {
              Rest.all('reports').post({'score':doc.score,'person':data.userId,'node':key})
              .then(function(report){
                doc.reports.id = report.id;
                $log.debug("Reports",report)
                var attempts = [];
                angular.forEach(doc.reports[key].attempts,function(attempt){
                  attempts.push({	"answer": attempt.answer,
	                 "status": attempt.status,
	                  "person": data.userId,
	                   "report": report.id,
	                    "node": attemp.node})
                })
                Rest.all('attempts').post(attempts);
              })
            }
          }
          // if (!doc.reports.hasOwnProperty(data.node)) {
          //   doc.reports[data.node] = [];
          // }
          // doc.reports[data.node].push({
          //   'score': data.score,
          //   'attempts': data.attempts
          // });

          // return appDB.put({
          //   '_id': data.userId,
          //   '_rev': response._rev,
          //   'data': doc
          // })
        })
        .then(function(data) {
          // localStorage.setItem('reportSyncComplete', false)
        })
    }
    // function isLessonDownloaded(id, mediaTypes) {
    //   $log.debug("isLessonDownloaded", id, mediaTypes)
    //   var d = $q.defer();
    //   var toCheckMedia = [];
    //   var downloaded = true;
    //   lessonDB.get(id).then(function(data) {
    //       if (!mediaTypes) {
    //         toCheckMedia = data.lesson.media;
    //       } else if (mediaTypes.length > 0) {
    //         angular.forEach(mediaTypes, function(mediaType) {
    //           if (mediaType === 'video') {
    //             for (var i = 0; i < data.lesson.media.length; i++) {
    //               if (data.lesson.media[i].url.split('.').pop() === 'mp4') {
    //                 toCheckMedia.push(data.lesson.media[i])
    //               }
    //             }
    //           }
    //           if (mediaType === 'audio') {
    //             for (var i = 0; i < data.lesson.media.length; i++) {
    //               if (data.lesson.media[i].url.split('.').pop() === 'mp3') {
    //                 toCheckMedia.push(data.lesson.media[i])
    //               }
    //             }
    //           }
    //           if (mediaType === 'image') {
    //             for (var i = 0; i < data.lesson.media.length; i++) {
    //               if (data.lesson.media[i].url.split('.').pop() === 'png') {
    //                 toCheckMedia.push(data.lesson.media[i])
    //               }
    //             }
    //           }
    //         })
    //       }
    //
    //       for (var i = 0; i < toCheckMedia.length; i++) {
    //         if (toCheckMedia[i].downloaded === false) {
    //           downloaded = false;
    //           break;
    //         }
    //       }
    //       d.resolve(downloaded);
    //     })
    //     .catch(function(err) {
    //       $log.debug("out", err)
    //       d.reject(err);
    //     })
    //
    //
    //   return d.promise;
    // }




    // function getFromKmapsBySr(sr){
    //     var result = kmapsDB.get(sr)
    //                     .then(function(doc){
    //                         return doc;
    //                     })
    //                     .catch(function(){
    //                         return null;
    //                     })
    //     return result;
    // }

    // function getDiagnosisQuestionByLevelNSkill(level, skill){

    //   var result = diagnosisQuestionsDB.query(function(doc, emit) {
    //                   emit(doc.level, doc);
    //                 }, { key: level })
    //                 .then(function(res) {
    //                   $log.debug('inside', res, skill);
    //                   var docs = [];
    //                     for(var i=0;i<res.rows.length;i++){
    //                       if(res.rows[i]["value"]["skill_area"] == skill){
    //                         docs.push(res.rows[i]["value"]);
    //                       }
    //                     }
    //                   return docs;
    //                   })
    //                   .catch(function(err) { console.log(err); return null;})
    //   return result;
    // }

    // function getDiagnosisQuestionById(id) {

    //   var result = diagnosisQuestionsDB.get(String(id))
    //                 .then(function(doc){
    //                   return doc;
    //                 })
    //                 .catch(function(){
    //                   return null
    //                 });

    //   return result;
    // }

    // function getDiagnosisQuestions(){
    //   var result = diagnosisQuestionsDB.get(String(id))
    // }
  }
})();
