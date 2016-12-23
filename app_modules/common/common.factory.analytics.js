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
    'CONSTANT'
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
    CONSTANT
  ) {

    var ACTIVITY_TYPE = {
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
        "SEEK": "seek video"
      },
      "VOCABULARY": {
        "CONTENT": "vocabulary",
        "START": "start vocabulary",
        "END": "end vocabulary",
      },
      "PRACTICE": {
        "CONTENT": "assessment",
        "START": "start practice",
        "END": "end practice"
      },
      "QUIZ": {
        "CONTENT": "assessment",
        "START": "start quiz",
        "END": "end quiz"
      },
      "QUESTION": {
        "CONTENT": "jsonquestion",
        "START": "start question",
        "END": "end question"
      },
      "APP": {
        "CONTENT": null,
        "START": "start app",
        "END": "end app"
      },
      "NOTIFICATION" : {
        "CONTENT" : null,
        "RECEIVED" : "received notification",
        "TAPPED" : "tapped notification"

      }
    };

    var analytics = {
      activity: ACTIVITY_TYPE,
      getLocation: getLocation,
      log: log
    };

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
      var posOptions = {
        timeout: 10000,
        enableHighAccuracy: false
      };
      return $cordovaGeolocation.getCurrentPosition(posOptions);
    }

    function log(action, data, profile_id, user_id) {
      $log.debug("Analytics", action, data);
      data["network"] = network.getConnectionType();
      data["device"] = device;
      data["app_version"] = CONSTANT.APP.VERSION;
      data["app_type"] = CONSTANT.APP.TYPE;
      data["location"] = {};
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
        post_param.actor_object_id = user_id;
      }

      if (CONSTANT.ANALYTICS) {


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

  }
})();
