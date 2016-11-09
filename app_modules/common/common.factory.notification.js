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
    'User'
  ];

  function notification($log, $cordovaLocalNotification,content,$q,User) {
    // types of notification
    // Undiscovered - content - 24hrs
    // Discovered - generic - 5hrs
    var resources; 

    return {
      log : log,
      init: init,
      createDb : createDb,
      defineTypes : defineTypes
    }

    function log(){
      $log.debug("notification factory is now working");
    }

    function dummyData() {
      return {
        '0092ac4b-1da2-41e3-81e1-2700274c78f0' : {
          id : (function(){
            return new Date().getTime().toString();
          })(),
          title : 'Lesson 1',
          text : 'Kids learn when to use the words “less than” and “fewer than”, e.g. “I have fewer pencils” vs “he drinks less water”',
          type : "content"
        },
        '0234146d-f0ae-49d4-9d4f-c74fe4fef312' : {
          id : (function(){
            return new Date().getTime().toString();
          })(),
          title : 'Lesson 2',
          text : '2Kids learn when to use the words “less than” and “fewer than”, e.g. “I have fewer pencils” vs “he drinks less water”',
          type : "content"
        },
        '02c46cce-74d9-4fbc-877d-d993eb9427f5' : {
          id : (function(){
            return new Date().getTime().toString();
          })(),
          title : 'Lesson 3',
          text : '3Kids learn when to use the words “less than” and “fewer than”, e.g. “I have fewer pencils” vs “he drinks less water”',
          type : "content"
        }
      }
    }

    function createDummy(db){
      $log.debug("adding new documents")
      var notifData = dummyData();
      for(var key in notifData){
        db.put({
          _id: (function(){
            return "notif-"+notifData[key].type+"-"+key
          })(),
          data: notifData[key]
        }).then(function(response){
          $log.debug("Notification has been created and is populated. Response is ",response)
        }).catch(function (err) {
          $log.error("Error with creating dummy data, ",err)
        });
      }

      // config = typeof(config) != 'undefined' ? config:{};
      // $cordovaLocalNotification.schedule({
      //   id: 1,
      //   text: ntfnText,
      //   title: 'Let\'s play',
      //   every: 'minute'
      // }).then(function () {
      //   $log.debug("Notification was placed");
      // });
    }



    function createDb() {
      $log.debug("creating db")
      var notificationDB = new PouchDB('notificationDB');
      createDummy(notificationDB);
      // notificationDB.get('notifLessons').then(function(response){
      //   $log.debug("Found the db. Doing nothing")
      // }).catch(function(err){
      //   $log.debug("Error with pouch",err);
      //   if (err.status == 404) {
      //     $log.debug("DB missing creating anew")
      //     createDummy(notificationDB);
      //   }
      //   else{
      //     $log.debug("Not a missing db error, ",err)
      //   }
      // })
    }

    function fetchDocs(){
    }

    function defineTypes(){
      $log.debug("DEFINING TYPES")
      var db = new PouchDB('notificationDB');
      $q.all({
        content : content.getActiveResource(),
        notif : db.get('notifLessons')
      }).then(function(data){
        // content.node.id 
        $log.debug("DEFINE TYPES",data)
        // var activeLesson = data.content[data.content.length - 1].locked ==
      },function(err){
        $log.error("TYPES ERROR happened",err)
      })
      // return {
      //   'discovered' : {
      //     type: "generic",
      //     loops: 1,
      //     interval: 5,
      //     title: "Let's play",
      //     text: "Hey, let's resume your learning"
      //   },
      //   'undiscovered' : {
      //     type: "content",
      //     loops: 1,
      //     interval: 24,
      //     title: (function(){

      //     })()
      //   }
      // }
        // })
      // });
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

    function schedule(type,data){
      $cordovaLocalNotification.schedule({
        id: type,
        text: data,
        title: 'Let\'s play',
        every: 'minute'
      }).then(function () {
        $log.debug("Notification was placed");
        // alert("Instant Notification set");
      });
    }
  }
})();