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

    var appDB = pouchDB('appDB');
    var resourceDB = pouchDB('resourceDB');
    var data = {
      createDiagLitmusMappingDB: createDiagLitmusMappingDB(),
      createKmapsJSON: createKmapsJSON(),
      createDiagQJSON: createDiagQJSON(),
      getDiagnosisLitmusMapping: getDiagnosisLitmusMapping,
      getTestParams: getTestParams,
      getKmapsJSON: getKmapsJSON,
      getDQJSON: getDQJSON,
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

  }

})();
