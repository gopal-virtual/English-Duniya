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
        .module('zaya-content', []);
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
      'com.2fdevs.videogular.plugins.buffering',

      // core
      'common',
      'zaya-map',
      'zaya-user',
      'zaya-profile',
      'zaya-intro',
      'zaya-auth',
      'zaya-quiz',
      'zaya-content'
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
      if (toState.name == 'quiz.practice.summary' && !toParams.report) {
        $log.debug("Practice summary page cannot be accessed : No quiz data present");
        event.preventDefault();
        $state.go('map.navigate');
      }
      // block content state
      if (toState.name == 'content.video' && !toParams.video) {
        $log.debug("Video value is not present");
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
  var ROOT = 'templates';

  angular
    .module('common')
    .constant('CONSTANT', {
      'BACKEND_SERVICE_DOMAIN': 'http://cc-test.zaya.in/',
      // 'BACKEND_SERVICE_DOMAIN' : 'http://192.168.1.6:9000/',
      'PATH': {
        'INTRO': ROOT + '/intro',
        'AUTH': ROOT + '/auth',
        'QUIZ': ROOT + '/quiz',
        'PROFILE': ROOT + '/profile',
        'USER': ROOT + '/user',
        'PLAYLIST': ROOT + '/playlist',
        'HOME': ROOT + '/home',
        'RESULT': ROOT + '/result',
        'SEARCH': ROOT + '/search',
        'GROUP': ROOT + '/group',
        'COMMON': ROOT + '/common',
        'MAP': ROOT + '/map',
        'CONTENT': ROOT + '/content'
      },
      'VIEW': '.view.html',
      'CLIENTID': {
        'FACEBOOK': '1159750564044149',
        'GOOGLE': '1011514043276-7q3kvn29jkegl2d1v7dtlbtipqqgo1rr.apps.googleusercontent.com',
        'ELL': '1e7aa89f-3f50-433a-90ca-e485a92bbda6'
      },
      'ASSETS' : {
        'IMG' : {
          'ICON' : 'img/icons',
          'SOUND_PLACEHOLDER' : 'img/icons/sound.png'
        }
      },
      'STAR': {
        'ONE': 60,
        'TWO': 80,
        'THREE': 95
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

(function() {
  'use strict';

  angular
    .module('zaya-content')
    .controller('contentController', contentController);

  contentController.$inject = ['$stateParams', 'orientation', '$log','$scope'];

  /* @ngInject */
  function contentController($stateParams, orientation, $log, $scope) {
    var contentCtrl = this;
    contentCtrl.onPlayerReady = onPlayerReady;
    contentCtrl.config = {
      sources: [$stateParams.video],
      autoplay : true,
      theme: "lib/videogular-themes-default/videogular.css"
    };

    function onPlayerReady(API) {
      contentCtrl.API = API;
    }

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
      orientation.setLandscape();
    });

  }

})();

(function() {
  'use strict';

  mainRoute.$inject = ["$stateProvider", "$urlRouterProvider", "CONSTANT"];
  angular
    .module('zaya-content')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('content', {
          url : '/content',
          abstract : true,
          template : '<ion-nav-view name="state-content"></ion-nav-view>'
      })
      .state('content.video', {
          url : '/video',
          params: {
            video: null,
          },
          views : {
              'state-content' : {
                  templateUrl : CONSTANT.PATH.CONTENT + '/content.video' + CONSTANT.VIEW,
                  controller : 'contentController as contentCtrl'
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

  mapController.$inject = ['$scope', '$rootScope', '$log', '$ionicModal', '$state', 'lessons', 'scores', 'extendLesson', 'Rest', 'CONSTANT', '$sce', '$ionicLoading', '$timeout', '$ionicBackdrop', 'orientation', 'Auth'];

  function mapController($scope, $rootScope, $log, $ionicModal, $state, lessons, scores, extendLesson, Rest, CONSTANT, $sce, $ionicLoading, $timeout, $ionicBackdrop, orientation, Auth) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
      orientation.setPortrait();
    });
    var mapCtrl = this;
    mapCtrl.lessons = lessons;
    // mapCtrl.lessons = extendLesson.getLesson(lessons, scores);

    mapCtrl.getLesson = getLesson;
    mapCtrl.getSrc = getSrc;
    mapCtrl.resetNode = resetNode;
    mapCtrl.getIcon = getIcon;
    mapCtrl.resourceType = resourceType;
    mapCtrl.playResource = playResource;
    mapCtrl.logout = logout;
    mapCtrl.backdrop = false;
    mapCtrl.showScore = -1;
    mapCtrl.user = JSON.parse(localStorage.user_details) || {};
    mapCtrl.user['name'] = mapCtrl.user.first_name + ' ' + mapCtrl.user.last_name;

    // mapCtrl.openModal = openModal;
    // mapCtrl.closeModal = closeModal;
    mapCtrl.openSettings = openSettings;
    mapCtrl.closeSettings = closeSettings;

    mapCtrl.skillSet = [{
      name: 'reading',
      score: 300
    }, {
      name: 'listening',
      score: 200
    }, {
      name: 'vocabulary',
      score: 250
    }, {
      name: 'grammar',
      score: 3000
    }];

    function logout() {
      mapCtrl.closeSettings();
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      Auth.logout(function() {
        $state.go('auth.signin', {})
      }, function() {
        // body...
      })
    }

    function openSettings() {
      $scope.settings.show();
    }

    function closeSettings() {
      $scope.settings.hide();
    }

    function playResource(resource) {
      $scope.closeModal();
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      if (mapCtrl.resourceType(resource) != 'video') {
        $timeout(function() {
          $state.go('quiz.questions', {
            id: resource.node.id
          });
        });
      } else {
        $timeout(function() {
          $state.go('content.video', {
            video: {
              src: mapCtrl.getSrc(resource.node.type.path),
              type: 'video/mp4'
            }
          });
        });
        //   mapCtrl.config.sources[0].src = mapCtrl.getSrc(resource.node.type.path);
      }
    }

    function resourceType(resource) {
      if (resource.node.content_type_name == 'assessment') {
        return 'assessment';
      } else if (resource.node.content_type_name == 'resource') {
        if (resource.node.type.file_type.substring(0, resource.node.type.file_type.indexOf('/')) == 'video') {
          return 'video';
        }
      } else {}
    }

    function getSrc(src) {
      return $sce.trustAsResourceUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + src);
    }

    function getIcon(resource) {
      if (resource.node.content_type_name == 'assessment') {
        return CONSTANT.ASSETS.IMG.ICON + '/quiz.png';
      } else if (resource.node.content_type_name == 'resource') {
        if (resource.node.type.file_type.substring(0, resource.node.type.file_type.indexOf('/')) == 'video') {
          return CONSTANT.ASSETS.IMG.ICON + '/video.png';
        }
      } else {

      }
    }

    $scope.$on('logout', function() {
      $state.go('user.main.settings', {});
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
      //   hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.settings' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
      //   hardwareBackButtonClose: false
    }).then(function(settings) {
      $scope.settings = settings;
    });

    function resetNode() {
      mapCtrl.selectedNode = {};
    }

    function getLesson(id) {
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('lessons', id).get().then(function(response) {
        $ionicLoading.hide();
        $scope.openModal();
        mapCtrl.selectedNode = response.plain();
        $log.debug('get lesson', response.plain());
        localStorage.setItem('lesson', JSON.stringify(mapCtrl.selectedNode));
      })
    }

    $timeout(function functionName() {
      if (localStorage.lesson) {
        $scope.openModal();
        mapCtrl.selectedNode = JSON.parse(localStorage.lesson);
      }
    });

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
              lessons : '=',
            },
            link: linkFunc,
        };

        return mapCanvas;

        function linkFunc(scope, el, attr, ctrl) {
          $timeout(
              function(){
                  createGame(scope, scope.lessons, $injector, $log)
              }
          );
        }
    }

})();

(function() {
  'use strict';

  angular
    .module('zaya-map')
    .factory('extendLesson', extendLesson);

  extendLesson.$inject = ['$log', 'CONSTANT'];

  /* @ngInject */
  function extendLesson($log, CONSTANT) {
    var extendLesson = {
      getLesson: getLesson
    };

    return extendLesson;

    function setLock(key, lesson, bool) {
      lesson.locked = bool;
    }

    function setStar(key, lesson, count) {
      lesson.stars = count;
    }

    function getLesson(lessons, scores) {

      angular.forEach(lessons, function(value, key) {
        setLock(key, value, true);
      })
      angular.forEach(lessons, function(value, key) {

        var total_score = 0;
        var obtained_score = 0;

        angular.forEach(scores[key].contents.assessment, function(value, key) {
          total_score += value.total_score;
          obtained_score += value.obtained_score;
        })

        if (total_score > 0) {
          var score = (obtained_score / total_score) * 100;

          // if score is > 80%, unlock the next lessons
          if (score >= CONSTANT.STAR.ONE) {
            if (lessons[key + 1])
              setLock(key, lessons[key + 1], false);
          }

          // give stars
          if (obtained_score == 0) {
            setStar(key, lessons[key], -1);
          } else if (score > 0 && score < CONSTANT.STAR.ONE) {
            setStar(key, lessons[key], 0);
          } else if (score >= CONSTANT.STAR.ONE && score < CONSTANT.STAR.TWO) {
            setStar(key, lessons[key], 1);
          } else if (score >= CONSTANT.STAR.TWO && score < CONSTANT.STAR.THREE) {
            setStar(key, lessons[key], 2);
          } else if (score >= CONSTANT.STAR.THREE) {
            setStar(key, lessons[key], 3);
          } else {}

        }
        // unlock first lessons
        if (key == 0) {
            setLock(key, value, false);
        }
      })

      return lessons;
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
      this.load.image('node-locked', 'img/icons/icon-node-locked.png');
      this.load.image('read', 'img/icons/icon-read.png');
      this.load.image('read_deactive', 'img/icons/icon-read-deactive.png');
      this.load.image('star', 'img/icons/icon-star-small.png');
      this.load.image('nostar', 'img/icons/icon-nostar.png');
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
        'x': [101,113,170,202,216,201,180,172,172,179,195,211,207,160,138,144,167,197,204,197,165,126,101,161,256,223,134,102,138,200,235,200,180,180,180,180,180,180,180,180],
        'y': [50,64,109,148,189,235,287,346,404,456,495,529,574,644,693,748,803,854,877,941,980,1022,1091,1116,1116,1171,1209,1266,1318,1342,1371,1433,1494,1577,1659,1742,1824,1907,1950,2050]
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
      // sand particles
      for (var i = 0; i < 100; i++)
      {
          var s = this.game.add.sprite(this.world.randomX, this.game.world.randomY, 'particle' + this.game.rnd.between(1, 3));

          s.scale.setTo(this.game.rnd.between(1, 2)/20);
          this.game.physics.arcade.enable(s);
          s.body.velocity.x = this.game.rnd.between(-200, -550);
          s.body.velocity.y = this.game.rnd.between(50, 70);
          s.autoCull = true;
          s.checkWorldBounds = true;
          s.events.onOutOfBounds.add(this.resetSprite, this);
      }
    //   var stars = this.game.add.group();
      function createStars(count, x, y){
          for (var i = 0; i < count; i++) {
              var star = stars.create(x[0] + x[i+1], y[0] + y[i+1], 'star');
              star.anchor.setTo(0.5,0.5);
          }
      }
      var star_x = [-12,0,12];
      var star_y = [-10,-15,-10];

      // Place nodes
      for (var j = 0, i = lessons.length-1, nodeCount = 1/(lessons.length-1); j <= 1; j += nodeCount, i--) {
        var currentLesson = lessons[i];
        log.debug('lesson status', currentLesson);
        var locked = currentLesson.locked ? '-locked' : '';
        var posx = this.math.catmullRomInterpolation(this.points.x, j);
        var posy = this.math.catmullRomInterpolation(this.points.y, j);
        var node = this.game.add.button(posx, posy, 'node'+locked);
        node.inputEnabled = true;
        node.events.onInputDown.add(function(currentLesson){
            return function(){
                if(!currentLesson.locked)
                    scope.$emit('openNode',currentLesson);
            }
        }(currentLesson));
        // var icon = this.game.add.sprite(posx, posy, 'read'+locked);
        // icon.anchor.setTo(0.5,0.5);
        // icon.scale.setTo(0.3,0.3);
        node.anchor.setTo(0.5, 0.5);
        // node.scale.setTo(1.8, 1.8);

        // add stars
        if(currentLesson.stars >= 0){
            var stars = this.game.add.group();
            log.debug('stars in lesson',currentLesson.stars);
            if(currentLesson.stars == 0){
                createStars(0,$.merge([posx],star_x),$.merge([posy],star_y));
            }
            else if(currentLesson.stars == 1){
                createStars(1,$.merge([posx],star_x),$.merge([posy],star_y));
            }
            else if(currentLesson.stars == 2){
                createStars(2,$.merge([posx],star_x),$.merge([posy],star_y));
            }
            else if(currentLesson.stars == 3){
                createStars(3,$.merge([posx],star_x),$.merge([posy],star_y));
            }
            else{}
        }
      }

      // fire animation
    //   var fire_animation = this.game.add.sprite(20,20, 'fire_animation');
    //   fire_animation.scale.setTo(0.5,0.5);
    //   var light = fire_animation.animations.add('light');
    //   fire_animation.animations.play('light', 20, true);

      // cactus
    //   var cactus_animation = this.game.add.sprite(20,20, 'cactus_animation');
    //   var wind = cactus_animation.animations.add('wind');
    //   cactus_animation.animations.play('wind', 5, true);

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
      .state('map', {
        url: '/map',
        abstract: true,
        resolve: {
          lessons: ['Rest', '$log', function(Rest, $log) {
            return Rest.one('accounts', CONSTANT.CLIENTID.ELL).getList('lessons').then(function(lessons) {
              return lessons.plain();
            })

          }],
          scores: ['Rest', '$log', function(Rest, $log) {
            return Rest.one('accounts', CONSTANT.CLIENTID.ELL).one('profiles', JSON.parse(localStorage.user_details).profile).getList('lessons-score').then(function(score) {
                $log.debug('scores rest' , score.plain());
              return score.plain();
            })
          }]

        },
        template: '<ion-nav-view name="state-map"></ion-nav-view>'
      })
      .state('map.navigate', {
        url: '/navigate',
        views: {
          'state-map': {
            templateUrl: CONSTANT.PATH.MAP + '/map' + CONSTANT.VIEW,
            controller: 'mapController as mapCtrl'
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

    profileController.$inject = ['CONSTANT','$state','Auth','Rest','$log','$ionicPopup','$ionicLoading'];

    function profileController(CONSTANT, $state, Auth, Rest, $log, $ionicPopup, $ionicLoading) {
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
            $ionicLoading.show({
              noBackdrop: false,
              hideOnStateChange: true
            });
          Rest.all('profiles').post(userdata).then(function(response){
              Auth.getUser(function(){
                $state.go('map.navigate',{});
              },function(){
                profileCtrl.showError('Error', 'Error making profile');
              })
          },function(error){
              $ionicLoading.hide();
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
          if (formData.first_name && !formData.first_name.$viewValue) {
            profileCtrl.showError("Child's name", "Please enter child's name");
            return false;
          }
          if (formData.dob && !formData.dob.$viewValue) {
            profileCtrl.showError("DOB", "Please select a DOB");
            return false;
          }
          if (formData.gender && !formData.gender.$viewValue) {
            profileCtrl.showError("Gender", "Please select a gender");
            return false;
          }
          if (formData.gender && !formData.gender.$viewValue) {
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
    quizCtrl.CONSTANT = CONSTANT;
    //audio
    quizCtrl.playAudio = playAudio;
    quizCtrl.starCount = starCount;

    //question layouts
    quizCtrl.GRID_TYPE = ['audio_to_text', 'text_to_pic', 'pic_to_text', 'audio_to_pic'];
    quizCtrl.LIST_TYPE = ['audio_to_text_longer', 'text_to_pic_longer', 'pic_to_text_longer', 'audio_to_pic_longer'];

    //slide box
    quizCtrl.slideHasChanged = slideHasChanged;
    quizCtrl.slideTo = slideTo;

    //Regex operations
    quizCtrl.soundIdRegex = /(?:\[\[)(?:sound)(?:\s)(?:id=)([0-9]+)(?:\]\])/;
    quizCtrl.imageTagRegex = /(?:\[\[)(?:img)(?:\s)(?:id=)([0-9]+)(?:\]\])/;

    quizCtrl.getSoundId = getSoundId;
    quizCtrl.getImageId = getImageId;
    quizCtrl.getImageSrc = getImageSrc;
    quizCtrl.parseToDisplay = parseToDisplay;
    quizCtrl.replaceImageTag = replaceImageTag;
    quizCtrl.removeSoundTag = removeSoundTag;


    quizCtrl.myStyle = {
      height: '10px',
      width: '0%',
      'background-color': 'yellow'
    }
    quizCtrl.practiceResult = {};

    // initialisation call
    quizCtrl.setCurrentIndex(0);
    quizCtrl.init(quizCtrl.quiz);

    $scope.modal = {};

    function starCount(index) {
      var count = quizCtrl.quizResult.stars - index;
      return count > 0 ? count : 0;
    }

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
        $log.debug("Summary")
        $log.debug(quizCtrl.report);
        quizCtrl.quiz = $stateParams.quiz;
        quizCtrl.quizResult = quizCtrl.calculateResult(quizCtrl.report, quizCtrl.quiz);
        $log.debug(quizCtrl.quizResult);
        Quiz.saveReport({
            node: quizCtrl.quiz.node.id,
            person: Auth.getProfileId(),
            score: quizCtrl.quizResult.marks
          }, function(success) {
            var report_id = success.id;
            var attempts = [];
            angular.forEach(quizCtrl.report.attempts, function(value, key) {
              // 1 - Attempted
              // 2 - Skipped
              // 3 - NotAttempted
              attempts.push({
                answer: value.length > 0 ? value : null,
                score: quizCtrl.quizResult.score[key],
                status: value.length > 0 ? 1 : 2,
                person: Auth.getProfileId(),
                report: report_id,
                node: key
              });
            });
            Quiz.saveAttempt(attempts, function(response) {}, function(error) {})
          }, function(error) {

          })
          // quizCtrl.report = {"quiz_id":"10014638-8567-4a33-814a-1b7bfedf0664","attempts":{"cbe39272-ccbd-4e05-9532-d53699ec59cd":[3],"61524a03-4acd-4b1d-ae96-96702387e7e3":[3],"5b66574b-621b-435e-a812-db7be6a94dfd":[3],"cda26918-b9d4-4120-afe4-1e627691454f":[3],"1eac2901-3f1a-4e48-b2cb-706964aece32":[2]}};
          // quizCtrl.quiz = {"node":{"id":"10014638-8567-4a33-814a-1b7bfedf0664","content_type_name":"assessment","type":{"id":"7053747a-2967-431a-bc68-2aa23b8bd1c4","score":100},"created":"2016-04-25T11:36:53.969858Z","updated":"2016-04-25T11:36:53.969884Z","title":"Assessment test","description":"Assessment description","object_id":"7053747a-2967-431a-bc68-2aa23b8bd1c4","stauts":"PUBLISHED","lft":10,"rght":21,"tree_id":1,"level":1,"parent":"5cb5adc2-84f8-41d2-9272-81790cb314c2","content_type":26,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[{"node":{"id":"cbe39272-ccbd-4e05-9532-d53699ec59cd","content_type_name":"json question","type":{"id":"249fdc1f-b466-4993-be6e-555fb6052a55","created":"2016-04-25T11:49:39.453229Z","updated":"2016-04-25T11:49:39.453251Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:49:39.486776Z","updated":"2016-04-25T11:49:39.486799Z","title":"Audio to text","description":"","object_id":"249fdc1f-b466-4993-be6e-555fb6052a55","stauts":"PUBLISHED","lft":13,"rght":14,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"61524a03-4acd-4b1d-ae96-96702387e7e3","content_type_name":"json question","type":{"id":"e7962a73-0199-477d-9838-8f8e419907b8","created":"2016-04-25T11:50:41.767437Z","updated":"2016-04-25T11:50:41.767456Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:50:41.799933Z","updated":"2016-04-25T11:50:41.799953Z","title":"Audio to text","description":"","object_id":"e7962a73-0199-477d-9838-8f8e419907b8","stauts":"PUBLISHED","lft":17,"rght":18,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"5b66574b-621b-435e-a812-db7be6a94dfd","content_type_name":"json question","type":{"id":"d72b724c-f8af-4221-815d-08abba56bda2","created":"2016-04-25T11:43:38.461255Z","updated":"2016-04-25T11:43:38.461273Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:43:38.493848Z","updated":"2016-04-25T11:43:38.493870Z","title":"Audio to text","description":"","object_id":"d72b724c-f8af-4221-815d-08abba56bda2","stauts":"PUBLISHED","lft":11,"rght":12,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"cda26918-b9d4-4120-afe4-1e627691454f","content_type_name":"json question","type":{"id":"8f9e4441-2e51-4834-860b-9324a6468889","created":"2016-04-25T11:50:17.262086Z","updated":"2016-04-25T11:50:17.262103Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:50:17.295078Z","updated":"2016-04-25T11:50:17.295097Z","title":"Audio to text","description":"","object_id":"8f9e4441-2e51-4834-860b-9324a6468889","stauts":"PUBLISHED","lft":15,"rght":16,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"1eac2901-3f1a-4e48-b2cb-706964aece32","content_type_name":"json question","type":{"id":"1678c124-710c-4b52-98a8-a873624d2dd0","created":"2016-04-25T11:50:45.706748Z","updated":"2016-04-25T11:50:45.706765Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:50:45.739207Z","updated":"2016-04-25T11:50:45.739227Z","title":"Audio to text","description":"","object_id":"1678c124-710c-4b52-98a8-a873624d2dd0","stauts":"PUBLISHED","lft":19,"rght":20,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]}]}

      } else if ($state.current.name == "quiz.questions" || $state.current.name == "quiz.practice.questions") {
        quizCtrl.report = {};
        quizCtrl.practiceResult.totalMarks = quizCtrl.quiz.node.type.score;
        quizCtrl.practiceResult.percentCorrect = 0;
        quizCtrl.practiceResult.scoredMarks = 0;
        quizCtrl.report.quiz_id = quiz.node.id;
        quizCtrl.report.attempts = {};
        for (var i = 0; i < quiz.objects.length; i++) {
          quizCtrl.report.attempts[quiz.objects[i].node.id] = [];
        }
        // init attempted

        for (i = 0; i < quizCtrl.quiz.objects.length; i++) {
          if (i !== 0)
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
      } else if ($state.current.name = 'quiz.practice.summary') {
        $log.debug("shere");
        $log.debug($stateParams);
        quizCtrl.report = $stateParams.report;
        quizCtrl.quiz = $stateParams.quiz;
        quizCtrl.practiceResult = $stateParams.practiceResult;
        $log.debug(quizCtrl.report);
        Quiz.saveReport({
            node: '10014638-8567-4a33-814a-1b7bfedf0664',
            person: Auth.getProfileId(),
            score: quizCtrl.practiceResult.totalMarks
          }, function(success) {
            var report_id = success.id;
            var attempts = [];

            angular.forEach(quizCtrl.quiz.objects, function(question) {
              var attempts_array = quizCtrl.report.attempts[question.node.id];
              quizCtrl.report.attempts[question.node.id].is_correct = false;
              angular.forEach(attempts_array, function(attempt) {
                $log.debug("attempt");
                $log.debug(attempt);
                attempts.push({
                  answer: attempt.length > 0 ? attempt : null,
                  score: quizCtrl.isCorrect(question, attempt) ? question.node.type.score : 0,
                  status: 1, //Skipping is not allowed in practice so status is set to 1
                  person: Auth.getProfileId(),
                  report: report_id,
                  node: question.node.id
                });
                if (quizCtrl.isCorrect(question, attempt)) {
                  quizCtrl.report.attempts[question.node.id].is_correct = true;
                }
              })
            })
            quizCtrl.practiceResult.analysis = attempts;
            Quiz.saveAttempt(attempts, function(response) {}, function(error) {})
          }, function(error) {

          })
          // Quiz.saveReport({
          //     node: quizCtrl.quiz.node.id,
          //     person: Auth.getProfileId(),
          //     score:
          //   }, function(success) {
          //     var report_id = success.id;
          //
          //     angular.forEach(quizCtrl.report.attempts, function(value, key) {
          //       // 1 - Attempted
          //       // 2 - Skipped
          //       // 3 - NotAttempted
          //
          //       angular.forEach(value,function(attempt){
          //         var attempt = {
          //           answer: value.length > 0 ? value : null,
          //           score: quizCtrl.quizResult.score[key],
          //           status: value.length > 0 ? 1 : 2,
          //           person: Auth.getProfileId(),
          //           report: report_id,
          //           node: key
          //         }
          //         Quiz.saveAttempt(attempt, function(response) {}, function(error) {})
          //       })
          //     });
          //   }, function(error) {
          //
          //   })
      }

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
      quizCtrl.submitAttempt(
        quizCtrl.quiz.objects[quizCtrl.currentIndex].node.id,
        quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
      );


      if (quizCtrl.isCorrectAttempted(quizCtrl.quiz.objects[quizCtrl.currentIndex])) {
        quizCtrl.practiceResult.scoredMarks += quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.score;
        $log.debug("scored marks", quizCtrl.practiceResult.scoredMarks)
        quizCtrl.practiceResult.percentCorrect = parseInt((quizCtrl.practiceResult.scoredMarks / quizCtrl.practiceResult.totalMarks) * 100);
        $log.debug("percent", quizCtrl.practiceResult.percentCorrect)
        quizCtrl.myStyle.width = quizCtrl.practiceResult.percentCorrect + "%";
      } else {
        if (quizCtrl.report.attempts[quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].node.id].length == 2) {
          quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].attempted = {};
          quizCtrl.quiz.objects.push(angular.copy(quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()]))
        }

      }
      $scope.openModal();


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
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted && _.size(quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted) >= 1;
      }
      if (quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "sentence ordering" || quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "sentence structuring") {
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted.length ? true : false;
      }
    }

    function feedback(question, attempt) {
      return;

      // if (quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1) {
      //   quizCtrl.nextQuestion();
      // } else {
      //   $log.debug("Final")
      //     // final question -> go to summary
      //   $state.go('quiz.practice.summary', {
      //     report: angular.copy(quizCtrl.report)
      //   });
      // }
      $log.debug("b")

      if (isCorrectAttempted(quizCtrl.quiz.objects[quizCtrl.currentIndex])) {

      } else {
        if (quizCtrl.report.attempts[quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].node.id].length == 2) {
          quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].attempted = {};
          quizCtrl.quiz.objects.push(angular.copy(quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()]))
        }

      }
      $scope.openModal();
    }

    function submitAttempt(question_id, attempt) {
      quizCtrl.report.attempts[question_id].push(angular.copy(attempt));
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
        }).sort().isEqual(question.node.type.answer.sort()).value();
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
            }).sort().isEqual(question.node.type.answer.sort()).value())
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

        $log.debug(quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].node.type.content.widgets.sounds[key])
        angular.element("#audioSource")[0].src = 'http://cc-test.zaya.in/' + quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].node.type.content.widgets.sounds[key];
      } else {
        angular.element("#audioSource")[0].src = 'sound/water-drop.mp3';
      }
      angular.element("#audioplayer")[0].load();
      angular.element("#audioplayer")[0].play();
    }


    $ionicModal.fromTemplateUrl(CONSTANT.PATH.QUIZ + '/practice.feedback' + CONSTANT.VIEW, {
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
      if (isCorrectAttempted(quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()]) || quizCtrl.report.attempts[quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].node.id].length >= 2) {
        $log.debug("Correct or last attempt");
        if (quizCtrl.currentIndex >= quizCtrl.quiz.objects.length - 1) {
          $log.debug("Last question exiting now");
          $scope.modal.hide().then(function() {
            $state.go('quiz.practice.summary', {
              quiz: angular.copy(quizCtrl.quiz),
              practiceResult: angular.copy(quizCtrl.practiceResult),
              report: angular.copy(quizCtrl.report)
            });
          });
        } else {
          $scope.modal.hide().then(function() {
            quizCtrl.nextQuestion();
          });
        }
      } else {
        $scope.modal.hide()
      }


    };

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
        stars: 0,
        score: {}
      };
      angular.forEach(quiz.objects, function(value) {
        if (isAttempted(value)) {
          $log.debug("d")
          $log.debug(value);

          if (quizCtrl.isCorrectAttempted(value)) {
            $log.debug("coorect attempted");
            result.analysis[value.node.id] = {
              title: value.node.title,
              status: 1
            };
            result.score[value.node.id] = value.node.type.score;
            result.marks += value.node.type.score;
            result.correct_questions++;
          } else {
            $log.debug("in coorect attempted");

            result.analysis[value.node.id] = {
              title: value.node.title,
              status: 0
            };
            result.score[value.node.id] = 0;
          }
        } else {
          result.analysis[value.node.id] = {
            title: value.node.title,
            status: -1
          }
          result.score[value.node.id] = 0;
        }

      });
      // $log.debug(result)
      var percent_correct = parseInt((result.marks / quiz.node.type.score) * 100);
      $log.debug('see the score', result.marks, quiz.node.type.score, percent_correct);
      if (percent_correct >= CONSTANT.STAR.ONE && percent_correct < CONSTANT.STAR.TWO) {
        result.stars = 1;
      } else if (percent_correct >= CONSTANT.STAR.TWO && percent_correct < CONSTANT.STAR.THREE) {
        result.stars = 2;
      } else if (percent_correct >= CONSTANT.STAR.THREE) {
        result.stars = 3;
      } else {}
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
            $log.debug("here");
            if (value.node.type.type == 'choicequestion' && !value.node.type.content.is_multiple && value.attempted !== '') {
              quizCtrl.submitAttempt(value.node.id,
                value.attempted);
            } else if (value.node.type.type == 'choicequestion' && value.node.type.content.is_multiple && value.attempted.length > 0) {
              $log.debug("Multiple found");

              quizCtrl.submitAttempt(value.node.id,
                value.attempted);
            }

          });
          $log.debug("Report");
          $log.debug(quizCtrl.report);

          $state.go('quiz.summary', {
            report: angular.copy(quizCtrl.report),
            quiz: angular.copy(quizCtrl.quiz)
          });
        } else {
          void 0;
        }
      });
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
      });
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
      if (quizCtrl.soundIdRegex.exec(string))
        return quizCtrl.soundIdRegex.exec(string)[1];
    }

    function getImageId(string) {
      if (quizCtrl.imageTagRegex.exec(string))
        return quizCtrl.imageTagRegex.exec(string)[1];
    }

    function getImageSrc(id) {
      return quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].node.type.content.widgets.images[id];
    }

    function parseToDisplay(string) {
      var text = quizCtrl.replaceImageTag(quizCtrl.removeSoundTag(string));
      return text.trim() || '<img class="card-image" src="' + CONSTANT.ASSETS.IMG.SOUND_PLACEHOLDER + '"></img>';

    }

    function removeSoundTag(string) {
      return string.replace(quizCtrl.soundIdRegex, "");
    }

    function replaceImageTag(string) {
      return string.replace(quizCtrl.imageTagRegex, "<img class='card-image' src='http://cc-test.zaya.in/" + quizCtrl.getImageSrc(quizCtrl.getImageId(string)) + "'></img>");
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
    var report = Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + '/api/v1');
      RestangularConfigurer.setRequestSuffix('/');
      RestangularConfigurer.setDefaultHeaders({
        'Content-Type': 'application/json',
      });
    });
    return {
      saveReport : function(data,success,failure){
        report.all('reports').post(data).then(function(response){
          success(response);
        },function(error){
          failure(error);
        })
      },
      saveAttempt : function(data,success,failure){
        report.all('attempts').post(data).then(function(response){
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
                // return {"node":{"id":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type_name":"assessment","type":{"id":"a74c7b03-f132-4b16-ab7e-9a5ff3744c26","type":"assessment","score":600},"created":"2016-05-12T12:56:59.275501Z","updated":"2016-05-12T12:56:59.275564Z","title":"Beginning Blends (L, R, S)","description":"","object_id":"a74c7b03-f132-4b16-ab7e-9a5ff3744c26","stauts":"PUBLISHED","lft":2,"rght":63,"tree_id":1,"level":1,"parent":"9adb6c64-773a-4217-8627-f0b6f8336382","content_type":26,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[{"node":{"id":"162c100c-a295-4a9e-8fa4-35cc37c62b19","content_type_name":"json question","type":{"id":"1dde30df-0826-4fec-919e-728420c0db73","created":"2016-05-12T12:56:59.351763Z","updated":"2016-05-12T12:56:59.351798Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"globe","key":4},{"option":"crop","key":3},{"option":"block","key":1},{"option":"drop","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.390021Z","updated":"2016-05-12T12:56:59.390059Z","title":"dr","description":"","object_id":"1dde30df-0826-4fec-919e-728420c0db73","stauts":"PUBLISHED","lft":3,"rght":4,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"eabcce21-0be5-4702-a5ef-e6bca75caed1","content_type_name":"json question","type":{"id":"91844612-5ee0-4246-a486-5fa4b4ff4fb6","created":"2016-05-12T12:56:59.413639Z","updated":"2016-05-12T12:56:59.413697Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[3,2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"plan","key":4},{"option":"skate","key":3},{"option":"broom","key":1},{"option":"sky","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.448045Z","updated":"2016-05-12T12:56:59.448100Z","title":"sk","description":"","object_id":"91844612-5ee0-4246-a486-5fa4b4ff4fb6","stauts":"PUBLISHED","lft":5,"rght":6,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"29b256e1-5712-481d-9605-e8549faa27aa","content_type_name":"json question","type":{"id":"11dd51e1-8101-4198-9d53-9149d875ea88","created":"2016-05-12T12:56:59.478796Z","updated":"2016-05-12T12:56:59.478848Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[1,2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"sky","key":4},{"option":"sleep","key":3},{"option":"class","key":1},{"option":"clock","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.503543Z","updated":"2016-05-12T12:56:59.503601Z","title":"cl","description":"","object_id":"11dd51e1-8101-4198-9d53-9149d875ea88","stauts":"PUBLISHED","lft":7,"rght":8,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"cfa822c2-51bd-4788-bc91-d9bc27c7b550","content_type_name":"json question","type":{"id":"cda7393f-3503-46b0-9652-2f903a826d96","created":"2016-05-12T12:56:59.527382Z","updated":"2016-05-12T12:56:59.527445Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[3,1,2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"drum","key":4},{"option":"black","key":3},{"option":"blue","key":1},{"option":"bland","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.569805Z","updated":"2016-05-12T12:56:59.569870Z","title":"bl","description":"","object_id":"cda7393f-3503-46b0-9652-2f903a826d96","stauts":"PUBLISHED","lft":9,"rght":10,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"df28d4b8-0754-455a-a971-04fced5fcd0a","content_type_name":"json question","type":{"id":"36b247a6-7c46-4b6f-b650-cf8b7e1d9e8c","created":"2016-05-12T12:56:59.616159Z","updated":"2016-05-12T12:56:59.616190Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[3,2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"drone","key":4},{"option":"prune","key":3},{"option":"stick","key":1},{"option":"probe","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.648250Z","updated":"2016-05-12T12:56:59.648282Z","title":"pr","description":"","object_id":"36b247a6-7c46-4b6f-b650-cf8b7e1d9e8c","stauts":"PUBLISHED","lft":11,"rght":12,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"22228584-fd44-4e79-9726-9f09e1c83f42","content_type_name":"json question","type":{"id":"160d9f4b-0a5f-4bc7-a9ae-210576df9129","created":"2016-05-12T12:56:59.772696Z","updated":"2016-05-12T12:56:59.772724Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[4,3],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/broom_ZNMYTK.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/brain_OVTQIC.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/crop_6T4O8Y.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/drop_3XQU5G.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.784011Z","updated":"2016-05-12T12:56:59.784045Z","title":"br","description":"","object_id":"160d9f4b-0a5f-4bc7-a9ae-210576df9129","stauts":"PUBLISHED","lft":13,"rght":14,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"df95755c-e63b-4c7a-9693-176e7a871fa5","content_type_name":"json question","type":{"id":"3b841ec9-2ddf-41f4-9e42-fd795b2c8d0b","created":"2016-05-12T12:56:59.905118Z","updated":"2016-05-12T12:56:59.905145Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[3,1],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/drone_9DG8IR.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/plum_JHQWVY.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/plane_KZUN6Z.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/block_KUKM0A.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.915732Z","updated":"2016-05-12T12:56:59.915768Z","title":"pl","description":"","object_id":"3b841ec9-2ddf-41f4-9e42-fd795b2c8d0b","stauts":"PUBLISHED","lft":15,"rght":16,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"4f0fbd8b-96d8-49b5-8e6a-bd3b54d12953","content_type_name":"json question","type":{"id":"af7acd05-8f6e-4a1e-b729-d24f22be7c49","created":"2016-05-12T12:57:00.037034Z","updated":"2016-05-12T12:57:00.037062Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[4,2],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/prune_3U3CWQ.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/drum_C2VZ4E.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/brick_YCDGJF.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/prize_DTZX5A.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.046799Z","updated":"2016-05-12T12:57:00.046832Z","title":"pr","description":"","object_id":"af7acd05-8f6e-4a1e-b729-d24f22be7c49","stauts":"PUBLISHED","lft":17,"rght":18,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"2edce18a-97c9-4df5-a85c-8e023590435a","content_type_name":"json question","type":{"id":"15bd0dd4-390c-42cd-8e12-64ef6f27fcee","created":"2016-05-12T12:57:00.210211Z","updated":"2016-05-12T12:57:00.210237Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[3,2],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/clock_7WSP6T.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/31/globe_FM9F07.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/class_2L8I2P.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/glass_X3U7RT.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.220483Z","updated":"2016-05-12T12:57:00.220517Z","title":"gl","description":"","object_id":"15bd0dd4-390c-42cd-8e12-64ef6f27fcee","stauts":"PUBLISHED","lft":19,"rght":20,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"64152db3-6eb9-46af-9616-9184eaa7be20","content_type_name":"json question","type":{"id":"34105ac8-ac4b-49eb-852b-7a6f1ecf293a","created":"2016-05-12T12:57:00.336373Z","updated":"2016-05-12T12:57:00.336402Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[2],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/stairs_1RX5DY.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/stop_QBR2CP.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/31/smile_7YJFPP.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/snake_PYHRCY.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.346098Z","updated":"2016-05-12T12:57:00.346130Z","title":"sn","description":"","object_id":"34105ac8-ac4b-49eb-852b-7a6f1ecf293a","stauts":"PUBLISHED","lft":21,"rght":22,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"24b49946-72ea-47fb-aff8-6d72d4ac8d6f","content_type_name":"json question","type":{"id":"81bde716-67df-41c3-97c9-185c2b9b4991","created":"2016-05-12T12:57:00.463194Z","updated":"2016-05-12T12:57:00.463222Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[1,2],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/black_MGSQ93.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/block_346JMX.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/flock_787RJT.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/flag_9EZSHM.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.491059Z","updated":"2016-05-12T12:57:00.491093Z","title":"fl","description":"","object_id":"81bde716-67df-41c3-97c9-185c2b9b4991","stauts":"PUBLISHED","lft":23,"rght":24,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"e0c2fd9f-7eb3-43e9-b9e4-6645c7256360","content_type_name":"json question","type":{"id":"9de167cb-5f2b-448b-8664-3bac685bea4c","created":"2016-05-12T12:57:00.619500Z","updated":"2016-05-12T12:57:00.619528Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[1],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/broom_CGPY6N.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/truck_JBQ5ZB.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/trap_VQ6ND7.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/grab_XF6QA9.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.629023Z","updated":"2016-05-12T12:57:00.629055Z","title":"tr","description":"","object_id":"9de167cb-5f2b-448b-8664-3bac685bea4c","stauts":"PUBLISHED","lft":25,"rght":26,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"d64892d6-0bbd-4c33-b8e0-a4d1c49bbddc","content_type_name":"json question","type":{"id":"7681b51a-97ca-4f17-8e99-267f09829237","created":"2016-05-12T12:57:00.745204Z","updated":"2016-05-12T12:57:00.745232Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[3,2],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/small_DH96E0.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/stairs_H7P48Q.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/clam_5OVPWR.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/stick_46RMWG.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.754843Z","updated":"2016-05-12T12:57:00.754874Z","title":"st","description":"","object_id":"7681b51a-97ca-4f17-8e99-267f09829237","stauts":"PUBLISHED","lft":27,"rght":28,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"64f8d91d-eabb-4845-85f7-c639b309ffa9","content_type_name":"json question","type":{"id":"cb1f21eb-8a75-41f9-87f3-b49632365ff8","created":"2016-05-12T12:57:00.870675Z","updated":"2016-05-12T12:57:00.870702Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[1,2],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/broke_DM7876.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/tap_L7GUWJ.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/drop_N9E3E2.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/drum_CPBOBH.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.880871Z","updated":"2016-05-12T12:57:00.880905Z","title":"dr","description":"","object_id":"cb1f21eb-8a75-41f9-87f3-b49632365ff8","stauts":"PUBLISHED","lft":29,"rght":30,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"82a3af56-481c-4fb4-ba35-e8d9ee0f6630","content_type_name":"json question","type":{"id":"017edec0-ed45-442f-b279-385aa871b395","created":"2016-05-12T12:57:00.950347Z","updated":"2016-05-12T12:57:00.950383Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[3],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/stick_ELFKB2.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2015/09/01/stick_1QBKAF.png"}},"is_multiple":false,"options":[{"option":"sp","key":4},{"option":"st","key":3},{"option":"sc","key":1},{"option":"sm","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.960589Z","updated":"2016-05-12T12:57:00.960625Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"017edec0-ed45-442f-b279-385aa871b395","stauts":"PUBLISHED","lft":31,"rght":32,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"cccd9128-686b-43e1-81ac-1c8ae8f8a66c","content_type_name":"json question","type":{"id":"adc718ac-d422-4e39-915f-87f1f5340882","created":"2016-05-12T12:57:01.023555Z","updated":"2016-05-12T12:57:01.023584Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[2],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/spoon_J5UK1S.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2016/02/25/spoon_FA5AXI.png"}},"is_multiple":false,"options":[{"option":"sn","key":4},{"option":"sm","key":3},{"option":"st","key":1},{"option":"sp","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.033477Z","updated":"2016-05-12T12:57:01.033512Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"adc718ac-d422-4e39-915f-87f1f5340882","stauts":"PUBLISHED","lft":33,"rght":34,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"d71d7e44-fdd9-4b8a-9c61-f1e74e30c825","content_type_name":"json question","type":{"id":"5d640c50-012c-4e4b-bcda-4011bd2ce063","created":"2016-05-12T12:57:01.098546Z","updated":"2016-05-12T12:57:01.098572Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[3],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/truck_SQT9AH.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2016/02/25/truck_VNUB0N.png"}},"is_multiple":false,"options":[{"option":"dr","key":4},{"option":"tr","key":3},{"option":"br","key":1},{"option":"bl","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.120818Z","updated":"2016-05-12T12:57:01.120853Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"5d640c50-012c-4e4b-bcda-4011bd2ce063","stauts":"PUBLISHED","lft":35,"rght":36,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"1fe67424-f2a4-440b-99bb-8483c7c63166","content_type_name":"json question","type":{"id":"f95c5838-14e2-4fc5-afce-2ffd98637386","created":"2016-05-12T12:57:01.158963Z","updated":"2016-05-12T12:57:01.159027Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[4],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/31/globe_R5JK2S.mp3"},"videos":{},"images":{}},"is_multiple":false,"options":[{"option":"gl","key":4},{"option":"sl","key":3},{"option":"dr","key":1},{"option":"br","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.171821Z","updated":"2016-05-12T12:57:01.171858Z","title":"[[sound id=1]]","description":"","object_id":"f95c5838-14e2-4fc5-afce-2ffd98637386","stauts":"PUBLISHED","lft":37,"rght":38,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"52875d13-70f8-4703-ac7f-2360b4b9553d","content_type_name":"json question","type":{"id":"c3e26cb2-4c70-4b6d-b3f3-e6be3638b379","created":"2016-05-12T12:57:01.234455Z","updated":"2016-05-12T12:57:01.234486Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[1],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/snail_5CQD1E.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2016/02/25/snail_XBPKXF.png"}},"is_multiple":false,"options":[{"option":"gr","key":4},{"option":"tr","key":3},{"option":"sn","key":1},{"option":"sm","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.244582Z","updated":"2016-05-12T12:57:01.244616Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"c3e26cb2-4c70-4b6d-b3f3-e6be3638b379","stauts":"PUBLISHED","lft":39,"rght":40,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"47d34dbf-01ee-4a26-b03d-3c892d1e1fec","content_type_name":"json question","type":{"id":"3a220a4b-cfa3-400e-b27e-e175ce7b1d62","created":"2016-05-12T12:57:01.356434Z","updated":"2016-05-12T12:57:01.356462Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[3],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/plane_CYJYTP.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2016/02/25/plane_UTJREM.png"}},"is_multiple":false,"options":[{"option":"pr","key":4},{"option":"pl","key":3},{"option":"cl","key":1},{"option":"cr","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.366632Z","updated":"2016-05-12T12:57:01.366666Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"3a220a4b-cfa3-400e-b27e-e175ce7b1d62","stauts":"PUBLISHED","lft":41,"rght":42,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"f629ada9-2cc8-4753-9344-7f3ceadf5000","content_type_name":"json question","type":{"id":"b9a7f3f2-7fe4-4ed4-83ef-c87313cb77f8","created":"2016-05-12T12:57:01.429291Z","updated":"2016-05-12T12:57:01.429319Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[3],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/clock_H8EFGC.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2015/09/01/clock_CPC46R.png"}},"is_multiple":false,"options":[{"option":"pl","key":4},{"option":"cl","key":3},{"option":"bl","key":1},{"option":"dr","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.438882Z","updated":"2016-05-12T12:57:01.438922Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"b9a7f3f2-7fe4-4ed4-83ef-c87313cb77f8","stauts":"PUBLISHED","lft":43,"rght":44,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"18026752-d923-4f00-9677-545eb4a4fc5e","content_type_name":"json question","type":{"id":"143ec4c5-31e4-446f-a234-313427e93f02","created":"2016-05-12T12:57:01.505779Z","updated":"2016-05-12T12:57:01.505808Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[2],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/grass_NX9C3F.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2016/02/25/grass_ZDH9LM.png"}},"is_multiple":false,"options":[{"option":"cl","key":4},{"option":"bl","key":3},{"option":"cr","key":1},{"option":"gr","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.516721Z","updated":"2016-05-12T12:57:01.516754Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"143ec4c5-31e4-446f-a234-313427e93f02","stauts":"PUBLISHED","lft":45,"rght":46,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"0e79e883-fa3d-483d-ac37-703967b7afab","content_type_name":"json question","type":{"id":"28266a54-d6c6-4a3f-ab45-eecd295dc390","created":"2016-05-12T12:57:01.586509Z","updated":"2016-05-12T12:57:01.586556Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[3],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/tree_M10F9T.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2016/02/25/tree_FOUJ6U.png"}},"is_multiple":false,"options":[{"option":"dr","key":4},{"option":"tr","key":3},{"option":"pr","key":1},{"option":"cr","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.601463Z","updated":"2016-05-12T12:57:01.601524Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"28266a54-d6c6-4a3f-ab45-eecd295dc390","stauts":"PUBLISHED","lft":47,"rght":48,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"50d65cf2-309b-427e-a44f-dccba6de2752","content_type_name":"json question","type":{"id":"cb8a0d73-f9da-4af9-a562-9e10a343f6b6","created":"2016-05-12T12:57:01.726150Z","updated":"2016-05-12T12:57:01.726220Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[1],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/31/crane_Q4CM4X.mp3"},"videos":{},"images":{}},"is_multiple":false,"options":[{"option":"tr","key":4},{"option":"gr","key":3},{"option":"cr","key":1},{"option":"pl","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.762503Z","updated":"2016-05-12T12:57:01.762560Z","title":"[[sound id=1]]","description":"","object_id":"cb8a0d73-f9da-4af9-a562-9e10a343f6b6","stauts":"PUBLISHED","lft":49,"rght":50,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"455ae052-e71c-4152-865f-41c8ae34bf8d","content_type_name":"json question","type":{"id":"0aca89a3-780a-4b12-b9ba-8de2d628eede","created":"2016-05-12T12:57:01.782073Z","updated":"2016-05-12T12:57:01.782104Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"stock","key":4},{"option":"crop","key":3},{"option":"snail","key":1},{"option":"small","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.807064Z","updated":"2016-05-12T12:57:01.807126Z","title":"sm","description":"","object_id":"0aca89a3-780a-4b12-b9ba-8de2d628eede","stauts":"PUBLISHED","lft":51,"rght":52,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"e9a5a5c5-636c-45e7-9d5d-4f5f719159a7","content_type_name":"json question","type":{"id":"d372277a-1e43-4736-9e18-782848fa4e97","created":"2016-05-12T12:57:01.818575Z","updated":"2016-05-12T12:57:01.818616Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"throw","key":4},{"option":"glow","key":3},{"option":"blow","key":1},{"option":"place","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.839624Z","updated":"2016-05-12T12:57:01.839695Z","title":"pl","description":"","object_id":"d372277a-1e43-4736-9e18-782848fa4e97","stauts":"PUBLISHED","lft":53,"rght":54,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"9beaaaf0-9075-4988-9b51-0550f1f782b6","content_type_name":"json question","type":{"id":"12f80277-19bd-4b66-89bf-ab91954d81a8","created":"2016-05-12T12:57:01.855058Z","updated":"2016-05-12T12:57:01.855131Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[4,3,2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"trick","key":4},{"option":"trap","key":3},{"option":"club","key":1},{"option":"truck","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.870469Z","updated":"2016-05-12T12:57:01.870504Z","title":"tr","description":"","object_id":"12f80277-19bd-4b66-89bf-ab91954d81a8","stauts":"PUBLISHED","lft":55,"rght":56,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"27681226-4c60-4719-bb4f-63a7de8b2e6a","content_type_name":"json question","type":{"id":"df1db188-8658-49c6-a7af-4570da5f26fa","created":"2016-05-12T12:57:01.881038Z","updated":"2016-05-12T12:57:01.881070Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[1],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"blend","key":4},{"option":"prize","key":3},{"option":"glow","key":1},{"option":"clam","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.893994Z","updated":"2016-05-12T12:57:01.894055Z","title":"gl","description":"","object_id":"df1db188-8658-49c6-a7af-4570da5f26fa","stauts":"PUBLISHED","lft":57,"rght":58,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"2616f02f-047d-4700-af74-108e2ed716b3","content_type_name":"json question","type":{"id":"51f50a96-4d2e-4b4d-b079-f059193bf0fa","created":"2016-05-12T12:57:01.909467Z","updated":"2016-05-12T12:57:01.909524Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[1],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"skate","key":4},{"option":"spot","key":3},{"option":"stairs","key":1},{"option":"black","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.931146Z","updated":"2016-05-12T12:57:01.931209Z","title":"st","description":"","object_id":"51f50a96-4d2e-4b4d-b079-f059193bf0fa","stauts":"PUBLISHED","lft":59,"rght":60,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"41995ffd-2548-4965-857d-9ab76d4adf82","content_type_name":"json question","type":{"id":"0f858462-1490-40ce-8f86-3ce3c850325b","created":"2016-05-12T12:57:02.186295Z","updated":"2016-05-12T12:57:02.186330Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[3,1],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/smile_GXPK1Z.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/skate_QV9MJB.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/sky_JAY7YD.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/dry_9R37SR.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:02.202258Z","updated":"2016-05-12T12:57:02.202298Z","title":"sk","description":"","object_id":"0f858462-1490-40ce-8f86-3ce3c850325b","stauts":"PUBLISHED","lft":61,"rght":62,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]}]}
                // eturn {"node":{"id":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type_name":"assessment","type":{"id":"a74c7b03-f132-4b16-ab7e-9a5ff3744c26","type":"assessment","score":600},"created":"2016-05-12T12:56:59.275501Z","updated":"2016-05-12T12:56:59.275564Z","title":"Beginning Blends (L, R, S)","description":"","object_id":"a74c7b03-f132-4b16-ab7e-9a5ff3744c26","stauts":"PUBLISHED","lft":2,"rght":63,"tree_id":1,"level":1,"parent":"9adb6c64-773a-4217-8627-f0b6f8336382","content_type":26,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[{"node":{"id":"162c100c-a295-4a9e-8fa4-35cc37c62b19","content_type_name":"json question","type":{"id":"1dde30df-0826-4fec-919e-728420c0db73","created":"2016-05-12T12:56:59.351763Z","updated":"2016-05-12T12:56:59.351798Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"globe","key":4},{"option":"crop","key":3},{"option":"block","key":1},{"option":"drop","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.390021Z","updated":"2016-05-12T12:56:59.390059Z","title":"dr","description":"","object_id":"1dde30df-0826-4fec-919e-728420c0db73","stauts":"PUBLISHED","lft":3,"rght":4,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"eabcce21-0be5-4702-a5ef-e6bca75caed1","content_type_name":"json question","type":{"id":"91844612-5ee0-4246-a486-5fa4b4ff4fb6","created":"2016-05-12T12:56:59.413639Z","updated":"2016-05-12T12:56:59.413697Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[3,2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"plan","key":4},{"option":"skate","key":3},{"option":"broom","key":1},{"option":"sky","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.448045Z","updated":"2016-05-12T12:56:59.448100Z","title":"sk","description":"","object_id":"91844612-5ee0-4246-a486-5fa4b4ff4fb6","stauts":"PUBLISHED","lft":5,"rght":6,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"29b256e1-5712-481d-9605-e8549faa27aa","content_type_name":"json question","type":{"id":"11dd51e1-8101-4198-9d53-9149d875ea88","created":"2016-05-12T12:56:59.478796Z","updated":"2016-05-12T12:56:59.478848Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[1,2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"sky","key":4},{"option":"sleep","key":3},{"option":"class","key":1},{"option":"clock","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.503543Z","updated":"2016-05-12T12:56:59.503601Z","title":"cl","description":"","object_id":"11dd51e1-8101-4198-9d53-9149d875ea88","stauts":"PUBLISHED","lft":7,"rght":8,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"cfa822c2-51bd-4788-bc91-d9bc27c7b550","content_type_name":"json question","type":{"id":"cda7393f-3503-46b0-9652-2f903a826d96","created":"2016-05-12T12:56:59.527382Z","updated":"2016-05-12T12:56:59.527445Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[3,1,2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"drum","key":4},{"option":"black","key":3},{"option":"blue","key":1},{"option":"bland","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.569805Z","updated":"2016-05-12T12:56:59.569870Z","title":"bl","description":"","object_id":"cda7393f-3503-46b0-9652-2f903a826d96","stauts":"PUBLISHED","lft":9,"rght":10,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"df28d4b8-0754-455a-a971-04fced5fcd0a","content_type_name":"json question","type":{"id":"36b247a6-7c46-4b6f-b650-cf8b7e1d9e8c","created":"2016-05-12T12:56:59.616159Z","updated":"2016-05-12T12:56:59.616190Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[3,2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"drone","key":4},{"option":"prune","key":3},{"option":"stick","key":1},{"option":"probe","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.648250Z","updated":"2016-05-12T12:56:59.648282Z","title":"pr","description":"","object_id":"36b247a6-7c46-4b6f-b650-cf8b7e1d9e8c","stauts":"PUBLISHED","lft":11,"rght":12,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"22228584-fd44-4e79-9726-9f09e1c83f42","content_type_name":"json question","type":{"id":"160d9f4b-0a5f-4bc7-a9ae-210576df9129","created":"2016-05-12T12:56:59.772696Z","updated":"2016-05-12T12:56:59.772724Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[4,3],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/broom_ZNMYTK.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/brain_OVTQIC.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/crop_6T4O8Y.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/drop_3XQU5G.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.784011Z","updated":"2016-05-12T12:56:59.784045Z","title":"br","description":"","object_id":"160d9f4b-0a5f-4bc7-a9ae-210576df9129","stauts":"PUBLISHED","lft":13,"rght":14,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"df95755c-e63b-4c7a-9693-176e7a871fa5","content_type_name":"json question","type":{"id":"3b841ec9-2ddf-41f4-9e42-fd795b2c8d0b","created":"2016-05-12T12:56:59.905118Z","updated":"2016-05-12T12:56:59.905145Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[3,1],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/drone_9DG8IR.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/plum_JHQWVY.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/plane_KZUN6Z.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/block_KUKM0A.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:56:59.915732Z","updated":"2016-05-12T12:56:59.915768Z","title":"pl","description":"","object_id":"3b841ec9-2ddf-41f4-9e42-fd795b2c8d0b","stauts":"PUBLISHED","lft":15,"rght":16,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"4f0fbd8b-96d8-49b5-8e6a-bd3b54d12953","content_type_name":"json question","type":{"id":"af7acd05-8f6e-4a1e-b729-d24f22be7c49","created":"2016-05-12T12:57:00.037034Z","updated":"2016-05-12T12:57:00.037062Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[4,2],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/prune_3U3CWQ.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/drum_C2VZ4E.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/brick_YCDGJF.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/prize_DTZX5A.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.046799Z","updated":"2016-05-12T12:57:00.046832Z","title":"pr","description":"","object_id":"af7acd05-8f6e-4a1e-b729-d24f22be7c49","stauts":"PUBLISHED","lft":17,"rght":18,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"2edce18a-97c9-4df5-a85c-8e023590435a","content_type_name":"json question","type":{"id":"15bd0dd4-390c-42cd-8e12-64ef6f27fcee","created":"2016-05-12T12:57:00.210211Z","updated":"2016-05-12T12:57:00.210237Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[3,2],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/clock_7WSP6T.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/31/globe_FM9F07.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/class_2L8I2P.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/glass_X3U7RT.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.220483Z","updated":"2016-05-12T12:57:00.220517Z","title":"gl","description":"","object_id":"15bd0dd4-390c-42cd-8e12-64ef6f27fcee","stauts":"PUBLISHED","lft":19,"rght":20,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"64152db3-6eb9-46af-9616-9184eaa7be20","content_type_name":"json question","type":{"id":"34105ac8-ac4b-49eb-852b-7a6f1ecf293a","created":"2016-05-12T12:57:00.336373Z","updated":"2016-05-12T12:57:00.336402Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[2],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/stairs_1RX5DY.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/stop_QBR2CP.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/31/smile_7YJFPP.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/snake_PYHRCY.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.346098Z","updated":"2016-05-12T12:57:00.346130Z","title":"sn","description":"","object_id":"34105ac8-ac4b-49eb-852b-7a6f1ecf293a","stauts":"PUBLISHED","lft":21,"rght":22,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"24b49946-72ea-47fb-aff8-6d72d4ac8d6f","content_type_name":"json question","type":{"id":"81bde716-67df-41c3-97c9-185c2b9b4991","created":"2016-05-12T12:57:00.463194Z","updated":"2016-05-12T12:57:00.463222Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[1,2],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/black_MGSQ93.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/block_346JMX.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/flock_787RJT.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/flag_9EZSHM.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.491059Z","updated":"2016-05-12T12:57:00.491093Z","title":"fl","description":"","object_id":"81bde716-67df-41c3-97c9-185c2b9b4991","stauts":"PUBLISHED","lft":23,"rght":24,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"e0c2fd9f-7eb3-43e9-b9e4-6645c7256360","content_type_name":"json question","type":{"id":"9de167cb-5f2b-448b-8664-3bac685bea4c","created":"2016-05-12T12:57:00.619500Z","updated":"2016-05-12T12:57:00.619528Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[1],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/broom_CGPY6N.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/truck_JBQ5ZB.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/trap_VQ6ND7.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/grab_XF6QA9.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.629023Z","updated":"2016-05-12T12:57:00.629055Z","title":"tr","description":"","object_id":"9de167cb-5f2b-448b-8664-3bac685bea4c","stauts":"PUBLISHED","lft":25,"rght":26,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"d64892d6-0bbd-4c33-b8e0-a4d1c49bbddc","content_type_name":"json question","type":{"id":"7681b51a-97ca-4f17-8e99-267f09829237","created":"2016-05-12T12:57:00.745204Z","updated":"2016-05-12T12:57:00.745232Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[3,2],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/small_DH96E0.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/stairs_H7P48Q.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/clam_5OVPWR.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/stick_46RMWG.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.754843Z","updated":"2016-05-12T12:57:00.754874Z","title":"st","description":"","object_id":"7681b51a-97ca-4f17-8e99-267f09829237","stauts":"PUBLISHED","lft":27,"rght":28,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"64f8d91d-eabb-4845-85f7-c639b309ffa9","content_type_name":"json question","type":{"id":"cb1f21eb-8a75-41f9-87f3-b49632365ff8","created":"2016-05-12T12:57:00.870675Z","updated":"2016-05-12T12:57:00.870702Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[1,2],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/broke_DM7876.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/tap_L7GUWJ.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/drop_N9E3E2.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/drum_CPBOBH.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.880871Z","updated":"2016-05-12T12:57:00.880905Z","title":"dr","description":"","object_id":"cb1f21eb-8a75-41f9-87f3-b49632365ff8","stauts":"PUBLISHED","lft":29,"rght":30,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"82a3af56-481c-4fb4-ba35-e8d9ee0f6630","content_type_name":"json question","type":{"id":"017edec0-ed45-442f-b279-385aa871b395","created":"2016-05-12T12:57:00.950347Z","updated":"2016-05-12T12:57:00.950383Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[3],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/stick_ELFKB2.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2015/09/01/stick_1QBKAF.png"}},"is_multiple":false,"options":[{"option":"sp","key":4},{"option":"st","key":3},{"option":"sc","key":1},{"option":"sm","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:00.960589Z","updated":"2016-05-12T12:57:00.960625Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"017edec0-ed45-442f-b279-385aa871b395","stauts":"PUBLISHED","lft":31,"rght":32,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"cccd9128-686b-43e1-81ac-1c8ae8f8a66c","content_type_name":"json question","type":{"id":"adc718ac-d422-4e39-915f-87f1f5340882","created":"2016-05-12T12:57:01.023555Z","updated":"2016-05-12T12:57:01.023584Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[2],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/spoon_J5UK1S.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2016/02/25/spoon_FA5AXI.png"}},"is_multiple":false,"options":[{"option":"sn","key":4},{"option":"sm","key":3},{"option":"st","key":1},{"option":"sp","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.033477Z","updated":"2016-05-12T12:57:01.033512Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"adc718ac-d422-4e39-915f-87f1f5340882","stauts":"PUBLISHED","lft":33,"rght":34,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"d71d7e44-fdd9-4b8a-9c61-f1e74e30c825","content_type_name":"json question","type":{"id":"5d640c50-012c-4e4b-bcda-4011bd2ce063","created":"2016-05-12T12:57:01.098546Z","updated":"2016-05-12T12:57:01.098572Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[3],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/truck_SQT9AH.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2016/02/25/truck_VNUB0N.png"}},"is_multiple":false,"options":[{"option":"dr","key":4},{"option":"tr","key":3},{"option":"br","key":1},{"option":"bl","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.120818Z","updated":"2016-05-12T12:57:01.120853Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"5d640c50-012c-4e4b-bcda-4011bd2ce063","stauts":"PUBLISHED","lft":35,"rght":36,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"1fe67424-f2a4-440b-99bb-8483c7c63166","content_type_name":"json question","type":{"id":"f95c5838-14e2-4fc5-afce-2ffd98637386","created":"2016-05-12T12:57:01.158963Z","updated":"2016-05-12T12:57:01.159027Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[4],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/31/globe_R5JK2S.mp3"},"videos":{},"images":{}},"is_multiple":false,"options":[{"option":"gl","key":4},{"option":"sl","key":3},{"option":"dr","key":1},{"option":"br","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.171821Z","updated":"2016-05-12T12:57:01.171858Z","title":"[[sound id=1]]","description":"","object_id":"f95c5838-14e2-4fc5-afce-2ffd98637386","stauts":"PUBLISHED","lft":37,"rght":38,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"52875d13-70f8-4703-ac7f-2360b4b9553d","content_type_name":"json question","type":{"id":"c3e26cb2-4c70-4b6d-b3f3-e6be3638b379","created":"2016-05-12T12:57:01.234455Z","updated":"2016-05-12T12:57:01.234486Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[1],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/snail_5CQD1E.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2016/02/25/snail_XBPKXF.png"}},"is_multiple":false,"options":[{"option":"gr","key":4},{"option":"tr","key":3},{"option":"sn","key":1},{"option":"sm","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.244582Z","updated":"2016-05-12T12:57:01.244616Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"c3e26cb2-4c70-4b6d-b3f3-e6be3638b379","stauts":"PUBLISHED","lft":39,"rght":40,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"47d34dbf-01ee-4a26-b03d-3c892d1e1fec","content_type_name":"json question","type":{"id":"3a220a4b-cfa3-400e-b27e-e175ce7b1d62","created":"2016-05-12T12:57:01.356434Z","updated":"2016-05-12T12:57:01.356462Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[3],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/plane_CYJYTP.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2016/02/25/plane_UTJREM.png"}},"is_multiple":false,"options":[{"option":"pr","key":4},{"option":"pl","key":3},{"option":"cl","key":1},{"option":"cr","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.366632Z","updated":"2016-05-12T12:57:01.366666Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"3a220a4b-cfa3-400e-b27e-e175ce7b1d62","stauts":"PUBLISHED","lft":41,"rght":42,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"f629ada9-2cc8-4753-9344-7f3ceadf5000","content_type_name":"json question","type":{"id":"b9a7f3f2-7fe4-4ed4-83ef-c87313cb77f8","created":"2016-05-12T12:57:01.429291Z","updated":"2016-05-12T12:57:01.429319Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[3],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/clock_H8EFGC.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2015/09/01/clock_CPC46R.png"}},"is_multiple":false,"options":[{"option":"pl","key":4},{"option":"cl","key":3},{"option":"bl","key":1},{"option":"dr","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.438882Z","updated":"2016-05-12T12:57:01.438922Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"b9a7f3f2-7fe4-4ed4-83ef-c87313cb77f8","stauts":"PUBLISHED","lft":43,"rght":44,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"18026752-d923-4f00-9677-545eb4a4fc5e","content_type_name":"json question","type":{"id":"143ec4c5-31e4-446f-a234-313427e93f02","created":"2016-05-12T12:57:01.505779Z","updated":"2016-05-12T12:57:01.505808Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[2],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/grass_NX9C3F.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2016/02/25/grass_ZDH9LM.png"}},"is_multiple":false,"options":[{"option":"cl","key":4},{"option":"bl","key":3},{"option":"cr","key":1},{"option":"gr","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.516721Z","updated":"2016-05-12T12:57:01.516754Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"143ec4c5-31e4-446f-a234-313427e93f02","stauts":"PUBLISHED","lft":45,"rght":46,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"0e79e883-fa3d-483d-ac37-703967b7afab","content_type_name":"json question","type":{"id":"28266a54-d6c6-4a3f-ab45-eecd295dc390","created":"2016-05-12T12:57:01.586509Z","updated":"2016-05-12T12:57:01.586556Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[3],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/tree_M10F9T.mp3"},"videos":{},"images":{"1":"http://curate.zaya.in/media/contents/zaya/photos/2016/02/25/tree_FOUJ6U.png"}},"is_multiple":false,"options":[{"option":"dr","key":4},{"option":"tr","key":3},{"option":"pr","key":1},{"option":"cr","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.601463Z","updated":"2016-05-12T12:57:01.601524Z","title":"[[img id=1]] [[sound id=1]]","description":"","object_id":"28266a54-d6c6-4a3f-ab45-eecd295dc390","stauts":"PUBLISHED","lft":47,"rght":48,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"50d65cf2-309b-427e-a44f-dccba6de2752","content_type_name":"json question","type":{"id":"cb8a0d73-f9da-4af9-a562-9e10a343f6b6","created":"2016-05-12T12:57:01.726150Z","updated":"2016-05-12T12:57:01.726220Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":3,"answer":[1],"score":30,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/31/crane_Q4CM4X.mp3"},"videos":{},"images":{}},"is_multiple":false,"options":[{"option":"tr","key":4},{"option":"gr","key":3},{"option":"cr","key":1},{"option":"pl","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.762503Z","updated":"2016-05-12T12:57:01.762560Z","title":"[[sound id=1]]","description":"","object_id":"cb8a0d73-f9da-4af9-a562-9e10a343f6b6","stauts":"PUBLISHED","lft":49,"rght":50,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"455ae052-e71c-4152-865f-41c8ae34bf8d","content_type_name":"json question","type":{"id":"0aca89a3-780a-4b12-b9ba-8de2d628eede","created":"2016-05-12T12:57:01.782073Z","updated":"2016-05-12T12:57:01.782104Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"stock","key":4},{"option":"crop","key":3},{"option":"snail","key":1},{"option":"small","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.807064Z","updated":"2016-05-12T12:57:01.807126Z","title":"sm","description":"","object_id":"0aca89a3-780a-4b12-b9ba-8de2d628eede","stauts":"PUBLISHED","lft":51,"rght":52,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"e9a5a5c5-636c-45e7-9d5d-4f5f719159a7","content_type_name":"json question","type":{"id":"d372277a-1e43-4736-9e18-782848fa4e97","created":"2016-05-12T12:57:01.818575Z","updated":"2016-05-12T12:57:01.818616Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"throw","key":4},{"option":"glow","key":3},{"option":"blow","key":1},{"option":"place","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.839624Z","updated":"2016-05-12T12:57:01.839695Z","title":"pl","description":"","object_id":"d372277a-1e43-4736-9e18-782848fa4e97","stauts":"PUBLISHED","lft":53,"rght":54,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"9beaaaf0-9075-4988-9b51-0550f1f782b6","content_type_name":"json question","type":{"id":"12f80277-19bd-4b66-89bf-ab91954d81a8","created":"2016-05-12T12:57:01.855058Z","updated":"2016-05-12T12:57:01.855131Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[4,3,2],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"trick","key":4},{"option":"trap","key":3},{"option":"club","key":1},{"option":"truck","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.870469Z","updated":"2016-05-12T12:57:01.870504Z","title":"tr","description":"","object_id":"12f80277-19bd-4b66-89bf-ab91954d81a8","stauts":"PUBLISHED","lft":55,"rght":56,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"27681226-4c60-4719-bb4f-63a7de8b2e6a","content_type_name":"json question","type":{"id":"df1db188-8658-49c6-a7af-4570da5f26fa","created":"2016-05-12T12:57:01.881038Z","updated":"2016-05-12T12:57:01.881070Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[1],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"blend","key":4},{"option":"prize","key":3},{"option":"glow","key":1},{"option":"clam","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.893994Z","updated":"2016-05-12T12:57:01.894055Z","title":"gl","description":"","object_id":"df1db188-8658-49c6-a7af-4570da5f26fa","stauts":"PUBLISHED","lft":57,"rght":58,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"2616f02f-047d-4700-af74-108e2ed716b3","content_type_name":"json question","type":{"id":"51f50a96-4d2e-4b4d-b079-f059193bf0fa","created":"2016-05-12T12:57:01.909467Z","updated":"2016-05-12T12:57:01.909524Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":1,"answer":[1],"score":10,"content":{"hints":"[]","widgets":{"sounds":{},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":"skate","key":4},{"option":"spot","key":3},{"option":"stairs","key":1},{"option":"black","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:01.931146Z","updated":"2016-05-12T12:57:01.931209Z","title":"st","description":"","object_id":"51f50a96-4d2e-4b4d-b079-f059193bf0fa","stauts":"PUBLISHED","lft":59,"rght":60,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]},{"node":{"id":"41995ffd-2548-4965-857d-9ab76d4adf82","content_type_name":"json question","type":{"id":"0f858462-1490-40ce-8f86-3ce3c850325b","created":"2016-05-12T12:57:02.186295Z","updated":"2016-05-12T12:57:02.186330Z","microstandard":"ELL.1.RE.PA.58","is_critical_thinking":false,"level":2,"answer":[3,1],"score":20,"content":{"hints":"[]","widgets":{"sounds":{"1":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/smile_GXPK1Z.mp3","2":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/skate_QV9MJB.mp3","3":"http://curate.zaya.in/media/contents/zaya/soundclips/2015/08/26/sky_JAY7YD.mp3","4":"http://curate.zaya.in/media/contents/zaya/soundclips/2016/01/14/dry_9R37SR.mp3"},"videos":{},"images":{}},"is_multiple":true,"options":[{"option":" [[sound id=1]] ","key":4},{"option":" [[sound id=2]] ","key":3},{"option":" [[sound id=3]] ","key":1},{"option":" [[sound id=4]] ","key":2}]},"type":"choicequestion"},"created":"2016-05-12T12:57:02.202258Z","updated":"2016-05-12T12:57:02.202298Z","title":"sk","description":"","object_id":"0f858462-1490-40ce-8f86-3ce3c850325b","stauts":"PUBLISHED","lft":61,"rght":62,"tree_id":1,"level":2,"parent":"aa92134b-40da-495c-bad6-3ffbd11a6aca","content_type":22,"account":"438bab7f-d05d-4ad1-b4e8-197cef8c4747","tag":null},"objects":[]}]}
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
            template : '<ion-nav-view name="state-personalise"></ion-nav-view>',
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
