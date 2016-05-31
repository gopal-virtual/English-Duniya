(function() {
  'use strict';

  angular
    .module('zaya-quiz')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('quiz', {
        url: '/quiz/:type/:id',
        abstract: true,
        cache: false,
        template: '<ion-nav-view name="state-quiz"></ion-nav-view>',
        onEnter: ['orientation', 'audio', function(orientation, audio) {
          orientation.setPortrait();
          audio.stop('background');
        }],
        resolve: {
          quiz: ['$stateParams', 'Rest','$log', function($stateParams, Rest, $log) {
            if ($stateParams.type == 'litmus') {
                Rest.one('profiles',JSON.parse(localStorage.user_details).profile).get().then(function(profile){
                    $log.debug(profile.plain().grade);
                });
              return {
                "node": {
                  "id": "001",
                  "content_type_name": "litmus",
                  "type": {
                    "id": "001",
                    "type": "litmus",
                  },
                  "tag": "litmus",
                  "title": "Litmus test",
                },
                "objects": [{
                  "node": {
                    "id": "106152d7-9beb-4049-8d1b-75b065e3f4cf",
                    "content_type_name": "json question",
                    "type": {
                      "id": "1ae080aa-6642-41c7-baf3-ffa50e97b942",
                      "created": "2016-05-23T08:19:51.269643Z",
                      "updated": "2016-05-23T10:07:14.240195Z",
                      "microstandard": "ELL.1.RE.V.105",
                      "is_critical_thinking": false,
                      "level": 1,
                      "answer": [1],
                      "score": 10,
                      "content": {
                        "is_multiple": false,
                        "widgets": {
                          "images": {
                            "1": "/media/ell/images/i_CN7RRZ.png"
                          },
                          "sounds": {
                            "1": "/media/ell/sounds/i-mein_885SAB.mp3",
                            "2": "/media/ell/sounds/you-aap_IO7AUZ.mp3"
                          },
                          "videos": {}
                        },
                        "tags": ["pictoaudio"],
                        "instruction": null,
                        "options": [{
                          "key": 1,
                          "option": " [[sound id=1]] "
                        }, {
                          "key": 2,
                          "option": " [[sound id=2]] "
                        }],
                        "hints": "[]"
                      },
                      "type": "choicequestion"
                    },
                    "tag": null,
                    "created": "2016-05-23T08:19:51.279304Z",
                    "updated": "2016-05-23T08:19:51.279337Z",
                    "title": "I [[img id=1]]",
                    "description": "",
                    "object_id": "1ae080aa-6642-41c7-baf3-ffa50e97b942",
                    "status": "PUBLISHED",
                    "lft": 31,
                    "rght": 32,
                    "tree_id": 31,
                    "level": 2,
                    "parent": "e0c43aa4-c661-4151-bf18-8cafd77692b9",
                    "content_type": 22,
                    "account": "1e7aa89f-3f50-433a-90ca-e485a92bbda6"
                  },
                  "objects": []
                }]
              };
            } else {
              return Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('assessments', $stateParams.id).get().then(function(quiz) {
                return quiz.plain();
              });
            }
          }]
        }
      })
      .state('quiz.start', {
        url: '/start',
        views: {
          'state-quiz': {
            templateUrl: CONSTANT.PATH.QUIZ + '/quiz.start' + CONSTANT.VIEW,
            controller: 'QuizController as quizCtrl'
          }
        }
      })
      .state('quiz.questions', {
        url: '/questions',
        // nativeTransitions: null,
        views: {
          'state-quiz': {
            // templateUrl : CONSTANT.PATH.QUIZ+'/quiz.questions'+CONSTANT.VIEW,
            templateUrl: function($stateParams) {
              return CONSTANT.PATH.QUIZ + '/quiz.' + $stateParams.type + '.questions' + CONSTANT.VIEW;
            },
            controller: 'QuizController as quizCtrl'
          }
        }
      })

    .state('quiz.summary', {
      url: '/summary',
      params: {
        report: null,
        quiz: null,
        summary: null
      },
      views: {
        'state-quiz': {
          templateUrl: CONSTANT.PATH.QUIZ + '/quiz.summary' + CONSTANT.VIEW,
          controller: 'QuizController as quizCtrl'
        }
      }
    })
  }
})();
