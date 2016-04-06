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
        .module('zaya-map', []);
})();

(function() {
    'use strict';

    angular
        .module('zaya-intro', []);
})();

(function() {
    'use strict';

    angular
        .module('zaya-search', []);
})();

(function() {
    'use strict';

    angular
        .module('zaya-auth', []);
})();

(function() {
    'use strict';

    angular
        .module('zaya-user', [
          'ionic',
          'ionic-native-transitions',
        ]);
})();

(function() {
    'use strict';

    angular
        .module('zaya-playlist', []);
})();

(function() {
    'use strict';

    angular
        .module('zaya-profile', []);
})();

(function() {
    'use strict';

    angular
        .module('zaya-quiz', [
          'ui.sortable'
        ]);
})();

(function() {
    'use strict';

    angular
        .module('zaya-group', []);
})();

(function () {
  'use strict';

  angular
    .module('zaya', [
      // external
      'ionic',
      'restangular',
      'ionic-native-transitions',
      'ngMessages',
      'ngCookies',

      // core
      'common',
      'zaya-user',
      'zaya-map',
      'zaya-playlist',
      'zaya-profile',
      'zaya-intro',
      'zaya-auth',
      'zaya-quiz',
      'zaya-search',
      'zaya-group'
    ]);

})();

(function(){
    AppConfig.$inject = ["$httpProvider", "$ionicConfigProvider", "$ionicNativeTransitionsProvider", "$logProvider"];
  angular
    .module('zaya')
    .config(AppConfig)

    function AppConfig($httpProvider, $ionicConfigProvider, $ionicNativeTransitionsProvider, $logProvider){
      // global debug log
      $logProvider.debugEnabled(true);

      // request/response interceptors
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
              void 0;
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
      $ionicConfigProvider.tabs.position('bottom');
      $ionicNativeTransitionsProvider.enable(true, false);
    }
})();

(function() {
    'use strict';

    angular
        .module('zaya')
        .factory('Rest', Rest);

    Rest.$inject = ['Restangular','CONSTANT'];

    function Rest(Restangular, CONSTANT) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN+'/api/v1');
            RestangularConfigurer.setRequestSuffix('/');
        });
    }
})();

(function() {
  'use strict';

  mainRoute.$inject = ["$urlRouterProvider", "$injector"];
  angular
    .module('zaya')
    .config(mainRoute);

  function mainRoute($urlRouterProvider, $injector) {
    // anonymous function implemented to avoid digest loop
    $urlRouterProvider.otherwise(function ($injector) {
        $injector.get('$state').go('intro');
    });
  }
})();

(function(){
  'use strict';

  runConfig.$inject = ["$ionicPlatform", "$rootScope", "$timeout", "$log", "$state", "$http", "$cookies", "Auth"];
  angular
    .module('zaya')
    .run(runConfig);

  function runConfig($ionicPlatform, $rootScope, $timeout, $log, $state,$http,$cookies, Auth) {
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
        // alternative to phaser destroy() ; phaser destroy doesn't remove canvas element
        if(toState.name!='user.main.playlist'){
          try {
            var canvas = document.querySelector('#map_canvas');
            canvas.parentNode.removeChild(canvas);
            $log.debug("Canvas Removed");
          }
          catch(e){}
        }
        //if not authenticated, redirect to login page
        if(!Auth.isAuthorised() && toState.name!='auth.signin' && toState.name!='auth.signup' && toState.name!='auth.forgot'){
          $log.debug("You are not authorized");
          event.preventDefault();
          $state.go('auth.signin');
        }
        //if authenticated, redirect to userpage
        if(Auth.isAuthorised() && (toState.name=='auth.signin' || toState.name=='auth.signup' || toState.name=='intro')){
          $log.debug("You are authorized");
          // event.preventDefault();
          // $state.go('user.main.home');
        }
        // block access to quiz summary page if there is no quiz data
        if(toState.name == 'quiz.summary' && !toParams.quizSummary){
            $log.debug("Quiz summary page cannot be accessed : No quiz data present");
            event.preventDefault();
        }

    })
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
  }

})();

(function(){
  'use strict';

  angular
    .module('zaya-auth')
    .controller('authController', authController)

    authController.$inject = ['$state','Auth','audio','$rootScope'];

  function authController($state,Auth,audio,$rootScope) {
    var authCtrl = this;

    authCtrl.audio = audio;
    authCtrl.login = login;
    authCtrl.signup = signup;
    authCtrl.rootScope = $rootScope;

    function login (user_credentials) {
        Auth.login(user_credentials,function(){
          $state.go('user.main.home',{});
        },function(){
          authCtrl.audio.play('wrong');
        })
    }

    function signup (user_credentials) {
      Auth.signup(user_credentials,function(){
        $state.go('user.personalise.usertype',{});
      },function(){
        authCtrl.audio.play('wrong');
      })
    }

  }
})();

(function() {
    'use strict';

    angular
        .module('zaya-auth')
        .factory('Auth', Auth)

    Auth.$inject = ['Restangular','CONSTANT', '$cookies'];

    function Auth(Restangular,CONSTANT, $cookies){
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
      // intro is now the main screen
      // .state('auth.main', {
      //   url: '/main',
      //   views: {
      //     'state-auth': {
      //       templateUrl: CONSTANT.PATH.AUTH + "/auth.main" + CONSTANT.VIEW
      //     }
      //   }
      // })
      .state('auth.signin', {
        url: '/signin',
        nativeTransitions: {
          "type": "slide",
          "direction": "left",
          "duration" :  400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.signin' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.signin.social' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.signup', {
        url: '/signup',
        nativeTransitions: {
          "type": "slide",
          "direction": "left",
          "duration" :  400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.signup' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.signup.social' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.forgot', {
        url: '/forgot',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration" :  400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot.social' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
  }
})();

(function(){
  var ROOT = 'templates';

  angular
    .module('common')
    .constant('CONSTANT',{
      'BACKEND_SERVICE_DOMAIN' : 'http://192.168.10.134:9000',
      'PATH' : {
        'INTRO' : ROOT+'/intro',
        'AUTH' : ROOT+'/auth',
        'QUIZ' : ROOT+'/quiz',
        'PROFILE' : ROOT+'/profile',
        'USER' : ROOT+'/user',
        'PLAYLIST' : ROOT+'/playlist',
        'HOME' : ROOT+'/home',
        'RESULT' : ROOT+'/result',
        'SEARCH' : ROOT+'/search',
        'GROUP' : ROOT+'/group',
        'COMMON' : ROOT + '/common',
        'MAP' : ROOT + '/map'
      },
      'VIEW' : '.view.html',
    })
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

(function(){
	widgetError.$inject = ["CONSTANT"];
	angular
		.module('common')
		.directive('widgetError',widgetError)

	function widgetError(CONSTANT){
		var error = {};
		error.restrict = 'E';
		error.templateUrl = CONSTANT.PATH.COMMON + '/common.error' + CONSTANT.VIEW;
		error.controller = ['$rootScope','$scope',function ($rootScope,$scope) {
			$scope.error = function(){
				return $rootScope.error;
			}
		}]
		return error;
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
            void 0;
          }
          catch(error){
            void 0;
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
        void 0;
      }
    });
  }

})();

(function() {
    'use strict';

    angular
        .module('zaya-group')
        .controller('Controller', Controller);

    Controller.$inject = [];

    /* @ngInject */
    function Controller() {
        var groupCtrl = this;

        groupCtrl.activate();

        function activate() {

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
      .state('group',{
        url : '/group',
        abstract : true,
        template : '<ion-nav-view name="state-group-admin"></ion-nav-view><ion-nav-view name="state-group-student"></ion-nav-view>'
      })
      .state('group.admin',{
        url : '/admin',
        views : {
          'state-group-admin' : {
            templateUrl : CONSTANT.PATH.GROUP + '/group.admin' + CONSTANT.VIEW,
            controller : 'groupController as groupCtrl'
          }
        }
      })
      .state('group.student',{
        url : '/student',
        views : {
          'state-group-student' : {
            templateUrl : CONSTANT.PATH.GROUP + '/group.student' + CONSTANT.VIEW,
            controller : 'groupController as groupCtrl'
          }
        }
      })
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

(function() {
    'use strict';

    angular
        .module('zaya-intro')
        .controller('introController', introController);

    introController.$inject = [];

    /* @ngInject */
    function introController() {
        var introCtrl = this;

        introCtrl.tabIndex = 0;
        introCtrl.slides = [
          {
            title : "Hello this Title",
            description : "some description is theresome description is theresome description is there",
            img : "img/01.png",
            color : "bg-brand-light"
          },
          {
            title : "Hello this Title",
            description : "some description is theresome description is theresome description is there",
            img : "img/02.png",
            // color : "bg-brand-light"
            color : "bg-assertive-light"
          },
          {
            title : "Hello this Title",
            description : "some description is theresome description is theresome description is there",
            img : "img/03.png",
            // color : "bg-brand-light"
            color : "bg-royal-light"
          }
        ];
    }
})();

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya-intro')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {
    $stateProvider
      .state('intro',{
        url : '/intro',
        templateUrl : CONSTANT.PATH.INTRO+'/intro'+CONSTANT.VIEW,
        controller : "introController as introCtrl"
      })
  }
})();

(function() {
    'use strict';

    angular
        .module('zaya-map')
        .controller('mapController', mapController);

    mapController.$inject = [];

    function mapController() {
        var zayaCtrl = this;
    }
})();

(function() {
    'use strict';

    mapCanvas.$inject = ["$injector", "$timeout"];
    angular
        .module('zaya-map')
        .directive('mapCanvas', mapCanvas)

    /* @ngInject */
    function mapCanvas($injector, $timeout) {
        var mapCanvas = {
            restrict: 'A',
            template: '<div id="map_canvas"></div>',
            scope: {
              // 'players' : '=',
              // 'mapId' : '='
            },
            link: linkFunc,
            // controller: Controller,
            // controllerAs: 'vm',
            // bindToController: true
        };

        return mapCanvas;

        function linkFunc(scope, el, attr, ctrl) {
          // createGame(scope, scope.players, scope.mapId, $injector)
          void 0;
          $timeout(createGame(scope, $injector));
        }
    }

    // Controller.$inject = ['dependencies'];

    /* @ngInject */
    // function Controller(dependencies) {
    //     var vm = this;
    //
    //     activate();
    //
    //     function activate() {
    //
    //     }
    // }
})();

window.createGame = function(scope, injector) {
  'use strict';

  void 0;
  var game = new Phaser.Game("100%", "100%", Phaser.AUTO, 'map_canvas', {
    preload: preload,
    create: create,
    update: update
  })

  function preload() {
    game.load.image('cloud1', 'img/cloud1.png');
    game.load.image('cloud2', 'img/cloud2.png');
    game.load.image('cloud3', 'img/cloud3.png');
    game.load.image('cloud4', 'img/cloud4.png');
    game.load.image('cloud5', 'img/cloud5.png');
    game.load.image('cloud6', 'img/cloud6.png');
    game.load.image('cloud7', 'img/cloud7.png');
    game.load.image('path', 'img/path.png');
    game.load.image('node', 'img/node.png');
  }

  function create() {
    game.stage.backgroundColor = "#AAD9E8";
    game.world.setBounds(0, 0, game.width, game.height * 3);
    init();
    var cloudCount = 20;
    for (var i = 0; i < cloudCount; i++) {
      var cloud = game.add.sprite(game.world.randomX, game.world.randomY, 'cloud' + game.rnd.between(1, 7));
      var scaleFactor = game.rnd.between(3,6)/10;
      cloud.scale.setTo(scaleFactor, scaleFactor);
      game.physics.arcade.enable(cloud);
      cloud.body.velocity.x = game.rnd.between(-5, -75);
      cloud.autoCull = true;
      cloud.checkWorldBounds = true;
      cloud.events.onOutOfBounds.add(resetSprite, this);
    }

    // game.add.sprite(game.width / 2, 0, 'path').scale.setTo(0.5, 0.5);

    var nodeCount = 20
    for (var i = 0; i < nodeCount; i++) {
      var node = game.add.sprite((i*10)+50, i * (game.world.height / nodeCount), 'node');
      node.scale.setTo(0.5, 0.5);
    }

  }
  function resetSprite(sprite) {
    sprite.x = game.world.bounds.right;
  }

  function init() {
    game.camera.y = game.height * 2;
  }

  function update() {
    dragMap(this);
  }

  function dragMap(ref) {
    if (ref.game.input.activePointer.isDown) {
      if (ref.game.origDragPoint) {
        // move the camera by the amount the mouse has moved since last update
        ref.game.camera.x += ref.game.origDragPoint.x - ref.game.input.activePointer.position.x;
        ref.game.camera.y += ref.game.origDragPoint.y - ref.game.input.activePointer.position.y;
      }
      // set new drag origin to current position
      ref.game.origDragPoint = ref.game.input.activePointer.position.clone();
    } else {
      ref.game.origDragPoint = null;
    }
  }

  function render() {
  }
  scope.$on('$destroy', function() {
    // phaser destroy is broken, check for fix
    // game.destroy(); // Clean up the game when we leave this scope
  });
};

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya-map')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('map',{
        url : '/map',
        templateUrl : CONSTANT.PATH.MAP + '/map' + CONSTANT.VIEW,
        controller : 'mapController as mapCtrl'
      })
  }
})();

(function() {
    'use strict';

    angular
        .module('zaya-playlist')
        .controller('playlistController', playlistController);

    playlistController.$inject = ['$ionicScrollDelegate','$timeout','$stateParams','playlistData'];

    function playlistController($ionicScrollDelegate,$timeout,$stateParams,playlistData) {
        var playlistCtrl = this;
        playlistCtrl.playlist = playlistData.playlist;
        playlistCtrl.playlistId = $stateParams.playlistId;

        $timeout(function() {
            $ionicScrollDelegate.$getByHandle('playlistScrollBottom').scrollBottom();
        });


    }
})();

(function() {
    'use strict';

    angular
        .module('zaya-playlist')
        .factory('playlistData', playlistData);

    playlistData.$inject = [];

    function playlistData() {
        var playlist = {
          playlist : {
              id : 100,
              title : "Root",
              description : "Root",
              root : true,
              children : [
                {
                  id : 1,
                  title : "English",
                  description : "lorem some desction for the subjjectt lorem some desction for the subjjecttlorem some desction for the subjjecttlorem some desction for the subjjecttlorem some desction for the subjjecttlorem some desction for the subjjecttlorem some desction for the subjjecttlorem some desction for the subjjectt",
                  image : "path",
                  children : [
                    {
                      id : 10,
                      title : "Lorem ipsum dolor sit amet",
                      description : "Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet",
                      children : [
                        {
                          id : 2,
                          title : "dolor sit amet",
                          description : "ipsum dolor sit ametLorem ipsum dolor sit amet",
                        },
                      ]
                    },
                    {
                      id : 11,
                      title : "Lorem hello are you",
                      description : "dolor sit ametLorem ipsum olor sit ametLorem ipsum dolor sit amet",
                      children : [
                        {
                          id : 111,
                          title : "Lorsdlfkj sdlfkj",
                          description : "dolor sdlfkjsdf sdflskdjfsd s",
                          children : []
                        },
                        {
                          id : 111,
                          title : "sdflksf sdlfsdk",
                          description : "dolor sdlscfsdf dffkjsdf sdflskdjfsd s",
                          children : []
                        },
                        {
                          id : 111,
                          title : "sdfsdf fsdf dsfj",
                          description : "dolor sdlsdffsfsd sdflskdjfsd s",
                          children : []
                        },
                        {
                          id : 111,
                          title : "dfd dfdf",
                          description : "ddsfsf sdflskdjfsd",
                          children : []
                        },
                      ]
                    },
                    {
                      id : 12,
                      title : "Lorem ipsum dolor sit amet",
                      description : "Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet",
                      children : []
                    }
                  ]
                },
                {
                  id : 2,
                  title : "Math",
                  description : "lorem some desction for the subjjectt",
                  image : "path",
                  children : []
                },
                {
                  id : 2,
                  title : "Geography",
                  description : "lorem some desction for the subjjectt",
                  image : "path",
                  children : []
                },
                {
                  id : 4,
                  title : "Science",
                  description : "lorem some desction for the subjjectt",
                  image : "path",
                  children : []
                },
                {
                  id : 4,
                  title : "Biology",
                  description : "lorem some desction for the subjjectt",
                  image : "path",
                  children : []
                },
                {
                  id : 4,
                  title : "Bio technology",
                  description : "lorem some desction for the subjjectt",
                  image : "path",
                  children : []
                },
                {
                  id : 4,
                  title : "Linkin Park",
                  description : "lorem some desction for the subjjectt",
                  image : "path",
                  children : []
                }
              ]
          }
        };

        return playlist;

    }
})();

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya-playlist')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {
    // $stateProvider
    //   .state('playlist',{
    //     url : '/playlist',
    //     views : {
    //       'playlist-tab':{
    //         templateUrl : CONSTANT.PATH.PLAYLIST+'/playlist'+CONSTANT.VIEW,
    //         controller : 'playlistController as playlistCtrl'
    //       }
    //     }
    //   })
  }
})();

(function() {
    'use strict';

    angular
        .module('zaya-profile')
        .controller('profileController', profileController);

    profileController.$inject = ['CONSTANT','$state','Auth'];

    function profileController(CONSTANT, $state, Auth) {
        var profileCtrl = this;
        profileCtrl.logout = logout;

        profileCtrl.tabIndex = 0;
        profileCtrl.tab = [
          {
            type : 'group',
            path : CONSTANT.PATH.PROFILE + '/profile.groups' + CONSTANT.VIEW,
            icon : 'ion-person-stalker'
          },
          {
            type : 'badge',
            path : CONSTANT.PATH.PROFILE + '/profile.badges' + CONSTANT.VIEW,
            icon : 'ion-trophy'
          }
        ]

        function logout() {
          Auth.logout(function () {
            $state.go('auth.signin',{})
          },function () {
            // body...
          })
        }

    }
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
    quizCtrl.decide = decide;
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
        // init attempted
        for (var i = 0; i < quizCtrl.quiz.questions.length; i++) {
          if((quizCtrl.quiz.questions[i].info.content_type=='choice question' && !quizCtrl.quiz.questions[i].info.question_type.is_multiple) || quizCtrl.quiz.questions[i].info.content_type=='dr question'){
            quizCtrl.quiz.questions[i].attempted = "";
          }
          else if(quizCtrl.quiz.questions[i].info.content_type=='choice question' && quizCtrl.quiz.questions[i].info.question_type.is_multiple){
            quizCtrl.quiz.questions[i].attempted = {};
          }
          else if(quizCtrl.quiz.questions[i].info.content_type=='sentence ordering' || quizCtrl.quiz.questions[i].info.content_type=='sentence structuring'){
            quizCtrl.quiz.questions[i].attempted = [];
          }
          else{}
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

    function decide() {
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
      if(quizCtrl.quiz.questions[quizCtrl.currentIndex].info.content_type == "sentence ordering" || quizCtrl.quiz.questions[quizCtrl.currentIndex].info.content_type == "sentence structuring"){
        return quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted.length ? true : false;
      }
    }

    function feedback (question,attempt){
      return quizCtrl.isCorrect(question,attempt) ? quizCtrl.audio.play('correct') : quizCtrl.audio.play('wrong') ;
    }

    function submitAttempt (question_id,attempt) {
      quizCtrl.report.attempts[question_id].push(angular.copy(attempt));
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
      // sor | sst
      if(question.info.content_type=='sentence ordering' || question.info.content_type=='sentence structuring'){
        return angular.equals(question.info.answer,attempt);
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
      if(question.info.content_type=='sentence ordering' || question.info.content_type=='sentence structuring'){
        for (var i = 0; i < quizCtrl.report.attempts[question.info.id].length; i++) {
          if(angular.equals(quizCtrl.report.attempts[question.info.id][i],question.info.answer))
            return true;
        }
        return false;
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

(function() {
    'use strict';

    angular
        .module('zaya-search')
        .controller('searchController', searchController);

    searchController.$inject = ['CONSTANT'];

    function searchController(CONSTANT) {
        var searchCtrl = this;

        searchCtrl.tabIndex = 0;
        searchCtrl.tab = [
          {
            type : 'node',
            path : CONSTANT.PATH.SEARCH + '/search.nodes' + CONSTANT.VIEW,
            icon : 'ion-ios-book'
          },
          {
            type : 'group',
            path : CONSTANT.PATH.SEARCH + '/search.groups' + CONSTANT.VIEW,
            icon : 'ion-person-stalker'
          },
          {
            type : 'user',
            path : CONSTANT.PATH.SEARCH + '/search.users' + CONSTANT.VIEW,
            icon : 'ion-person-add'
          }
        ]
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
      .state('search',{
        url : '/search',
        abstract : true,
        template : '<ion-nav-view name="state-search"></ion-nav-view>'
      })
      .state('search.main',{
        url : '/main',
        nativeTransitions : {
          "type" : 'slide',
          "direction" : 'up',
        },
        views : {
          'state-search' : {
            templateUrl : CONSTANT.PATH.SEARCH + '/search' + CONSTANT.VIEW,
            controller : "searchController as searchCtrl"
          }
        }
      })
  }
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
        templateUrl: CONSTANT.PATH.USER+'/user'+CONSTANT.VIEW,
      })
      // personalisation for all
      .state('user.personalise',{
        url : '/personalise',
        abstract : true,
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise'+CONSTANT.VIEW,
          }
        }
      })
      .state('user.personalise.usertype',{
        url : '/usertype',
        views : {
          'state-personalise':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise.usertype'+CONSTANT.VIEW
          }
        }
      })
      .state('user.personalise.usersubject',{
        url : '/usersubject',
        views : {
          'state-personalise':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise.usersubject'+CONSTANT.VIEW
          }
        }
      })
      .state('user.main',{
        url : '/main',
        abstract : true,
        views : {
          'state-user':{
            templateUrl : CONSTANT.PATH.USER+'/main'+CONSTANT.VIEW,
          }
        }
      })
      .state('user.main.profile',{
        url : '/profile',
        nativeTransitions: {
          "type": "slide",
          "direction" : "right",
          // "duration" :  200
        },
        views : {
          'profile-tab' : {
            templateUrl : CONSTANT.PATH.PROFILE+'/profile'+CONSTANT.VIEW,
            controller : 'profileController as profileCtrl'
          }
        }
      })
      .state('user.main.settings',{
        url : '/settings',
        views : {
          'profile-tab' : {
            templateUrl : CONSTANT.PATH.PROFILE+'/profile.settings'+CONSTANT.VIEW,
            controller : 'profileController as profileCtrl'
          }
        }
      })
      .state('user.main.playlist',{
        url : '/playlist/:playlistId',
        nativeTransitions : null,
        views : {
          'playlist-tab':{
            templateUrl : CONSTANT.PATH.PLAYLIST+'/playlist'+CONSTANT.VIEW,
            controller : 'playlistController as playlistCtrl'
          }
        }
      })
      .state('user.main.home',{
        url : '/home',
        nativeTransitions : null,
        views : {
          'home-tab':{
            templateUrl : CONSTANT.PATH.HOME+'/home'+CONSTANT.VIEW,
            controller : 'homeController as homeCtrl'
          }
        }
      })
      .state('user.main.result',{
        url : '/result',
        nativeTransitions : null,
        views : {
          'result-tab':{
            templateUrl : CONSTANT.PATH.RESULT+'/result'+CONSTANT.VIEW
          }
        }
      })
  }
})();
