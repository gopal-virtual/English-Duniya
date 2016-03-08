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
      'ngCordova'
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

      $ionicConfigProvider.views.transition("android");

    }
})();

(function(){
  var ROOT = 'template';

  angular
    .module('zaya')
    .constant('CONSTANT',{
      'BACKEND_SERVICE_DOMAIN' : 'http://gopal.zaya.in',
      // 'BACKEND_SERVICE_DOMAIN' : 'http://192.168.1.34:9000',
      'PATH' : {
        'AUTH' : ROOT+'/auth',
        'QUIZ' : ROOT+'/quiz'
      },
      // 'CONTROLLER' : 'controller.js',
      'VIEW' : 'view.html'
    })
})();

(function() {
    'use strict';

    Rest.$inject = ["Restangular", "CONSTANT"];
    Auth.$inject = ["Restangular", "CONSTANT"];
    angular
        .module('zaya')
        .factory('Rest', Rest)
        .factory('Auth', Auth)

    function Rest(Restangular, CONSTANT) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN+'/api/v1');
            RestangularConfigurer.setRequestSuffix('/');
        });
    }
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

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      //Authentication - > Main, Signin, Signup, Forgot
      .state('auth',{
        url : '/auth',
        abstract : true,
        template : '<ion-nav-view animation="slide-left-right"></ion-nav-view>'
      })
      .state('auth.main',{
        url : '/main',
        templateUrl : CONSTANT.PATH.AUTH+"/auth.main."+CONSTANT.VIEW
      })
      .state('auth.signin', {
        url: '/signin',
        templateUrl: CONSTANT.PATH.AUTH+'/auth.signin.'+CONSTANT.VIEW,
        controller : 'authController as authCtrl'
      })
      .state('auth.signup',{
        url : '/signup',
        templateUrl : CONSTANT.PATH.AUTH+'/auth.signup.'+CONSTANT.VIEW,
        controller : 'authController as authCtrl'
      })
      .state('auth.forgot',{
        url : '/forgot',
        templateUrl : CONSTANT.PATH.AUTH+'/auth.forgot.'+CONSTANT.VIEW,
        controller : 'authController as authCtrl'
      })
      // end : Authentication

      // Practice
      // end : Practice

      // Quiz
      .state('quiz',{
        url : '/quiz/:id',
        abstract : true,
        cache: false,
        template : '<ion-nav-view></ion-nav-view>',
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
        templateUrl : CONSTANT.PATH.QUIZ+'/quiz.start.'+CONSTANT.VIEW,
        controller : 'QuizController as quizCtrl'
      })
      .state('quiz.questions',{
        url : '/questions',
        templateUrl : CONSTANT.PATH.QUIZ+'/quiz.questions.'+CONSTANT.VIEW,
        controller : 'QuizController as quizCtrl'
      })
      .state('quiz.summary',{
        url : '/summary',
        templateUrl : CONSTANT.PATH.QUIZ+'/quiz.summary.'+CONSTANT.VIEW,
        controller : 'QuizController as quizCtrl'
      })
      // end : Quiz


      //landing
      .state('user',{
        url :'/user',
        abstract : true,
        template: '<ion-nav-view></ion-nav-view>'
      })
      // personalisation for all
      .state('user.personalise',{
        url : '/personalise',
        abstract : true,
        templateUrl : 'template/profile/personalise.'+CONSTANT.VIEW,
      })
      .state('user.personalise.usertype',{
        url : '/usertype',
        templateUrl : 'template/profile/personalise.usertype.'+CONSTANT.VIEW
      })
      .state('user.personalise.usersubject',{
        url : '/usersubject',
        templateUrl : 'template/profile/personalise.usersubject.'+CONSTANT.VIEW
      })
      // learn app
      .state('user.main',{
        url : '/main',
        abstract : true,
        templateUrl : 'template/user/main.'+CONSTANT.VIEW,
        controller : 'userMainController as UserMain'
      })
      .state('user.main.profile',{
        url : '/profile',
        abstract : true,
        templateUrl : 'template/profile/profile.'+CONSTANT.VIEW
      })
      .state('user.main.profile.groups',{
        url : '/groups',
        views : {
          'group-tab' : {
            templateUrl : 'template/profile/profile.group.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main.profile.badges',{
        url : '/badges',
        views : {
          'badge-tab':{
            templateUrl : 'template/profile/profile.badge.'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main.playlist',{
        url : '/playlist',
        templateUrl : 'template/playlist/playlist.'+CONSTANT.VIEW
      })
      .state('user.main.home',{
        url : '/home',
        templateUrl : 'template/home/home.'+CONSTANT.VIEW,
        controller : 'homeController as homeCtrl'
      })
      .state('user.main.result',{
        url : '/result',
        templateUrl : 'template/result/result.'+CONSTANT.VIEW
      })
      .state('user.main.search',{
        url : '/search',
        templateUrl : 'template/search/search.'+CONSTANT.VIEW
      })

    $urlRouterProvider.otherwise('/auth/main');
    // $urlRouterProvider.otherwise('/splash');
  }
})();

(function(){
  'use strict';

  runConfig.$inject = ["$ionicPlatform", "$cordovaNativeAudio"];
  angular
    .module('zaya')
    .run(runConfig);

  function runConfig($ionicPlatform,$cordovaNativeAudio) {
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
      // load sound
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
    .controller('userMainController',userMainController)

  userMainController.$inject = ['$state'];

  function userMainController($state) {
    var UserMain = this;

    UserMain.goToProfile = function(){ $state.go('user.main.profile',{})}
    UserMain.goToPlaylist = function(){ $state.go('user.main.playlist',{})}
    UserMain.goToHome = function(){ $state.go('user.main.home',{})}
    UserMain.goToResult = function(){ $state.go('user.main.result',{})}
    UserMain.goToSearch = function(){ $state.go('user.main.search',{})}
  }
})();

(function(){
  'use strict';

  angular
    .module('zaya')
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
    .module('zaya')
    .factory('audio',audio)

    function audio($cordovaNativeAudio) {
      return {
        play : function (sound) {
          try{
            $cordovaNativeAudio.play(sound);
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

  angular
    .module('zaya')
    .controller('homeController',homeController)

  homeController.$inject = ['$scope'];

  function homeController($scope) {
    var homeCtrl = this;
    homeCtrl.carouselOptions = {
        "loop": true,
        "margin": 0,
        "items": 1,
        "stagePadding": 20,
        "nav": false,
        "autoplay": true,
        "center" : true
    };
  }
})();

(function() {
  angular
    .module('zaya')
    .controller('QuizController', QuizController)

  QuizController.$inject = ['quiz','$stateParams', '$state', '$scope', 'audio'] ;

  function QuizController(quiz, $stateParams, $state, $scope, audio) {
    var quizCtrl = this;

    quizCtrl.quiz = quiz;
    quizCtrl.audio = audio;
    var quizQuestions = quizCtrl.quiz.questions;

    quizCtrl.init = function (quiz) {
      // init report object
      quizCtrl.report = {};
      quizCtrl.report.quiz_id = quiz.info.id;
      quizCtrl.report.attempts = {};
      for (var i = 0; i < quiz.questions.length; i++) {
        quizCtrl.report.attempts[quiz.questions[i].info.id] = [];
      }
    }

    // traversing the question
    quizCtrl.isCurrentIndex = function(index) {
      return quizCtrl.currentIndex == index;
    }
    quizCtrl.setCurrentIndex = function(index) {
      quizCtrl.currentIndex = index;
    }
    quizCtrl.getCurrentIndex = function () {
      return quizCtrl.currentIndex;
    }
    quizCtrl.prevQuestion = function() {
      quizCtrl.currentIndex = (quizCtrl.currentIndex > 0) ? --quizCtrl.currentIndex : quizCtrl.currentIndex;
    }
    quizCtrl.nextQuestion = function() {
      quizCtrl.currentIndex = (quizCtrl.currentIndex < quizQuestions.length - 1) ? ++quizCtrl.currentIndex : quizCtrl.currentIndex;
    }

    //log attempts & feedback
    quizCtrl.submit = function () {
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
      else{
        quizCtrl.nextQuestion();
      }
    }
    quizCtrl.canSubmit = function(){
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
    quizCtrl.feedback = function (question,attempt){
      return quizCtrl.isCorrect(question,attempt) ? quizCtrl.audio.play('correct') : quizCtrl.audio.play('wrong') ;
    }
    quizCtrl.submitAttempt = function (question_id,attempt) {
      quizCtrl.report.attempts[question_id].push(attempt);
    }
    quizCtrl.isAttempted = function (question_id) {
      return quizCtrl.report.attempts[question_id].length ? true : false;
    }
    quizCtrl.isCorrect = function(question,attempt){
      // multiple choice
      if(question.info.content_type=='choice question' && question.info.question_type.is_multiple){
        // return angular.equals(attempt.sort(),question.info.answer.sort());
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
    quizCtrl.isCorrectAttempted = function(question){
      // multiple choice
      if(question.info.content_type=='choice question' && question.info.question_type.is_multiple){
        // return true;
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
    quizCtrl.isKeyCorrect = function(question,key){
        return question.info.answer.indexOf(key)!=-1 ? true : false;
    }
    quizCtrl.isKeyAttempted = function(question,key){
      if(question.info.question_type.is_multiple){
        return _.chain(quizCtrl.report.attempts[question.info.id]).last().has(key).value();
      }
      else{
        return quizCtrl.report.attempts[question.info.id].indexOf(key)!=-1 ? true : false;
      }
    }

    // initialisation call
    quizCtrl.setCurrentIndex(0);
    quizCtrl.init(quizCtrl.quiz);
  }
})();
