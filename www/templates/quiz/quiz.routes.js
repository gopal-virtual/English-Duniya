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
                return {"node_id":2,"parent":1,"info":{"score":160,"id":1,"title":"english quiz","description":"","content_type":21},"questions":[{"id":1,"node_id":3,"parent":2,"info":{"question_type":"audio_to_pic_long","id":1,"title":null,"description":"Lorem ipsum dolor sit amet","image":{"url":null,"key":null},"audio":{"url":"http://soundbible.com/grab.php?id=769&type=mp3","key":"5719c8fdd50d193f2dd37736"},"is_critical_thinking":false,"level":2,"microstandard":"a.a","answer":[2],"is_multiple":false,"score":30,"choices":[{"option":null,"key":1,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fd70e1c5181b81f2ed"},"audio":{"url":null,"key":null}},{"option":null,"key":2,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fd70e1c5181b81f2ed"},"audio":{"url":null,"key":null}},{"option":null,"key":3,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fd70e1c5181b81f2ed"},"audio":{"url":null,"key":null}},{"option":null,"key":4,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fd70e1c5181b81f2ed"},"audio":{"url":null,"key":null}}],"content_type":"choice question","content_type_id":26}},{"node_id":3,"parent":2,"id":2,"info":{"question_type":"audio_to_pic","id":2,"title":null,"description":"Lorem ipsum dolor sit amet","image":{"url":null,"key":null},"audio":{"url":"http://soundbible.com/grab.php?id=769&type=mp3","key":"5719c8fdd50d193f2dd37736"},"is_critical_thinking":false,"level":2,"microstandard":"a.a","answer":[2],"score":30,"is_multiple":false,"choices":[{"option":null,"key":1,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fdd50d193f2dd37736"},"audio":{"url":null,"key":null}},{"option":null,"key":2,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fd796627380ae47676"},"audio":{"url":null,"key":null}},{"option":null,"key":3,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fd482db5bf7abdbcba"},"audio":{"url":null,"key":null}},{"option":null,"key":4,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fd70e1c5181b81f2ed"},"audio":{"url":null,"key":null}}],"content_type":"choice question","content_type_id":26}},{"node_id":3,"parent":2,"id":3,"info":{"question_type":"audio_to_text","id":3,"title":null,"description":"Lorem ipsum dolor sit amet","image":{"url":null,"key":null},"audio":{"url":"http://soundbible.com/grab.php?id=769&type=mp3","key":"5719c8fdd50d193f2dd37736"},"is_critical_thinking":false,"level":2,"microstandard":"a.a","answer":[2],"score":30,"is_multiple":false,"choices":[{"option":"Lorem Ipsum","key":1,"image":{"url":null,"key":null},"audio":{"url":null,"key":null}},{"option":"Lorem Ipsum","key":2,"image":{"url":null,"key":null},"audio":{"url":null,"key":null}},{"option":"Lorem Ipsum","key":3,"image":{"url":null,"key":null},"audio":{"url":null,"key":null}},{"option":"Lorem Ipsum","key":4,"image":{"url":null,"key":null},"audio":{"url":null,"key":null}}],"content_type":"choice question","content_type_id":26}},{"node_id":3,"parent":2,"id":4,"info":{"question_type":"pic_to_audio","id":4,"title":null,"description":"Lorem ipsum dolor sit amet","image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fdd50d193f2dd37736"},"audio":{"url":null,"key":null},"is_critical_thinking":false,"level":2,"microstandard":"a.a","answer":[2],"score":30,"is_multiple":false,"choices":[{"option":null,"image":{"url":null,"key":null},"audio":{"url":"http://soundbible.com/grab.php?id=769&type=mp3","key":"5719c8fdd50d193f2dd37736"}},{"option":null,"key":2,"image":{"url":null,"key":null},"audio":{"url":"http://soundbible.com/grab.php?id=769&type=mp3","key":"5719c8fdd50d193f2dd37736"}},{"option":null,"key":3,"image":{"url":null,"key":null},"audio":{"url":"http://soundbible.com/grab.php?id=769&type=mp3","key":"5719c8fdd50d193f2dd37736"}},{"option":null,"key":4,"image":{"url":null,"key":null},"audio":{"url":"http://soundbible.com/grab.php?id=769&type=mp3","key":"5719c8fdd50d193f2dd37736"}}],"content_type":"choice question","content_type_id":26}},{"node_id":4,"parent":2,"id":5,"info":{"question_type":"pic_to_text_long","id":5,"title":null,"description":null,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fdd50d193f2dd37736"},"audio":{"url":null,"key":null},"is_critical_thinking":false,"level":2,"microstandard":"a.a","answer":[2],"score":30,"is_multiple":false,"choices":[{"option":"Lorem ipsum","key":1,"image":{"url":null,"key":null},"audio":{"url":null,"key":null}},{"option":"Lorem ipsum","key":2,"image":{"url":null,"key":null},"audio":{"url":null,"key":null}},{"option":"Lorem ipsum","key":3,"image":{"url":null,"key":null},"audio":{"url":null,"key":null}},{"option":"Lorem ipsum","key":4,"image":{"url":null,"key":null},"audio":{"url":null,"key":null}}],"content_type":"choice question","content_type_id":26}},{"node_id":5,"parent":2,"id":6,"info":{"question_type":"pic_to_text","id":6,"title":null,"description":"Lorem ipsum dolor sit amet","image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fdd50d193f2dd37736"},"audio":{"url":null,"key":null},"is_critical_thinking":false,"level":2,"microstandard":"a.a","answer":[2],"score":30,"is_multiple":false,"choices":[{"option":"Lorem ipsum","key":1,"image":{"url":null,"key":null},"audio":{"url":null,"key":null}},{"option":"Lorem ipsum","key":2,"image":{"url":null,"key":null},"audio":{"url":null,"key":null}},{"option":"Lorem ipsum","key":3,"image":{"url":null,"key":null},"audio":{"url":null,"key":null}},{"option":"Lorem ipsum","key":4,"image":{"url":null,"key":null},"audio":{"url":null,"key":null}}],"content_type":"choice question","content_type_id":26}},{"node_id":6,"parent":2,"id":7,"info":{"question_type":"text_to_pic_long","id":7,"title":"Lorem ipsum dolor sit amet","description":"Lorem ipsum dolor sit amet","image":{"url":null,"key":null},"audio":{"url":null,"key":null},"is_critical_thinking":false,"level":2,"microstandard":"a.a","answer":[2],"score":30,"is_multiple":false,"choices":[{"option":null,"key":1,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fdd50d193f2dd37736"},"audio":{"url":null,"key":null}},{"option":null,"key":2,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fdd50d193f2dd37736"},"audio":{"url":null,"key":null}},{"option":null,"key":3,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fdd50d193f2dd37736"},"audio":{"url":null,"key":null}},{"option":null,"key":4,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fdd50d193f2dd37736"},"audio":{"url":null,"key":null}}],"content_type":"choice question","content_type_id":26}},{"node_id":7,"parent":2,"id":8,"info":{"question_type":"text_to_pic","id":8,"title":"Lorem ipsum dolor sit amet","description":"Lorem ipsum dolor sit amet","image":{"url":null,"key":null},"audio":{"url":null,"key":null},"is_critical_thinking":false,"level":2,"microstandard":"a.a","answer":[2],"score":30,"is_multiple":false,"choices":[{"option":null,"key":1,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fdd50d193f2dd37736"},"audio":{"url":null,"key":null}},{"option":null,"key":2,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fdd50d193f2dd37736"},"audio":{"url":null,"key":null}},{"option":null,"key":3,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fdd50d193f2dd37736"},"audio":{"url":null,"key":null}},{"option":null,"key":4,"image":{"url":"http://lorempixel.com/100/100/","key":"5719c8fdd50d193f2dd37736"},"audio":{"url":null,"key":null}}],"content_type":"choice question","content_type_id":26}}]};
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
          report: null
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
