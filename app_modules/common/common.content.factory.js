(function() {
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
    'widgetParser',
    'extendLesson',
    '$http',
    '$rootScope'
  ];
  /* @ngInject */
  function content(pouchDB,
    $log,
    CONSTANT,
    $q,
    mediaManager,
    $interval,
    User,
    widgetParser,
    extendLesson,
    $http,
    $rootScope
  ) {
    // var lessonDB = null;
    // if (User.getActiveProfileSync() && User.getActiveProfileSync().data) {
    var lessonDB = pouchDB('lessonsDB', {
      revs_limit: 1,
      // auto_compaction : true
    });
    var diagnosisTranslationsDB = pouchDB('diagnosisTranslationsDB', {
      revs_limit: 1,
      // auto_compaction : true
    });
    // createDiagnosisTranslationsDB();
    // }
    var contentProperties = {
      createLessonDBIfNotExists: createLessonDBIfNotExists,
      createOrUpdateLessonDB: createOrUpdateLessonDB,
      createLessonDBIfNotExistsPatch: createLessonDBIfNotExistsPatch,
      getLessonsList: getLessonsList,
      getResourceList: getResourceList,
      getAssessment: getAssessment,
      getLesson: getLesson,
      getVocabulary: getVocabulary,
      downloadVocabulary: downloadVocabulary,
      downloadAssessment: downloadAssessment,
      downloadVideo: downloadVideo,
      downloadLesson: downloadLesson,
      findNewMediaToDownload: findNewMediaToDownload,
      downloadNewMedia: downloadNewMedia,
      getActiveResource: getActiveResource,
      getActiveLessonId: getActiveLessonId,
      replicateLessonDB: replicateLessonDB,
      getLocalizedNode: getLocalizedNode,
      getLocalizedQuestion: getLocalizedQuestion,
      getStatus: getStatus,
      deleteLessonDB: deleteLessonDB,
      createDependentDBs: createDependentDBs,
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

    function deleteLessonDB() {
      $log.debug("tag deletelessondb")
      return lessonDB.erase();
    }

    function createDiagnosisTranslationsDB() {
      return diagnosisTranslationsDB.load(CONSTANT.PATH.DATA + '/diagnosis_translations.db');
    }

    function createDependentDBs() {
      var createLessonsDB = createOrUpdateLessonDB();
      var createtranslationsDB = createDiagnosisTranslationsDB()
      return $q.all(createLessonsDB, createtranslationsDB);
    }

    function replicateLessonDB() {
      if (!$rootScope.lessonDBReplicationStarted) {
        $log.debug("Replication");
        $rootScope.lessonDBReplicationStarted = true;
        lessonDB.replicate.from(CONSTANT.LESSONS_DB_SERVER, {
            retry: true,
            timeout: 20000
          }).$promise
          .then(null, null, function(progress) {
            $log.debug('lessondb replication status', progress);
            if (progress.paused && (progress.paused.name === 'indexed_db_went_bad' || progress.paused.name == "InvalidStateError" || progress.paused.reason === "QuotaExceededError")) {
              $rootScope.$broadcast('lowDiskSpace')
            }
          })
          .then(function(result) {
            $log.debug('lessondb replication resolved with', result);
          })
          .catch(function(reason) {
            $log.debug('lessondb replication failed with', reason);
          })
          .finally(function() {
            $log.debug('lessondb replication done');
          });
      }
    }

    function getLocalizedNode(nodeId, targetLanguage) {
      return lessonDB.get('localized_mapping').then(function(localizationMapping) {
        return (localizationMapping.mapping[nodeId] && localizationMapping.mapping[nodeId][targetLanguage]) || nodeId;
      });
    }

    function getLocalizedQuestion(questionId, targetLanguage) {
      return lessonDB.get('localized_mapping').then(function(localizationMapping) {

        if(localizationMapping.mapping[questionId] && localizationMapping.mapping[questionId][targetLanguage]){
        var translatedQuestionID = localizationMapping.mapping[questionId][targetLanguage];
           return diagnosisTranslationsDB.get(translatedQuestionID).then(function(question) {
          return question.question;
        });
         }else{
          return questionId;
         }

      })
    }

    function findNewMediaToDownload() {
      $rootScope.mediaSyncStatus.checkingMedia = true;
      $log.debug("findNewMediaToDownload");
      var promises = [];
      var promises2 = [];
      var mediaToDownload = [];
      return getResourceList().then(function(lessons) {
        return extendLesson.getLesson(lessons).then(function(result) {
          $log.debug("lessons extended", result);
          var lessonlist = [];
          angular.forEach(result, function(lesson) {
            $log.debug("lesson", lesson)
            if (lesson.stars == -1 || lesson.stars > 0) {
              lessonlist.push(lesson)
            }
          });
          var media = getMediaListfromResourceList(lessonlist);
          angular.forEach(media, function(url) {
            promises.push(mediaManager.getPath(url));
          });
          $log.debug("All paths get")
          return $q.all(promises).then(function(r) {
            $log.debug("Result", r);
            var size = 0;
            angular.forEach(r, function(url) {
              if (url.split(":")[0] === 'https') {
                mediaToDownload.push(url)
              }
            });
            angular.forEach(mediaToDownload, function(url) {
              if (url.split(":")[0] === 'https') {
                promises2.push($http.head(url))
              }
            });
            return $q.all(promises2).then(function(response) {
              angular.forEach(response, function(data) {
                size = size + parseInt(data.headers("Content-Length"));
              })
              $log.debug("Size is ", size, parseFloat(size / (1024 * 1024)).toFixed(1));
              $rootScope.mediaSyncStatus.checkingMedia = false;
              if (mediaToDownload.length) {
                $log.debug("mediaToDownload.length", mediaToDownload.length)
                  // $rootScope.$broadcast('showInfoIcon',true)
              } else {
                // $rootScope.$broadcast('showInfoIcon',false)
              }
              return {
                size: parseFloat(size / (1024 * 1024)).toFixed(1),
                mediaToDownload: mediaToDownload
              }
            });
          })
        });
      })
    }

    function downloadNewMedia() {
      $rootScope.mediaSyncStatus.downloadingMedia = true;
      var promises = [];
      return findNewMediaToDownload().then(function(mediaSyncStatus) {
        $rootScope.mediaSyncStatus = mediaSyncStatus;
        angular.forEach($rootScope.mediaSyncStatus.mediaToDownload, function(url) {
          promises.push(mediaManager.downloadIfNotExists(url));
        });
        return $q.all(promises);
      }).then(function() {
        $rootScope.mediaSyncStatus.downloadingMedia = false;
        $rootScope.mediaSyncStatus.size = 0;
        $rootScope.mediaSyncStatus.mediaToDownload = [];
        // $rootScope.$broadcast('showInfoIcon',false)
      })
    }

    function getMediaListfromResourceList(resourceList) {
      $log.debug("getMediaListfromResourceList");
      var media = [];
      angular.forEach(resourceList, function(resource) {
        $log.debug(resource.node.content_type_name);
        if (resource.node.content_type_name === 'resource') {
          if (resource.node.intro_sound && media.indexOf(resource.node.intro_sound) < 0) {
            media.push(resource.node.intro_sound);
          }
          if (resource.node.type.path && media.indexOf(resource.node.type.path) < 0) {
            media.push(resource.node.type.path);
          }
        }
        if (resource.node.content_type_name === 'assessment') {
          if (resource.node.intro_sound && media.indexOf(resource.node.intro_sound) < 0) {
            media.push(resource.node.intro_sound);
          }
          angular.forEach(resource.objects, function(question) {
            if (question.node.meta.instructions.sounds && media.indexOf(question.node.meta.instructions.sounds[0]) < 0) {
              media.push(question.node.meta.instructions.sounds[0]);
            }
            var url_index, url;
            if (question.node.type.content.widgets.images) {
              for (url_index in question.node.type.content.widgets.images) {
                if (question.node.type.content.widgets.images.hasOwnProperty(url_index)) {
                  url = question.node.type.content.widgets.images[url_index];
                  // $log.debug("images found",url,question.node.type.content.widgets.images.hasOwnProperty(url),media.indexOf(url));
                  if (media.indexOf(url) < 0) {
                    media.push(url);
                  }
                }
              }
            }
            if (question.node.type.content.widgets.sounds) {
              for (url_index in question.node.type.content.widgets.sounds) {
                if (question.node.type.content.widgets.sounds.hasOwnProperty(url_index)) {
                  url = question.node.type.content.widgets.sounds[url_index];
                  // $log.debug("images found",url,question.node.type.content.widgets.images.hasOwnProperty(url),media.indexOf(url));
                  if (media.indexOf(url) < 0) {
                    media.push(url);
                  }
                }
              }
            }
          })
        }
      });
      return media;
    }

    function createLessonDBIfNotExists() {
      $log.debug("createLessonDBIfNotExists")
        // lessonDB = pouchDB('lessonsDB', {
        //   revs_limit: 1
        // });
      return lessonDB.get('_local/preloaded').then(function(doc) {}).catch(function(err) {
        if (err.name !== 'not_found') {
          throw err;
        }
        $log.debug("NEW DB MADE 1");
        return lessonDB.load(CONSTANT.PATH.DATA + '/lessons.db').then(function() {
          $log.debug("NEW DB MADE 2");
          return lessonDB.put({
            _id: '_local/preloaded'
          });
        })
      })
    }

    function createOrUpdateLessonDB() {
      $log.debug("create or update lessondb")
        // lessonDB = pouchDB('lessonsDB', {
        //   revs_limit: 1
        // });
      $log.debug("NEW DB MADE 1");
      return lessonDB.load(CONSTANT.PATH.DATA + '/lessons.db', {
        // proxy: CONSTANT.LESSONS_DB_SERVER
      })
    }

    function createLessonDBIfNotExistsPatch() {
      // lessonDB = pouchDB('lessonsDB', {
      //   revs_limit: 1
      // });
      return lessonDB.get('_local/preloaded').then(function(doc) {}).catch(function(err) {
        if (err.name !== 'not_found') {
          throw err;
        }
        $log.debug("NEW DB MADE 1");
        return lessonDB.load(CONSTANT.PATH.DATA + '/lessons.db').then(function() {
          $log.debug("NEW DB MADE 2");
          return lessonDB.put({
            _id: '_local/preloaded'
          });
        })
      })
    }

    function getLessonsList() {
      var d = $q.defer();
      lessonDB.allDocs({
          include_docs: true
        }).then(function(data) {
          var lessons = [];
          var currentLesson = {}
          for (var i = 0; i < data.rows.length; i++) {
            //   data.rows[i].doc.lesson.node.key = data.rows[i].doc.lesson.key;
            $log.debug("====", data.rows[i].id)
            if (data.rows[i].doc && data.rows[i].id !== '_design/_auth' && data.rows[i].id !== 'localized_mapping') {
              currentLesson = data.rows[i].doc.lesson
              $log.debug('modified lesson', data.rows[i])
              for (var c = 0; c < currentLesson.objects.length; c++) {
                if (currentLesson.node.meta && currentLesson.node.meta.intros && currentLesson.node.meta.intros.sound && currentLesson.node.meta.intros.sound[0]) {
                  currentLesson.objects[c].node.intro_sound = currentLesson.node.meta.intros.sound[0];
                  // $log.debug('meta',currentLesson.node.meta,currentLesson.objects[c].node)
                }
              }
              lessons.push(currentLesson);
            }
          }
          // for (var i = 0; i < lessons.length; i++) {
          // data.rows[i].doc.lesson.node.key = data.rows[i].doc.lesson.key;
          // }
          // lessons = _.sortBy(lessons, 'key');
          d.resolve(lessons)
        })
        .catch(function(error) {
          d.reject(error)
        });
      return d.promise;
    }

    function getResourceList() {
      var i;
      var d = $q.defer();
      User.playlist.get(User.getActiveProfileSync()._id).then(function(playlist) {
          lessonDB.allDocs({
            include_docs: true
          }).then(function(data) {
            // $log.debug("AAAAAAAA "+data+" END");
            var lessons = [];
            var resources = [];
            var playlist_ids = [];
            for (i = 0; i < playlist.length; i++) {
              $log.debug("making playlist ids");
              playlist_ids.push(playlist[i].lesson_id);
            }
            $log.debug("done making playlist ids" + JSON.stringify(playlist_ids));
            for (i = 0; i < data.rows.length; i++) {
              $log.debug("making lessonlist");
              var index = -1;
              while ((index = playlist_ids.indexOf(data.rows[i].id, index + 1)) != -1) {
                $log.debug("making lessonlist 1");
                lessons[index] = data.rows[i];
                lessons[index]['parentHindiLessonId'] = playlist[index]['suggestedLesson']
                lessons[index]['miss'] = playlist[index]['miss'];
              }
            }
            // if(playlist.indexOf(data.rows[i].id) >= 0){
            //     lessons[playlist.indexOf(data.rows[i].id)] = data.rows[i]
            //   }
            $log.debug("Modifying lessons list")
            for (i = 0; i < lessons.length; i++) {
              $log.debug("Modifying lessons list 1")
                // data.rows[i].doc.lesson.node.key = data.rows[i].doc.lesson.key;
              for (var c = 0; c < lessons[i].doc.lesson.objects.length; c++) {
                $log.debug("Modifying lessons list 2")
                if (lessons[i].doc.lesson.node.meta && lessons[i].doc.lesson.node.meta.intros && lessons[i].doc.lesson.node.meta.intros.sound && lessons[i].doc.lesson.node.meta.intros.sound[0]) {
                  lessons[i].doc.lesson.objects[c].node.intro_sound = lessons[i].doc.lesson.node.meta.intros.sound[0];
                }
                lessons[i].doc.lesson.objects[c].node.tag = lessons[i].doc.lesson.node.tag;
                lessons[i].doc.lesson.objects[c].node.playlist_index = i;
                $log.debug("parent hindi lesson is " + lessons[i]['parentHindiLessonId'])
                lessons[i].doc.lesson.objects[c].node.parentHindiLessonId = lessons[i]['parentHindiLessonId'];
                lessons[i].doc.lesson.objects[c].node.miss = lessons[i]['miss'];
              }
              // for(var c = 0; c < lessons[i].doc.lesson.objects.length; c++){
              // $log.debug("Iter ",lessons[i].doc.lesson.objects[c].node.playlist_index )
              // }
              var include_video_flag = true;
              var include_vocab_flag = true;
              $log.debug("pre", playlist.length);
              angular.forEach(CONSTANT.NODE_TYPE_LIST, function(node_type) {
                for (var c = 0; c < lessons[i].doc.lesson.objects.length; c++) {
                  if (node_type == 'vocabulary' && lessons[i].doc.lesson.objects[c].node.content_type_name === 'vocabulary') {
                    for (var key in playlist[i]) {
                      if (playlist[i].hasOwnProperty(key)) {
                        if (playlist[i][key].type === 'resource') {
                          include_vocab_flag = false;
                        }
                      }
                    }
                    if (include_vocab_flag) {
                      resources.push(angular.copy(lessons[i].doc.lesson.objects[c]));
                      include_video_flag = false;
                    }
                  }
                  if (node_type == 'resource' && lessons[i].doc.lesson.objects[c].node.content_type_name === 'resource' && include_video_flag === true) {
                    resources.push(angular.copy(lessons[i].doc.lesson.objects[c]));
                  }
                  if (node_type == 'assessment' && lessons[i].doc.lesson.objects[c].node.content_type_name === 'assessment') {
                    resources.push(angular.copy(lessons[i].doc.lesson.objects[c]));
                  }
                }
              })
            }
            if (resources.length) {
              resources[resources.length - 1].node.requiresSuggestion = true;
            }
            $log.debug("Resource list resolving" + $log.debug(resources));
            d.resolve(resources)
          });
          // $log.debug("data",data)
          // for (var i = 0; i < data.rows.length; i++) {
          //   data.rows[i].key = data.rows[i].doc.lesson.key;
          // }
          // data.rows = _.sortBy(data.rows, 'key');
          // $log.debug("lessons",lessons)
        })
        .catch(function(error) {
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
            function(index) {
              return function(path) {
                quiz.objects[index].node.instructionSound = path
              }
            }(index)
          ))
        }
        promises.push(widgetParser.parseToDisplay(quiz.objects[index].node.title, index, quiz).then(
          function(index) {
            $log.debug("play resource here");
            return function(result) {
              quiz.objects[index].node.widgetHtml = result;
            }
          }(index)
        ));
        quiz.objects[index].node.widgetSound = null;
        if (widgetParser.getSoundId(quiz.objects[index].node.title)) {
          promises.push(widgetParser.getSoundSrc(widgetParser.getSoundId(quiz.objects[index].node.title), index, quiz).then(
            function(index) {
              return function(result) {
                quiz.objects[index].node.widgetSound = result;
              }
            }(index)
          ))
        }
        for (var j = 0; j < quiz.objects[index].node.type.content.options.length; j++) {
          promises.push(widgetParser.parseToDisplay(quiz.objects[index].node.type.content.options[j].option, index, quiz).then(
            function(index, j) {
              return function(result) {
                quiz.objects[index].node.type.content.options[j].widgetHtml = result;
              }
            }(index, j)
          ));
          quiz.objects[index].node.type.content.options[j].widgetSound = null;
          if (widgetParser.getSoundId(quiz.objects[index].node.type.content.options[j].option)) {
            promises.push(widgetParser.getSoundSrc(widgetParser.getSoundId(quiz.objects[index].node.type.content.options[j].option), index, quiz).then(
              function(index, j) {
                return function(result) {
                  quiz.objects[index].node.type.content.options[j].widgetSound = result;
                }
              }(index, j)
            ))
          }
        }
      }
      $q.all(promises).then(function() {
        $log.debug("play resource respoving assessment", quiz);
        d.resolve(quiz)
      });
      return d.promise;
    }

    function getLesson(id) {
      return lessonDB.get(id).then(function(data) {
        return data.lesson;
      });
    }

    function downloadVideo(video) {
      return mediaManager.downloadIfNotExists(video.node.type.path)
    }

    function downloadAssessment(assessment) {
      var d = $q.defer();
      var promises = [];
      var mediaArray = [];
      angular.forEach(assessment.objects, function(object) {
        if (object.node.meta.instructions && object.node.meta.instructions.sounds) {
          promises.push(
            mediaManager.downloadIfNotExists(object.node.meta.instructions.sounds[0])
          );
        }
        angular.forEach(object.node.type.content.widgets, function(widget) {
          angular.forEach(widget, function(file) {
            if (mediaArray.indexOf(file) < 0) {
              mediaArray.push(file);
              promises.push(
                mediaManager.downloadIfNotExists(file)
              );
            }
          })
        })
      });
      $q.all(promises).then(function(success) {
          d.resolve(success);
        })
        .catch(function(err) {
          $log.debug("ERRORR FOUND IN Download Assessment", err)
          d.reject(err)
        });
      return d.promise;
    }

    function getVocabulary(vocabulary) {
      var d = $q.defer();
      var promises = [];
      var mediaArray = [];
      $log.debug('Starting download of vocabulary', vocabulary);
      angular.forEach(vocabulary.objects, function(object) {
        promises.push(
          mediaManager.getPath(object.node.type.image.path).then(
            function(path) {
              object.node.type.image.path = path
            }
          )
        );
        angular.forEach(object.node.type.sound, function(sound) {
          promises.push(
            mediaManager.getPath(sound.path).then(
              function(path) {
                sound.path = path
              }
            )
          )
        })
      });
      $q.all(promises).then(function(success) {
          d.resolve(vocabulary);
        })
        .catch(function(err) {
          $log.debug("Error getting Vocabulary module : ", err)
          d.reject(err)
        });
      return d.promise;
    }

    function downloadVocabulary(vocabulary) {
      var d = $q.defer();
      var promises = [];
      var mediaArray = [];
      $log.debug('Starting download of vocabulary', vocabulary);
      angular.forEach(vocabulary.objects, function(object) {
        promises.push(
          mediaManager.downloadIfNotExists(object.node.type.image.path)
        );
        angular.forEach(object.node.type.sound, function(sound) {
          if (mediaArray.indexOf(sound.path) < 0) {
            mediaArray.push(sound.path);
            promises.push(
              mediaManager.downloadIfNotExists(sound.path)
            );
          }
        })
      });
      $q.all(promises).then(function(success) {
          d.resolve(success);
        })
        .catch(function(err) {
          $log.debug("Error downloading Vocabulary module : ", err)
          d.reject(err)
        });
      return d.promise;
    }

    function downloadLesson(lesson) {
      var vocabulary;
      var assessment;
      var video;
      angular.forEach(lesson.objects, function(resource) {
          if (resource.node.content_type_name === 'resource') {
            video = resource;
          } else if (resource.node.content_type_name === 'vocabulary') {
            vocabulary = resource;
          } else if (resource.node.content_type_name === 'assessment') {
            assessment = resource;
          }
        })
        //include assessment
      if (vocabulary) {
        //include vocabulary
      } else {
        //include video
      }
      return mediaManager.downloadIfNotExists(lesson.node.meta.intros.sound[0]).then(function() {
        return downloadAssessment(assessment)
      }).then(function() {
        if (vocabulary) {
          return downloadVocabulary(vocabulary)
        } else if (video) {
          return downloadVideo(video)
        } else {
          return $q.when();
        }
      })
    }

    function getActiveResource() {
      return getResourceList(User.getActiveProfileSync().data.profile.grade).then(function(lessons) {
          return extendLesson.getLesson(lessons).then(function(extLessons) {
            $log.debug("This is the active lesson", extLessons[extLessons.length - 1].locked ? extLessons[extLessons.length - 2] : extLessons[extLessons.length - 1])
            return extLessons[extLessons.length - 1].locked ? extLessons[extLessons.length - 2] : extLessons[extLessons.length - 1];
            // $log.debug("This  is the playlist ",result)
          });
        })
        // }).catch(function(err){
        //   $log.error("Error occured while fetching active playlist",err);
        // });
    }

    function getActiveLessonId() {
      // $log.debug("ACTIVE PROFILE",User.getActiveProfileSync())
      // $log.debug("PLAYLIST")
      return User.playlist.get(User.getActiveProfileSync()._id).then(function(playlist) {
        return playlist[0].lesson_id;
      });
    }

    function getStatus() {
      $log.debug("GOT STATUS");
    }
  }
})();
