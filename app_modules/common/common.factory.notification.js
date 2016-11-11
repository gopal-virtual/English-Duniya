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
      defineType : defineType,
      schedule : schedule,
      set : set,
      db: {
        load : dbLoad,
        destroy : dbDestroy
        
      }
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
      $log.debug("DEFINING TYPES");
      var db = new PouchDB('notificationDB');
      var defer = $q.defer();
      // $q.all({
      //   content : content.getActiveResource(),
      //   notif : db.get('notifLessons')
      // }).then(function(data){
      //   // content.node.id 
      //   $log.debug("DEFINE TYPES",data)
      //   // var activeLesson = data.content[data.content.length - 1].locked ==
      // },function(err){
      //   $log.error("TYPES ERROR happened",err)
      // })

      content.getActiveResource().then(function(lesson){
        $log.debug('Fetching doc named "notif'+'-content-'+lesson.node.parent+'"')
        return db.get('notif'+'-content-'+lesson.node.parent).then(function(doc){
          $log.debug("DOC",doc);
          defer.resolve(doc);
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

    // function defineTypes(){
    //   $log.debug("IN DEFINE")
    //   return fetchDocs().then(function(data){
    //     // $log.debug('THIS IS DATA',data)
    //     var now = new Date().getTime();
    //     return {
    //       'discovered' : {
    //         id: data._id,
    //         title: data.title,
    //         text: data.text,
    //         at: (function(){
    //           new Date(now + 10 * 1000)
    //         })()
    //       },
    //       'undiscovered' : {
    //         type: "content",
    //         loops: 1,
    //         interval: 24,
    //         title: "Hey"
    //       }
    //     }
    //   },function(err){
    //     $log.warn('Can\'t define types. Error ',err)
    //   })
    // }

    function set(type){
      $log.debug("setting notification",type)
      fetchDocs().then(function(data){
        $log.debug("SCHEDULE",defineType(data,type));
        schedule(defineType(data,type));
      },function(err){
        $log.warn('Can\'t schedule notification',err)
      })

      // $log.debug('RETURN',defineTypes().discovered);
      // try{
      //   $cordovaLocalNotification.schedule({
      //     id: defineTypes().discovered.id,
      //     text: defineTypes().discovered.text,
      //     title: defineTypes().discovered.title,
      //     at: defineTypes().discovered.at
      //   }).then(function () {
      //     $log.debug("Notification was placed. HEHEHEHE");
      //     // alert("Instant Notification set");
      //   });
      // }catch(err){
      //   $log.debug("notification threw error ",err)
      // }
    }

    function schedule(data){
      try{
        $cordovaLocalNotification.schedule({
          id: data._id,
          text: data.text,
          title: data.title,
          at: data.at
        }).then(function () {
          $log.debug("Notification was placed. HEHEHEHE");
          // alert("Instant Notification set");
        });
      }catch(err){
        $log.debug("notification threw error ",err)
      }
    }

    function defineType(data,type){
      var now = new Date();
      var returnType;
      switch(type){
        case 'discovered': 
          returnType = {
            id: data._id,
            at: 1,
            title: "Let's play",
            text: "Hey, let's resume your learning"
          };
          break;
        case 'undiscovered':
          returnType = {
            id: data._id,
            at: 5,
            title: data.title,
            text: data.text
          };
          break;
        default:
          returnType = false;
      }
      return returnType;
    } 
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

  }
})();