(function() {
  'use strict';

  angular
    .module('zaya-quiz')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('quiz', {
        url: '/quiz/:type/:id/',
        abstract: true,
        cache: false,
        template: '<ion-nav-view name="state-quiz"></ion-nav-view>',
        onEnter: ['orientation', 'audio', function(orientation, audio) {
          orientation.setPortrait();
          audio.stop('background');
        }],
        params: {
          quiz: null,
          report: null,
          summary: null
        },
        resolve: {
          quiz: ['$stateParams', 'Rest', '$log', 'data', 'ml', '$q', '$http','demo', function($stateParams, Rest, $log, data, ml, $q, $http,demoFactory) {
            if ($stateParams.type == 'litmus') {
              var all_promises = [];
              if (ml.kmapsJSON == undefined) {
                var promise = ml.setMLKmapsJSON;
                all_promises.push(promise);
              }
              if (ml.dqJSON == undefined) {
                var promise = ml.setMLDqJSON;
                all_promises.push(promise);
              }
              if (ml.mapping == undefined) {
                var promise = ml.setMapping;
                all_promises.push(promise);
              }
              var litmus = {
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
                "objects": []
              };
              return $q.all(all_promises).then(function() {
                var suggestion = ml.getNextQSr(data.getTestParams(JSON.parse(localStorage.profile).grade), ml.mapping);
                var question = ml.dqJSON[suggestion.qSr];
                question && litmus.objects.push(question);
                litmus['suggestion'] = suggestion;
                return litmus;
              })
            } else {
              return demoFactory.show(5).then(function(response) {
                // $log.debug('resolving quiz');
                // $stateParams.quiz.objects[0].node.id == 'demo' ? $stateParams.quiz.objects.shift(data.demo_question) :false;
                var currentIndex = $stateParams.quiz.objects.length;
                var temporaryValue, randomIndex;
                // shuffling of questions
                // while (0 !== currentIndex) {
                //   randomIndex = Math.floor(Math.random() * currentIndex);
                //   currentIndex -= 1;
                //   temporaryValue = $stateParams.quiz.objects[currentIndex];
                //   $stateParams.quiz.objects[currentIndex] = $stateParams.quiz.objects[randomIndex];
                //   $stateParams.quiz.objects[randomIndex] = temporaryValue;
                // }
                response && $stateParams.quiz.objects.unshift(data.demo_question);
                return data.getAssessment($stateParams.quiz).then(function(response) {
                  return response;
                });

              })

              // return $stateParams.quiz;

            }
          }]
        }
      })
      .state('quiz.start', {
        url: 'start',
        onEnter: function($stateParams, $log) {},
        views: {
          'state-quiz': {
            templateUrl: CONSTANT.PATH.QUIZ + '/quiz.start' + CONSTANT.VIEW,
            controller: 'QuizController as quizCtrl'
          }
        }
      })
      .state('quiz.questions', {
        url: 'questions',
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
      url: 'summary',
      onEnter: ['$log', 'audio', function($log, audio) {
        $log.debug("Enter summary")
      }],
      onExit: ['$log', 'audio', function($log, audio) {
        $log.debug("Exit summary")
      }],
      views: {
        'state-quiz': {
          templateUrl: CONSTANT.PATH.QUIZ + '/quiz.summary' + CONSTANT.VIEW,
          controller: 'QuizController as quizCtrl'
        }
      }
    })
  }
})();
