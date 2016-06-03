(function() {
    'use strict';

    angular
        .module('common')
        .factory('data', data);

    data.$inject = ['pouchDB', '$http', '$log'];

    /* @ngInject */
    function data(pouchDB, $http, $log) {
        // var diagnosisQuestionsDB = pouchDB('diagnosisQuestions');
        // var kmapsDB = pouchDB('kmaps');
        var diagLitmusMappingDB = pouchDB('diagLitmusMapping');
        var kmapsJSONDB = pouchDB('kmapsJSON');
        var dqJSONDB = pouchDB('dqJSON');

        var data = {
            // createDiagnosisQuestionDB: createDiagnosisQuestionDB(),
            // createKmapsDB: createKmapsDB(),
            createDiagLitmusMappingDB: createDiagLitmusMappingDB(),
            createKmapsJSON: createKmapsJSON(),
            createDiagQJSON: createDiagQJSON(),
            // getDiagnosisQuestionById: getDiagnosisQuestionById,
            // getDiagnosisQuestionByLevelNSkill: getDiagnosisQuestionByLevelNSkill,
            getDiagnosisLitmusMapping: getDiagnosisLitmusMapping,
            getTestParams : getTestParams,
            // getFromKmapsBySr: getFromKmapsBySr,
            getKmapsJSON: getKmapsJSON,
            getDQJSON: getDQJSON
            // diagnosisQuestionsDB: diagnosisQuestionsDB,
            // kmapsDB: kmapsDB,
            // diagLitmusMappingDB: diagLitmusMappingDB
        };


        return data;

        function getTestParams(realTimeGrade){

            function setPreviousAnswerCallback(tests, x){
                tests["previousAnswer"] = x[0];
                tests["count"]++;
                console.log('tests', JSON.stringify(tests));
                if(x[0] == 1){
                    x[1].test[0]["qSet"][x[1]["actualLevel"]] = { "sr": x[1].qSr, "answered": "right" };
                }else{
                    x[1].test[0]["qSet"][x[1]["actualLevel"]] = { "sr": x[1].qSr, "answered": "wrong" };
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
            $http.get('templates/common/diagnosticLitmusMapping.json').success(function(data) {
                $log.debug('in createDiagLitmusMappingDB');
                diagLitmusMappingDB.put({ "_id": "diagnostic_litmus_mapping", "diagnostic_litmus_mapping": data[0] })
                .then(function(){$log.debug('createDiagLitmusMappingDB success');})
                .catch(function(err){$log.debug('err createDiagLitmusMappingDB', err)});
            });
        };

        function createKmapsJSON() {
            $http.get('templates/common/kmapsJSON.json').success(function(data) {
                $log.debug('in createKmapsJSON');
                kmapsJSONDB.put({ "_id": "kmapsJSON", "kmapsJSON": data[0] })
                .then(function(){$log.debug('kmapsJSON success');})
                .catch(function(err){$log.debug('err kmapsJSON', err)});
            });
        };

        function createDiagQJSON(){
          $http.get('templates/common/diagnosisQJSON.json').success(function(data) {
              $log.debug('in createDiagQJSON');
              dqJSONDB.put({ "_id": "dqJSON", "dqJSON": data[0] })
              .then(function(){$log.debug('dqJSONDBdqJSONDB success');})
              .catch(function(err){$log.debug('err dqJSONDB', err)});
          });
        }

        function getDQJSON(){
          var result = dqJSONDB.get("dqJSON")
                        .then(function(doc){
                          return doc.dqJSON;
                        })
          return result;
        }

        function getKmapsJSON(){
            var result = kmapsJSONDB.get("kmapsJSON")
                          .then(function(doc){
                            return doc.kmapsJSON;
                          })
            return result;
        }

        function getDiagnosisLitmusMapping(){
          var result = diagLitmusMappingDB.get("diagnostic_litmus_mapping")
                        .then(function(doc){
                          return doc.diagnostic_litmus_mapping;
                        })
          return result;
        }

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
