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
                return {"node":{"id":"421ddb89-f517-484a-8455-39427833ab58","content_type_name":"assessment","type":{"id":"40322743-237d-41fe-bdb3-bc46661a5b1c","score":160},"created":"2016-04-25T11:30:46.492081Z","updated":"2016-05-09T11:25:25.416354Z","title":"Assessment test","description":"Assessment description","object_id":"40322743-237d-41fe-bdb3-bc46661a5b1c","stauts":"PUBLISHED","lft":2,"rght":9,"tree_id":4,"level":1,"parent":"a26a2331-5ed0-44d5-af7f-5a986f349158","content_type":26,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[{"node":{"id":"f86b046e-8996-4573-91f0-282b30b84e1b","content_type_name":"json question","type":{"id":"6ccfad8f-d923-4648-920f-b69c7275cf9b","created":"2016-05-03T07:16:43.177244Z","updated":"2016-05-03T07:16:43.177262Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"choices":[{"image":null,"key":1,"option":"2.","audio":null},{"image":null,"key":2,"option":"L","audio":null},{"image":null,"key":3,"option":"correct","audio":null},{"image":null,"key":4,"option":"Ki and Ka","audio":null}],"is_multiple":false,"image":null,"layout_type":"audio_to_text","audio":"http://static1.grsites.com/archive/sounds/animals/animals019.mp3"},"type":"choicequestion"},"created":"2016-05-03T07:16:43.209683Z","updated":"2016-05-09T13:35:36.698738Z","title":"select_answer_3_test.","description":"","object_id":"6ccfad8f-d923-4648-920f-b69c7275cf9b","stauts":"PUBLISHED","lft":7,"rght":8,"tree_id":4,"level":2,"parent":"421ddb89-f517-484a-8455-39427833ab58","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"0ad2e1de-f93b-4e1f-a847-209fb9053a74","content_type_name":"json question","type":{"id":"850c8eec-be72-41cd-9d50-75c49bae57fd","created":"2016-04-29T11:58:39.586725Z","updated":"2016-04-29T11:58:39.586741Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[1],"score":20,"content":{"choices":[{"key":1,"image":"http://lorempixel.com/300/100/","audio":"http://static1.grsites.com/archive/sounds/animals/animals014.mp3","option":null},{"key":2,"image":null,"audio":"http://static1.grsites.com/archive/sounds/animals/animals019.mp3","option":null},{"key":3,"image":null,"audio":"http://static1.grsites.com/archive/sounds/animals/animals014.mp3","option":"this is wrong"},{"key":4,"image":null,"audio":null,"option":null}],"is_multiple":false,"audio":"http://static1.grsites.com/archive/sounds/animals/animals014.mp3","layout_type":"audio_to_pic","image":"http://lorempixel.com/100/100/"},"type":"choicequestion"},"created":"2016-04-29T11:58:39.619081Z","updated":"2016-05-09T13:33:25.592313Z","title":"Select_answer_1_2_3","description":"","object_id":"850c8eec-be72-41cd-9d50-75c49bae57fd","stauts":"PUBLISHED","lft":5,"rght":6,"tree_id":4,"level":2,"parent":"421ddb89-f517-484a-8455-39427833ab58","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"a88611f7-6040-45f8-b171-92b54ab1d1ca","content_type_name":"json question","type":{"id":"81471ef5-9e9a-421a-8440-069f71a1572d","created":"2016-04-23T10:33:22.827443Z","updated":"2016-04-23T10:33:22.827494Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[1,4],"score":20,"content":{"choices":[{"key":1,"option":"B."},{"key":2,"option":"A."},{"key":3,"option":"Y."},{"key":4,"option":"D"}],"is_multiple":true},"type":"choicequestion"},"created":"2016-04-23T10:33:22.852604Z","updated":"2016-05-09T11:25:48.707664Z","title":"Select letters b, d","description":"","object_id":"81471ef5-9e9a-421a-8440-069f71a1572d","stauts":"PUBLISHED","lft":3,"rght":4,"tree_id":4,"level":2,"parent":"421ddb89-f517-484a-8455-39427833ab58","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]}]};
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
  }
})();
