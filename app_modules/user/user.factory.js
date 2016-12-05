(function () {
  'use strict';
  angular
    .module('zaya-user')
    .factory('User', User)
  User.$inject = [
    'CONSTANT',
    '$log',
    '$q',
    'pouchDB',
    'queue',
    'device',
    '$injector'

  ];

  function User(CONSTANT,
                $log,
                $q,
                pouchDB,
                queue,
                device,
                $injector) {

    var User = {};
    var profilesDB = pouchDB('profilesDB',{revs_limit: 1});
    // var remoteProfilesDb = pouchDB('http://anna:secret@127.0.0.1:5984/device'+device.uuid);

    // var myIndex = {
    //   _id: '_design/profile',
    //   "filters": {
    //     "by_profile": function(doc, req) {
    //       if(doc._id === '_design/profile'){
    //         return true;
    //       }
    //       if(doc.data){
    //         return (doc.data.device_id === req.query.device_id);
    //       }
    //       return false;
    //     }.toString()
    //   }
    // };


    // profilesDB.put(myIndex).finally(function(){
    //   $log.debug("Device uuid",device.uuid);
    //   if(device.uuid){
        // PouchDB.replicate( 'http://ci-couch.zaya.in/profilesdb','profilesDB',{live: true,
        //   retry: true,
        //   filter: 'profile/by_profile',
        //   query_params: { "device_id": device.uuid}
        // }).on('change', function (info) {
        //   $log.debug("change")
        //   // handle change
        // }).on('paused', function (err) {
        //   $log.debug("paused")
        //
        //   // replication paused (e.g. replication up to date, user went offline)
        // }).on('active', function () {
        //   $log.debug("active")
        //
        //   // replicate resumed (e.g. new changes replicating, user went back online)
        // }).on('denied', function (err) {
        //   $log.debug("denied")
        //
        //   // a document failed to replicate (e.g. due to permissions)
        // }).on('complete', function (info) {
        //   // handle complete
        //   $log.debug("completed")
        //
        // }).on('error', function (err) {
        //   // handle error
        //   $log.debug("error")
        //
        // });
    //   }
    // });
    var appDB = pouchDB('appDB');
    var initial_skills = [
      {
        "id": "fd6044b3-aa49-4599-b1b9-e66d3cb03bce",
        "title": "Vocabulary",
        "lesson_scores": 0,
        "question_scores": 0
      },
      {
        "id": "18059dd6-a37d-44f0-9e92-efca7ec31d3b",
        "title": "Reading",
        "lesson_scores": 0,
        "question_scores": 0
      },
      {
        "id": "d82f6ac3-6401-49f5-b787-642b041cfa9e",
        "title": "Grammar",
        "lesson_scores": 0,
        "question_scores": 0
      },
      {
        "id": "f0f0d75b-8671-49db-b2d0-5b0ba6135be8",
        "title": "Listening",
        "lesson_scores": 0,
        "question_scores": 0
      }
    ];

    function generateProfileID() {
      var d = new Date().getTime();
      var random_uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return device.uuid + '_' + random_uuid
    }

    User.getActiveProfileSync = getActiveProfileSync;
    User.setActiveProfileSync = setActiveProfileSync;
    User.updateActiveProfileSync = updateActiveProfileSync;
    User.user = {
      getIdSync: getUserIdSync
    };
    User.profile = {
      add: addNewProfile,
      update: updateProfile,
      // set: setActiveProfile,
      get: get,
      getAll: getAllProfiles,
      patch: patchProfile,
      updateRoadMapData: updateRoadMapData,
      select : selectProfile
    };
    User.skills = {
      get: getSkills,
      update: updateSkills
    };
    User.scores = {
      getScoreList: getScoreList,
      getScoreOfLesson: getScoreOfLesson,
      getScoreOfResource: getScoreOfResource,
      update: updateScores,
      getScoreOfAssessment: getScoreOfAssessment
    };
    User.reports = {
      save: saveReport
    };
    User.demo = {
      isShown: isDemoShown,
      getStep: getDemoStep,
      setStep: setDemoStep
    }
    User.playlist = {
        get: getUserPlaylist,
        add: addNodeToPlaylist,
      patch: patchUserPlaylist
    }
    User.checkIfProfileOnline = checkIfProfileOnline;
    User.startProfileSync = startProfileSync;
    function startProfileSync() {

      PouchDB.replicate('profilesDB', CONSTANT.PROFILES_DB_SERVER+device.uuid, {
        live: true,
        retry: true,
        heartbeat: false
      }).on('paused', function (err) {
        $log.debug("Paused in profile db sync",err);
      })
    }
    function updateRoadMapData(roadMapData,profileId) {
      $log.debug("updateRoadMapData",roadMapData,profileId)
      return profilesDB.get(profileId).then(function (response) {
        $log.debug("profile",response)
        var doc = response.data;
        doc.roadMapData = roadMapData;
        updateActiveProfileSync({'_id': profileId, 'data': doc});
        return profilesDB.put({
          '_id': profileId,
          '_rev': response._rev,
          'data': doc
        })
      })
    }
    function checkIfProfileOnline() {
      $log.debug("UUID",device.uuid)
      return PouchDB.replicate( CONSTANT.PROFILES_DB_SERVER+device.uuid, 'profilesDB',{retry:true}).then(function () {
        return profilesDB.allDocs({
          include_docs: true
        })
      })


    }

    function selectProfile(profile) {
        // $log.debug("ALLdocs",docs.rows[0].doc);
        $log.debug("selectProfile",profile)

        if(profile ){
          setActiveProfileSync(profile.doc);
          if(profile.doc.data.playlist.length){
            localStorage.setItem('diagnosis_flag',true);
            localStorage.setItem('demo_flag',5);
          }else{
            localStorage.setItem('diagnosis_flag',false);
            localStorage.setItem('demo_flag',1);
          }
          if(profile.doc.data.roadMapData){
            $log.debug("Setting roadmap data")
            localStorage.setItem('roadMapData',JSON.stringify(profile.doc.data.roadMapData));

          }

        }
    }

    function getUserIdSync() {
      return JSON.parse(localStorage.getItem('user_details')).id
    }

    function getAllProfiles() {
      return profilesDB.allDocs({
        include_docs: true
      }).then(function (response) {
        return response.rows;
      })
    }

    function addNewProfile(profile) {

      var record = {
        "_id": generateProfileID(),

        "data": {
          "device_id": device.uuid,
          "scores": {},
          "reports": [],
          "skills": initial_skills,
          "profile": profile,
          "playlist": []
        }
      };
      profile.client_uid = record._id;

      $log.debug("Adding new profile",record);
      return profilesDB.put(record)
        .then(function () {

          // PouchDB.sync('profilesDB', 'http://ci-couch.zaya.in/profilesdb',{live: true,
          //   retry: true,
          //   filter: 'app/by_profile',
          //   query_params: { "profile_id": profile.client_uid }});
          startProfileSync();
          return queue.push('profiles', profile);
        }).then(function () {
          return record;
        })
        .catch(function (e) {

        })
    }


    function patchProfile(profile, id) {


      var record = {
        "_id": id ? id : generateProfileID(),
        "data": {
          "scores": {},
          "reports": [],
          "skills": initial_skills,
          "profile": profile
        }
      };
      return appDB.get(id).then(function (response) {

        record.data.scores = response.data.scores;
        record.data.skills = response.data.skills;

        return profilesDB.put(record)

      })
        .then(function(){
          var temp = profile;
          temp.client_uid = id;

          return updateProfile(id,temp)
        })

        .then(function(){

          User.setActiveProfileSync(record);

          return $injector.get('content').createLessonDBIfNotExistsPatch()
        })
        .then(function () {

          $log.debug("Lesson db is now created")
          return record;
        })
      .catch(function(error){


      })
    }

    function getActiveProfileSync() {
      return JSON.parse(localStorage.getItem('profile'));
    }

    function updateActiveProfileSync(profile) {
      return localStorage.setItem('profile', JSON.stringify(profile));
    }

    function updateProfile(profileId, profileData) {


      var new_profile;
      return profilesDB.get(profileId).then(function (response) {
        new_profile = response;
        new_profile.data.profile = profileData;
        return profilesDB.put(new_profile);
      }).then(function () {
        var temp = new_profile.data.profile;
        // delete temp['client_uid'];


        if(profileId == temp['client_uid'])
        {
          $log.debug("Deleteinh clientUid",temp)
          delete temp['client_uid'];
        }
        return queue.push('/profiles/' + profileId, temp, 'patch')
      })
        .then(function () {

          updateActiveProfileSync(new_profile);
          return $injector.get('content').createLessonDBIfNotExists()
        })
        .catch(function (e) {

        });
      // profile.grade = newGrade;
      // Auth.updateProfile(profile);

      // return data.createIfNotExistsLessonDB()

    }

    function setActiveProfileSync(profile) {
      localStorage.setItem('profile', JSON.stringify(profile));
      return true;
    }

    function get(profileId) {

    }

    function getSkills(profileId) {

      return profilesDB.get(profileId).then(function (response) {

        return response.data.skills;
      })
    }


    function updateSkills(data) {

      return profilesDB.get(data.profileId).then(function (response) {
        var doc = response.data;
        angular.forEach(doc.skills, function (skill, key) {
          if (skill.title == data.skill) {
            doc.skills[key].lesson_scores += data.score;
          }
        })
        updateActiveProfileSync({'_id': data.profileId, 'data': doc});
        return profilesDB.put({
          '_id': data.profileId,
          '_rev': response._rev,
          'data': doc
        })
      })
        .catch(function (error) {
        })
    }


    function getScoreList(profileId) {
      return profilesDB.get(profileId).then(function(response){
        return response.data.playlist;
      })
    }

    function getScoreOfLesson(lessonId, profileId) {
      $log.debug("get score of lesson");
      return profilesDB.get(profileId).then(function (response) {

        return response.data.scores[lessonId];
      })

    }
    function getScoreOfResource(lessonId, resourceId, profileId, playlistIndex) {
      $log.debug("getScoreOfResource",lessonId, resourceId, profileId, playlistIndex)
      return profilesDB.get(profileId).then(function (response) {
        $log.debug("RESO",response.data.playlist[playlistIndex],response.data.playlist[playlistIndex][resourceId],response.data.playlist[playlistIndex]['lesson_id'])
          if(response.data.playlist[playlistIndex]['lesson_id'] == lessonId && response.data.playlist[playlistIndex][resourceId]){
              return response.data.playlist[playlistIndex][resourceId];
          }
          else{
              return null
          }
      })

    }

    function updateScores(data) {
        $log.debug("Updatign scores",data)

      return profilesDB.get(data.profileId).then(function (response) {
        var doc = response.data;
        // if (!doc.scores.hasOwnProperty(data.lessonId)) {
        //   doc.scores[data.lessonId] = {};
        // }

        $log.debug(doc.playlist[data.playlist_index],"Check it");
        doc.playlist[data.playlist_index][data.id] = {
          'score': data.score,
          'totalScore': data.totalScore,
          'type': data.type,
          'skill' : data.skill
        };
        // doc.scores[data.lessonId][data.id] = {
        //   'score': data.score,
        //   'totalScore': data.totalScore,
        //   'type': data.type,
        //   'skill' : data.skill
        // };
        // $log.debug("HERE",doc.scores[data.lessonId][data.id] )
        var temp = JSON.parse(localStorage.getItem('lesson'));
        temp.score = doc.scores[data.lessonId];

        localStorage.setItem('lesson', JSON.stringify(temp));
        return profilesDB.put({
          '_id': data.profileId,
          '_rev': response._rev,
          'data': doc
        });
      })


    }

    function saveReport(report) {
      return queue.push('reports', {
        'client_uid': report.profileId,
        'node': report.node,
        'score': report.score,
        'attempts': report.attempts
      })
    }

    function getScoreOfAssessment(assessmentId, lessonId, profileId, playlistIndex) {
      return profilesDB.get(profileId).then(function (response) {
        var result = null;
        if (response.data.playlist[playlistIndex]) {
          if (response.data.playlist[playlistIndex].hasOwnProperty(assessmentId)) {
            result = response.data.playlist[playlistIndex][assessmentId]
            $log.debug("GEt score of assessment",result)
          }
        }
        return result
      })
    }


    function isDemoShown(step) {
      var skills = getActiveProfileSync().data.skills;
      var score = 0;
      angular.forEach(skills, function (skill) {
        score = score + skill.lesson_scores;
      });

      if (step && step === 5 && score === 50) {
        return true;
      }
      return score ? false : true;
    }

    function getDemoStep() {
      return parseInt(localStorage.getItem('demo_flag'));
    }

    function setDemoStep(step) {
      localStorage.setItem('demo_flag', step);
    }

    function getUserPlaylist(profileId) {
      $log.debug("In user playlist")
      return profilesDB.get(profileId).then(function (response) {
        if(response.data.playlist)
          return response.data.playlist;
        else
          return getPatchedUserPlaylist(profileId);
      })
    }

    function patchUserPlaylist(profileId){
      return getPatchedUserPlaylist(profileId)
    }

    function getPatchedUserPlaylist(profileId){
      var d = $q.defer();
      $log.debug("Inside patch playlist")
      var promises = [];

      profilesDB.get(profileId).then(function (response) {
          $log.debug("Scores found "+profileId+ JSON.stringify(response.data.scores))
        if(response.data.scores){
          $log.debug("Scores found ")
            response.data.playlist = [];
          $injector.get('content').createLessonDBIfNotExists().then(function(){
            angular.forEach(response.data.scores,function(lesson,lesson_id){
              $log.debug("Lesson id  "+lesson_id);
              var tmp = $injector.get('content').getLesson(lesson_id).then(function(lesson_details){
                var pl = {'lesson_id':lesson_id};
                $log.debug("Got lesson  "+lesson_id);

                angular.forEach(lesson,function(resource,resource_id){
                  pl[resource_id] = resource;
                  pl[resource_id]['skill'] = lesson_details.node.tag
                });
                $log.debug("Pushing a pl in playlist");
                return response.data.playlist.push(pl);

              });
              promises.push(
               tmp
              )

            });
            $q.all(promises).then(function(){
              response.data.scores = {};
              $log.debug("Patched profile for updation "+JSON.stringify(response.data));

              return profilesDB.put({
                '_id': profileId,
                '_rev': response._rev,
                'data': response.data
              });
            })
              .then(function(){
                $log.debug("Returning"+JSON.stringify(response.data.playlist) + " END");

                d.resolve(response.data.playlist);
              })
              .catch(function(e){
                $log.debug("ERROR"+JSON.stringify(e))
              })
          })
        }
      })
      return d.promise;
    }
    function addNodeToPlaylist(profileId,nodeData) {
      return profilesDB.get(profileId).then(function (response) {
        response.data.playlist.push({'lesson_id':nodeData.suggestedLesson,'dependencyData':nodeData.dependencyData});
        $log.debug("Response",response);
        return profilesDB.put({
          '_id': profileId,
          '_rev': response._rev,
          'data': response.data
        })
      })
    }

    return User;


  }
})();