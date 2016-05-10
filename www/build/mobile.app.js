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
        .module('zaya-profile', []);
})();

(function() {
    'use strict';

    angular
        .module('zaya-quiz', [
          'ui.sortable'
        ]);
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
      'ngCordovaOauth',
      'com.2fdevs.videogular',
      'com.2fdevs.videogular.plugins.controls',

      // core
      'common',
      'zaya-map',
      'zaya-user',
      'zaya-profile',
      'zaya-intro',
      'zaya-auth',
      'zaya-quiz',
    ]);

})();

(function(){
    AppConfig.$inject = ["$httpProvider", "$ionicConfigProvider", "$ionicNativeTransitionsProvider", "$logProvider", "$windowProvider"];
  angular
    .module('zaya')
    .config(AppConfig)

    function AppConfig($httpProvider, $ionicConfigProvider, $ionicNativeTransitionsProvider, $logProvider, $windowProvider){
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
        $injector.get('$state').go('map.navigate');
    });
  }
})();

(function () {
  'use strict';
  runConfig.$inject = ["$ionicPlatform", "$rootScope", "$timeout", "$log", "$state", "$http", "$cookies", "Auth", "$window"];
  angular
    .module('zaya')
    .run(runConfig);
  function runConfig($ionicPlatform, $rootScope, $timeout, $log, $state, $http, $cookies, Auth, $window) {
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
    //$http.defaults.headers.common['Access-Control-Request-Headers'] = 'accept, auth-token, content-type, xsrfcookiename';
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

      //if not authenticated, redirect to login page
      if (!Auth.isAuthorised() && toState.name != 'auth.signin' && toState.name != 'auth.signup' && toState.name != 'auth.forgot') {
        $log.debug("You are not authorized");
        event.preventDefault();
        $state.go('auth.signin');
      }

      // if authenticated but not verified clear localstorage and redirect to login
      if (Auth.isAuthorised() && !Auth.isVerified() && toState.name != 'auth.verify.phone' && toState.name != 'auth.forgot_verify_otp' && toState.name != 'auth.change_password' ) {
        $log.debug("User account not verified");
        event.preventDefault();
        localStorage.clear();
        $state.go('auth.signin');
      }



      //if authenticated and verified but has no profile, redirect to user.personalise.social
      if (Auth.isAuthorised() && Auth.isVerified() && !Auth.hasProfile() && (toState.name != 'user.personalise.social')) {
        $log.debug("Account authorised and verfified , profile not complete");
        event.preventDefault();
        $state.go('user.personalise.social');
      }
      //if authenticated, verified and has profile, redirect to userpage

      if (Auth.isAuthorised() && Auth.isVerified() && Auth.hasProfile() && (toState.name == 'auth.signin' || toState.name == 'auth.signup' || toState.name == 'intro' || toState.name == 'auth.verify.phone' || toState.name == 'auth.forgot' || toState.name == 'auth.change_password' || toState.name == 'auth.forgot_verify_otp' || toState.name == 'user.personalise.social')) {
        $log.debug("Account authorised , verififed and profile completed");
        event.preventDefault();
        $state.go('map.navigate');
      }
      // block access to quiz summary page if there is no quiz data
      if (toState.name == 'quiz.summary' && !toParams.report) {
        $log.debug("Quiz summary page cannot be accessed : No quiz data present");
        event.preventDefault();
        $state.go('map.navigate');
      }

      if(toState.name == 'auth.verify.phone'){
        $log.debug("verify");
        document.addEventListener('onSMSArrive',function(e){
          $rootScope.$broadcast('smsArrived',{'message':e})
        });

      }

    });
    $ionicPlatform.ready(function () {
    //   if (window.StatusBar) {
    //     StatusBar.hide();
    //   }
      // detect app activity
      document.addEventListener("pause", function(){
        $log.debug("paused");
        try{
          var video = document.querySelector('video');
          if(!video.paused){
            video.pause();
          }
        }
        catch(e){
          $log.debug(e);
        }
      }, false);
      // sms watch
      try{
        SMS && SMS.startWatch(function () {
          $log.debug('start watching sms');
        }, function () {
          $log.debug('Failed to start sms watching');
        });
      }
      catch(error){
        $log.debug(error);
      }

      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  }
}
)();

(function(){
  var ROOT = 'templates';

  angular
    .module('common')
    .constant('CONSTANT',{
      'BACKEND_SERVICE_DOMAIN' : 'http://cc-test.zaya.in/',
      // 'BACKEND_SERVICE_DOMAIN' : 'http://192.168.1.6:9000/',
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
        'MAP' : ROOT + '/map',
        'CONTENT' : ROOT + '/content'
      },
      'VIEW' : '.view.html',
      'CLIENTID' : {
        'FACEBOOK' : '1159750564044149',
        'GOOGLE' : '1011514043276-7q3kvn29jkegl2d1v7dtlbtipqqgo1rr.apps.googleusercontent.com',
        'ELL' : '1e7aa89f-3f50-433a-90ca-e485a92bbda6'
      },
      'ASSETS' : {
        'IMG' : {
          'ICON' : 'img/icons'
        }
      }
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

(function() {
    'use strict';

    angular
        .module('common')
        .directive('validInput', validInput);

    function validInput() {
        var validInput = {
            require: '?ngModel',
            link: linkFunc
        };

        return validInput;

        function linkFunc(scope, element, attrs, ngModelCtrl) {
          if(!ngModelCtrl) {
            return;
          }
          ngModelCtrl.$parsers.push(function(val) {
            var clean = val.replace( /[^a-zA-Z0-9@.!#$%&'*+-/=?^_`{|}~]+/g, '');
            clean = clean.toLowerCase();
            if (val !== clean) {
              ngModelCtrl.$setViewValue(clean);
              ngModelCtrl.$render();
            }
            return clean;
          });
        }
    }
})();

(function() {
    'use strict';

    validOtp.$inject = ["$log"];
    angular
        .module('common')
        .directive('validOtp', validOtp);

    function validOtp($log) {
        var validOtp = {
            require: '?ngModel',
            link: linkFunc
        };

        return validOtp;

        function linkFunc(scope, element, attrs, ngModelCtrl) {
          if(!ngModelCtrl) {
            return;
          }

          ngModelCtrl.$parsers.push(function(val) {
            var clean = (val > 999999)?(val.toString()).substring(0,6):val;
            if (val !== clean) {
              ngModelCtrl.$setViewValue(clean);
              ngModelCtrl.$render();
            }
            return clean;
          });
        }
    }
})();

(function() {
  'use strict';

  trackVideo.$inject = ["$window", "$log", "orientation"];
  angular
    .module('common')
    .directive('trackVideo', trackVideo);

  /* @ngInject */
  function trackVideo($window, $log, orientation) {
    var video = {
      restrict: 'A',
      link: linkFunc,
    };

    return video;

    // full screen not working ; instead used css to immitate full screen effect ; check below
    function toggleFullScreen() {
      if (!document.fullscreenElement && // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }

    function linkFunc(scope, el, attr, ctrl) {
      el.bind('playing', function() {
        // toggleFullScreen();
        document.querySelector("ion-modal-view").classList.remove('modal-dark');
        document.querySelector("ion-modal-view").classList.add('modal-black');
        el.addClass('fullscreen');
        orientation.setLandscape();
      });
      el.bind('pause', function() {
        // toggleFullScreen();
        document.querySelector("ion-modal-view").classList.remove('modal-black');
        document.querySelector("ion-modal-view").classList.add('modal-dark');
        el.removeClass('fullscreen');
        orientation.setPortrait();
      });
      el.bind('click',function (event) {
        event.stopPropagation();
      })
    }
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

(function() {
    'use strict';

    angular
        .module('common')
        .factory('orientation', orientation);

    orientation.$inject = ['$window','$log'];

    /* @ngInject */
    function orientation($window, $log) {
        var orientation = {
            setLandscape : setLandscape,
            setPortrait : setPortrait,
        };

        return orientation;

        function setPortrait() {
          try{
            $window.screen.lockOrientation('portrait');
          }
          catch(e){
            $log.debug(e);
          }
        }

        function setLandscape() {
          try{
            $window.screen.lockOrientation('landscape');
          }
          catch(e){
            $log.debug(e);
          }
        }

    }
})();

(function () {
  'use strict';

  angular
    .module('common')
    .factory('Utilities',utilities)

    function utilities() {
      return {
        range : function (num) {
          return new Array(num);
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

(function () {
  'use strict';
  angular
    .module('zaya-auth')
    .controller('authController', authController)
  authController.$inject = ['$q','$ionicModal', '$state', 'Auth', 'audio', '$rootScope', '$ionicPopup', '$log', '$cordovaOauth', 'CONSTANT', '$interval', '$scope', '$ionicLoading'];
  function authController($q,$ionicModal, $state, Auth, audio, $rootScope, $ionicPopup, $log, $cordovaOauth, CONSTANT, $interval, $scope, $ionicLoading) {
    var authCtrl = this;
    var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var indian_phone_regex = /^[7-9][0-9]{9}$/;
    //var username_regex = /^[a-z0-9]*$/;
    var min = 6;
    var max = 15;
    var country_code = '+91';
    authCtrl.audio = audio;
    authCtrl.login = login;
    authCtrl.logout = logout;
    authCtrl.signup = signup;
    authCtrl.openModal = openModal;
    authCtrl.closeModal = closeModal;
    authCtrl.rootScope = $rootScope;
    authCtrl.validCredential = validCredential;
    authCtrl.showError = showError;
    authCtrl.showAlert = showAlert;
    authCtrl.verifyOtpValidations = verifyOtpValidations;
    authCtrl.verifyOtp = verifyOtp;
    // authCtrl.getToken = getToken;
    authCtrl.passwordResetRequest = passwordResetRequest;
    authCtrl.validateForgotPasswordForm = validateForgotPasswordForm;
    authCtrl.resendOTP = resendOTP;
    authCtrl.max_counter = 60;
    authCtrl.startCounter = startCounter;
    authCtrl.stopCounter = stopCounter;
    authCtrl.signUpDisabled = false;
    authCtrl.resendOTPCount = 0;
    authCtrl.resendOTPDate = null;
    authCtrl.maxOTPsendCountperDay = 50;
    authCtrl.autoVerifyPhoneStatus = false;
    authCtrl.resetPasswordLinkSent = false;
    authCtrl.closeKeyboard = closeKeyboard;
    authCtrl.verifyOtpResetPassword = verifyOtpResetPassword;
    authCtrl.validCredentialChangePassword = validCredentialChangePassword;
    authCtrl.changePassword = changePassword;
    authCtrl.cancelOTP = cancelOTP;
    authCtrl.recoverAccount = recoverAccount;
    authCtrl.error = { "title" : "", "desc" : ""};


    function recoverAccount() {
        authCtrl.openModal('recover');
    }
    function openModal (modal) {
      if(modal == 'error'){
        authCtrl.errorModal.show();
      }
      else if(modal == 'recover'){
        authCtrl.recoveryModal.show();
      }
      else {
        return false;
      }

    }
    function closeModal (modal) {
      var q = $q.defer();

      if(modal == 'error'){
        q.resolve(authCtrl.errorModal.hide());
      }
      else if(modal == 'recover'){
        q.resolve(authCtrl.recoveryModal.hide());
      }
      else{
        q.reject(false);
      }

      return q.promise;
    }
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.AUTH + '/auth.forgot.social' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
    }).then(function(recoveryModal) {
      authCtrl.recoveryModal = recoveryModal;
    });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.AUTH + '/auth.error.modal' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
    }).then(function(errorModal) {
      authCtrl.errorModal = errorModal;
    });


    function validEmail(email) {
      return email_regex.test(email);
    }

    function validPhoneNumber(number) {
      return indian_phone_regex.test(number);
    }

    //function validUsername(username) {
    //  return username_regex.test(username);
    //}
    function login(url, user_credentials) {
      $ionicLoading.show({
        template: 'Logging in...'
      });
      user_credentials = ( url == 'login' ) ? cleanCredentials(user_credentials) : user_credentials;
      Auth.login(url, user_credentials, function (response) {
        Auth.getUser(function (success) {
          Auth.setAuthProvider(url);
          $ionicLoading.hide();
          $state.go('map.navigate', {});
        }, function () {
          $ionicLoading.hide();
          authCtrl.showError("Error Login", "Please enter a valid mobile no./Email ID and password");
        });
      }, function (response) {
        $ionicLoading.hide();
        if(response.data.details){
          authCtrl.showError("Error Login", response.data.details);
        }
        else{
          authCtrl.showError("Error Login", "Please enter a valid mobile no./Email ID and password");
        }
        authCtrl.audio.play('wrong');
      })
    }

    function signup(user_credentials) {
      $ionicLoading.show({
        template: 'Signing up...'
      });
      user_credentials = cleanCredentials(user_credentials);
      authCtrl.signUpDisabled = true;
      Auth.signup(user_credentials, function (response) {
        $state.go('auth.verify.phone', {});
        $ionicLoading.hide();
        authCtrl.signUpDisabled = false;
      }, function (response) {
        $ionicLoading.hide();
        //  authCtrl.showError(_.chain(response.data).keys().first(), response.data[_.chain(response.data).keys().first()].toString());
        if(response.data)
        {
          authCtrl.showError("Could not register", response.data.details);
        }
        else
        {
          authCtrl.showError("Could not register", "Please enter a valid mobile no. and password");
        }
        authCtrl.audio.play('wrong');
        authCtrl.signUpDisabled = false;
      })
    }

    function logout(path) {
      Auth.logout(function () {
        $state.go(path, {})
      }, function () {
        // body...
      })
    }

    // web social login / will be used in web apps
    // function getToken(webservice) {
    //   if (webservice == 'facebook') {
    //     $cordovaOauth.facebook(CONSTANT.CLIENTID.FACEBOOK, ["email"]).then(function (result) {
    //       authCtrl.login('facebook', {"access_token": result.access_token});
    //     }, function (error) {
    //       authCtrl.showError("Error", error);
    //     });
    //   }
    //   if (webservice == 'google') {
    //     $cordovaOauth.google(CONSTANT.CLIENTID.GOOGLE, ["email"]).then(function (result) {
    //       authCtrl.login('google', {"access_token": result.access_token});
    //     }, function (error) {
    //       authCtrl.showError("Error", error);
    //     });
    //   }
    // }

    function cleanCredentials(user_credentials) {
      if (validEmail(user_credentials.useridentity)) {
        user_credentials['email'] = user_credentials.useridentity;
      }
      else if (!isNaN(parseInt(user_credentials.useridentity, 10)) && validPhoneNumber(parseInt(user_credentials.useridentity, 10))) {
        user_credentials['phone_number'] = country_code + user_credentials.useridentity;
      }
      delete user_credentials['useridentity'];
      return user_credentials;
    }

    function validCredential(formData) {
      if (!formData.useridentity.$viewValue) {
        authCtrl.showError("Empty", "Its empty! Enter a valid phone number or email");
        return false;
      }
      else if (formData.useridentity.$viewValue && formData.useridentity.$viewValue.indexOf('@') != -1 && !validEmail(formData.useridentity.$viewValue)) {
        authCtrl.showError("Email", "Oops! Please enter a valid email");
        return false;
      }
      else if (formData.useridentity.$viewValue && !isNaN(parseInt(formData.useridentity.$viewValue, 10)) && !validPhoneNumber(formData.useridentity.$viewValue) && !validEmail(formData.useridentity.$viewValue)) {
        authCtrl.showError("Phone", "Oops! Please enter a valid mobile no.");
        return false;
      }
      else if (!formData.password.$viewValue) {
        authCtrl.showError("Password", "Its empty! Enter a valid password");
        return false;
      }
      else if (formData.password.$viewValue.length < min) {
        authCtrl.showError("Password", "Minimum " + min + " characters required");
        return false;
      }
      else if (formData.password.$viewValue.length > max) {
        authCtrl.showError("Password", "Maximum " + max + " can be used");
        return false;
      }
      else if (formData.email && formData.email.$viewValue && !validEmail(formData.email.$viewValue)) {
        authCtrl.showError("Email", "Oops! Please enter a valid email");
        return false;
      }
      return true;
    }

    function showError(title, msg) {
      $log.debug(title, msg);
      authCtrl.error.title = title;
      authCtrl.error.desc = msg;
      authCtrl.openModal('error');
      // $ionicPopup.alert({
      //   title: title,
      //   template: msg
      // });
    }

    function showAlert(title, msg) {
      $log.debug(title, msg);
      authCtrl.error.title = title;
      authCtrl.error.desc = msg;
      authCtrl.openModal('error');
      // $ionicPopup.alert({
      //   title: title,
      //   template: msg
      // }).then(function (response) {
      //   if (success) {
      //     success()
      //   }
      // });
    }

    function verifyOtpValidations(formData) {
      if (!formData.otp.$viewValue) {
        authCtrl.showError("OTP", "Its empty! Enter the one time password");
        return false;
      }
      $log.debug("OTP validations passed");
      return true;
    }

    function verifyOtp(otp_credentials) {
      $ionicLoading.show({
        template: 'Verifying...'
      });
      Auth.verifyOtp(otp_credentials, otpVerifiedSuccessHandler, function (error) {
        $ionicLoading.hide();
        authCtrl.showError("Incorrect OTP!", "The one time password you entered is incorrect!");
      })
    }

    function passwordResetRequest(user_credentials) {
      $ionicLoading.show({
        template: 'Requesting...'
      });
      $log.debug(user_credentials);
      user_credentials = cleanCredentials(user_credentials);
      $log.debug(user_credentials);
      Auth.resetPassword(user_credentials, function (success) {
        if (user_credentials.hasOwnProperty('phone_number')) {
          localStorage.setItem('Authorization', success.token);
          authCtrl.closeModal('recover');
          $state.go('auth.forgot_verify_otp');
        }
        else {
          authCtrl.showAlert("Reset Password", "We have send a link to your email");
        }
        authCtrl.resetPasswordLinkSent = true;
        $ionicLoading.hide();
      }, function (error) {
        authCtrl.showAlert("Not Registered", "Mobile no. /Email ID is not registered.");
        $ionicLoading.hide();
      })
    }

    function validateForgotPasswordForm(formData) {
      $log.debug(formData);
      if (!formData.useridentity.$viewValue) {
        authCtrl.showError("Empty", "Its empty! Enter a valid phone number or email");
        return false;
      }
      else if (formData.useridentity.$viewValue && formData.useridentity.$viewValue.indexOf('@') != -1 && !validEmail(formData.useridentity.$viewValue)) {
        authCtrl.showError("Email", "Oops! Please enter a valid email");
        return false;
      }
      else if (formData.useridentity.$viewValue && !isNaN(parseInt(formData.useridentity.$viewValue, 10)) && !validPhoneNumber(formData.useridentity.$viewValue)) {
        authCtrl.showError("Phone", "Oops! Please enter a valid mobile no.");
        return false;
      }
      return true;
    }

    function resendOTP() {
      if (Auth.canSendOtp(authCtrl.maxOTPsendCountperDay)) {
        Auth.resendOTP(function (success) {
          authCtrl.showAlert("OTP Sent", "We have sent you otp again");
          authCtrl.startCounter();
          authCtrl.autoVerifyPhoneStatus = 'Waiting For SMS';
        }, function (error) {
          authCtrl.showError(error);
        })
      }
      else {
        authCtrl.showAlert("OTP Resend count exceed", "Sorry you cant send more otps try again tomorrow");
      }
    }

    function startCounter() {
      authCtrl.counter = authCtrl.max_counter;
      authCtrl.start = $interval(function () {
        if (authCtrl.counter > 0) {
          authCtrl.counter--;
        } else {
          authCtrl.stopCounter();
        }
      }, 1000);
      return true;
    }

    function stopCounter() {
      if (angular.isDefined(authCtrl.start)) {
        $interval.cancel(authCtrl.start);
      }
    }

    $scope.$on('smsArrived', function (event, data) {
      $ionicLoading.show({
        template: 'Getting OTP From SMS'
      });
      authCtrl.autoVerifyPhoneStatus = 'Getting OTP From SMS';
      Auth.getOTPFromSMS(data.message, function (otp) {
        $ionicLoading.show({
          template: 'OTP received. Verifying..'
        });
        authCtrl.autoVerifyPhoneStatus = 'OTP received. Verifying..';
        Auth.verifyOtp({'code': otp}, function (success) {
          authCtrl.autoVerifyPhoneStatus = 'Verified';
          otpVerifiedSuccessHandler(success);
        }, function () {
          $ionicLoading.hide();
          authCtrl.autoVerifyPhoneStatus = 'Error Verifying OTP. Try Again';
        });
      }, function () {
        $ionicLoading.hide();
        authCtrl.autoVerifyPhoneStatus = 'Error Getting OTP From SMS';
        //authCtrl.showError("Could not get OTP","Error fetching OTP");
      });
      if (SMS) {
        SMS.stopWatch(function () {
          $log.debug('watching', 'watching stopped');
        }, function () {
          updateStatus('failed to stop watching');
        });
        SMS.startWatch(function () {
          $log.debug('watching', 'watching started');
        }, function () {
          updateStatus('failed to start watching');
        });
      }
    });
    function otpVerifiedSuccessHandler(success) {
      Auth.getUser(function (success) {
        $ionicLoading.hide();
        authCtrl.showAlert("Correct!", "Phone Number verified!");
        $state.go('user.personalise.social', {});
      }, function (error) {
        $ionicLoading.hide();
        authCtrl.showError("Error", "Could not verify OTP. Try again");
      });
    }

    authCtrl.numberOfWatches = function () {
      var root = angular.element(document.getElementsByTagName('body'));
      var watchers = [];
      var f = function (element) {
        angular.forEach(['$scope', '$isolateScope'], function (scopeProperty) {
          if (element.data() && element.data().hasOwnProperty(scopeProperty)) {
            angular.forEach(element.data()[scopeProperty].$$watchers, function (watcher) {
              watchers.push(watcher);
            });
          }
        });
        angular.forEach(element.children(), function (childElement) {
          f(angular.element(childElement));
        });
      };
      f(root);
      // Remove duplicate watchers
      var watchersWithoutDuplicates = [];
      angular.forEach(watchers, function (item) {
        if (watchersWithoutDuplicates.indexOf(item) < 0) {
          watchersWithoutDuplicates.push(item);
        }
      });
      $log.debug(watchersWithoutDuplicates);
    };
    authCtrl.googleSignIn = function () {
      $ionicLoading.show({
        template: 'Logging in...'
      });
      try{
        window.plugins.googleplus.login(
          {
            'scopes': 'email profile',
            'webApiKey': '306430510808-i5onn06gvm82lhuiopm6l6188133j5r4.apps.googleusercontent.com',
            'offline': true
          },
          function (user_data) {
            authCtrl.login('google', {"access_token": user_data.oauthToken});
            // For the purpose of this example I will store user data on local storage
            //UserService.setUser({
            //  userID: user_data.userId,
            //  name: user_data.displayName,
            //  email: user_data.email,
            //  picture: user_data.imageUrl,
            //  accessToken: user_data.accessToken,
            //  idToken: user_data.idToken
            //});
          },
          function (msg) {
            authCtrl.showError("Error",msg);
            $ionicLoading.hide();
          }
        );
      }
      catch(e){
        $log.debug(e);
      }
    };
    authCtrl.googleSignOut = function () {
      window.plugins.googleplus.logout(
        function (msg) {
          void 0;
        }
      );
    };
    authCtrl.facebookSignIn = function () {
      facebookConnectPlugin.login(['email', 'public_profile'], function (success) {
        authCtrl.login('facebook', {"access_token": success.authResponse.accessToken});
      }, function () {
      })
    };
    function closeKeyboard() {
      try{
        cordova.plugins.Keyboard.close();
      }
      catch(e){
        $log.debug(e);
      }
      return true;
    }
    function verifyOtpResetPassword(otp){
        Auth.verifyOtpResetPassword(otp,function(success){
          $log.debug(success);
          $state.go('auth.change_password', {});
        },function(error){
          $log.debug(error);
          authCtrl.showAlert("InCorrect!", "You entered wrong OTP!");
        })
    }
    function validCredentialChangePassword(formData) {
      if (!formData.password1.$viewValue) {
        authCtrl.showError("Enter Password", "Its empty! Enter a password");
        return false;
      }
      else if(formData.password1.$viewValue.length < 6){
        authCtrl.showError("Password too small", "Password must be 6 characters long");
        return false;
      }
      else if(typeof(formData.password2.$viewValue) == 'undefined' || !angular.equals(formData.password2.$viewValue,formData.password1.$viewValue)){
        authCtrl.showError("Confirm Password", "Please confirm your password");
        return false;
      }
      return true;
    }
    function changePassword(credentials){
      credentials.secret_key = '@#2i0-jn9($un1w8utqc2dms!$#5+5';
      Auth.changePassword(credentials,function(success){
        authCtrl.showAlert('Success','You have reset your password');
        $log.debug(success);
        $state.go('auth.signin', {});
      },function(error){
        $log.debug(error);
      })
    }
    function cancelOTP(){
     localStorage.clear();
      $state.go('auth.signin',{});
    }

  }
})();

(function () {
  'use strict';
  angular
    .module('zaya-auth')
    .factory('Auth', Auth)
  Auth.$inject = ['Restangular', 'CONSTANT', '$cookies', '$log', '$window'];
  function Auth(Restangular, CONSTANT, $cookies, $log, $window) {
    var rest_auth = Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + '/rest-auth');
      RestangularConfigurer.setRequestSuffix('/');
      RestangularConfigurer.setDefaultHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      });
    });
    return {
      login: function (url, user_credentials, success, failure) {
        rest_auth.all(url).post($.param(user_credentials)).then(function (response) {
          localStorage.setItem('Authorization', response.key || response.token);
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      logout: function (success, failure) {
        rest_auth.all('logout').post().then(function (response) {
          if(localStorage.getItem('authProvider') == 'google')
          {
            window.plugins.googleplus.logout();
          }
          if(localStorage.getItem('authProvider') == 'facebook')
          {
            facebookConnectPlugin.logout();
          }
          localStorage.removeItem('Authorization');
          localStorage.removeItem('user_details');
          localStorage.removeItem('authProvider');
          success();
        }, function (error) {
          failure();
        })
      },
      signup: function (user_credentials, success, failure) {
        rest_auth.all('registration').post($.param(user_credentials), success, failure).then(function (response) {
          localStorage.setItem('Authorization', response.key);
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      reset: function (email, atype, success, failure) {
        type == 'password' && rest_auth.all('password').all('reset').post(email);
        type == 'username' && rest_auth.all('username').all('reset').post(email);
      },
      isAuthorised: function () {
        return localStorage.Authorization;
      },
      canSendOtp: function (max_otp_send_count) {
        var last_otp_date = localStorage.getItem('last_otp_date');
        var otp_sent_count = localStorage.getItem('otp_sent_count');
        if (last_otp_date && otp_sent_count) {
          if (this.dateCompare(new Date(), new Date((last_otp_date)))) {
            localStorage.setItem('last_otp_date', new Date());
            localStorage.setItem('otp_sent_count', 1);
            return true;
          } else {
            if (otp_sent_count < max_otp_send_count) {
              localStorage.setItem('last_otp_date', new Date());
              localStorage.setItem('otp_sent_count', ++otp_sent_count);
              return true;
            } else {
              return false;
            }
          }
        }
        else {
          localStorage.setItem('last_otp_date', new Date());
          localStorage.setItem('otp_sent_count', 1);
          return true;
        }
      },
      // remove util funstion from auth factory
      dateCompare: function (date_1, date_2) { // Checks if date_1 > date_2
        var month_1 = date_1.getMonth();
        var month_2 = date_2.getMonth();
        var day_1 = date_1.getDate();
        var day_2 = date_2.getDate();
        if (month_1 > month_2) {
          return true;
        } else if (month_1 == month_2) {
          return day_1 > day_2;
        } else return false;
      },
      verifyOtp: function (verification_credentials, success, failure) {
        $log.debug(JSON.stringify(verification_credentials));
        rest_auth.all('sms-verification').post($.param(verification_credentials), success, failure).then(function (response) {
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      resetPassword: function (reset_password_credentials, success, failure) {
        rest_auth.all('password/reset').post($.param(reset_password_credentials), success, failure).then(function (response) {
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      resendOTP: function (success, failure) {
        rest_auth.all('resend-sms-verification').post('', success, failure).then(function (response) {
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      getUser: function (success, failure) {
        Restangular.oneUrl('user_details', CONSTANT.BACKEND_SERVICE_DOMAIN + 'rest-auth/user/').get().then(function (response) {
          localStorage.setItem('user_details', JSON.stringify(response));
          success(response);
        }, function (response) {
          failure(response);
        });
      },
      isVerified: function () {
        var user_details = JSON.parse(localStorage.getItem('user_details'));
        if (user_details) {
          return user_details.is_verified;
        }
        else {
          return false;
        }
      },
      getOTPFromSMS: function (message,success,failure) {
        var string = message.data.body;
        if(message.data.address == '+12023353814')
        {
          var e_position = string.indexOf("Enter");
          var o_position = string.indexOf("on");
          success(string.substring(e_position + 6, o_position - 1));
        }
        else{
          failure();
        }

      },
      setAuthProvider: function (authProvider){
        localStorage.setItem('authProvider',authProvider);
        return authProvider;
      },
      verifyOtpResetPassword: function(otp,success,failure){
        rest_auth.all('password/reset/sms-verification').post($.param(otp), success, failure).then(function (response) {
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      changePassword: function (credentials, success, failure) {
        rest_auth.all('password/change').post($.param(credentials), success, failure).then(function (response) {
          localStorage.removeItem('Authorization');
          success(response);
        }, function (response) {
          failure(response);
        })
      },
      hasProfile: function(){
        return JSON.parse(localStorage.getItem('user_details')).profile == null ? false : true;
      }
      ,
      getProfileId: function(){
        return JSON.parse(localStorage.getItem('user_details')).profile;
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
      .state('auth.forgot_verify_otp', {
        url: '/verifyotp',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration" :  400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot.verify' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.change_password', {
        url: '/changepassword',
        nativeTransitions: {
          "type": "slide",
          "direction": "up",
          "duration" :  400
        },
        views: {
          'state-auth': {
            // templateUrl: CONSTANT.PATH.AUTH + '/auth.forgot' + CONSTANT.VIEW,
            templateUrl: CONSTANT.PATH.AUTH + '/auth.changepassword' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
      .state('auth.verify',{
        abstract : true,
        url : '/verify',
        views : {
          "state-auth" : {
            template : "<ion-nav-view name='state-auth-verify'></ion-nav-view>"
          }
        }
      })
      .state('auth.verify.phone', {
        url: '/phone',
        nativeTransitions: {
          "type": "slide",
          "direction": "left",
          "duration" :  400
        },
        views: {
          'state-auth-verify': {
            templateUrl: CONSTANT.PATH.AUTH + '/auth.verify.phonenumber' + CONSTANT.VIEW,
            controller: 'authController as authCtrl'
          }
        }
      })
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

  mapController.$inject = ['$scope','$rootScope', '$log', '$ionicModal', '$state', 'lessons', 'Rest', 'CONSTANT', '$sce', 'orientation','$ionicLoading','$timeout','$ionicBackdrop'];

  function mapController($scope, $rootScope, $log, $ionicModal, $state, lessons, Rest, CONSTANT, $sce, orientation, $ionicLoading, $timeout, $ionicBackdrop) {
    var mapCtrl = this;
    mapCtrl.lessons = lessons;
    mapCtrl.getLesson = getLesson;
    mapCtrl.getSrc = getSrc;
    mapCtrl.resetNode = resetNode;
    mapCtrl.getIcon = getIcon;
    mapCtrl.resourceType = resourceType;
    mapCtrl.playResource = playResource;
    mapCtrl.backdrop = false;
    mapCtrl.showScore = -1;

    // mapCtrl.openModal = openModal;
    // mapCtrl.closeModal = closeModal;
    mapCtrl.onPlayerReady = function(API){
        mapCtrl.API = API;
    }

	mapCtrl.updateOrientation = function(state) {
        if(state=='play'){
            orientation.setLandscape();
            mapCtrl.API.toggleFullScreen();
        }
        if(state=='pause' || state=='stop'){
            orientation.setPortrait();
            mapCtrl.API.toggleFullScreen();
        }
	};
    mapCtrl.config = {
        sources : [
            {
                src : '',
                type : 'video/mp4'
            }
        ],
        theme: "lib/videogular-themes-default/videogular.css"
    }

    mapCtrl.skillSet = [
      {name : 'reading', score : 300},
      {name : 'listening', score : 200},
      {name : 'vocabulary', score : 250},
      {name : 'grammar', score : 3000}
    ];

    function playResource (resource) {
      if(mapCtrl.resourceType(resource) != 'video'){
        $scope.closeModal();
        $ionicLoading.show({noBackdrop: false, hideOnStateChange: true});
        $state.go('quiz.questions',{id : resource.node.id});
      }
      else{
          mapCtrl.config.sources[0].src = mapCtrl.getSrc(resource.node.type.path);
      }
    }
    function resourceType (resource){
      if(resource.node.content_type_name == 'assessment'){
        return 'assessment';
      }
      else if(resource.node.content_type_name == 'resource'){
        if(resource.node.type.file_type.substring(0,resource.node.type.file_type.indexOf('/')) == 'video'){
          return 'video';
        }
      }
      else {}
    }
    function getSrc(src){
      return $sce.trustAsResourceUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + src);
    }
    function getIcon(resource){
      if(resource.node.content_type_name == 'assessment'){
        return CONSTANT.ASSETS.IMG.ICON + '/quiz.png';
      }
      else if(resource.node.content_type_name == 'resource'){
        if(resource.node.type.file_type.substring(0,resource.node.type.file_type.indexOf('/')) == 'video'){
          return CONSTANT.ASSETS.IMG.ICON + '/video.png';
        }
      }
      else {

      }
    }

    $scope.$on('logout', function() {
      $state.go('user.main.settings',{});
    })
    $scope.$on('openNode', function(event, node) {
      mapCtrl.getLesson(node.id);
    })
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    $scope.openModal = function() {
      $scope.modal.show();
      return true;
    }
    $scope.closeModal = function() {
      $scope.modal.hide();
      return true;
    }

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose : false
    }).then(function(modal) {
      $scope.modal = modal;
    });

    function resetNode(){
        mapCtrl.selectedNode = {};
    }

    function getLesson(id) {
      $ionicLoading.show({noBackdrop: false, hideOnStateChange: true});
      Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('lessons', id).get().then(function(response) {
        $ionicLoading.hide();
        $scope.openModal();
        mapCtrl.selectedNode = response.plain();
        localStorage.setItem('lesson', JSON.stringify(mapCtrl.selectedNode));
      })
    }

    if(localStorage.lesson){
      // mapCtrl.selectedNode = JSON.parse(localStorage.lesson);
      // $scope.openModal();
      mapCtrl.getLesson(JSON.parse(localStorage.lesson).node.id);
    }

  }
})();

(function() {
    'use strict';

    mapCanvas.$inject = ["$injector", "$timeout", "$log"];
    angular
        .module('zaya-map')
        .directive('mapCanvas', mapCanvas)

    /* @ngInject */
    function mapCanvas($injector, $timeout, $log) {
        var mapCanvas = {
            restrict: 'A',
            template: '<div id="map_canvas"></div>',
            scope: {
              lessons : '='
            },
            link: linkFunc,
        };

        return mapCanvas;

        function linkFunc(scope, el, attr, ctrl) {
          $timeout(createGame(scope, scope.lessons, $injector, $log));
        }
    }

})();

window.createGame = function(scope, lessons, injector, log) {
  'use strict';

  var lessons = lessons;
  var game = new Phaser.Game("100", "100" , Phaser.CANVAS, 'map_canvas');

  var playState = {
    preload : function () {
      this.load.image('desert', 'img/assets/desert.png');
      this.load.image('cactus', 'img/assets/cactus.png');
      this.load.image('tent', 'img/assets/tent_fire.png');
      this.load.image('tent_green', 'img/assets/tent_green.png');
      this.load.image('two_stone', 'img/assets/two_stone.png');
      this.load.image('one_stone', 'img/assets/one_stone.png');
      this.load.image('particle1', 'img/assets/particle1.png');
      this.load.image('particle2', 'img/assets/particle2.png');
      this.load.image('particle3', 'img/assets/particle3.png');

      this.load.spritesheet('fire_animation', 'img/assets/fire_animation.png', 322,452, 20);
      this.load.spritesheet('cactus_animation', 'img/assets/cactus_animation.png', 30,52, 5);
      this.load.image('node', 'img/icons/node.png');
      // debug value
      this.game.time.advancedTiming = true;
    },
    create : function() {
      var desert = this.game.add.sprite(0,0,'desert');
      var game_scale = game.world.width/desert.width;
      desert.scale.setTo(game_scale, 1);
      this.game.world.setBounds(0, 0, this.game.width, desert.height);
      log.debug(this.world.height - 30);
      var cactus_points = [
        {x : 42 * game_scale , y : 2050 , scale : 1},
        {x : 328 * game_scale , y : 1998, scale : 1},
        {x : 128 * game_scale, y : 1904, scale : 1},
        {x : 304 * game_scale, y : 1798, scale : 1},
        {x : 26 * game_scale, y : 1772, scale : 1},
        {x : 348 * game_scale, y : 1675, scale : 1},
        {x : 38 * game_scale, y : 1591, scale : 1},
        {x : 124 * game_scale, y : 1446, scale : 1},
        {x : 292 * game_scale, y : 1280, scale : 1},
        {x : 40 * game_scale, y : 1096, scale : 1},
        {x : 76 * game_scale, y : 913, scale : 1},
        {x : 306 * game_scale, y : 768, scale : 1},
        {x : 40 * game_scale, y : 475, scale : 1},
        {x : 42 * game_scale, y : 254, scale : 1},
        {x : 310 * game_scale, y : 184, scale : 1},
      ];
      var tent_points = [
        {x : 258 * game_scale, y : 950, scale : 1 }
      ];
      var tent_green_points = [
        {x : 26 * game_scale, y : 1403, scale : 1}
      ]
      var one_stone_points = [
        {x : 42 * game_scale, y : 1873 , scale : 1},
        {x : 214 * game_scale, y : 1797, scale : 1},
        {x : 45 * game_scale, y : 1235, scale : 1},
        {x : 345 * game_scale, y : 1202, scale : 1}
      ];
      var two_stone_points = [
        {x : 293, y : 2139, scale : 1},
      ]

      // place tent
      for (var i = 0, tent_count = tent_points.length ; i < tent_count; i++) {
        var tent = this.game.add.sprite(tent_points[i].x, tent_points[i].y,'tent');
        tent.anchor.setTo(0.5,0.5);
        tent.scale.setTo(tent_points[i].scale);
      }
      for (var i = 0, tent_count = tent_green_points.length ; i < tent_count; i++) {
        var tent = this.game.add.sprite(tent_green_points[i].x, tent_green_points[i].y,'tent_green');
        tent.anchor.setTo(0.5,0.5);
        tent.scale.setTo(tent_green_points[i].scale);
      }
      // place stone
      for (var i = 0, one_stone_count = one_stone_points.length ; i < one_stone_count; i++) {
        var tent = this.game.add.sprite(one_stone_points[i].x, one_stone_points[i].y,'one_stone');
        tent.anchor.setTo(0.5,0.5);
        tent.scale.setTo(one_stone_points[i].scale);
      }
      for (var i = 0, two_stone_count = two_stone_points.length ; i < two_stone_count; i++) {
        var tent = this.game.add.sprite(two_stone_points[i].x, two_stone_points[i].y,'two_stone');
        tent.anchor.setTo(0.5,0.5);
        tent.scale.setTo(two_stone_points[i].scale);
      }
      // place cactus
      for (var i = 0, cactus_count = cactus_points.length; i < cactus_count; i++) {
        var cactus = this.game.add.sprite(cactus_points[i].x, cactus_points[i].y,'cactus');
        cactus.anchor.setTo(0.5,0.5);
        cactus.scale.setTo(cactus_points[i].scale);
        // catcus animation
        // var cactus_animation = this.game.add.sprite(this.game.rnd.between(10,this.game.world.width-10), this.game.rnd.between(0,this.game.world.height), 'cactus_animation');
        // cactus_animation.scale.setTo(3,3);
        // var walk = cactus_animation.animations.add('walk');
        // cactus_animation.animations.play('walk', 10, true);
      }

      // placing lesson node
      // 1. lesson node count
      // 2. Node should follow a particular path
      // path
      log.debug('desert', desert.width);
      this.points = {
        'x': [101,113,170,202,216,201,180,172,172,179,195,211,207,160,138,144,167,197,204,197,165,126,101,161,256,223,134,102,138,200,235,200,180,180,180,180,180,180,180,180,180],
        'y': [50,64,109,148,189,235,287,346,404,456,495,529,574,644,693,748,803,854,877,941,980,1022,1091,1116,1116,1171,1209,1266,1318,1342,1371,1433,1494,1577,1659,1742,1824,1907,1989,2072,2155]
      };

      for (var i = 0, points_count = this.points.x.length; i < points_count; i++) {
        this.points.x[i] *= game_scale;
      }

      this.increment = 1 / game.world.height;

      // Somewhere to draw to
      this.bmd = this.add.bitmapData(this.game.width, this.game.world.height);
      this.bmd.addToWorld();
      // Draw the path
      for (var j = 0; j < 1; j += this.increment) {
        var posx = this.math.catmullRomInterpolation(this.points.x, j);
        var posy = this.math.catmullRomInterpolation(this.points.y, j);
        this.bmd.rect(posx, posy, 4, 4, '#219C7F');
      }
      // Place nodes
      for (var j = 0, i = lessons.length-1, nodeCount = 1/lessons.length; j < 1; j += nodeCount, i--) {
        var posx = this.math.catmullRomInterpolation(this.points.x, j);
        var posy = this.math.catmullRomInterpolation(this.points.y, j);
        var node = this.game.add.button(posx, posy, 'node', function (node) {
          scope.$emit('openNode',node);
        }, this, 2, 1, 0);
        node.anchor.setTo(0.5, 0.5);
        node.id = lessons[i].id;
      }
      for (var i = 0; i < 100; i++)
      {
          var s = this.game.add.sprite(this.world.randomX, this.game.world.randomY, 'particle' + this.game.rnd.between(1, 3));

          s.scale.setTo(this.game.rnd.between(1, 2)/20);
          this.game.physics.arcade.enable(s);
          s.body.velocity.x = this.game.rnd.between(-55, -70);
          s.body.velocity.y = this.game.rnd.between(10, 20);
          s.autoCull = true;
          s.checkWorldBounds = true;
          s.events.onOutOfBounds.add(this.resetSprite, this);
      }

      var fire_animation = this.game.add.sprite(20,20, 'fire_animation');
      fire_animation.scale.setTo(0.5,0.5);
      var light = fire_animation.animations.add('light');
      fire_animation.animations.play('light', 20, true);
      // cactus
      var cactus_animation = this.game.add.sprite(20,20, 'cactus_animation');
      var wind = cactus_animation.animations.add('wind');
      cactus_animation.animations.play('wind', 5, true);

      this.init();
      this.game.kineticScrolling.start();
    },
    init : function() {
      this.game.kineticScrolling = this.game.plugins.add(Phaser.Plugin.KineticScrolling);
      this.game.kineticScrolling.configure({
        kineticMovement: true,
        timeConstantScroll: 325, //really mimic iOS
        horizontalScroll: false,
        verticalScroll: true,
        horizontalWheel: false,
        verticalWheel: true,
        deltaWheel: 40
    });
      this.game.camera.y = ((~~this.world.height/this.game.height)-1) * this.game.height;
    },
    resetSprite : function (sprite) {
        sprite.x = this.game.world.bounds.right;
        if(sprite.y > this.world.height)
          sprite.y = this.game.world.bounds.top;
    },
    update : function() {
      // this.dragMap();
    },

    render : function(){
      // this.game.debug.text("fps : "+game.time.fps || '--', 2, 14, "#00ff00");
    }
  }

  game.state.add('play',playState);
  game.state.start('play');

  // phaser destroy doesn't remove canvas element --> removed manually in app run
  scope.$on('$destroy', function() {
    game.destroy(); // Clean up the game when we leave this scope
    var canvas = document.querySelector('#map_canvas');
    canvas.parentNode.removeChild(canvas);
    log.debug('game destoryed');
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
        abstract : true,
          resolve : {
            lessons : ['Rest','$log',function(Rest, $log){
              return Rest.one('accounts', CONSTANT.CLIENTID.ELL).getList('lessons').then(function(lessons) {
                $log.debug(lessons.plain());
                return lessons.plain();
              })
            }]
          },
        template : '<ion-nav-view name="state-map"></ion-nav-view>'
      })
      .state('map.navigate',{
        url : '/navigate',
        views : {
          'state-map' : {
            templateUrl : CONSTANT.PATH.MAP + '/map' + CONSTANT.VIEW,
            controller : 'mapController as mapCtrl'
          }
        }
      })
  }
})();

(function() {
    'use strict';

    angular
        .module('zaya-profile')
        .controller('profileController', profileController);

    profileController.$inject = ['CONSTANT','$state','Auth','Rest','$log','$ionicPopup'];

    function profileController(CONSTANT, $state, Auth, Rest, $log, $ionicPopup) {
        var profileCtrl = this;
        profileCtrl.createProfile = createProfile;
        profileCtrl.updateProfile = updateProfile;
        profileCtrl.logout = logout;
        profileCtrl.calcAge = calcAge;
        profileCtrl.closeKeyboard = closeKeyboard;
        profileCtrl.validatePersonaliseForm = validatePersonaliseForm;
        profileCtrl.showError = showError;
        profileCtrl.convertDate = convertDate;
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

        function calcAge(dateString) {
          var birthday = +new Date(dateString);
          return ~~((Date.now() - birthday) / (31557600000));
        }
        function convertDate(date) {
          function pad(s) { return (s < 10) ? '0' + s : s; }
          var d = new Date(date);
          $log.debug([d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())  ].join('-'))
          return [d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())  ].join('-');
        }

        function createProfile (userdata) {
          Rest.all('profiles').post(userdata).then(function(response){
              Auth.getUser(function(){
                $state.go('map.navigate',{});
              },function(){
                profileCtrl.showError('Error', 'Error making profile');
              })
          },function(error){
            $ionicPopup.alert({
              title : _.chain(error.data).keys().first(),
              template : error.data[_.chain(error.data).keys().first()].toString(),
            });
          })
        }

        function updateProfile(userdata) {
          // body...
        }

        function logout() {
          Auth.logout(function () {
            $state.go('auth.signin',{})
          },function () {
            // body...
          })
        }
        function showError(title, msg) {
          $log.debug(title, msg);
          $ionicPopup.alert({
            title: title,
            template: msg
          });
        }

        function validatePersonaliseForm(formData) {
          $log.debug(formData);
          if (!formData.first_name.$viewValue) {
            profileCtrl.showError("Child's name", "Please enter child's name");
            return false;
          }
          if (!formData.dob.$viewValue) {
            profileCtrl.showError("DOB", "Please select a DOB");
            return false;
          }
          if (!formData.gender.$viewValue) {
            profileCtrl.showError("Gender", "Please select a gender");
            return false;
          }
          if (!formData.gender.$viewValue) {
            profileCtrl.showError("Grade", "Please select a grade");
            return false;
          }
          return true;
        }
        function closeKeyboard() {
          try{
            cordova.plugins.Keyboard.close();
          }
          catch(e){
            $log.debug(e);
          }
          return true;
        }

    }
})();

(function() {
  angular
    .module('zaya-quiz')
    .controller('QuizController', QuizController)

  QuizController.$inject = ['quiz', '$stateParams', '$state', '$scope', 'audio', '$log', '$ionicModal', 'CONSTANT', '$ionicSlideBoxDelegate', 'Utilities', 'Quiz', 'Auth', '$ionicLoading', '$ionicPopup'];

  function QuizController(quiz, $stateParams, $state, $scope, audio, $log, $ionicModal, CONSTANT, $ionicSlideBoxDelegate, Utilities, Quiz, Auth, $ionicLoading, $ionicPopup) {
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
    quizCtrl.attemptAndNext = attemptAndNext;
    quizCtrl.calculateResult = calculateResult;
    quizCtrl.MARKS_MULTIPIER = 10;
    quizCtrl.quizResult = {};
    quizCtrl.utilities = Utilities;
    quizCtrl.submitQuiz = submitQuiz;
    quizCtrl.endQuiz = endQuiz;
    quizCtrl.pauseQuiz = pauseQuiz;
    quizCtrl.restartQuiz = restartQuiz;
    //audio
    quizCtrl.playAudio = playAudio;

    //question layouts
    quizCtrl.GRID_TYPE = ['audio_to_text', 'text_to_pic', 'pic_to_text', 'audio_to_pic'];
    quizCtrl.LIST_TYPE = ['audio_to_text_longer', 'text_to_pic_longer', 'pic_to_text_longer', 'audio_to_pic_longer'];

    //slide box
    quizCtrl.slideHasChanged = slideHasChanged;
    quizCtrl.slideTo = slideTo;

    //Regex operations
    quizCtrl.soundIdRegex = /(?:\[\[)(?:sound)(?:\s)(?:id=)([0-9]+)(?:\]\])/;
    quizCtrl.imageTagRegex = /(?:\[\[)(?:image)(?:\s)(?:id=)([0-9]+)(?:\]\])/;

    quizCtrl.getSoundId = getSoundId;
    quizCtrl.getImageId = getImageId;
    quizCtrl.getImageSrc = getImageSrc;
    quizCtrl.parseToDisplay = parseToDisplay;
    quizCtrl.replaceImageTag = replaceImageTag;
    quizCtrl.removeSoundTag = removeSoundTag;


    // initialisation call
    quizCtrl.setCurrentIndex(0);
    quizCtrl.init(quizCtrl.quiz);

    $scope.modal = {};



    function init(quiz) {

      // init report object
      if ($state.current.name == "quiz.summary") {
        document.addEventListener("backbutton", onBackKeyDown, false);

        function onBackKeyDown(e) {
          e.preventDefault();
          $ionicLoading.show({
            noBackdrop: false,
            hideOnStateChange: true
          });
          $state.go('map.navigate');
        }
        quizCtrl.report = $stateParams.report;
        quizCtrl.quiz = $stateParams.quiz;
        quizCtrl.quizResult = quizCtrl.calculateResult(quizCtrl.report, quizCtrl.quiz);
        Quiz.saveReport({
          node: quizCtrl.quiz.node.id,
          person: Auth.getProfileId(),
          score: quizCtrl.quizResult.marks
        }, function(success) {
          var report_id = success.id;
          angular.forEach(quizCtrl.report.attempts, function(value, key) {
            // 1 - Attempted
            // 2 - Skipped
            // 3 - NotAttempted
            var attempt = {
              answer: value.length > 0 ? value : null,
              status: value.length > 0 ? 1 : 2,
              person: Auth.getProfileId(),
              report: report_id,
              node: key
            };
            Quiz.saveAttempt(attempt, function(response) {}, function(error) {});
          });
        }, function(error) {

        });
        // quizCtrl.report = {"quiz_id":"10014638-8567-4a33-814a-1b7bfedf0664","attempts":{"cbe39272-ccbd-4e05-9532-d53699ec59cd":[3],"61524a03-4acd-4b1d-ae96-96702387e7e3":[3],"5b66574b-621b-435e-a812-db7be6a94dfd":[3],"cda26918-b9d4-4120-afe4-1e627691454f":[3],"1eac2901-3f1a-4e48-b2cb-706964aece32":[2]}};
        // quizCtrl.quiz = {"node":{"id":"10014638-8567-4a33-814a-1b7bfedf0664","content_type_name":"assessment","type":{"id":"7053747a-2967-431a-bc68-2aa23b8bd1c4","score":100},"created":"2016-04-25T11:36:53.969858Z","updated":"2016-04-25T11:36:53.969884Z","title":"Assessment test","description":"Assessment description","object_id":"7053747a-2967-431a-bc68-2aa23b8bd1c4","stauts":"PUBLISHED","lft":10,"rght":21,"tree_id":1,"level":1,"parent":"5cb5adc2-84f8-41d2-9272-81790cb314c2","content_type":26,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[{"node":{"id":"cbe39272-ccbd-4e05-9532-d53699ec59cd","content_type_name":"json question","type":{"id":"249fdc1f-b466-4993-be6e-555fb6052a55","created":"2016-04-25T11:49:39.453229Z","updated":"2016-04-25T11:49:39.453251Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:49:39.486776Z","updated":"2016-04-25T11:49:39.486799Z","title":"Audio to text","description":"","object_id":"249fdc1f-b466-4993-be6e-555fb6052a55","stauts":"PUBLISHED","lft":13,"rght":14,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"61524a03-4acd-4b1d-ae96-96702387e7e3","content_type_name":"json question","type":{"id":"e7962a73-0199-477d-9838-8f8e419907b8","created":"2016-04-25T11:50:41.767437Z","updated":"2016-04-25T11:50:41.767456Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:50:41.799933Z","updated":"2016-04-25T11:50:41.799953Z","title":"Audio to text","description":"","object_id":"e7962a73-0199-477d-9838-8f8e419907b8","stauts":"PUBLISHED","lft":17,"rght":18,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"5b66574b-621b-435e-a812-db7be6a94dfd","content_type_name":"json question","type":{"id":"d72b724c-f8af-4221-815d-08abba56bda2","created":"2016-04-25T11:43:38.461255Z","updated":"2016-04-25T11:43:38.461273Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:43:38.493848Z","updated":"2016-04-25T11:43:38.493870Z","title":"Audio to text","description":"","object_id":"d72b724c-f8af-4221-815d-08abba56bda2","stauts":"PUBLISHED","lft":11,"rght":12,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"cda26918-b9d4-4120-afe4-1e627691454f","content_type_name":"json question","type":{"id":"8f9e4441-2e51-4834-860b-9324a6468889","created":"2016-04-25T11:50:17.262086Z","updated":"2016-04-25T11:50:17.262103Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:50:17.295078Z","updated":"2016-04-25T11:50:17.295097Z","title":"Audio to text","description":"","object_id":"8f9e4441-2e51-4834-860b-9324a6468889","stauts":"PUBLISHED","lft":15,"rght":16,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"1eac2901-3f1a-4e48-b2cb-706964aece32","content_type_name":"json question","type":{"id":"1678c124-710c-4b52-98a8-a873624d2dd0","created":"2016-04-25T11:50:45.706748Z","updated":"2016-04-25T11:50:45.706765Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:50:45.739207Z","updated":"2016-04-25T11:50:45.739227Z","title":"Audio to text","description":"","object_id":"1678c124-710c-4b52-98a8-a873624d2dd0","stauts":"PUBLISHED","lft":19,"rght":20,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]}]}

      } else if ($state.current.name == "quiz.questions") {
        quizCtrl.report = {};
        quizCtrl.report.quiz_id = quiz.node.id;
        quizCtrl.report.attempts = {};
        for (var i = 0; i < quiz.objects.length; i++) {
          quizCtrl.report.attempts[quiz.objects[i].node.id] = [];
        }
        // init attempted

        for (var i = 0; i < quizCtrl.quiz.objects.length; i++) {
          if (i != 0)
            quizCtrl.quiz.objects[i].isVisited = false;
          else
            quizCtrl.quiz.objects[i].isVisited = true;

          if ((quizCtrl.quiz.objects[i].node.type.type == 'choicequestion' && !quizCtrl.quiz.objects[i].node.type.content.is_multiple) /*|| quizCtrl.quiz.objects[i].node.content_type=='dr question'*/ ) {
            quizCtrl.quiz.objects[i].attempted = "";
          } else if (quizCtrl.quiz.objects[i].node.type.type == 'choicequestion' && quizCtrl.quiz.objects[i].node.type.content.is_multiple) {
            quizCtrl.quiz.objects[i].attempted = [];
          }
          //else if(quizCtrl.quiz.objects[i].node.content_type=='sentence ordering' || quizCtrl.quiz.objects[i].node.content_type=='sentence structuring'){
          //  quizCtrl.quiz.objects[i].attempted = [];
          //}
          else {}
        }
      } else {}

    }

    function isCurrentIndex(index) {

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

      quizCtrl.currentIndex = (quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1) ? ++quizCtrl.currentIndex : quizCtrl.currentIndex;
    }

    function decide() {
      if (!quizCtrl.isCorrectAttempted(quizCtrl.quiz.objects[quizCtrl.currentIndex])) {
        quizCtrl.submitAttempt(
          quizCtrl.quiz.objects[quizCtrl.currentIndex].node.id,
          quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
        );
        quizCtrl.feedback(
          quizCtrl.quiz.objects[quizCtrl.currentIndex],
          quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
        );
      } else if (quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1) {
        quizCtrl.nextQuestion();
      } else {
        // final question -> go to summary
        $state.go('quiz.summary', {
          report: angular.copy(quizCtrl.report)
        });
      }
    }

    function canSubmit() {

      // SCQ | DR
      if ((quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && !quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple) || quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "dr question") {
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted;
      }
      // MCQ
      if (quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple) {
        //removes false keys
        quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted = _.pick(quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted, _.identity);
        // true if attempted and key count is more than one
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted && _.size(quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted) > 1;
      }
      if (quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "sentence ordering" || quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "sentence structuring") {
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted.length ? true : false;
      }
    }

    function feedback(question, attempt) {

      return quizCtrl.isCorrect(question, attempt) ? $scope.openModal('correct') : $scope.openModal('wrong');
    }

    function submitAttempt(question_id, attempt) {
      if (quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && !quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple && attempt != '') {
        quizCtrl.report.attempts[question_id].push(angular.copy(attempt));
      } else if (quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple && attempt.length > 0) {
        quizCtrl.report.attempts[question_id].push(angular.copy(attempt));

      }

    }


    function isAttempted(question) {
      // multiple choice
      if (question.node.type.type == 'choicequestion' && question.node.type.content.is_multiple) {
        for (var i = 0; i < quizCtrl.report.attempts[question.node.id].length; i++) {
          if (_.chain(quizCtrl.report.attempts[question.node.id][i]).map(function(num, key) {
              return num ? parseInt(key) : false;
            }).reject(function(num) {
              return !num;
            }).value().length > 0)
            return true;
        }
        return false;
      }
      // single choice
      if (question.node.type.type == 'choicequestion' && !question.node.type.content.is_multiple) {
        return quizCtrl.report.attempts[question.node.id].length > 0;
      }
    }

    function isCorrect(question, attempt) {

      // multiple choice
      if (question.node.type.type == 'choicequestion' && question.node.type.content.is_multiple) {
        return _.chain(attempt).map(function(num, key) {
          return parseInt(key);
        }).isEqual(question.node.type.answer).value();
      }
      // single choice
      if (question.node.type.type == 'choicequestion' && !question.node.type.content.is_multiple) {
        return attempt == question.node.type.answer[0];
      }
      // dr
      if (question.node.type.type == 'dr question') {
        return attempt == question.node.type.answer[0];
      }
      // sor | sst
      if (question.node.type.type == 'sentence ordering' || question.node.type.type == 'sentence structuring') {
        return angular.equals(question.node.type.answer, attempt);
      }
    }

    function isCorrectAttempted(question) {
      // multiple choice
      if (question.node.type.type == 'choicequestion' && question.node.type.content.is_multiple) {
        for (var i = 0; i < quizCtrl.report.attempts[question.node.id].length; i++) {
          if (_.chain(quizCtrl.report.attempts[question.node.id][i]).map(function(num, key) {
              return num ? parseInt(key) : false;
            }).reject(function(num) {
              return !num;
            }).isEqual(question.node.type.answer).value())
            return true;
        }
        return false;
      }
      // single choice
      if (question.node.type.type == 'choicequestion' && !question.node.type.content.is_multiple) {
        return quizCtrl.report.attempts[question.node.id].indexOf(question.node.type.answer[0]) != -1 ? (true) : false;
      }
      // to be tested for new api
      // dr
      //if(question.node.type.type=='dr question'){
      //  return quizCtrl.report.attempts[question.node.id].indexOf(question.node.type.answer[0].toLowerCase())!=-1 ? true : false;
      //}
      //if(question.node.type.type=='sentence ordering' || question.node.type.type=='sentence structuring'){
      //  for (var i = 0; i < quizCtrl.report.attempts[question.node.id].length; i++) {
      //    if(angular.equals(quizCtrl.report.attempts[question.node.id][i],question.node.type.answer))
      //      return true;
      //  }
      //  return false;
      //}
    }

    function isKeyCorrect(question, key) {

      return question.node.type.answer.indexOf(key) != -1 ? true : false;
    }

    function isKeyAttempted(question, key) {

      if (question.node.type.content.is_multiple) {
        return _.chain(quizCtrl.report.attempts[question.node.id]).last().has(key).value();
      } else {
        return quizCtrl.report.attempts[question.node.id].indexOf(key) != -1 ? true : false;
      }
    }

    function playAudio(key) {
      angular.element("#audioplayer")[0].pause();
      if (key) {
        angular.element("#audioSource")[0].src = key;
      } else {
        angular.element("#audioSource")[0].src = 'sound/water-drop.mp3';
      }
      angular.element("#audioplayer")[0].load();
      angular.element("#audioplayer")[0].play();
    }


    $ionicModal.fromTemplateUrl(CONSTANT.PATH.QUIZ + '/quiz.feedback' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      $scope.modal.show();
      return true;
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    }

    function attemptAndNext() {
      quizCtrl.submitAttempt(
        quizCtrl.quiz.objects[quizCtrl.currentIndex].node.id,
        quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
      );
      quizCtrl.audio.play('water-drop');
      if (quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1) {
        $ionicSlideBoxDelegate.next();
      } else {
        // final question -> go to summary
        $state.go('quiz.summary', {
          report: angular.copy(quizCtrl.report),
          quiz: angular.copy(quizCtrl.quiz)
        });
      }
    }


    function slideHasChanged(index) {
      quizCtrl.setCurrentIndex(index);
      quizCtrl.quiz.objects[index].isVisited = true;
    }

    function slideTo(index) {
      $ionicSlideBoxDelegate.slide(index);
    }

    function calculateResult(report, quiz) {
      var result = {
        analysis: {},
        marks: 0,
        correct_questions: 0,
        stars: 0
      };
      angular.forEach(quiz.objects, function(value) {
        if (isAttempted(value)) {
          if (quizCtrl.isCorrectAttempted(value)) {
            result.analysis[value.node.id] = "Correct";
            result.marks += parseInt(value.node.level) * quizCtrl.MARKS_MULTIPIER;
            result.correct_questions++;
          } else {
            result.analysis[value.node.id] = "Wrong";
          }
        } else {
          result.analysis[value.node.id] = "Unattemted"
        }

      })
      var percent_correct = parseInt((result.correct_questions / quiz.objects.length) * 100);
      if (percent_correct >= 80) {
        if (percent_correct >= 90) {
          if (percent_correct >= 95) {
            result.stars = 3;
          } else {
            result.stars = 2;
          }
        } else {
          result.stars = 1;
        }
      }
      return result;
    }

    function range(num) {
      return new Array(num);
    }

    function submitQuiz() {

      $ionicPopup.confirm({
        title: 'Submit Quiz?',
        template: 'Are you sure you want to submit quiz?'
      }).then(function(res) {
        if (res) {
          angular.forEach(quiz.objects, function(value, key) {
            quizCtrl.submitAttempt(value.node.id,
              value.attempted)
          })
          $state.go('quiz.summary', {
            report: angular.copy(quizCtrl.report),
            quiz: angular.copy(quizCtrl.quiz)
          });
        } else {
          void 0;
        }
      });;
    }

    function endQuiz() {

      $ionicPopup.confirm({
        title: 'End Quiz?',
        template: 'Are you sure you want to end quiz?'
      }).then(function(res) {
        if (res) {
          $ionicLoading.show({
            noBackdrop: false,
            hideOnStateChange: true
          });
          $state.go('map.navigate', {});
        } else {
          void 0;
        }
      });;
    }
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.QUIZ + '/quiz.pause.modal' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      quizCtrl.pauseModal = modal;
    });

    function pauseQuiz() {
      quizCtrl.pauseModal.show();
    }

    function restartQuiz() {
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      $state.go($state.current, {}, {
        reload: true
      });
    }


    function getSoundId(string) {
      if(quizCtrl.soundIdRegex.exec(string))
      return quizCtrl.soundIdRegex.exec(string)[1];
    }
    function getImageId(string) {
      if(quizCtrl.imageTagRegex.exec(string))
        return quizCtrl.imageTagRegex.exec(string)[1];
    }
    function getImageSrc(id) {
      return quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].node.type.content.widgets.images[id];
    }
    function parseToDisplay(string) {
      var text = quizCtrl.replaceImageTag(quizCtrl.removeSoundTag(string));
      return text.trim() || '<img height="100" width="100" src="img/icons/sound.png"></img>';

    }
    function removeSoundTag(string) {
      return string.replace(quizCtrl.soundIdRegex, "");
    }
    function replaceImageTag(string) {
      return string.replace(quizCtrl.imageTagRegex, "<img src='"+quizCtrl.getImageSrc(quizCtrl.getImageId(string))+"'></img>");
    }
  }
})();

(function () {
  'use strict';
  angular
    .module('zaya-quiz')
    .factory('Quiz', Quiz)
  Quiz.$inject = ['Restangular', 'CONSTANT', '$cookies', '$log', '$window'];
  function Quiz(Restangular, CONSTANT, $cookies, $log, $window) {
    var rest = Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + '/api/v1');
      RestangularConfigurer.setRequestSuffix('/');
      RestangularConfigurer.setDefaultHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      });
    });
    return {
      saveReport : function(data,success,failure){
        rest.all('reports').post($.param(data)).then(function(response){
          success(response);
        },function(error){
          failure(error);
        })
      },
      saveAttempt : function(data,success,failure){
        rest.all('attempts').post($.param(data)).then(function(response){
          success(response);
        },function(error){
          failure(error);
        })
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
                return {"node":{"id":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type_name":"assessment","type":{"id":"60818cc0-80ef-4bb9-9f1a-3809cb17480c","score":260},"created":"2016-05-07T12:42:59.955741Z","updated":"2016-05-07T12:42:59.955798Z","title":"letter sounds vs names","description":"","object_id":"60818cc0-80ef-4bb9-9f1a-3809cb17480c","stauts":"PUBLISHED","lft":4,"rght":57,"tree_id":3,"level":1,"parent":"55a5321c-af6b-484f-a083-110c63a934f8","content_type":26,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[{"node":{"id":"9aad1431-4292-4983-a4dc-76c49c8e57fc","content_type_name":"json question","type":{"id":"5e36a8da-8ac2-4b48-9fe6-8b37e5f5e8e5","created":"2016-05-07T12:42:59.971242Z","updated":"2016-05-07T12:42:59.971277Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"b"},"score":10,"content":{"content":{"a":" [[sound id=2]] ","b":" [[sound id=1]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2015/08/13/a-sound_EK07B8.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-a_LH0LUQ.mp3"},"videos":{},"images":{"1":"http://lorempixel.com/100/100"}}},"type":"choicequestion"},"created":"2016-05-07T12:42:59.983129Z","updated":"2016-05-07T12:42:59.983183Z","title":"Select the letter sound ofa [[image id=1]]","description":"","object_id":"5e36a8da-8ac2-4b48-9fe6-8b37e5f5e8e5","stauts":"PUBLISHED","lft":5,"rght":6,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"e81b7854-bf07-452d-8ab1-33f32b8db525","content_type_name":"json question","type":{"id":"f1c36527-ed0d-42d1-900a-1989b6bcfd59","created":"2016-05-07T12:42:59.998169Z","updated":"2016-05-07T12:42:59.998244Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=2]] ","b":" [[sound id=1]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/name-of-b-final_L52FU2.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/b-sound_FXZA6D.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.040174Z","updated":"2016-05-07T12:43:00.040207Z","title":"Select the letter sound ofb","description":"","object_id":"f1c36527-ed0d-42d1-900a-1989b6bcfd59","stauts":"PUBLISHED","lft":7,"rght":8,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"c3cecf94-9249-4098-87fa-a3883719edbc","content_type_name":"json question","type":{"id":"12eec6d3-d883-49c1-b331-1a229a6ff28e","created":"2016-05-07T12:43:00.089871Z","updated":"2016-05-07T12:43:00.089896Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"b"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_N11G4D.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/c-sound_FA77P6.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/name-of-c_16TAZ5.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.134026Z","updated":"2016-05-07T12:43:00.134059Z","title":"Select the letter sound ofc [[sound id=1]]","description":"","object_id":"12eec6d3-d883-49c1-b331-1a229a6ff28e","stauts":"PUBLISHED","lft":9,"rght":10,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"005dcafe-9bd7-4256-b390-aa77100e9f21","content_type_name":"json question","type":{"id":"ff0e5e34-bfee-4c99-9862-f3107d6597f0","created":"2016-05-07T12:43:00.181620Z","updated":"2016-05-07T12:43:00.181643Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"b"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_KPDOH6.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/d-sound_SVZ1XG.mp3","3":"/media/contents/zaya/soundclips/2016/01/14/name-of-d-final_1ZDX81.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.208881Z","updated":"2016-05-07T12:43:00.208915Z","title":"Select the letter sound ofd [[sound id=1]]","description":"","object_id":"ff0e5e34-bfee-4c99-9862-f3107d6597f0","stauts":"PUBLISHED","lft":11,"rght":12,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"04989d1b-9011-43a9-bb0c-b0d7b47706a4","content_type_name":"json question","type":{"id":"0b494bdd-25c1-44a4-91c0-ad6ef663d5d2","created":"2016-05-07T12:43:00.420781Z","updated":"2016-05-07T12:43:00.420813Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"b"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_QDVRQU.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/e-sound_WMBJBW.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/name-of-e_A24A36.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.516490Z","updated":"2016-05-07T12:43:00.516524Z","title":"Select the letter sound ofe [[sound id=1]]","description":"","object_id":"0b494bdd-25c1-44a4-91c0-ad6ef663d5d2","stauts":"PUBLISHED","lft":13,"rght":14,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"fdb873b8-5025-429d-bb95-0bf995f2c635","content_type_name":"json question","type":{"id":"a7cf59e0-23c8-4692-bfb4-dda22e2ea757","created":"2016-05-07T12:43:00.534082Z","updated":"2016-05-07T12:43:00.534116Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"b"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_ESKWXL.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/f-sound_3VA79D.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/name-of-f_ONHQOK.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.554741Z","updated":"2016-05-07T12:43:00.554775Z","title":"Select the letter sound off [[sound id=1]]","description":"","object_id":"a7cf59e0-23c8-4692-bfb4-dda22e2ea757","stauts":"PUBLISHED","lft":15,"rght":16,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"ddb33d30-b657-4d9c-9a47-b3720e9a3b1d","content_type_name":"json question","type":{"id":"c43d4456-7edd-4e97-983f-105a543672e4","created":"2016-05-07T12:43:00.575383Z","updated":"2016-05-07T12:43:00.575417Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_TLJUNV.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-g_T4XZDP.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/g-sound_JFY2UW.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.594042Z","updated":"2016-05-07T12:43:00.594094Z","title":"Select the letter sound ofg [[sound id=1]]","description":"","object_id":"c43d4456-7edd-4e97-983f-105a543672e4","stauts":"PUBLISHED","lft":17,"rght":18,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"8a6fd341-eaa4-4855-8de8-9c1580ad01db","content_type_name":"json question","type":{"id":"819005bf-870d-411e-adad-f26f3694fcbb","created":"2016-05-07T12:43:00.613544Z","updated":"2016-05-07T12:43:00.613605Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"b"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_TAHDRJ.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/h-sound_WXBB1F.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/name-of-h_QJU6Q1.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.630097Z","updated":"2016-05-07T12:43:00.630152Z","title":"Select the letter sound ofh [[sound id=1]]","description":"","object_id":"819005bf-870d-411e-adad-f26f3694fcbb","stauts":"PUBLISHED","lft":19,"rght":20,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"77bf770f-3be8-43a6-8a02-9bbec06c2ff0","content_type_name":"json question","type":{"id":"607645df-c73a-4e0b-b35f-3d2ef535ab76","created":"2016-05-07T12:43:00.643234Z","updated":"2016-05-07T12:43:00.643263Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_J2KGKA.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-i_EYHITR.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/i-sound_TYRUMS.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.653527Z","updated":"2016-05-07T12:43:00.653559Z","title":"Select the letter sound ofi [[sound id=1]]","description":"","object_id":"607645df-c73a-4e0b-b35f-3d2ef535ab76","stauts":"PUBLISHED","lft":21,"rght":22,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"c4d03d78-8a86-4d10-b5e4-3cc40b933365","content_type_name":"json question","type":{"id":"6bda1b35-94ac-4a50-9817-0907071e9ee9","created":"2016-05-07T12:43:00.663542Z","updated":"2016-05-07T12:43:00.663579Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_S0NUDE.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-j_URT0KE.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/j-sound_NPDORY.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.673356Z","updated":"2016-05-07T12:43:00.673389Z","title":"Select the letter sound ofj [[sound id=1]]","description":"","object_id":"6bda1b35-94ac-4a50-9817-0907071e9ee9","stauts":"PUBLISHED","lft":23,"rght":24,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"7939d2c5-9dae-43b6-aaa4-cf50e3f74cda","content_type_name":"json question","type":{"id":"04d8acb8-d47d-40a4-b251-03aa0945668b","created":"2016-05-07T12:43:00.683753Z","updated":"2016-05-07T12:43:00.683857Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_8A8SFG.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-k_6WCU8Y.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/k-sound_OC06P7.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.693348Z","updated":"2016-05-07T12:43:00.693380Z","title":"Select the letter sound ofk [[sound id=1]]","description":"","object_id":"04d8acb8-d47d-40a4-b251-03aa0945668b","stauts":"PUBLISHED","lft":25,"rght":26,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"64776c19-f4b0-46e9-b9e7-ecfe48df5646","content_type_name":"json question","type":{"id":"ab7a8ee7-963a-451d-8cba-7916c32aa81b","created":"2016-05-07T12:43:00.703602Z","updated":"2016-05-07T12:43:00.703631Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_FF2LTN.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-l_XEPINW.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/l-sound_1MVEZJ.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.712146Z","updated":"2016-05-07T12:43:00.712178Z","title":"Select the letter sound ofl [[sound id=1]]","description":"","object_id":"ab7a8ee7-963a-451d-8cba-7916c32aa81b","stauts":"PUBLISHED","lft":27,"rght":28,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"cac43387-19a4-4049-bc7f-992fbddd8da1","content_type_name":"json question","type":{"id":"f5164332-d301-4aa1-bffa-a7c3c8e54f6a","created":"2016-05-07T12:43:00.722791Z","updated":"2016-05-07T12:43:00.722823Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_WIAJS6.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-m_QQP82Y.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/m-sound_JG3N3X.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.731205Z","updated":"2016-05-07T12:43:00.731237Z","title":"Select the letter sound ofm [[sound id=1]]","description":"","object_id":"f5164332-d301-4aa1-bffa-a7c3c8e54f6a","stauts":"PUBLISHED","lft":29,"rght":30,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"f3c918eb-e4d2-4c54-bb79-292f35db3fdc","content_type_name":"json question","type":{"id":"2c3005fe-d36c-4973-9c9d-973fa9e1ec42","created":"2016-05-07T12:43:00.744379Z","updated":"2016-05-07T12:43:00.744427Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"b"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_1JUCB0.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/n-sound_D836YX.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/name-of-n_X100GE.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.754515Z","updated":"2016-05-07T12:43:00.754549Z","title":"Select the letter sound ofn [[sound id=1]]","description":"","object_id":"2c3005fe-d36c-4973-9c9d-973fa9e1ec42","stauts":"PUBLISHED","lft":31,"rght":32,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"b54c6652-8673-4b4d-b2b1-deea8cc04c72","content_type_name":"json question","type":{"id":"14ff5dfa-f055-4d33-934a-573a2b6a6fbb","created":"2016-05-07T12:43:00.764602Z","updated":"2016-05-07T12:43:00.764636Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_OEDE11.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-o_QTA8NH.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/o-sound_EL24HU.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.773890Z","updated":"2016-05-07T12:43:00.773924Z","title":"Select the letter sound ofo [[sound id=1]]","description":"","object_id":"14ff5dfa-f055-4d33-934a-573a2b6a6fbb","stauts":"PUBLISHED","lft":33,"rght":34,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"5a8e681c-ce1e-47ad-a148-551e63fb6f69","content_type_name":"json question","type":{"id":"e37609c0-e529-48c7-bb5c-60e78aa98dde","created":"2016-05-07T12:43:00.783530Z","updated":"2016-05-07T12:43:00.783557Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"b"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_0YWL9T.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/p-sound_7KNXSW.mp3","3":"/media/contents/zaya/soundclips/2016/01/14/name-of-p-final_2Y8BDJ.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.793536Z","updated":"2016-05-07T12:43:00.793569Z","title":"Select the letter sound ofp [[sound id=1]]","description":"","object_id":"e37609c0-e529-48c7-bb5c-60e78aa98dde","stauts":"PUBLISHED","lft":35,"rght":36,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"8b5f28cf-ce5f-494c-8459-d80021a10021","content_type_name":"json question","type":{"id":"5f8ed370-6de2-4c9b-9ffa-d3625279839b","created":"2016-05-07T12:43:00.803574Z","updated":"2016-05-07T12:43:00.803735Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_6OWBCL.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-q_HQ5TLA.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/q-sound_7TWKXE.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.812341Z","updated":"2016-05-07T12:43:00.812375Z","title":"Select the letter sound ofq [[sound id=1]]","description":"","object_id":"5f8ed370-6de2-4c9b-9ffa-d3625279839b","stauts":"PUBLISHED","lft":37,"rght":38,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"0b18e5a6-54ae-4c70-9e73-443df17d038f","content_type_name":"json question","type":{"id":"5559bedc-91f9-48e8-8b94-ee12fdba59b6","created":"2016-05-07T12:43:00.822599Z","updated":"2016-05-07T12:43:00.822632Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"b"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_OBDNXQ.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/r-sound_NY21PE.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/name-of-r_5MGFFL.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.831620Z","updated":"2016-05-07T12:43:00.831655Z","title":"Select the letter sound ofr [[sound id=1]]","description":"","object_id":"5559bedc-91f9-48e8-8b94-ee12fdba59b6","stauts":"PUBLISHED","lft":39,"rght":40,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"966675bf-ce92-4344-9e16-fc11bec51e4d","content_type_name":"json question","type":{"id":"7a92ac67-9efd-41a4-90f0-53a39d81b6fb","created":"2016-05-07T12:43:00.842570Z","updated":"2016-05-07T12:43:00.842598Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_DV7Q8H.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-s_0NO2X6.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/s-sound_UVMTAR.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.851492Z","updated":"2016-05-07T12:43:00.851525Z","title":"Select the letter sound ofs [[sound id=1]]","description":"","object_id":"7a92ac67-9efd-41a4-90f0-53a39d81b6fb","stauts":"PUBLISHED","lft":41,"rght":42,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"5697ac67-bb0d-4071-becf-fc3463142f52","content_type_name":"json question","type":{"id":"d028714d-756f-4288-a61e-cd65b0c22a86","created":"2016-05-07T12:43:00.862635Z","updated":"2016-05-07T12:43:00.862664Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_2L1Y42.mp3","2":"/media/contents/zaya/soundclips/2016/01/14/name-of-t-final_9OV3K0.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/t-sound_O7CNHH.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.871891Z","updated":"2016-05-07T12:43:00.871924Z","title":"Select the letter sound oft [[sound id=1]]","description":"","object_id":"d028714d-756f-4288-a61e-cd65b0c22a86","stauts":"PUBLISHED","lft":43,"rght":44,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"09220ece-51eb-4ba4-b888-e9bc92214f0d","content_type_name":"json question","type":{"id":"2ef1b4c2-20a6-4767-b57b-b2e87c8cc9c9","created":"2016-05-07T12:43:00.882377Z","updated":"2016-05-07T12:43:00.882403Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=2]] ","b":" [[sound id=1]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2015/08/13/name-of-u_9D1WUZ.mp3","2":"/media/contents/zaya/soundclips/2016/01/14/sound-of-u-final_I74OH3.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.891274Z","updated":"2016-05-07T12:43:00.891306Z","title":"Select the letter sound ofu","description":"","object_id":"2ef1b4c2-20a6-4767-b57b-b2e87c8cc9c9","stauts":"PUBLISHED","lft":45,"rght":46,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"d74d1351-32d9-492d-b5d4-236cafe4572f","content_type_name":"json question","type":{"id":"420458a1-9684-4dba-9b3d-aeac2569323f","created":"2016-05-07T12:43:00.901634Z","updated":"2016-05-07T12:43:00.901714Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"b"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_XJXXK3.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/v-sound_OT3MR8.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/name-of-v_G85DDP.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.911263Z","updated":"2016-05-07T12:43:00.911294Z","title":"Select the letter sound ofv [[sound id=1]]","description":"","object_id":"420458a1-9684-4dba-9b3d-aeac2569323f","stauts":"PUBLISHED","lft":47,"rght":48,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"4a2e89d0-5787-4ce0-a294-d3bf2d735188","content_type_name":"json question","type":{"id":"e4f14aef-8e7a-4f22-8700-a4d757d93b6d","created":"2016-05-07T12:43:00.921027Z","updated":"2016-05-07T12:43:00.921054Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_MU5O0A.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-w_8ABOB1.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/w-sound_U3RVRC.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.931420Z","updated":"2016-05-07T12:43:00.931455Z","title":"Select the letter sound ofw [[sound id=1]]","description":"","object_id":"e4f14aef-8e7a-4f22-8700-a4d757d93b6d","stauts":"PUBLISHED","lft":49,"rght":50,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"616ba51c-be19-4224-9366-6312a275ade7","content_type_name":"json question","type":{"id":"8022d1dd-57f6-4959-90c5-68f2bd8193b0","created":"2016-05-07T12:43:00.945078Z","updated":"2016-05-07T12:43:00.945110Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"a"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_ZBJ2DX.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-x_6VEVUK.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/x-sound_RHFV6J.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.957755Z","updated":"2016-05-07T12:43:00.957875Z","title":"Select the letter sound ofx [[sound id=1]]","description":"","object_id":"8022d1dd-57f6-4959-90c5-68f2bd8193b0","stauts":"PUBLISHED","lft":51,"rght":52,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"6ca3e874-ab33-40dc-a94d-96741589cdbf","content_type_name":"json question","type":{"id":"cceec617-6f18-46b6-963d-b27c394042ce","created":"2016-05-07T12:43:00.975044Z","updated":"2016-05-07T12:43:00.975097Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"b"},"score":10,"content":{"content":{"a":" [[sound id=3]] ","b":" [[sound id=2]] "},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2016/01/14/select-the-sound-of-this-letter_6L23Z4.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/y-sound_0DXBCU.mp3","3":"/media/contents/zaya/soundclips/2015/08/13/name-of-y_09PTMD.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:00.987179Z","updated":"2016-05-07T12:43:00.987228Z","title":"Select the letter sound ofy [[sound id=1]]","description":"","object_id":"cceec617-6f18-46b6-963d-b27c394042ce","stauts":"PUBLISHED","lft":53,"rght":54,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]},{"node":{"id":"d7c8a56c-6638-48ce-b6a3-afeef9d96a95","content_type_name":"json question","type":{"id":"74abcc74-bcc3-4d5d-840d-73ff416aa732","created":"2016-05-07T12:43:01.004524Z","updated":"2016-05-07T12:43:01.004567Z","microstandard":"ELL.1.RE.PA.30","is_critical_thinking":false,"level":1,"answer":{"answer":"b"},"score":10,"content":{"content":{"a":" [[sound id=2]] ","b":"[[sound id=1]]"},"widgets":{"sounds":{"1":"/media/contents/zaya/soundclips/2015/08/13/z-sound_N78YQZ.mp3","2":"/media/contents/zaya/soundclips/2015/08/13/name-of-z_ZXVXPO.mp3"},"videos":{},"images":{}}},"type":"choicequestion"},"created":"2016-05-07T12:43:01.017595Z","updated":"2016-05-07T12:43:01.017630Z","title":"Select the letter sound ofz","description":"","object_id":"74abcc74-bcc3-4d5d-840d-73ff416aa732","stauts":"PUBLISHED","lft":55,"rght":56,"tree_id":3,"level":2,"parent":"5d8b3d13-f4fb-40ce-a83f-51b1dd28d65a","content_type":22,"account":"ccbb119e-3831-43d5-8c1d-2832dfd7a31c","tag":null},"objects":[]}]};
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

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya-user')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      // parent state after authentication
      .state('user',{
        url :'/user',
        abstract : true,
        template: '<ion-nav-view name="state-user"></ion-nav-view>',
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
      .state('user.personalise.social',{
        url : '/social',
        views : {
          'state-personalise':{
            templateUrl : CONSTANT.PATH.PROFILE+'/personalise.social'+CONSTANT.VIEW,
            controller : 'profileController as profileCtrl'
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
