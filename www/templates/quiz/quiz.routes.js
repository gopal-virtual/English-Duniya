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
                return {"node":{"id":"8e66a888-8b65-43b9-b09b-99512c2ead01","content_type_name":"assessment","type":{"id":"45c6af60-82ba-4e37-9269-6ba441c9f832","type":"practice","score":240},"tag":null,"created":"2016-05-18T09:15:35.875338Z","updated":"2016-05-18T09:15:35.875372Z","title":"Vocabulary - Greetings - hello, goodbye, please, thank you","description":"Vocabulary - Greetings - hello, goodbye, please, thank you","object_id":"45c6af60-82ba-4e37-9269-6ba441c9f832","stauts":"PUBLISHED","lft":4,"rght":29,"tree_id":32,"level":1,"parent":"6e65769e-78fe-481c-a81e-5c87221f4301","content_type":26,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[{"node":{"id":"2cb49262-d460-42bd-b011-2c0df5ba6701","content_type_name":"json question","type":{"id":"d8223e37-08cd-4278-bea9-d4ba80f02ba1","created":"2016-05-18T09:15:41.906866Z","updated":"2016-05-18T09:15:41.906891Z","microstandard":"ELL.1.RE.V.22","is_critical_thinking":false,"level":1,"answer":[3],"score":10,"content":{"instruction":null,"is_multiple":false,"hints":"[]","tags":["audiotopic"],"options":[{"key":4,"option":" [[img id=1]]"},{"key":2,"option":" [[img id=2]]"},{"key":3,"option":" [[img id=3]]"},{"key":1,"option":" [[img id=4]]"}],"widgets":{"videos":{},"sounds":{"1":"/media/ell/sounds/hello_LZN5IN.mp3"},"images":{"1":"/media/ell/images/thankyou_33SLK3.png","2":"/media/ell/images/please_KO52JX.png","3":"/media/ell/images/hello_L34IJI.png","4":"/media/ell/images/goodbye_JW8QRW.png"}}},"type":"choicequestion"},"tag":null,"created":"2016-05-18T09:15:41.916719Z","updated":"2016-05-18T09:15:41.916753Z","title":"[[sound id=1]]","description":"","object_id":"d8223e37-08cd-4278-bea9-d4ba80f02ba1","stauts":"PUBLISHED","lft":7,"rght":8,"tree_id":32,"level":2,"parent":"8e66a888-8b65-43b9-b09b-99512c2ead01","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"184127ba-ef52-4ff5-9734-c181d4712ce6","content_type_name":"json question","type":{"id":"6b56435a-120c-433f-9f74-00947f2d932d","created":"2016-05-18T09:16:02.773889Z","updated":"2016-05-18T09:16:02.773917Z","microstandard":"ELL.1.RE.V.22","is_critical_thinking":false,"level":1,"answer":[4],"score":10,"content":{"instruction":null,"is_multiple":false,"hints":"[]","tags":["audiotopic"],"options":[{"key":4,"option":" [[img id=1]]"},{"key":2,"option":" [[img id=2]]"},{"key":3,"option":" [[img id=3]]"},{"key":1,"option":" [[img id=4]]"}],"widgets":{"videos":{},"sounds":{"1":"/media/ell/sounds/thank-you_AHSQYQ.mp3"},"images":{"1":"/media/ell/images/thankyou_XM37CO.png","2":"/media/ell/images/hello_VM5G3S.png","3":"/media/ell/images/goodbye_A1DRQA.png","4":"/media/ell/images/please_80LJ9J.png"}}},"type":"choicequestion"},"tag":null,"created":"2016-05-18T09:16:02.783565Z","updated":"2016-05-18T09:16:02.783612Z","title":"[[sound id=1]]","description":"","object_id":"6b56435a-120c-433f-9f74-00947f2d932d","stauts":"PUBLISHED","lft":27,"rght":28,"tree_id":32,"level":2,"parent":"8e66a888-8b65-43b9-b09b-99512c2ead01","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]}]};
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
