(function() {
    'use strict';

    angular
        .module('common')
        .factory('analytics', analytics);

    analytics.$inject = ['Rest','$log','network'];

    /* @ngInject */
    function analytics(Rest, $log, network) {

        var ACTIVITY_TYPE = {
            "LESSON" : {
                "START" : "start lesson",
                "END" : "end lesson",
                "AVAILABLE" : "available lessons",
                "UNLOCKED" : "unlocked lessons"
            },
            "VIDEO" : {
                "START" : "start video",
                "END" : "end video",
                "SEEK" : "seek video"
            },
            "PRACTICE" : {
                "START" : "start practice",
                "END" : "end practice"
            },
            "QUIZ" : {
                "START" : "start quiz",
                "END" : "end quiz"
            },
            "QUESTION" : {
                "START" : "start question",
                "END" : "end question"
            },
            "APP" : {
                "START" : "start app",
                "END" : "end app"
            }
        };

        var analytics = {
            activity : ACTIVITY_TYPE,
            getDevice : getDevice,
            log: log
        };

        return analytics;


        function getPostParam (
            actor_object_id,
            verb,
            action_object_content_type,
            action_object_object_id,
            target_object_id,
            data)
        {
            data["network"] = network.getConnectionType();
            data["device"] = analytics.getDevice();
            return {
                "actor_object_id": actor_object_id,
                "verb": verb,
                "actor_content_type": "person",
                "action_object_content_type" : action_object_content_type,
                "action_object_object_id" : action_object_object_id,
                "target_object_id" : target_object_id,
                "target_content_type" : "account",
                "data" : data
            }
        }

        function getDevice () {
            $log.debug("Device : Details : ", device);
            try {
                var device = {
                    "model" : window.device.model,
                    "platform" : window.device.platform,
                    "uuid" : window.device.uuid,
                    "version" : window.device.version,
                    "serial" : window.device.serial,
                    "manufacturer" : window.device.manufacturer
                }
                return device;
            } catch (e) {
                return {
                    "error" : e
                }
            }
        }

        function getUserDetails (prop) {
            var user = JSON.parse(localStorage.profile);
            if(prop == 'id'){
                return user.id;
            }
            if(prop == 'account'){
                return user.accounts[user.username].id;
            }
        }

        function log(action, data) {
            $log.debug('Analytics : Action : ', action);
            $log.debug('Analytics : Data : ', data);
            $log.debug('Analytics : Verb : ', analytics.activity);

            var post_param = getPostParam(
                getUserDetails('id'),
                analytics.activity[action.name][action.type],
                action.name.toLowerCase(),
                action.id,
                getUserDetails('account'),
                data
            );

            network.isOnline() &&
            Rest
                .all('activity-log')
                .post(post_param)
                .then(function(response){
                    $log.debug("Analytics : Success : ", response);
                })
                .catch(function(error){
                    $log.debug("Analytics : Error : ", error);
                })

            // if offline push to queue with url
            // !network.isOnline() &&
            // data.queue.push(post_param, 'activity-log');

            return true;
        }
    }
})();
