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
          quiz: ['$stateParams', 'Rest', '$log', 'data', 'ml', '$q', '$http', function($stateParams, Rest, $log, data, ml, $q, $http) {
            if ($stateParams.type == 'litmus') {

              // var q = $q.defer();

            //   function tryMe() {
            //     // try{
            //     var grade = JSON.parse(localStorage.profile).grade;
            //     $log.debug('grade', grade);
            //     var params = data.getTestParams(grade);
            //     // var mapping = res;
              //
            //     $log.debug('params', params);
            //     $log.debug('mapping', ml.mapping);
            //     $log.debug('ml.dqQuiz', ml.dqQuiz);
              //
            //     var result = ml.getNextQSr(params, ml.mapping);
            //     $log.debug('result', result);
            //     result.test[0]['setPreviousAnswer'] = 1;
            //     result.test[0]["qSet"][result["actualLevel"]] = {
            //       "sr": result.qSr,
            //       "answered": "right"
            //     };
            //     $log.debug('changed result', result);
              //
            //     result = ml.getNextQSr(result.test, ml.mapping);
            //     $log.debug('result', result);
            //     result.test[0]['setPreviousAnswer'] = 0;
            //     result.test[0]["qSet"][result["actualLevel"]] = {
            //       "sr": result.qSr,
            //       "answered": "wrong"
            //     };
            //     $log.debug('changed result', result);
              //
            //     result = ml.getNextQSr(result.test, ml.mapping);
            //     $log.debug('result', result);
            //     result.test[0]['setPreviousAnswer'] = 1;
            //     result.test[0]["qSet"][result["actualLevel"]] = {
            //       "sr": result.qSr,
            //       "answered": "right"
            //     };
            //     $log.debug('changed result', result);
              //
            //     result = ml.getNextQSr(result.test, ml.mapping);
            //     $log.debug('result', result);
            //     result.test[0]['setPreviousAnswer'] = 0;
            //     result.test[0]["qSet"][result["actualLevel"]] = {
            //       "sr": result.qSr,
            //       "answered": "wrong"
            //     };
            //     $log.debug('changed result', result);
              //
            //     var rec = ml.runDiagnostic(ml.dqQuiz);
            //     $log.debug('rec', rec);
            //   }

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
                  var id = ml.getNextQSr(data.getTestParams(JSON.parse(localStorage.profile).grade), ml.mapping);
                  var question = ml.dqJSON[id.qSr];
                  $log.debug('question node', question);
                  question && litmus.objects.push(question);
                  return litmus;
              })


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
