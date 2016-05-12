(function() {
  'use strict';

  angular
    .module('zaya-quiz')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('quiz',{
        url : '/quiz/:id',
        abstract : true,
        cache: false,
        template : '<ion-nav-view name="state-quiz"></ion-nav-view>',
        resolve: {
            quiz: ['$stateParams', 'Rest', function($stateParams, Rest) {
                return {"node":{"id":"c1693b27-cad4-415d-b6bc-97026c5adecb","content_type_name":"assessment","type":{"id":"076a8ab4-26e2-458f-afb3-7a390a301fa3","type":"assessment","score":340},"created":"2016-05-11T05:10:02.312761Z","updated":"2016-05-11T05:10:02.312803Z","title":"ELL.BA.K.2","description":"","object_id":"076a8ab4-26e2-458f-afb3-7a390a301fa3","stauts":"PUBLISHED","lft":2,"rght":9,"tree_id":3,"level":1,"parent":"c247fe3d-94f0-4ed8-9a48-21537186ed96","content_type":26,"account":"d881a735-2028-4271-b1bc-cfb9f04e0a90","tag":null},"objects":[{"node":{"id":"680d0966-2cb0-4de9-91e1-ee2e52374baa","content_type_name":"json question","type":{"id":"aa0105ef-d555-4af4-8543-1db6cdd9d4b5","created":"2016-05-11T05:10:03.558652Z","updated":"2016-05-11T05:10:03.558681Z","microstandard":"ELL.BA.K.2","is_critical_thinking":false,"level":1,"answer":[1,2],"score":10,"content":{"is_multiple":true,"widgets":{"videos":{},"sounds":{"1":"/media/ell/sounds/select-all-vowels-sab-vowels-chuno_JW2HIH.mp3"},"images":{}},"options":[{"option":"Option 1","key":1},{"option":"Option 2","key":2},{"option":"Option 3","key":3},{"option":"Option 4","key":4}],"hints":"[]"},"type":"choicequestion"},"created":"2016-05-11T05:10:03.573401Z","updated":"2016-05-11T05:10:03.573444Z","title":"Select all vowels.Select all vowels. [[sound id=1]]","description":"","object_id":"aa0105ef-d555-4af4-8543-1db6cdd9d4b5","stauts":"PUBLISHED","lft":3,"rght":4,"tree_id":3,"level":2,"parent":"c1693b27-cad4-415d-b6bc-97026c5adecb","content_type":22,"account":"d881a735-2028-4271-b1bc-cfb9f04e0a90","tag":null},"objects":[]},{"node":{"id":"1bbf8be4-6f8c-408a-be6e-2a9f2efb4051","content_type_name":"json question","type":{"id":"f4e2f823-a017-48b3-b56c-d9efa198feed","created":"2016-05-11T05:10:04.983862Z","updated":"2016-05-11T05:10:04.983893Z","microstandard":"ELL.BA.K.2","is_critical_thinking":false,"level":1,"answer":[1,2],"score":10,"content":{"is_multiple":true,"widgets":{"videos":{},"sounds":{"1":"/media/ell/sounds/select-all-vowels-sab-vowels-chuno_JA7FOB.mp3"},"images":{}},"options":[{"key":1,"option":"Option 1"},{"key":2,"option":"Option 2"},{"key":3,"option":"Option 3"},{"key":4,"option":"Option 4"}],"hints":"[]"},"type":"choicequestion"},"created":"2016-05-11T05:10:05.205000Z","updated":"2016-05-11T05:10:05.205064Z","title":"Select all vowels.Select all vowels. [[sound id=1]]","description":"","object_id":"f4e2f823-a017-48b3-b56c-d9efa198feed","stauts":"PUBLISHED","lft":5,"rght":6,"tree_id":3,"level":2,"parent":"c1693b27-cad4-415d-b6bc-97026c5adecb","content_type":22,"account":"d881a735-2028-4271-b1bc-cfb9f04e0a90","tag":null},"objects":[]}]};
                return Rest.one('accounts',CONSTANT.CLIENTID.ELL).one('assessments',$stateParams.id).get().then(function(quiz){
                  return quiz.plain();
                });
            }]
        }
      })
      .state('quiz.start',{
        url : '/start',
        views : {
          'state-quiz' : {
            templateUrl : CONSTANT.PATH.QUIZ+'/quiz.start'+CONSTANT.VIEW,
            controller : 'QuizController as quizCtrl'
          }
        }
      })
      .state('quiz.questions',{
        url : '/questions',
        nativeTransitions: null,
        views : {
          'state-quiz' : {
            templateUrl : CONSTANT.PATH.QUIZ+'/quiz.questions'+CONSTANT.VIEW,
            controller : 'QuizController as quizCtrl'
          }
        }
      })

      .state('quiz.summary',{
        url : '/summary',
        params: {
          report: null,
          quiz : null
        },
        views : {
          'state-quiz' : {
            templateUrl : CONSTANT.PATH.QUIZ+'/quiz.summary'+CONSTANT.VIEW,
            controller : 'QuizController as quizCtrl'
          }
        }
      })
      .state('quiz.practice',{
        url : '/practice',
        views: {
          'state-quiz': {
            template : '<ion-nav-view name="state-quiz-practice"></ion-nav-view>'
          }
        }
      })
      .state('quiz.practice.questions',{
        url : '/questions',
        nativeTransitions: null,
        views : {
          'state-quiz-practice' : {
            templateUrl : CONSTANT.PATH.QUIZ+'/practice.questions'+CONSTANT.VIEW,
            controller : 'QuizController as quizCtrl'
          }
        }
      })
      .state('quiz.practice.summary',{
        url : '/summary',
        params: {
          report: null,
          quiz : null,
          practiceResult: null
        },
        views : {
          'state-quiz-practice' : {
            templateUrl : CONSTANT.PATH.QUIZ+'/practice.summary'+CONSTANT.VIEW,
            controller : 'QuizController as quizCtrl'
          }
        }
      })
  }
})();
