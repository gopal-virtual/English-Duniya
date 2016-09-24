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


    function push(url, body,method) {
      if(!method){
        method = 'post'
      }
      $log.debug("Pushing",url,body,method);
      return queueDB.put({
        '_id': new Date().getTime().toString(),
        'url': url,
        'body': body,
        'method' : method
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

      $log.debug("R",record)
      //patch
      if(!record.doc.body){
        record.doc.body = record.doc.data.data;
        record.doc.method = 'post';
        record.doc.url = 'activity-log';
      }
      $log.debug("R'",record)

      //patch end

      if(record.doc.url === 'activity-log'){

        if(record.doc.body.client_uid === undefined && record.doc.body.actor_object_id === undefined){
$log.debug("HRE CMED")
        record.doc.body.actor_object_id = JSON.parse(localStorage.getItem('user_details')).id;
        }
      }
      var promise;
      if(record.doc.method === 'post'){
        promise = Rest.all(record.doc.url).post(record.doc.body)
      }else{
        promise = Rest.all(record.doc.url).patch(record.doc.body)
      }



        return promise.then(function () {


        return queueDB.remove(record.doc)
      })
    }


  }

})();
