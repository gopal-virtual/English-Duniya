(function () {
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
        onEnter: ['orientation', 'audio', function (orientation, audio) {
          orientation.setPortrait();
          audio.stop('background');
        }],
        params: {
          quiz: null,
          report: null,
          summary: null
        },
        resolve: {
          quiz: ['$stateParams', 'Rest', '$log', 'content', 'ml', '$q', '$http', 'demo', 'data', function ($stateParams, Rest, $log, content, ml, $q, $http, demoFactory, data) {
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
              return $q.all(all_promises).then(function () {
                var suggestion = ml.getNextQSr(data.getTestParams(JSON.parse(localStorage.profile).grade), ml.mapping);
                var question = ml.dqJSON[suggestion.qSr];
                question && litmus.objects.push(question);
                litmus['suggestion'] = suggestion;
                return litmus;
              })
            } else {
              return demoFactory.show(5).then(function (response) {
                // ;
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
                response && $stateParams.quiz.objects.unshift(content.demo_question);
                return content.getAssessment($stateParams.quiz).then(function (response) {
                  return response;
                });

              })

              // return $stateParams.quiz;

            }
          }]
        }
      })
      .state('quiz.start', {
        url: '/start',
        onEnter: function ($stateParams, $log) {
        },
        views: {
          'state-quiz': {
            templateUrl: CONSTANT.PATH.QUIZ + '/quiz.start' + CONSTANT.VIEW,
            controller: 'QuizController as quizCtrl'
          }
        }
      })
      .state('quiz.questions', {
        url: '/questions',
        onEnter: ['$log', '$state', '$stateParams', function ($log, $state, $stateParams) {
          if (!$stateParams.quiz.objects.length) {
            $state.go('state.missing');
          }
        }],
        // nativeTransitions: null,
        views: {
          'state-quiz': {
            // templateUrl : CONSTANT.PATH.QUIZ+'/quiz.questions'+CONSTANT.VIEW,
            templateUrl: function ($stateParams) {
              return CONSTANT.PATH.QUIZ + '/quiz.' + $stateParams.type + '.questions' + CONSTANT.VIEW;
            },
            controller: 'QuizController as quizCtrl'
          }
        }
      })
      .state('quiz.missing', {
        url: '/missing',
        template: '<h1>Questions not Found</h1>'
      })
      .state('quiz.summary', {
        url: '/summary',
        onEnter: ['$log', 'audio', 'content', '$stateParams', 'lessonutils', 'User', function ($log, audio, content, $stateParams, lessonutils, User) {

          var report = $stateParams.report;
          var quiz = $stateParams.quiz;
          var summary = $stateParams.summary;
          var lesson = lessonutils.getLocalLesson();

          User.skills.update({
            profileId: User.getActiveProfileSync()._id,
            lessonId: lesson.node.id,
            id: quiz.node.id,
            score: summary.score.marks,
            totalScore: quiz.node.type.score,
            skill: lesson.node.tag,
          })
            .then(function () {
              return User.scores.getScoreOfAssessment(quiz.node.id, lesson.node.id, User.getActiveProfileSync()._id)
            })
            .then(function (previousScore) {
              if ((!previousScore) || (!previousScore.hasOwnProperty('score')) || (previousScore && parseInt(previousScore.score) < summary.score.marks)) {

                return User.scores.update({
                  profileId: User.getActiveProfileSync()._id,
                  lessonId: lesson.node.id,
                  id: quiz.node.id,
                  score: summary.score.marks,
                  totalScore: quiz.node.type.score,
                  type: 'assessment'
                })

              }
            })

            .then(function (success) {
              // var report_id = success.id;
              var attempts = [];
              angular.forEach(report.attempts, function (value, key) {
                attempts.push({
                  answer: value.length > 0 ? value : null,
                  score: summary.analysis[key].score,
                  status: value.length > 0 ? CONSTANT.ATTEMPT.STATUS.ATTEMPTED : CONSTANT.ATTEMPT.STATUS.SKIPPED,
                  // person: Auth.getProfileId(),
                  // report: report_id,
                  node: key
                });
              });
              return User.reports.save({
                'score': summary.score.marks,
                'attempts': attempts,
                'profileId': User.getActiveProfileSync()._id,
                'node': quiz.node.id
              })

            })
        }],
        onExit: ['$log', 'audio', function ($log, audio) {

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
