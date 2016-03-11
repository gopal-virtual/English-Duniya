(function() {
    'use strict';

    angular
        .module('common', [
          'ionic',
          'ngCordova'
        ]);
})();

(function() {
    'use strict';

    angular
        .module('zaya-auth', [
          'common'
        ]);
})();

(function() {
    'use strict';

    angular
        .module('zaya-user', []);
})();

(function() {
    'use strict';

    angular
        .module('zaya-quiz', [
          'common'
        ]);
})();

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
(function () {
  'use strict';

  angular
    .module('zaya', [
      'ionic',
      'restangular',
      'ionic-native-transitions',

      // core
      'zaya-auth',
      'zaya-user',
      'zaya-quiz'
    ]);

})();

(function(){
    AppConfig.$inject = ["$httpProvider", "$ionicConfigProvider"];
  angular
    .module('zaya')
    .config(AppConfig)

    function AppConfig($httpProvider, $ionicConfigProvider){
      $httpProvider.interceptors.push(["$rootScope", "$q", function ($rootScope,$q){
        return {
          request : function(config){
            if(localStorage.Authorization)
              config.headers.Authorization = 'Token '+localStorage.Authorization;
              config.headers.xsrfCookieName = 'csrftoken';
              config.headers.xsrfHeaderName = 'X-CSRFToken';
            return config;
          },

          response : function(response){
            if(response.status==200 && response.data.hasOwnProperty('success')){
              $rootScope.success = $rootScope.success || [];
              $rootScope.success.push(response.data.success);
              setTimeout(function(){
                $rootScope.success.pop();
              },3000)
            }

            return response;
          },
          responseError : function(rejection){
            if([400,500].indexOf(rejection.status)!=-1){
              $rootScope.error = $rootScope.error || [];
              $rootScope.error.push(rejection.data);
              setTimeout(function(){
                $rootScope.error.pop();
              },3000)
            }
            if(rejection.status==404){
              console.log(rejection);
              $rootScope.error = $rootScope.error || [];
              $rootScope.error.push({'Not Found':'Functionality not available'});
              setTimeout(function(){
                $rootScope.error.pop();
              },3000)
            }
            return $q.reject(rejection);
          }
        }
      }])
      $ionicConfigProvider.views.maxCache(0);
    }
})();

(function(){
  var ROOT = 'templates';

  angular
    .module('zaya')
    .constant('CONSTANT',{
      // 'BACKEND_SERVICE_DOMAIN' : 'http://gopal.zaya.in',
      'BACKEND_SERVICE_DOMAIN' : 'http://192.168.10.121:9000',
      'VIEW' : 'view.html'
    })
})();

(function() {
    'use strict';

    angular
        .module('zaya')
        .factory('Rest', Rest);

    Rest.$inject = ['Restangular','CONSTANT'];

    /* @ngInject */
    function Rest(Restangular, CONSTANT) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN+'/api/v1');
            RestangularConfigurer.setRequestSuffix('/');
        });
    }
})();

(function() {
  'use strict';

  mainRoute.$inject = ["$urlRouterProvider"];
  angular
    .module('zaya')
    .config(mainRoute);

  function mainRoute($urlRouterProvider) {
    $urlRouterProvider.otherwise('/auth/main');
  }
})();

(function(){
  'use strict';

  runConfig.$inject = ["$ionicPlatform"];
  angular
    .module('zaya')
    .run(runConfig);

  function runConfig($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });

    window.addEventListener('native.keyboardshow', function(){
      document.body.classList.add('keyboard-open');
    });
  }

})();

(function(){
  var ROOT = 'templates';

  angular
    .module('zaya-auth')
    .constant('CONSTANT',{
      'PATH' : {
        'AUTH' : ROOT+'/auth'
      },
      'VIEW' : 'view.html'
    })
})();

(function(){
  'use strict';

  angular
    .module('zaya-auth')
    .controller('authController', authController)

    authController.$inject = ['$state','Auth','audio'];

  function authController($state,Auth,audio) {
    var authCtrl = this;

    authCtrl.audio = audio;

    authCtrl.login = function(user_credentials) {
      console.log(user_credentials);
        Auth.login(user_credentials,function(){
          $state.go('user.main.home',{});
        },function(){
          // $state.go('authenticate.signin',{})
        })
    }
    authCtrl.signup = function () {
      $state.go('user.personalise.usertype',{});
    }
  }
})();

(function() {
    'use strict';

    Auth.$inject = ["Restangular", "CONSTANT"];
    angular
        .module('zaya-auth')
        .factory('Auth', Auth)

    function Auth(Restangular,CONSTANT){
      var rest_auth = Restangular.withConfig(function(RestangularConfigurer) {
          RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN+'/rest-auth');
          RestangularConfigurer.setRequestSuffix('/');
          RestangularConfigurer.setDefaultHeaders({
            'Content-Type':'application/x-www-form-urlencoded',
          });
      });
      return {
        login : function(user_credentials, success, failure){
          rest_auth.all('login').post($.param(user_credentials)).then(function(response){
            localStorage.setItem('Authorization',response.key);
            success();
          },function(){
            failure();
          })
        },
        logout : function(success,failure){
          rest_auth.all('logout').post().then(function(response){
            localStorage.removeItem('Authorization');
            success();
          },function(error){
            failure();
          })
        },
        signup : function(user_credentials,success,failure){
          rest_auth.all('registration').post($.param(user_credentials),success,failure).then(function(response){
            localStorage.setItem('Authorization',response.key);
            success();
          },function(response){
            failure();
          })
        },
        reset : function (email,type,success,failure) {
          type=='password' && rest_auth.all('password').all('reset').post(email);
          type=='username' && rest_auth.all('username').all('reset').post(email);
        },
        isAuthorised : function(){
          return localStorage.Authorization;
        }
      }
    }
})();

(function() {
  'use strict';

  authRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya-auth')
    .config(authRoute);

  function authRoute($stateProvider, $urlRouterProvider, CONSTANT) {
    $stateProvider
    .state('auth', {
        url: '/auth',
        abstract: true,
        template: "<ion-nav-view name='state-auth'></ion-nav-view>",
      })
      .state('auth.main', {
        url: '/main',
        views: {
          'state-auth': {
            templateUrl: CONSTANT.PATH.AUTH + "/auth.main." + CONSTANT.VIEW
          }
        }
      })
      .state('auth.signin', {
        url: '/signin',
        views: {
          'state-auth': {
            templateUrl: CONSTANT.PATH.AUTH + '/auth.signin.' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.signup', {
        url: '/signup',
        views: {
          'state-auth': {
            templateUrl: CONSTANT.PATH.AUTH + '/auth.signup.' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.forgot', {
        url: '/forgot',
        nativeTransitions: {
          "type": "slide",
          "direction": "up"
        },
        views: {
          'state-auth': {
            templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot.' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
  }
})();

(function() {
  angular
    .module('zaya')
    .directive('widgetCarousel', widgetCarousel)
    .directive('carouselItem', carouselItem);

  function widgetCarousel() {
    var carousel = {}
    carousel.restrict = 'A';
    carousel.link = function(scope) {
      scope.initCarousel = function(element) {
        // provide any default options you want
        var defaultOptions = {};
        var customOptions = scope.$eval($(element).attr('carousel-options'));
        // combine the two options objects
        for (var key in customOptions) {
          if (customOptions.hasOwnProperty(key)) {
            defaultOptions[key] = customOptions[key];
          }
        }
        // init carousel
        $(element).owlCarousel(defaultOptions);
      };
    }
    return carousel;
  }

  function carouselItem() {
    var carouselItem = {};
    carouselItem.restrict = 'A';
    carouselItem.transclude = false;
    carouselItem.link = function(scope, element) {
      // wait for the last item in the ng-repeat then call init
      if (scope.$last) {
        scope.initCarousel(element.parent());
      }
    }
    return carouselItem;
  }
})();

(function () {
  'use strict';

    audio.$inject = ["$cordovaNativeAudio"];
  angular
    .module('common')
    .factory('audio',audio)

    function audio($cordovaNativeAudio) {
      return {
        play : function (sound) {
          try{
            $cordovaNativeAudio.play(sound);
            console.log('sound played');
          }
          catch(error){
            console.log(error);
          }
        }
      };
    }
})();

(function(){
  'use strict';

  runConfig.$inject = ["$ionicPlatform", "$cordovaNativeAudio"];
  angular
    .module('common')
    .run(runConfig);

  function runConfig($ionicPlatform,$cordovaNativeAudio) {
    $ionicPlatform.ready(function() {
      try{
        $cordovaNativeAudio.preloadSimple('water-drop', 'sound/water-drop.mp3');
        $cordovaNativeAudio.preloadSimple('correct', 'sound/correct.mp3');
        $cordovaNativeAudio.preloadSimple('wrong', 'sound/wrong.mp3');
      }
      catch(error){
        console.log('native audio not supported');
      }
    });
  }

})();

(function(){
  'use strict';

  angular
    .module('zaya')
    .controller('homeController',homeController)

  homeController.$inject = ['$scope'];

  function homeController($scope) {
    var homeCtrl = this;
    homeCtrl.carouselOptions = {
        "loop": false,
        "margin": 0,
        "items": 1,
        "stagePadding": 20,
        "nav": false,
        "autoplay": false,
        "center" : true
    };
  }
})();

(function(){
  var ROOT = 'templates';

  angular
    .module('zaya-quiz')
    .constant('CONSTANT',{
      'PATH' : {
        'QUIZ' : ROOT+'/quiz'
      },
      'VIEW' : 'view.html'
    })
})();

(function() {
  angular
    .module('zaya-quiz')
    .controller('QuizController', QuizController)

  QuizController.$inject = ['quiz','$stateParams', '$state', '$scope', 'audio'] ;

  function QuizController(quiz, $stateParams, $state, $scope, audio) {
    var quizCtrl = this;

    quizCtrl.quiz = quiz;
    quizCtrl.audio = audio;
    quizCtrl.init = init;

    // traversing the question
    quizCtrl.isCurrentIndex = isCurrentIndex;
    quizCtrl.setCurrentIndex = setCurrentIndex;
    quizCtrl.getCurrentIndex = getCurrentIndex;
    quizCtrl.prevQuestion = prevQuestion;
    quizCtrl.nextQuestion = nextQuestion;

    //log attempts & feedback
    quizCtrl.submit = submit;
    quizCtrl.canSubmit = canSubmit;
    quizCtrl.feedback = feedback;
    quizCtrl.submitAttempt = submitAttempt;
    quizCtrl.isAttempted = isAttempted;
    quizCtrl.isCorrect = isCorrect;
    quizCtrl.isCorrectAttempted = isCorrectAttempted;
    quizCtrl.isKeyCorrect = isKeyCorrect;
    quizCtrl.isKeyAttempted = isKeyAttempted;

    // initialisation call
    quizCtrl.setCurrentIndex(0);
    quizCtrl.init(quizCtrl.quiz);

    function init (quiz) {
      // init report object
      if($state.current.name=="quiz.summary"){
        quizCtrl.report = $stateParams.report;
      }
      else if($state.current.name=="quiz.questions"){
        quizCtrl.report = {};
        quizCtrl.report.quiz_id = quiz.info.id;
        quizCtrl.report.attempts = {};
        for (var i = 0; i < quiz.questions.length; i++) {
          quizCtrl.report.attempts[quiz.questions[i].info.id] = [];
        }
      }
      else{}
    }

    function isCurrentIndex (index) {
      return quizCtrl.currentIndex == index;
    }

    function setCurrentIndex(index) {
      quizCtrl.currentIndex = index;
    }

    function getCurrentIndex() {
      return quizCtrl.currentIndex;
    }

    function prevQuestion() {
      quizCtrl.currentIndex = (quizCtrl.currentIndex > 0) ? --quizCtrl.currentIndex : quizCtrl.currentIndex;
    }

    function nextQuestion() {
      quizCtrl.currentIndex = (quizCtrl.currentIndex < quizCtrl.quiz.questions.length - 1) ? ++quizCtrl.currentIndex : quizCtrl.currentIndex;
    }

    function submit() {
      if(!quizCtrl.isCorrectAttempted(quizCtrl.quiz.questions[quizCtrl.currentIndex])){
        quizCtrl.submitAttempt(
          quizCtrl.quiz.questions[quizCtrl.currentIndex].info.id,
          quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted
        );
        quizCtrl.feedback(
          quizCtrl.quiz.questions[quizCtrl.currentIndex],
          quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted
        );
      }
      else if(quizCtrl.currentIndex < quizCtrl.quiz.questions.length - 1){
        quizCtrl.nextQuestion();
      }
      else {
        // final question -> go to summary
        $state.go('quiz.summary',{report : angular.copy(quizCtrl.report)});
      }
    }

    function canSubmit(){
      // SCQ | DR
      if((quizCtrl.quiz.questions[quizCtrl.currentIndex].info.content_type == "choice question" && !quizCtrl.quiz.questions[quizCtrl.currentIndex].info.question_type.is_multiple) || quizCtrl.quiz.questions[quizCtrl.currentIndex].info.content_type == "dr question"){
        return quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted;
      }
      // MCQ
      if(quizCtrl.quiz.questions[quizCtrl.currentIndex].info.content_type == "choice question" && quizCtrl.quiz.questions[quizCtrl.currentIndex].info.question_type.is_multiple){
        //removes false keys
        quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted = _.pick(quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted, _.identity);
        // true if attempted and key count is more than one
        return quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted && _.size(quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted)>1;
      }
    }

    function feedback (question,attempt){
      return quizCtrl.isCorrect(question,attempt) ? quizCtrl.audio.play('correct') : quizCtrl.audio.play('wrong') ;
    }

    function submitAttempt (question_id,attempt) {
      quizCtrl.report.attempts[question_id].push(attempt);
    }

    function isAttempted (question_id) {
      return quizCtrl.report.attempts[question_id].length ? true : false;
    }

    function isCorrect(question,attempt){
      // multiple choice
      if(question.info.content_type=='choice question' && question.info.question_type.is_multiple){
        return _.chain(attempt).map(function(num,key){return parseInt(key);}).isEqual(question.info.answer).value();
      }
      // single choice
      if(question.info.content_type=='choice question' && !question.info.question_type.is_multiple){
        return attempt == question.info.answer[0];
      }
      // dr
      if(question.info.content_type=='dr question'){
        return attempt == question.info.answer[0];
      }
    }

    function isCorrectAttempted (question){
      // multiple choice
      if(question.info.content_type=='choice question' && question.info.question_type.is_multiple){
        for (var i = 0; i < quizCtrl.report.attempts[question.info.id].length; i++) {
          if(_.chain(quizCtrl.report.attempts[question.info.id][i]).map(function(num,key){return parseInt(key);}).isEqual(question.info.answer).value())
            return true;
        }
        return false;
      }
      // single choice
      if(question.info.content_type=='choice question' && !question.info.question_type.is_multiple){
        return quizCtrl.report.attempts[question.info.id].indexOf(question.info.answer[0])!=-1 ? true : false;
      }
      // dr
      if(question.info.content_type=='dr question'){
        return quizCtrl.report.attempts[question.info.id].indexOf(question.info.answer[0].toLowerCase())!=-1 ? true : false;
      }
    }

    function isKeyCorrect (question,key){
        return question.info.answer.indexOf(key)!=-1 ? true : false;
    }

    function isKeyAttempted (question,key){
      if(question.info.question_type.is_multiple){
        return _.chain(quizCtrl.report.attempts[question.info.id]).last().has(key).value();
      }
      else{
        return quizCtrl.report.attempts[question.info.id].indexOf(key)!=-1 ? true : false;
      }
    }
  }
})();

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
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
                return Rest.one('assessments', $stateParams.id).get().then(function(quiz) {
                    return quiz.plain();
                })
            }]
        }
      })
      .state('quiz.start',{
        url : '/start',
        views : {
          'state-quiz' : {
            templateUrl : CONSTANT.PATH.QUIZ+'/quiz.start.'+CONSTANT.VIEW,
            controller : 'QuizController as quizCtrl'
          }
        }
      })
      .state('quiz.questions',{
        url : '/questions',
        views : {
          'state-quiz' : {
            templateUrl : CONSTANT.PATH.QUIZ+'/quiz.questions.'+CONSTANT.VIEW,
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
            templateUrl : CONSTANT.PATH.QUIZ+'/quiz.summary.'+CONSTANT.VIEW,
            controller : 'QuizController as quizCtrl'
          }
        }
      })
  }
})();

(function(){
  var ROOT = 'templates';

  angular
    .module('zaya-user')
    .constant('CONSTANT',{
      'PATH' : {
        'PROFILE' : ROOT+'/profile',
        'USER' : ROOT+'/user',
      },
      'VIEW' : 'view.html'
    })
})();

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya-user')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('user',{
        url :'/user',
        abstract : true,
        templateUrl: CONSTANT.PATH.USER+'/user.'+CONSTANT.VIEW,
      })
      // personalisation for all
      .state('user.personalise',{
        url : '/personalise',
        abstract : true,
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise.'+CONSTANT.VIEW,
          }
        }
      })
      .state('user.personalise.usertype',{
        url : '/usertype',
        views : {
          'state-personalise':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise.usertype.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.personalise.usersubject',{
        url : '/usersubject',
        views : {
          'state-personalise':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise.usersubject.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main',{
        url : '/main',
        abstract : true,
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.USER+'/main.'+CONSTANT.VIEW,
          }
        }
      })
      // .state('user.main.profile',{
      //   url : '/profile',
      //   abstract : true,
      //   templateUrl : CONSTANT.PATH.AUTH+'/profile.'+CONSTANT.VIEW
      // })
      // .state('user.main.profile.groups',{
      //   url : '/groups',
      //   views : {
      //     'group-tab' : {
      //       templateUrl : CONSTANT.PATH.AUTH+'/profile.group.'+CONSTANT.VIEW
      //     }
      //   }
      // })
      // .state('user.main.profile.badges',{
      //   url : '/badges',
      //   views : {
      //     'badge-tab':{
      //       templateUrl : CONSTANT.PATH.AUTH+'/profile.badge.'+CONSTANT.VIEW
      //     }
      //   }
      // })
      .state('user.main.playlist',{
        url : '/playlist',
        views : {
          'playlist-tab':{
            templateUrl : 'templates/playlist/playlist.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main.home',{
        url : '/home',
        views : {
          'home-tab':{
            templateUrl : 'templates/home/home.'+CONSTANT.VIEW,
            controller : 'homeController as homeCtrl'
          }
        }
      })
      .state('user.main.result',{
        url : '/result',
        views : {
          'result-tab':{
            templateUrl : 'templates/result/result.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main.search',{
        url : '/search',
        views : {
          'search-tab':{
            templateUrl : 'templates/search/search.'+CONSTANT.VIEW
          }
        }
      })
  }
})();
