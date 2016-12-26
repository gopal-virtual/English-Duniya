(function() {
  'use strict';
  angular
    .module('common')
    .factory('queue', queue);
  queue.$inject = [
    'pouchDB',
    '$log',
    'Rest',
    'CONSTANT',
    '$q',
    'Auth',
    'network'
  ];
  /* @ngInject */
  function queue(pouchDB,
    $log,
    Rest,
    CONSTANT,
    $q,
    Auth,
    network) {
    var queueDB = pouchDB('queueDB', {
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

    function push(url, body, method) {
      $log.debug("queue", "push",url,new Date().getTime().toString(),body)
      if (!method) {
        method = 'post'
      }
      return queueDB.put({
        '_id': new Date().getTime().toString(),
        'url': url,
        'body': body,
        'method': method
      }).then(function() {
        $log.debug("queue", "push success")
        if (localStorage.getItem('syncing') !== 'true' && network.isOnline()) {
          $log.debug("queue", "push success start sync")
          startSync();
        } else {
          $log.debug("queue", "push success do not start sync")
        }
        return $q.resolve();
      }).catch(function(err) {
        $log.debug("queue", "push error ", err)
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
      $log.debug("queue", "upload if record")
      if (records.length > 0) {
        $log.debug("queue", "upload if record found")
        return uploadAndDelete(records[0]);
      } else {
        $log.debug("queue", "upload if record no data")
        return $q.resolve('no_data');
      }
    }

    function startSync() {
      $log.debug("queue", "starting sync")
      localStorage.setItem('syncing', true)
      Auth.loginIfNotAuthorised()
        .then(function() {
          $log.debug("queue", "authorised")
          return Auth.createCouchIfNot()
        })
        .then(function() {
          $log.debug("queue", "couch created")
          return queueDB.allDocs({
            include_docs: true
          })
        })
        .then(function(response) {
          $log.debug("queue", "all records get")
          return uploadIfRecord(response.rows)
        })
        .then(function(response) {
          $log.debug("queue", "upload if record success")
          if (response === 'no_data') {
            localStorage.setItem('syncing', false);
            return true;
          } else {
            $log.debug("queue", "starting sync 2")
            startSync();
          }
        })
        .catch(function(e) {
          $log.debug("queue error", e)
        })
    }

    function uploadAndDelete(record) {
      //patch
      $log.debug("queue", "upload amd delete", record)
      if (!record.doc.body) {
        record.doc.body = record.doc.data.data;
        record.doc.method = 'post';
        record.doc.url = 'activity-log';
      }
      //patch end
      if (record.doc.url === 'activity-log') {
        if (record.doc.body.client_uid === undefined && record.doc.body.actor_object_id === undefined) {
          record.doc.body.actor_object_id = localStorage.user_details ? JSON.parse(localStorage.getItem('user_details')).id : null;
        }
      }
      var promise;
      if (record.doc.method === 'post') {
        promise = Rest.all(record.doc.url).post(record.doc.body)
      } else {
        promise = Rest.all(record.doc.url).patch(record.doc.body)
      }
      return promise.then(function() {
          $log.debug("queue", "upload success", record)
          return queueDB.remove(record.doc)
        })
        .catch(function(error) {
          if (error.status !== 0) {
            $log.debug("upload failed", record)
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
        })
    }
    return queueProperties;
    
  }
})();