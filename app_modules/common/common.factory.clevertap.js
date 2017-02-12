(function() {
  'use strict';
  angular
  .module('common')
  .factory('clevertap',clevertap);

  clevertap.$inject = [
    '$log',
    'User',
    '$http',
    'CONSTANT',
  ];

  function clevertap($log, User,$http,CONSTANT) {
    // types of clevertap
    // Undiscovered - content - 24hrs
    // Discovered - generic - 5hrs
    var resources;

    return {
      registerPush : registerPush,
      profileSet : profileSet
    }

    function registerPush(){
      try{
        $log.debug('CLEVERTAP 3',CleverTap.registerPush());
        CleverTap.registerPush();
      }catch(err){
        $log.warn('Cant work with clevertap',err);
      }
    }

    function profileSet(profileData){
    	$log.debug('Setting profile data',profileData)
        // if (response.data) {
      $log.debug('CLEVERTAP. profileSet',profileData);
      // var profileId = response.data[0].id;
      // $log.debug('CLEVERTAP. Profile id',profileId);
      try{
        $log.debug('CLEVERTAP',CleverTap);
        // $log.debug('CLEVERTAP2');
        var profile = User.getActiveProfileSync().data.profile;
        CleverTap.profileSet(profileData);
        // $log.debug('CLEVERTAP3',registerPush);
      }catch(err){
        $log.warn('CLEVERTAP. Error with CleverTap',err);
      }
      registerPush()
        // }
    }

    function CleverTapLocation(){
      try{
        CleverTap.getLocation(function(loc) {
          $log.debug("CleverTapLocation is ",loc.lat,loc.lon);
          CleverTap.setLocation(loc.lat, loc.lon);
        },
        function(error) {
          $log.debug("CleverTapLocation error is ",error);
        });
      }catch(err){
        $log.warn('Error with clevertap',err);
      }
    }
  }
})();
