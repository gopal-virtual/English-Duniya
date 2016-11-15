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

    // function dummyData() {
    //   return {
    //     '0092ac4b-1da2-41e3-81e1-2700274c78f0' : {
    //       id : (function(){
    //         return new Date().getTime().toString();
    //       })(),
    //       title : 'Lesson 1',
    //       text : 'Kids learn when to use the words “less than” and “fewer than”, e.g. “I have fewer pencils” vs “he drinks less water”',
    //       type : "content"
    //     },
    //     '0234146d-f0ae-49d4-9d4f-c74fe4fef312' : {
    //       id : (function(){
    //         return new Date().getTime().toString();
    //       })(),
    //       title : 'Lesson 2',
    //       text : '2Kids learn when to use the words “less than” and “fewer than”, e.g. “I have fewer pencils” vs “he drinks less water”',
    //       type : "content"
    //     },
    //     '02c46cce-74d9-4fbc-877d-d993eb9427f5' : {
    //       id : (function(){
    //         return new Date().getTime().toString();
    //       })(),
    //       title : 'Lesson 3',
    //       text : '3Kids learn when to use the words “less than” and “fewer than”, e.g. “I have fewer pencils” vs “he drinks less water”',
    //       type : "content"
    //     }
    //   }
    // }

    // function createDummy(db){
    //   $log.debug("adding new documents")
    //   var notifData = dummyData();
    //   for(var key in notifData){
    //     db.put({
    //       _id: (function(){
    //         return "notif-"+notifData[key].type+"-"+key
    //       })(),
    //       data: notifData[key]
    //     }).then(function(response){
    //       $log.debug("Notification has been created and is populated. Response is ",response)
    //     }).catch(function (err) {
    //       $log.error("Error with creating dummy data, ",err)
    //     });
    //   }
    // }



    function createDb() {
      $log.debug("creating db")
      var notificationDB = new PouchDB('notificationDB');
      createDummy(notificationDB);
    }


    function fetchDocs(){
      $log.info("Fetching Docs ...");
      var db = new PouchDB('notificationDB');
      var defer = $q.defer();
      content.getActiveLessonId().then(function(lessonId){
        $log.debug('Fetching doc named "notif'+'-content-'+lessonId+'"')
        return db.get('notif'+'-content-'+lessonId).then(function(doc){
          $log.debug("DOC",doc);
          defer.resolve(doc);
        }).catch(function(err){
          if(err.status == 404){
            $log.warn('Notification was not set. The doc named "notif'+'-content-'+lessonId+'" was not found. Check the database perhaps')
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
        schedule(defineType(data,type));
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

  }
})();