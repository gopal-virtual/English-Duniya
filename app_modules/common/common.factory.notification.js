(function() {
  'use strict';
  angular
  .module('common')
  .factory('notification',notification);

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
    'device'
  ];

  function notification($log, $cordovaLocalNotification,content,$q,User,$http,lessonutils,$cordovaPushV5,CONSTANT,device) {
    // types of notification
    // Undiscovered - content - 24hrs
    // Discovered - generic - 5hrs
    var resources;

    return {
      log : log,
      init: init,
      createDb : createDb,
      defineType : defineType,
      schedule : schedule,
      set : set,
      smartContentSet : smartContentSet,
      cancelAll : cancelAll,
      db: {
        load : dbLoad,
        destroy : dbDestroy,
        replicate : replicate
      },
      online: {
        register: onlineRegister,
        set : onlineSet
      }
    }

    function log(){
      $log.debug("notification factory is now working");
    }


    function createDb() {
      $log.debug("creating db")
      var notificationDB = new PouchDB('notificationDB');
      createDummy(notificationDB);
    }


    function fetchDocs(){
      $log.info("Fetching Docs ...");
      var db = new PouchDB('notificationDB');
      var defer = $q.defer();
      content.getActiveResource().then(function(lesson){
        $log.debug("This is sparta",lesson)
        $log.debug('Fetching doc named "notif'+'-content-'+lesson.node.parent+'"')
        return db.get('notif'+'-content-'+lesson.node.parent).then(function(doc){
          $log.debug("DOC",{'doc':doc,'lesson':lesson});
          defer.resolve({'doc':doc,'lesson':lesson});
        }).catch(function(err){
          if(err.status == 404){
            $log.warn('Notification was not set. The doc named "notif'+'-content-'+lesson.node.parent+'" was not found. Check the database perhaps')
          }else{
            $log.error("Can't fetch notification from pouch\n",err);
          }
          defer.reject(err);
        })
      })
      return defer.promise;
    }

    function set(type){
      $log.info("Setting Notification ...")
      // content.getActiveLessonId().then(function(lessonId){
      //   $log.warn("Lesson ID", lessonId);
      // });
      $log.debug("setting notification",type);
      fetchDocs().then(function(data){
        // $log.debug("SCHEDULE",defineType(data,type));
        schedule(defineType(data.doc,type));
      },function(err){
        $log.warn('Can\'t schedule notification',err)
      })
    }

    function smartContentSet(){
      $log.info("Setting Notification smartly ...")
      fetchDocs().then(function(data){
        $log.debug("this is the data that determines",data)
        $log.debug('resource type huhu', lessonutils.resourceType(data.lesson))
        if (lessonutils.resourceType(data.lesson) != "practice") {
          $log.debug("Notification undiscovered");
          schedule(defineType(data.doc,'undiscovered'));
          // set('undiscovered');
        }else{
          $log.debug("Notification discovered")
          schedule(defineType(data.doc,'discovered'));
          // set('discovered');
        }
        $log.debug('HOMAMAM',data.lesson)
      },function(err){
        $log.warn('Can\'t schedule notification',err)
      })
    }

    function schedule(data){
      $log.info("Scheduling ...")
      data['icon'] = 'res://ic_stat_english_duniya';
      data['smallIcon'] = 'res://icon';
      // data['icon'] = "http://www.company-name-generator.com/blog/wp-content/uploads/2010/10/BMW_logo_small.png"
      // data['smallIcon'] = "http://www.company-name-generator.com/blog/wp-content/uploads/2010/10/BMW_logo_small.png"
      $log.debug("THIS IS DATA",data)
      try{
        $cordovaLocalNotification.schedule(data).then(function () {
          $log.debug("Notification was placed. HEHEHEHE");
          // alert("Instant Notification set");
        });
      }catch(err){
        $log.debug("notification threw error ",err)
      }
    }

    function defineType(data,type){
      $log.info("Defining types ...")
      var now = new Date().getTime();
      $log.debug("This is the time",new Date(now + 10 * 60000))
      var returnType;
      switch(type){
        case 'discovered':
          returnType = {
            id: data._id,
            at: (function(){
              return new Date(now + 1 * 60000);
            })(),
            title: "Let's play",
            text: "Hey, let's resume your learning"
          };
          break;
        case 'undiscovered':
          returnType = {
            id: data._id,
            at: (function(){
              return new Date(now + 1 * 60000);
            })(),
            title: data.title,
            text: data.text
          };
          break;
        default:
          returnType = false;
      }
      return returnType;
    }

    function dbCreate(){
      return new PouchDB('notificationDB');
    }

    function dbLoad(){
      var db = new PouchDB('notificationDB');
      return db.load('data/notifications.db')
      .then(function(){
        $log.debug("Database loaded from file");
      }).catch(function(err){
        $log.error("Database couldn't be created",err);
      });
    }

    function dbDestroy(){
      var db = new PouchDB('notificationDB');
      db.destroy().then(function(response){
        $log.debug('database destroyed',response)
      }).catch(function(err){
        $log.error('Error occured while destroying db',err);
      })
    }

    function init() {
      $log.debug("Debugging Notification")
      // var deferred = $q.defer();
      var db = new PouchDB('notificationDB');
      db.get('notifLessons').then(function(doc){
        $log.debug("printing notifLessons",doc);
        $log.debug("resources",resources);
      }).catch(function(err){
        $log.debug("Error fetching doc ",err);
      })
    }

    function replicate() {
      var localDb = new PouchDB('notificationDB');
      var remoteDb = new PouchDB('https://ci-couch.zaya.in/notifications');
      remoteDb.replicate.to(localDb, {
        live: true,
        retry: true
      }).on('change', function (change) {
        $log.debug("NOTIFICATION DATABASE CHANGE",change);
      }).on('paused', function (info) {
        $log.warn('notificationDB replication paused',info)
      }).on('active', function (info) {
        $log.debug('notificationDB replication active',info)
      }).on('error', function (err) {
        $log.error('error occured while syncing couch',err)
      });
    }

    function onlineRegister(data){
      $log.debug("Inside online Register")
      $http({
        method: 'POST',
        url: 'https://cc-test.zaya.in/api/v1/devices/',
        data: {dev_id: data.dev_id, dev_type: data.dev_type, reg_id: data.reg_id}
      }).then(function successCallback(response) {
        $log.debug("successfully posted", response)
      }, function errorCallback(response) {
        $log.debug("not successfully posted", response)
      });
    }


    function cancelAll(){
      try{
        return $cordovaLocalNotification.cancelAll()
      }catch(err){
        $log.warn('Don\'t worry. This is not an error. Notifications are not supposed to work on fake devices\n',err)
      }
    }

    function onlineSet() {
      $log.debug("APP RUN USER RGISTERD");
      try{
        localStorage.myPush = ''; // I use a localStorage variable to persist the token
        $cordovaPushV5.initialize(  // important to initialize with the multidevice structure !!
          {
            android: {
              senderID: CONSTANT.CONFIG.NOTIFICATION.SENDERID
            }
          }
        ).then(function (result) {
          $cordovaPushV5.onNotification();
          $cordovaPushV5.onError();
          if (localStorage.pushKey) {
            $log.debug("notifId ",localStorage.pushKey);
          }else{
            $cordovaPushV5.register().then(function (resultreg) {
              localStorage.myPush = resultreg;
              $log.debug("this is supposed to go to server");
              $log.debug({
                dev_id: device.uuid,
                reg_id: resultreg
              });
              localStorage.setItem('pushKey',resultreg);
              $log.debug(device,"Check this please");
              onlineRegister({
                dev_id: device.uuid,
                dev_type: "ANDROID",
                reg_id: resultreg
              });

              $log.debug('Sending to server',resultreg);
              // SEND THE TOKEN TO THE SERVER, best associated with your device id and user
            }, function (err) {
              $log.debug("Some error occured",err);
              // handle error
            });
          }
        });


      }catch(err){
        $log.warn("Need to run app on mobile to enable push notifications",err)
      }
    }
  }
})();
