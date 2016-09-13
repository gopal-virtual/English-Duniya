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
    'Auth'
  ];

  /* @ngInject */
  function queue(pouchDB,
                 $log,
                 Rest,
                 CONSTANT,
                 $q,
                 Auth) {

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
      // $log.debug(typeof new Date().getTime().toString())
      return queueDB.put({
        '_id': new Date().getTime().toString(),
        'url': url,
        'body': body
      }).then(function(){
        if(localStorage.getItem('syncing') !== 'true'){
          startSync();
          $log.debug("starting sync")
        }else{

          $log.debug("not starting sync")
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
    //     $log.debug(record,response);
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
      $log.debug("start Sync");
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
            $log.debug("f1")
          if(response === 'no_data'){
            $log.debug("f2")

            localStorage.setItem('syncing',false);
            return true;
          }else{
            $log.debug("f3")

            startSync()
          }
        })
        .catch(function(e){
          $log.debug("Error",e)
        })

    }

    function uploadAndDelete(record) {
        $log.debug("upload and delete",record)
      return Rest.all(record.doc.url).post(record.doc.body).then(function () {
        $log.debug("uploaded and deleteing",record)

        return queueDB.remove(record.doc)
      })
    }


  }

})();
