(function () {
  'use strict';

  angular
    .module('common')
    .factory('content', content);

  content.$inject = [
    'pouchDB',
    '$log',
    'CONSTANT',
    '$q',
    'mediaManager',
    '$interval',
    'User',
    'widgetParser'
  ];

  /* @ngInject */
  function content(pouchDB,
                   $log,
                   CONSTANT,
                   $q,
                   mediaManager,
                   $interval,
                   User,
                   widgetParser) {

    var lessonDB = null;

    if (User.getActiveProfileSync() && User.getActiveProfileSync().data) {
      lessonDB = pouchDB('lessonsGrade' + User.getActiveProfileSync().data.profile.grade, {
        adapter: 'websql'
      });
    }
    var contentProperties = {
      createLessonDBIfNotExists: createLessonDBIfNotExists,
      createLessonDBIfNotExistsPatch: createLessonDBIfNotExistsPatch,
      getLessonsList: getLessonsList,
      getResourceList: getResourceList,
      getAssessment: getAssessment,
      getLesson: getLesson,
      downloadAssessment: downloadAssessment,
      downloadVideo: downloadVideo,
      demo_question: {
        "node": {
          "id": CONSTANT.QUESTION.DEMO,
          "content_type_name": "json question",
          "type": {
            "id": CONSTANT.QUESTION.DEMO,
            "created": "2016-07-08T14:44:19.871339Z",
            "updated": "2016-07-08T14:44:19.871370Z",
            "microstandard": "ELL.1.RE.V.9.MOB",
            "is_critical_thinking": false,
            "level": 1,
            "answer": [2],
            "score": 10,
            "content": {
              "is_multiple": false,
              "widgets": {
                "videos": {},
                "sounds": {},
                "images": {
                  "1": "/media/ell/images/dog_O5P4I8.png",
                  "2": "/media/ell/images/person_9FDOFJ.png",
                  "3": "/media/ell/images/place_KJMRCN.png",
                  "4": "/media/ell/images/animal_7C4FVV.png",
                  "5": "/media/ell/images/thing_0IS1M4.png"
                }
              },
              "instruction": null,
              "options": [{
                "option": "person [[img id=2]]",
                "key": 1
              }, {
                "option": "place [[img id=3]]",
                "key": 3
              }, {
                "option": "animal [[img id=4]]",
                "key": 2
              }, {
                "option": "thing [[img id=5]]",
                "key": 4
              }],
              "tags": [],
              "hints": "[]"
            },
            "type": "choicequestion"
          },
          "tag": null,
          "created": "2016-07-08T14:44:19.881208Z",
          "updated": "2016-07-08T14:44:19.881242Z",
          "title": "dog [[img id=1]]",
          "description": "",
          "object_id": "e3ea1ecb-997a-4d2f-9a45-378fa3201e57",
          "status": "PUBLISHED",
          "lft": 936,
          "rght": 937,
          "tree_id": 1,
          "level": 3,
          "parent": "29f41d84-fda3-4964-94be-25a6800d93a3",
          "content_type": 21,
          "account": "150c906a-c3ef-4e2b-a19d-c77fdabf2015"
        },
        "objects": []
      }
    };

    return contentProperties;

    function createLessonDBIfNotExists() {
      lessonDB = pouchDB('lessonsGrade' + User.getActiveProfileSync().data.profile.grade, {
        adapter: 'websql'
      });



      return lessonDB.get('_local/preloaded').then(function (doc) {


      }).catch(function (err) {
        if (err.name !== 'not_found') {
          throw err;
        }
        $log.debug("NEW DB MADE");
        return lessonDB.load(CONSTANT.PATH.DATA + '/lessonsGrade' + User.getActiveProfileSync().data.profile.grade + '.db').then(function () {
          return lessonDB.put({
            _id: '_local/preloaded'
          });
        })

      })
    }

    function createLessonDBIfNotExistsPatch() {
      lessonDB = pouchDB('lessonsGrade' + User.getActiveProfileSync().data.profile.grade, {
        adapter: 'websql'
      });

      return lessonDB.allDocs()
        .then(function(result){

          return Promise.all(result.rows.map(function(row){

            return lessonDB.remove(row.id,row.value.rev);
          }))
        })
        .then(function(){

          return lessonDB.load(CONSTANT.PATH.DATA + '/lessonsGrade' + User.getActiveProfileSync().data.profile.grade + '.db')
        })
        .then(function () {

          return lessonDB.put({
            _id: '_local/preloaded'
          });
        })
        .catch(function(e){

        })

    }

    function getLessonsList() {
      var d = $q.defer();
      lessonDB.allDocs({
        include_docs: true
      }).then(function (data) {


        var lessons = [];
        for (var i = 0; i < data.rows.length; i++) {
          data.rows[i].doc.lesson.node.key = data.rows[i].doc.lesson.key;
          lessons.push(data.rows[i].doc.lesson.node);
        }
        lessons = _.sortBy(lessons, 'key');

        d.resolve(lessons)
      })
        .catch(function (error) {
          d.reject(error)
        });

      return d.promise;
    }
    function getResourceList () {
      var d = $q.defer();
      lessonDB.allDocs({
        include_docs: true
      }).then(function (data) {
        $log.debug(data)
        for (var i = 0; i < data.rows.length; i++) {
          data.rows[i].key = data.rows[i].doc.lesson.key;
        }
        data.rows = _.sortBy(data.rows, 'key');
        var lessons = [];
        for ( i = 0; i < data.rows.length; i++) {
          data.rows[i].doc.lesson.node.key = data.rows[i].doc.lesson.key;
          for (var c = 0; c < data.rows[i].doc.lesson.objects.length; c++) {
            if(data.rows[i].doc.lesson.node.meta && data.rows[i].doc.lesson.node.meta.intros && data.rows[i].doc.lesson.node.meta.intros.sound && data.rows[i].doc.lesson.node.meta.intros.sound[0]){
              data.rows[i].doc.lesson.objects[c].node.intro_sound = data.rows[i].doc.lesson.node.meta.intros.sound[0];
            }
            data.rows[i].doc.lesson.objects[c].node.tag = data.rows[i].doc.lesson.node.tag;
            lessons.push(data.rows[i].doc.lesson.objects[c])
          }
        }
          $log.debug("lessons",lessons)
        d.resolve(lessons)
      })
        .catch(function (error) {
          d.reject(error)
        });

      return d.promise;
    }

    function getAssessment(quiz) {
      var d = $q.defer();
      var promises = [];
      for (var index = 0; index < quiz.objects.length; index++) {
        if (quiz.objects[index].node.meta && quiz.objects[index].node.meta.instructions && quiz.objects[index].node.meta.instructions.sounds[0] && localStorage.getItem(quiz.objects[index].node.meta.instructions.sounds[0]) != 'played') {
          localStorage.setItem(quiz.objects[index].node.meta.instructions.sounds[0], 'played');
          promises.push(mediaManager.getPath(quiz.objects[index].node.meta.instructions.sounds[0]).then(
            function (index) {
              return function (path) {
                quiz.objects[index].node.instructionSound = path
              }
            }(index)
          ))
        }

        promises.push(widgetParser.parseToDisplay(quiz.objects[index].node.title, index, quiz).then(
          function (index) {
            return function (result) {
              quiz.objects[index].node.widgetHtml = result;
            }
          }(index)
        ));
        quiz.objects[index].node.widgetSound = null;
        if (widgetParser.getSoundId(quiz.objects[index].node.title)) {
          promises.push(widgetParser.getSoundSrc(widgetParser.getSoundId(quiz.objects[index].node.title), index, quiz).then(
            function (index) {
              return function (result) {
                quiz.objects[index].node.widgetSound = result;
              }
            }(index)
          ))
        }

        for (var j = 0; j < quiz.objects[index].node.type.content.options.length; j++) {
          promises.push(widgetParser.parseToDisplay(quiz.objects[index].node.type.content.options[j].option, index, quiz).then(
            function (index, j) {
              return function (result) {
                quiz.objects[index].node.type.content.options[j].widgetHtml = result;
              }
            }(index, j)
          ));
          quiz.objects[index].node.type.content.options[j].widgetSound = null;

          if (widgetParser.getSoundId(quiz.objects[index].node.type.content.options[j].option)) {
            promises.push(widgetParser.getSoundSrc(widgetParser.getSoundId(quiz.objects[index].node.type.content.options[j].option), index, quiz).then(
              function (index, j) {
                return function (result) {
                  quiz.objects[index].node.type.content.options[j].widgetSound = result;
                }
              }(index, j)
            ))
          }
        }
      }
      $q.all(promises).then(function () {
        d.resolve(quiz)
      });
      return d.promise;
    }

    function getLesson(id) {
      return lessonDB.get(id).then(function (data) {
        return data.lesson;
      });
    }

    function downloadVideo(video) {

      return mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER + video.node.type.path)
    }

    function downloadAssessment(assessment) {

      var d = $q.defer();
      var promises = [];
      var mediaArray = [];

      angular.forEach(assessment.objects, function (object) {
        if (object.node.meta.instructions && object.node.meta.instructions.sounds) {
          promises.push(
            mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER + object.node.meta.instructions.sounds[0])
          );
        }
        angular.forEach(object.node.type.content.widgets, function (widget) {
          angular.forEach(widget, function (file) {
            if (mediaArray.indexOf(file) < 0) {
              mediaArray.push(file);
              promises.push(
                mediaManager.downloadIfNotExists(CONSTANT.RESOURCE_SERVER + file)
              );
            }
          })
        })
      });
      $q.all(promises).then(function (success) {
        d.resolve(success);
      })
        .catch(function (err) {
          d.reject(err)
        });
      return d.promise;

    }

  }

})();
