(function () {
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

    var queueDB = pouchDB('queueDB');
    var queueProperties = {
      push: push,
      startSync: startSync,
      getAll : function(){
        return queueDB.allDocs({include_docs:true});
      }
    };

    return queueProperties;


    function push(url, body) {
      $log.debug("P",url,body)
      return queueDB.put({
        '_id': new Date().getTime().toString(),
        'url': url,
        'body': body
      }).then(function(){
        if(localStorage.getItem('syncing') !== 'true' && network.isOnline()){
          startSync();

        }else{


        }
        return $q.resolve();
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
      if (records.length > 0) {
        return uploadAndDelete(records[0]);
      } else {
        return $q.resolve('no_data');
      }
    }

    function startSync() {
      $log.debug("start sync called");
      localStorage.setItem('syncing',true)
      Auth.loginIfNotAuthorised()
        .then(function () {
          return queueDB.allDocs({
            include_docs: true
          })
        })
        .then(function (response) {
          return uploadIfRecord(response.rows)
        })
        .then(function (response) {

          if(response === 'no_data'){


            localStorage.setItem('syncing',false);
            return true;
          }else{


            startSync()
          }
        })
        .catch(function(e){

        })

    }

    function uploadAndDelete(record) {

      if(record.doc.url === 'activity-log'){
        if(record.doc.body.client_uid === undefined && record.doc.body.actor_object_id === undefined){
        record.doc.body.actor_object_id = JSON.parse(localStorage.getItem('user_details')).id;
        }
      }

      return Rest.all(record.doc.url).post(record.doc.body).then(function () {


        return queueDB.remove(record.doc)
      })
    }


  }

})();
