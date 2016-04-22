(function () {
  'use strict';
  angular
    .module('zaya-auth')
    .controller('authController', authController)
  authController.$inject = ['$state', 'Auth', 'audio', '$rootScope', '$ionicPopup', '$log', '$cordovaOauth', 'CONSTANT', '$interval', '$scope', '$ionicLoading'];
  function authController($state, Auth, audio, $rootScope, $ionicPopup, $log, $cordovaOauth, CONSTANT, $interval, $scope, $ionicLoading) {
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
    authCtrl.rootScope = $rootScope;
    authCtrl.validCredential = validCredential;
    authCtrl.showError = showError;
    authCtrl.showAlert = showAlert;
    authCtrl.verifyOtpValidations = verifyOtpValidations;
    authCtrl.verifyOtp = verifyOtp;
    authCtrl.getToken = getToken;
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
          $state.go('user.personalise.social', {});
        }, function () {
          $ionicLoading.hide();
          authCtrl.showError("Error Login", "Please enter a valid mobile no./Email ID and password");
        });
      }, function (response) {
        $ionicLoading.hide();

        //authCtrl.showError(_.chain(response.data).keys().first(), response.data[_.chain(response.data).keys().first()].toString());
        if(response.data.details)
        {
          authCtrl.showError("Error Login", response.data.details);
        }
        else{
          authCtrl.showError("Error Login", "Please enter a valid mobile no./Email ID and password");
        }
        authCtrl.audio.play('wrong');
      })
    }

    function logout(path) {
      Auth.logout(function () {
        $state.go(path, {})
      }, function () {
        // body...
      })
    }

    function getToken(webservice) {
      if (webservice == 'facebook') {
        $cordovaOauth.facebook(CONSTANT.CLIENTID.FACEBOOK, ["email"]).then(function (result) {
          authCtrl.login('facebook', {"access_token": result.access_token});
        }, function (error) {
          authCtrl.showError("Error", error);
        });
      }
      if (webservice == 'google') {
        $cordovaOauth.google(CONSTANT.CLIENTID.GOOGLE, ["email"]).then(function (result) {
          authCtrl.login('google', {"access_token": result.access_token});
        }, function (error) {
          authCtrl.showError("Error", error);
        });
      }
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
      $ionicPopup.alert({
        title: title,
        template: msg
      });
    }

    function showAlert(title, msg, success) {
      $log.debug(title, msg);
      $ionicPopup.alert({
        title: title,
        template: msg
      }).then(function (response) {
        if (success) {
          success()
        }
      });
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
          authCtrl.showAlert("Reset Password", "We have send you an otp please verify it to reset password", function () {
          });
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
          $log.debug(JSON.stringify(msg));
          $ionicLoading.hide();
        }
      );
    };
    authCtrl.googleSignOut = function () {
      window.plugins.googleplus.logout(
        function (msg) {
          alert(msg);
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
          authCtrl.showAlert("Correct!", "OTP verified!");
          $state.go('auth.change_password', {});
        },function(error){
          authCtrl.showAlert("InCorrect!", "You entered wrong OTP!");
          $log.debug(error);
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
        authCtrl.showAlert('Success','You have reset your password',function(success){
          $log.debug(success);
          $state.go('auth.signin', {});
        })
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
