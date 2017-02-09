(function() {
  'use strict';
  angular
  .module('common')
  .factory('appstate',appstate);

  appstate.$inject = [
    '$log',
    'User',
    'device'
  ];

  function appstate($log, User, device) {
    return {
       set : set,
       get : get
    }


    function set(key,value) {
      var db = new PouchDB('profilesDB');
      var profileId = User.getActiveProfileSync()._id;
      // $log.info('searching profile,',profileId)
      return new Promise(function(resolve,reject){
        db.get(profileId).then(function(profile){
          // $log.info('STATE',profile);
          // var profileAppState = profile._appstate;
          if(!profile.data._appstate){
            profile.data._appstate = {};
          }
          
          if ( profile.data._appstate[key] != value ) {
            // $log.debug('STATE. doesn\'t match')
            profile.data._appstate[key] = value;
          }else{
            // $log.debug('STATE. already exists')
            reject('State already exists');
          }


          db.put({
            _id : profile._id,
            _rev : profile._rev,
            data : profile.data
          }).then(function(status){
            // if(status['ok'] == true){
            User.updateActiveProfileSync(profile)
            resolve(profile);
            // }
          }).catch(function(err){
            reject(err);
          })
          // if(!)
        }).catch(function(err){
          reject(err);
        })
        
      })
      // .then(function(profile) {
      // })
      // .then(function(res){
      //   resolve(res);
      // }).catch(function(err){
      //   reject(err);
      // })
    }

    function get(key){
      var db = new PouchDB('profilesDB');
      var profileId = User.getActiveProfileSync()._id;
      return db.get(profileId).then(function(profile){
        // $log.info('STATE',profile);
        // var profileAppState = profile._appstate;
        return profile.data._appstate[key];
        // if(!)
      })
    }

    

   }
})();
