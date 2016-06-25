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
        params : {
          quiz : null
        },
        resolve: {
          quiz: ['$stateParams', 'Rest', '$log', 'data', 'ml', '$q', '$http', function($stateParams, Rest, $log, data, ml, $q, $http) {
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

              $log.debug('all_promises', all_promises);

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
                  $log.debug('question node', suggestion);
                  question && litmus.objects.push(question);
                  litmus['suggestion'] = suggestion;
                  return litmus;
              })


            } else {
                return data.getAssessment($stateParams.quiz).then(function(response){
                    return response;
                })
                ;
              // return $stateParams.quiz;

            }
          }]
        }
      })
      .state('quiz.start', {
        url: 'start',
        onEnter: function($stateParams,$log){
        },
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
      params: {
        report: null,
        quiz: null,
        summary: null
      },
      onEnter: function($log){
        $log.debug("YY");
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
