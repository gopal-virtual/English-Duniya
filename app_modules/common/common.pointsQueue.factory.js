(function() {
  'use strict';
  angular
    .module('common')
    .factory('pointsQueue', pointsQueue);
  pointsQueue.$inject = [
    'pouchDB',
    '$log',
    'Rest',
    'CONSTANT',
    '$q',
    'Auth',
    'network',
    '$http'
  ];
  /* @ngInject */
  function pointsQueue(pouchDB,
    $log,
    Rest,
    CONSTANT,
    $q,
    Auth,
    network,
    $http) {
    var queueDB = pouchDB('pointsQueueDB', {
      revs_limit: 1,
      // auto_compaction: true
    });
    var queueProperties = {
      push: push,
      startSync: startSync,
      getAll: function() {
        return queueDB.allDocs({
          include_docs: true
        });
      },
      // compactDB : function(){
      //   return queueDB.compact().then(function(result){
      //     $log.debug("Compaction done",result);
      //   })
      //   .catch(function(err){
      //     $log.debug("Compaction error",err);
      //   });
      // }
    };

    function push(body) {
      return queueDB.put({
        '_id': new Date().getTime().toString(),
        'body': JSON.parse(JSON.stringify(body)),
        'method': 'post'
      }).then(function() {
        $log.debug("points queue", "push");
        if (localStorage.getItem('syncingPoints') !== 'true' && network.isOnline()) {
          // $log.debug("pointsQueue", "push success start sync")
          // startSync();
        } else {
          // $log.debug("pointsQueue", "push success do not start sync")
        }
        return $q.resolve();
      }).catch(function(err) {
        $log.debug("points queue", "push error ", err)
      })
    }
    // return queueDB.allDocs({
    //   include_docs: true
    // }).then(function (response) { //Check if records l > 0
    //   if (response.rows.length == 0) {
    //     $q.reject("No data");
    //   } else {
    //     var record = response.rows[0].doc;
    //
    //     uploadRecord(record).then(function () {
    //       d.resolve({
    //         'record_doc': record
    //       })
    //     })
    //
    //   }
    //   return d.promise;
    // })
    function uploadIfRecord(records) {
      // $log.debug("queue", "upload if record")
      if (records.length > 0) {
        // $log.debug("queue", "upload if record found")
        return uploadAndDelete(records[0]);
      } else {
        // $log.debug("queue", "upload if record no data")
        return $q.resolve('no_data');
      }
    }

    function startSync(d) {
      $log.debug("points queue", "start sync");
      localStorage.setItem('syncingPoints', true)
      if (!d) {
        var d = $q.defer();
      }
      queueDB.allDocs({
          include_docs: true
        })
        .then(function(response) {
          $log.debug("points queue", "uplaod if record");
          return uploadIfRecord(response.rows)
        })
        .then(function(response) {
          $log.debug("points queue", "uplaod if record completed");
          if (response === 'no_data') {
            $log.debug("points queue", "in start sync no data");
            localStorage.setItem('syncingPoints', false);
            d.resolve();
          } else {
            $log.debug("points queue", "in start sync start sync again");
            return startSync(d);
          }
        })
      return d.promise;
    }

    function uploadAndDelete(record) {
      var promise;
        $log.debug("points queue","uplaod and delete");

      return $http.post(CONSTANT.CHALLENGE_SERVER+'points/', record.doc.body).then(
          function success() {
            $log.debug("points queue", "upload success", record);
            return queueDB.remove(record.doc);
          },
          function fail(error) {
            if (error.status !== 0) {
              $log.debug("points upload failed", record);
              var e = {
                "error": error,
                "function": "queue_push"
              };
              // Raven.captureException("Error with queue push",{
              //   extra: {error:e}
              // });
              // $log.debug("ERROR with queue",error.status)
              return queueDB.remove(record.doc);
            } else {
              return $q.reject();
            }
          }
        )
        // if (record.doc.method === 'post') {
        //   promise = Rest.all('/profiles/' + User.getActiveProfileSync()._id + '/points/').post(record.doc.body);
        // }
        // return promise.then(function() {})
        //   .catch(function(error) {
        //   });
    }
    return queueProperties;
  }
})();