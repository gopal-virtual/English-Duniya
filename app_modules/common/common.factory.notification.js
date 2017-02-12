(function() {
  'use strict';
  angular
    .module('common')
    .factory('notification', notification);
  notification.$inject = [
    '$log',
    '$cordovaLocalNotification',
    'content',
    '$q',
    'User',
    '$http',
    'lessonutils',
    '$cordovaPushV5',
    'CONSTANT',
    'device',
    'analytics',
    'appstate'
  ];

  function notification($log, $cordovaLocalNotification, content, $q, User, $http, lessonutils, $cordovaPushV5, CONSTANT, device, analytics, appstate) {
    // types of notification
    // Undiscovered - content - 24hrs
    // Discovered - generic - 5hrs
    var resources;
    return {
      log: log,
      init: init,
      createDb: createDb,
      defineType: defineType,
      schedule: schedule,
      set: set,
      smartContentSet: smartContentSet,
      cancelAll: cancelAll,
      fetchDocById: fetchDocById,
      getFromServer: getFromServer,
      db: {
        load: dbLoad,
        destroy: dbDestroy,
        replicate: replicate
      },
      online: {
        register: onlineRegister,
        set : onlineSet,
        log : onlineLog
        // clevertapRegister : onlineClevertapRegister,
        // clevertapProfile : onlineClevertapProfile,
        // CleverTapLocation : CleverTapLocation,
      },
      offline: {
        list: listOfflineNotifications,
        fetch: fetchOfflineNotifications,
        scheduleMulti: scheduleMulti
      }
    }

    function log() {
      $log.debug("notification factory is now working");
    }

    function createDb() {
      $log.debug("creating db")
      var notificationDB = new PouchDB('notificationDB');
      createDummy(notificationDB);
    }

    function fetchDocs() {
      $log.info("Fetching Docs ...");
      var db = new PouchDB('notificationDB');
      var defer = $q.defer();
      content.getActiveResource().then(function(lesson) {
        $log.debug("This is sparta", lesson)
        $log.debug('Fetching doc named "notif' + '-content-' + lesson.node.parent + '"')
        return db.get('notif' + '-content-' + lesson.node.parent).then(function(doc) {
          $log.debug("DOC", {
            'doc': doc,
            'lesson': lesson
          });
          defer.resolve({
            'doc': doc,
            'lesson': lesson
          });
        }).catch(function(err) {
          if (err.status == 404) {
            $log.warn('Notification was not set. The doc named "notif' + '-content-' + lesson.node.parent + '" was not found. Check the database perhaps')
          } else {
            $log.error("Can't fetch notification from pouch\n", err);
          }
          defer.reject(err);
        })
      })
      return defer.promise;
    }

    function fetchDocById(notifId) {
      $log.info("Fetching Doc By Id ...");
      var db = new PouchDB('notificationDB');
      var defer = $q.defer();
      db.get('notif' + '-content-' + notifId).then(function(doc) {
        $log.debug("DOC", doc);
        defer.resolve(doc);
      }).catch(function(err) {
        if (err.status == 404) {
          $log.warn('Notification was not set. The doc named "notif' + '-content-' + notifId + '" was not found. Check the database perhaps')
        } else {
          $log.error("Can't fetch notification from pouch\n", err);
        }
        defer.reject(err);
      })
      return defer.promise;
    }

    function set(type) {
      $log.info("Setting Notification ...")
        // content.getActiveLessonId().then(function(lessonId){
        //   $log.warn("Lesson ID", lessonId);
        // });
      $log.debug("setting notification", type);
      fetchDocs().then(function(data) {
        // $log.debug("SCHEDULE",defineType(data,type));
        schedule(defineType(data.doc, type));
      }, function(err) {
        $log.warn('Can\'t schedule notification', err)
      })
    }

    function smartContentSet() {
      $log.info("Setting Notification smartly ...")
      fetchDocs().then(function(data) {
        $log.debug("this is the data that determines", data)
        $log.debug('resource type huhu', lessonutils.resourceType(data.lesson))
        if (lessonutils.resourceType(data.lesson) != "practice") {
          $log.debug("Notification undiscovered");
          schedule(defineType(data.doc, 'undiscovered'));
          // set('undiscovered');
        } else {
          $log.debug("Notification discovered")
          schedule(defineType(data.doc, 'discovered'));
          // set('discovered');
        }
        $log.debug('HOMAMAM', data.lesson)
      }, function(err) {
        $log.warn('Can\'t schedule notification', err)
      })
    }

    function schedule(data, time) {
      $log.info("Scheduling ...")
      if (time) {
        var now = new Date().getTime();
        data['at'] = new Date(now + time * 60000);
      }
      data['icon'] = 'res://icon';
      data['smallIcon'] = 'res://ic_stat_english_duniya';
      // data['icon'] = "http://www.company-name-generator.com/blog/wp-content/uploads/2010/10/BMW_logo_small.png"
      // data['smallIcon'] = "http://www.company-name-generator.com/blog/wp-content/uploads/2010/10/BMW_logo_small.png"
      $log.debug("THIS IS DATA", data)
      try {
        $cordovaLocalNotification.schedule(data).then(function() {
          $log.debug("Notification was placed. HEHEHEHE");
          // alert("Instant Notification set");
        });
      } catch (err) {
        $log.debug("notification threw error ", err)
      }
    }

    function defineType(data, type) {
      $log.info("Defining types ...")
      var now = new Date().getTime();
      $log.debug("This is the time", (new Date(now + 10 * 60000)).toString())
      var returnType;
      switch (type) {
        case 'discovered':
          returnType = {
            id: data._id,
            at: CONSTANT.NOTIFICATION.DURATION.DISCOVERED,
            title: "Let's play",
            text: "Hey, let's resume your learning"
          };
          break;
        case 'undiscovered':
          returnType = {
            id: data._id,
            at: CONSTANT.NOTIFICATION.DURATION.UNDISCOVERED,
            title: data.title,
            text: data.text
          };
          break;
        default:
          returnType = false;
      }
      $log.debug('define', returnType);
      return returnType;
    }

    function dbCreate() {
      return new PouchDB('notificationDB');
    }

    function dbLoad() {
      var db = new PouchDB('notificationDB');
      return db.load('data/notifications.db')
        .then(function() {
          $log.debug("Database loaded from file");
        }).catch(function(err) {
          $log.error("Database couldn't be created", err);
        });
    }

    function dbDestroy() {
      var db = new PouchDB('notificationDB');
      db.destroy().then(function(response) {
        $log.debug('database destroyed', response)
      }).catch(function(err) {
        $log.error('Error occured while destroying db', err);
      })
    }

    function init() {
      $log.debug("Debugging Notification")
        // var deferred = $q.defer();
      var db = new PouchDB('notificationDB');
      db.get('notifLessons').then(function(doc) {
        $log.debug("printing notifLessons", doc);
        $log.debug("resources", resources);
      }).catch(function(err) {
        $log.debug("Error fetching doc ", err);
      })
    }

    function replicate() {
      var localDb = new PouchDB('notificationDB');
      var remoteDb = new PouchDB(CONSTANT.NOTIFICATION_DB_SERVER);
      remoteDb.replicate.to(localDb, {
        retry: true,
        timeout: 20000
      }).on('change', function(change) {
        $log.debug("NOTIFICATION DATABASE CHANGE", change);
      }).on('paused', function(info) {
        $log.warn('notificationDB replication paused', info);
      }).on('active', function(info) {
        $log.debug('notificationDB replication active', info);
      }).on('error', function(err) {
        $log.error('error occured while syncing couch', err);
      });
    }

    function getFromServer(data) {
      $log.debug("Inside online get")
        // var defer = $q.defer();
      return $http({
        method: 'GET',
        url: CONSTANT.BACKEND_SERVICE_DOMAIN + '/api/v1/devices/?dev_id=' + data.dev_id
          // data: {dev_id: data.dev_id}
      });
      // .then(function successCallback(response) {
      //   $log.debug("We got this", response)
      //   defer.resolve(response);
      // }, function errorCallback(response) {
      //   $log.error("We couldn't get", response)
      //   if (response.status == 404) {
      //     defer.resolve(false);
      //     $log.warn("No worries, we kust register your device")
      //   }else{
      //     defer.reject(response);
      //   }
      // });
      // return defer.promise;
    }

    function onlineRegister(data) {
      $log.warn("NOTIFICATION. Inside online Register")
      $http({
        method: 'POST',
        url: CONSTANT.BACKEND_SERVICE_DOMAIN + '/api/v1/devices/',
        data: {
          dev_id: data.dev_id,
          dev_type: data.dev_type,
          reg_id: data.reg_id
        }
      }).then(function successCallback(response) {
        $log.debug("NOTIFICATION. successfully posted", response)
      }, function errorCallback(response) {
        $log.error("NOTIFICATION. Not successfully posted", response)
        if (response.status == 400) {
          $log.warn("NOTIFICATION. This is totally okay. The user is already registered for notification.")
        }
      });
    }

    function onlinePatch(newToken) {
      $log.warn('NOTIFICATION. Patching with nnew fcm token ...')
      $http({
        method: 'PATCH',
        url: CONSTANT.BACKEND_SERVICE_DOMAIN + '/api/v1/devices/' + device.uuid,
        data: {
          reg_id: newToken,
          is_active: true
        }
      }).then(function successCallback(response) {
        $log.debug("NOTIFICATION. successfully patched", response)
      }, function errorCallback(response) {
        $log.error("NOTIFICATION. Not successfully patched", response)
          // if (response.status == 400) {
          //   $log.warn("This is totally okay. The user is already registered for notification.")
          // }
      });
    }

    function cancelAll() {
      try {
        return $cordovaLocalNotification.cancelAll()
      } catch (err) {
        $log.warn('Don\'t worry. This is not an error. Notifications are not supposed to work on fake devices\n', err)
      }
    }

    function onlineSet() {
      $log.debug("APP RUN USER RGISTERD");
      console.log('CONSTANT.CONFIG.NOTIFICATION.SENDERID', CONSTANT.CONFIG.NOTIFICATION.SENDERID)
      try {
        $cordovaPushV5.initialize( // important to initialize with the multidevice structure !!
          {
            android: {
              senderID: CONSTANT.CONFIG.NOTIFICATION.SENDERID,
              icon: 'ic_stat_english_duniya',
              iconColor: "blue"
                // forceShow : true
            }
          }
        ).then(function(result) {
          $log.warn("NOTIFICATION. ", result)
          $cordovaPushV5.onNotification();
          $cordovaPushV5.onError();
          $cordovaPushV5.register().then(function(resultreg) {
              $log.warn("NOTIFIICATION. token from gcm ", resultreg)
              getFromServer({
                dev_id: device.uuid
              }).then(function(response) {
                if (!response.data[0]) {
                  $log.warn("NOTIFICATION. not registered with server. Will register", response)
                  onlineRegister({
                    dev_id: device.uuid,
                    dev_type: "ANDROID",
                    reg_id: resultreg
                  });
                } else {
                  $log.warn("NOTIFICATION. registered with server. patching")
                  onlinePatch(resultreg);
                }
              })
            }, function(error) {
              $log.error("NOTIFICATION. This is an error. Google is mibehaving. Contact Rudra")
            })
        });
      } catch (err) {
        $log.warn("NOTIFICATION. Need to run app on mobile to enable push notifications", err)
      }
    }

    function onlineLog(type) {
      var typeMap = {
        'received': 'RECEIVED',
        'tapped': 'TAPPED'
      }
      var profileId;
      if (User.getActiveProfileSync()) {
        profileId = User.getActiveProfileSync()._id ? User.getActiveProfileSync()._id : device.uuid;
      }
      analytics.log({
        name: 'NOTIFICATION',
        type: typeMap[type],
        id: null
      }, {
        time: new Date()
      }, profileId);
    }

    function fetchOfflineNotifications() {
      $log.info("OFFLINE");
      var db = new PouchDB('notificationDB');
      return new Promise(function(resolve, reject) {
        db.allDocs({
          include_docs: true,
          startkey: 'notif-offline-',
          endkey: 'notif-offline-\uffff',
        }).then(function(docs) {
          // $log.info("OFFLINE NOTIFICATION BAM YEAH",offlineNotifications);
          resolve(docs);
        }).catch(function(err) {
          // $log.error('',err)
          reject(err);
        })
      })
    }

    function constructOfflineNotification(notificationObject) {
      /*
        notificationObject => {
          _id : string,
          title : string,
          text: string,
          at : timestamp/string,
          repeat : boolean,
          first_at : timestamp,
          repeat_at : number[1-24] (hours),
          expiry : timestamp,
          condition : -,
          published_at: timestamp,
          data : JSON
        }
        schedulerObject => {
          id : number,
          title : string,
          text : string,
          firstAt : date/timestamp
          every : number,
          at : date/timestamp,
          data : JSON
        }
      */
      var schedulerObject = {};
      $log.info('OFFLINE. notification expiry check', parseInt(Date.now() / 1000), notificationObject['expiry'], parseInt(Date.now() / 1000) < notificationObject['expiry'])
      if (notificationObject['published_at'] && parseInt(Date.now() / 1000) < notificationObject['expiry']) {
        schedulerObject = {
          id: notificationObject['_id'],
          title: notificationObject['title'],
          text: notificationObject['text'],
          data: notificationObject['data'],
          icon: 'res://icon',
          smallIcon: 'res://ic_stat_english_duniya'
        };
        if (notificationObject['condition']) {
          // appstate.get('MAP.REGIO').then(function(value){
          // if (notificationObject['condition']['state']) {}
          $log.info('OFFLINE. condition', User.getActiveProfileSync().data._appstate[notificationObject['condition']['state']]);
          if (!!User.getActiveProfileSync().data._appstate[notificationObject['condition']['state']] != notificationObject['condition']['value']) {
            return false;
          }
          // else{
          // }
          // })
          // notificationObject['condition']['state'];
        }
        if (notificationObject['repeat']) {
          /*
            This case is basically a simple Arithmetic Progression problem.
            Here, a[1] = firstAt : timestamp in secs,
                  d = every : secs,
                  a[n-approx] = now : timestamp in secs
                  n[approx] = ? decimaled number of itetations
                  n = ? : number of itetations
            To find,
                  a[n] = ? : timestamp at which the notification needs to be set

            We first find number of iterations (n[approx]) by the formula,
            
                  n[approx] = (a[n-approx] - a[1] + d)/d

            Now we ciel to get the actual value,

                  n = ceil(n[approx])

            Finally, we find a[n] as,

                  a[n] = a[1] + (n-1)d

            From the above equations we can conclude,

                  a[n] = a[1] + (ceil((a[n-approx] - a[1])/d))d
          */

          var base = new Date().getTime(),
              firstAt = 0;

          if(notificationObject['first_at'].charAt(0) == '+'){
            firstAt = parseInt(new Date(base + parseInt(notificationObject['first_at'].substring(1))*3600000).getTime());
          }else{
            firstAt = new Date(notificationObject['first_at']);
          }

          
          var every = notificationObject['repeat_at'] * 60 * 60,
              now = Math.floor(Date.now() / 1000);
          $log.debug('OFFLINE. firstAt',firstAt);
          if ( firstAt > now) {
            schedulerObject['firstAt'] = new Date(firstAt);
          }else{
            schedulerObject['firstAt'] = new Date((firstAt + (Math.ceil((now - firstAt) / every)) * every) * 1000);
          }
          schedulerObject['every'] = every / 60;
        } else {
          var at = 0,
              base = new Date().getTime();

          if(notificationObject['at'].charAt(0) == '+'){
            at = new Date(base + parseInt(notificationObject['at'].substring(1))*3600000);
          }else{
            at = new Date(notificationObject['at']);
          }

          $log.debug('OFFLINE. at', notificationObject['at'], new Date(notificationObject['at']))
          schedulerObject['at'] = new Date(at);
        }
        // console.log()
      } else {
        schedulerObject = false;
      }
      $log.info('OFFLINE.schedulerObject', schedulerObject);
      return schedulerObject;
    }

    function listOfflineNotifications() {
      return new Promise(function(resolve, reject) {
        fetchOfflineNotifications().then(function(docs) {
          var schedulerObjectArray = [];
          for (var i = 0; i < docs.rows.length; i++) {
            var notificationObject = constructOfflineNotification(docs.rows[i].doc);
            if (notificationObject) {
              schedulerObjectArray.push(notificationObject);
            }
          }
          $log.debug('OFFLINE.')
          $log.debug('OFFLINE.schedulerObjectArray', schedulerObjectArray);
          resolve(schedulerObjectArray);
        }).catch(function(err) {
          // $log.error('some error occured while fetching offline notification doc',err);
          reject(err);
        })
      })
    }

    function scheduleMulti(schedulerObjectArray) {
      /*
        schedulerObjectArray => [schedulerObject]
      */
      try {
        $cordovaLocalNotification.schedule(schedulerObjectArray);
      } catch (err) {
        console.warn('Offline notification mai problem aa gayi', err);
      }
    }


    // function onlineClevertapRegister(){
    //   try{
    //     $log.debug('CLEVERTAP 3',CleverTap.registerPush());
    //     CleverTap.registerPush();
    //   } catch (err) {
    //     $log.warn('Cant work with clevertap', err);
    //   }
    // }

    // function onlineClevertapProfile() {
    //   $http.get(CONSTANT.BACKEND_SERVICE_DOMAIN + '/api/v1/profiles/?client_uid=' + User.getActiveProfileSync()._id).then(function(response) {
    //     if (response.data) {
    //       $log.debug('CLEVERTAP. profile', response);
    //       var profileId = response.data[0].id;
    //       $log.debug('CLEVERTAP. Profile id',profileId);
    //       try{
    //         $log.debug('CLEVERTAP',CleverTap);
    //         // $log.debug('CLEVERTAP2');
    //         var profile = User.getActiveProfileSync().data.profile;
    //         CleverTap.profileSet({
    //           "Identity": profileId,
    //           "ts": Date.now().toString(),       // user creation date, or just leave this field out to set the time has current
    //           "Name": profile.first_name+" "+profile.last_name,
    //           "Gender": profile.gender,
    //           "type": "profile",
    //           "Phone": User.user.getPhoneNumber(),
    //           // "profileData": {
    //           // }
    //         });
    //         // $log.debug('CLEVERTAP3',registerPush);
    //       } catch (err) {
    //         $log.warn('CLEVERTAP. Error with CleverTap', err);
    //       }
    //     }
    //   })
    // }

    // function CleverTapLocation(){
    //   try{
    //     CleverTap.getLocation(function(loc) {
    //       $log.debug("CleverTapLocation is ",loc.lat,loc.lon);
    //       CleverTap.setLocation(loc.lat, loc.lon);
    //     },
    //     function(error) {
    //       $log.debug("CleverTapLocation error is ",error);
    //     });
    //   }catch(err){
    //     $log.warn('Error with clevertap',err);
    //   }
    // }
  }
})();