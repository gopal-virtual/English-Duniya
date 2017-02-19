(function() {
  'use strict';

  angular
    .module('common')
    .factory('analytics', analytics);

  analytics.$inject = [
    '$log',
    'network',
    'queue',
    '$cordovaGeolocation',
    '$q',
    'device',
    'User',
    'CONSTANT',
    'appstate'
  ];

  /* @ngInject */
  function analytics(
    $log,
    network,
    queue,
    $cordovaGeolocation,
    $q,
    device,
    User,
    CONSTANT,
    appstate
  ) {

    var ACTIVITY_TYPE = {
      "REGISTRATION": {
        "CONTENT": null,
        "LANGUAGE": "select language",
        "NAME": "enter name",
        "GENDER": "select gender",
        "GRADE": "select grade",
      },
      "LESSON": {
        "CONTENT": "lesson",
        "START": "start lesson",
        "END": "end lesson",
        "AVAILABLE": "available lessons",
        "UNLOCKED": "unlocked lessons"
      },
      "VIDEO": {
        "CONTENT": "resource",
        "START": "start video",
        "END": "end video",
        "SEEK": "seek video",
        "PAUSE" : "pause video",
        "RESUME" : "resume video",
        "QUIT" : "quit video",
        "SWITCH" : "switch from video to map"
      },
      "VOCABULARY": {
        "CONTENT": "vocabulary",
        "START": "start vocabulary",
        "END": "end vocabulary",
        "PAUSE" : "pause vocabulary",
        "RESUME" : "resume vocabulary",
        "QUIT" : "quit vocabulary",
        "SWITCH" : "switch from vocabulary to map"
      },
      "VOCABULARY_CARD": {
        "CONTENT": "vocabularycard",
        "START": "start vocabulary card",
        "PLAY" : "tap to play vocabulary card",
        "END": "end vocabulary card",
      },
      "PRACTICE": {
        "CONTENT": "assessment",
        "START": "start practice",
        "QUIT" : "quit practice",
        "PAUSE" : "pause practice",
        "RESUME" : "resume practice",
        "END": "end practice",
        "SWITCH" : "switch from practice to map"
      },
      "QUIZ": {
        "CONTENT": "assessment",
        "START": "start quiz",
        "END": "end quiz"
      },
      "QUESTION": {
        "CONTENT": "jsonquestion",
        "START": "start question",
        "END": "end question",
        "PLAY" : "play audio"
      },
      "LITMUS": {
        "CONTENT": "jsonquestion",
        "START": "start litmus",
        "END": "end litmus",
        "LEVEL": "level assigned",
        "START_BUTTON_LEVEL": "start button level",
        "EXIT": "exit litmus",
        "SUMMARY": "result litmus",
        "PLAY" : "play audio"
      },
      "APP": {
        "CONTENT": null,
        "START": "start app",
        "END": "end app",
        "EXIT_MODAL_SHOW": "exit modal show",
        "Exit_MODAL_HIDE": "exit modal hide",
      },
      "NOTIFICATION" : {
        "CONTENT" : null,
        "RECEIVED" : "received notification",
        "TAPPED" : "tapped notification"
      },
      "STATE":{
        "CHANGE_START": "stage change start",
        "CHANGE_COMPLETE": "stage change complete",
        "CHANGE_ERROR": "stage change error"
      },
      "FAILURE":{
        "LOW_DISK_SPACE": "low disk space"
      },
      "PHONENUMBER" : {
        "TAP_ADD" : "tap phone number add ",
        "TAP_CHANGE" : "tap phone number change",
        "OPEN" : "open phone number",
        "CLOSE" : "close phone number",
        "NUMBER_SUBMIT" : "submit phone number",
        "NUMBER_SUCCESS" : "register phone number success",
        "NUMBER_ERROR" : "register phone number error",
        "OTP_SUBMIT" : "submit otp",
        "OTP_RESEND" : "resend otp",
        "OTP_SUCCESS" : "verify otp success",
        "OTP_ERROR" : "verify otp error",
      },
      "CHOOSEPROFILE" : {
        "TAP" : "tap choose profile",
        "OPEN" : "open choose profile",
        "CLOSE" : "close choose profile",
        "PROFILE_TAP" : "tap profile card",
        "SWITCH" : "switch profile",
        "ADD" : "add profile"
      },
      "MAP" : {
        "PORT_NEXT" : "tap portal next",
        "PORT_PREV" : "tap portal prev",
        "REGION" : "on region"
      },
      "CHALLENGE" : {
        "CLICKED" : "tap challenge",
        "JOINED" : "join challenge"
      }
    };

    var analytics = {
      activity: ACTIVITY_TYPE,
      getLocation: getLocation,
      log: log
    };
    var location = {};
    return analytics;

    function getPostParam(
      actor_object_id,
      verb,
      action_object_content_type,
      action_object_object_id,
      target_object_id,
      data
    ) {

      data["network"] = network.getConnectionType();
      data["device"] = device;
      data["location"] = {};
      data["campaign_name"] = CONSTANT.APP.CAMPAIGN;
      var post_param = {
        "actor_object_id": actor_object_id,
        "verb": verb,
        "actor_content_type": "person",
        "action_object_content_type": action_object_content_type,
        "action_object_object_id": action_object_object_id,
        "target_object_id": target_object_id,
        "target_content_type": "account",
        "data": data
      };

      return $q.resolve(post_param);
      //   if (verb == "end app") {
      //     return $q.resolve(post_param);
      //   } else {
      //     return analytics.getLocation()
      //       .then(function(position) {
      //         post_param.data.location["lat"] = position.coords.latitude;
      //         post_param.data.location["long"] = position.coords.longitude;
      //         return $q.resolve(post_param);
      //       })
      //   }
    }


    function getLocation() {
      $log.debug("getting location");
      var posOptions = {
        timeout: 10000,
        enableHighAccuracy: false
      };
      return $cordovaGeolocation.getCurrentPosition(posOptions).then(function (response) {
          location = response;
          return response;
      });
    }

    function log(action, data, profile_id, user_id) {
      // $log.debug("Analytics", action, data);
      $log.info('action',action.name+"."+action.type);
      if (User.getActiveProfileSync()) {
        appstate.set(action.name+"."+action.type,1).then(function(res){
          $log.debug('STATE',res);
        }).catch(function(err){
          $log.warn('STATE',err);
        });
      }
      data["network"] = network.getConnectionType();
      data["device"] = device;
      data["app_version"] = CONSTANT.APP.VERSION;
      data["app_type"] = CONSTANT.APP.TYPE;
      data["campaign_name"] = CONSTANT.APP.CAMPAIGN;
      $log.debug("Loggin analytics",data);
      if(location && location.coords){
      data["location"] = {'latitue':location.coords.latitude,'longitude':location.coords.longitude};
      }
      var post_param = {
        "verb": analytics.activity[action.name][action.type],
        "actor_content_type": "person",
        "action_object_content_type": analytics.activity[action.name].CONTENT,
        "action_object_object_id": action.id,
        // "target_object_id": target_object_id,
        "target_content_type": "account",
        "data": data
      };
      if (profile_id) {
        post_param.client_uid = profile_id;
      } else {
        post_param.actor_object_id = User.user.getIdSync();
      }

      if (CONSTANT.ANALYTICS) {
        $log.debug("Pushing activity log")
        queue.push('activity-log', post_param);
      }
      // ionic.Platform.device().available &&

      // .then(function() {
      //   if (network.isOnline()) {
      //     return Rest
      //       .all('activity-log')
      //       .post(post_param);
      //   } else {
      //    ;
      //   }
      // });
      //


      return true;
    }


    function saveState(action){
      $log.info('action',action.name+"."+action.type);
    }

  }
})();
