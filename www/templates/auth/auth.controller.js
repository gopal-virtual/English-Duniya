(function() {
  'use strict';
  angular
    .module('zaya-auth')
    .controller('authController', authController)
  authController.$inject = ['$q', '$ionicModal', '$state', 'Auth', 'audio', '$rootScope', '$ionicPopup', '$log', '$cordovaOauth', 'CONSTANT', '$interval', '$scope', '$ionicLoading', 'formHelper', '$ionicPlatform','data'];

  function authController($q, $ionicModal, $state, Auth, audio, $rootScope, $ionicPopup, $log, $cordovaOauth, CONSTANT, $interval, $scope, $ionicLoading, formHelper, $ionicPlatform, dataService) {
    var authCtrl = this;
    authCtrl.formHelper = formHelper;
    authCtrl.Auth = Auth;
    authCtrl.audio = audio;
    authCtrl.logout = logout;
    authCtrl.signup = signup;
    authCtrl.signin = signin;
    authCtrl.rootScope = $rootScope;
    authCtrl.showError = showError;
    authCtrl.showAlert = showAlert;
    authCtrl.verifyOtp = verifyOtp;
    authCtrl.resendOTP = resendOTP;
    authCtrl.max_counter = 60;
    authCtrl.startCounter = startCounter;
    authCtrl.stopCounter = stopCounter;
    authCtrl.closeKeyboard = closeKeyboard;
    authCtrl.verifyOtpResetPassword = verifyOtpResetPassword;
    authCtrl.changePassword = changePassword;
    authCtrl.recoverAccount = recoverAccount;
    authCtrl.cleanLocalStorage = cleanLocalStorage;
    authCtrl.signUpFormValidations = {
      'emailAddress': ['emailAddress'],
      'phoneNumber': ['required', 'phoneNumber'],
      'password': ['required', 'password']
    }; // {fieldname: [validations]}
    authCtrl.signInFormValidations = {
      'userIdentity': ['required', 'userIdentity'],
      'password': ['required', 'password']
    }; // {fieldname: [validations]}
    authCtrl.OtpFormValidations = {
      'otp': ['required', 'otp']
    };
    authCtrl.recoverAccountFormValidations = {
      'userIdentity': ['required', 'userIdentity']
    };
    authCtrl.changePasswordFormValidations = {
      'password1': ['required', 'password'],
      'password2': ['required', 'equals-password1']
    };

    function recoverAccount(formData) {
      var credentials;
      $ionicLoading.show();
      authCtrl.formHelper.validateForm(formData, authCtrl.recoverAccountFormValidations)
        .then(function(response) {
          credentials = response;
          return Auth.resetPassword(credentials);
        })
        .then(function(success) {
          authCtrl.resetPasswordLinkSent = true;
          if (credentials.hasOwnProperty('phone_number')) {
            localStorage.setItem('Authorization', success.token);
            authCtrl.recoveryModal.hide().then(function() {
              $state.go('auth.forgot_verify_otp');
            });
          } else {
            authCtrl.showAlert("Reset Password", "We have send a link to your email").then(function() {
              authCtrl.recoveryModal.hide().then(function() {
                $state.go('auth.signin');
              });
            });
          }

        })
        .catch(function(error) {
          authCtrl.showError("Invalid Details", error || "Please try again");
          authCtrl.audio.play('wrong');
        }).finally(function() {
          $ionicLoading.hide()
        })
    }


    $ionicModal.fromTemplateUrl(CONSTANT.PATH.AUTH + '/auth.forgot.social' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up',
    }).then(function(recoveryModal) {

      authCtrl.recoveryModal = recoveryModal;
    });

    function signin(url, data) {
      $ionicLoading.show();
      var getCredentials;
      if (url === 'login') {
        getCredentials = authCtrl.formHelper.validateForm(data, authCtrl.signInFormValidations);
      }
      if (url === 'google') {
        var d = $q.defer();
        window.plugins.googleplus.login(CONSTANT.CONFIG.AUTH.GOOGLEPLUS,
          function(response) {
            d.resolve({
              "access_token": response.oauthToken
            });
          },
          function(error) {
            d.reject(error);
          }
        );
        getCredentials = d.promise;
      }
      if (url === 'facebook') {
        var d = $q.defer();
        facebookConnectPlugin.login(CONSTANT.CONFIG.AUTH.FB, function(response) {
          d.resolve({
            "access_token": success.authResponse.accessToken
          });
        }, function(error) {
          d.reject(error);
        });
        getCredentials = d.promise;
      }
      getCredentials.then(function(credentials) {
          return Auth.login(url, credentials);
        })
        .then(function() {
          return Auth.getUser();
        })
        .then(function() {
          return Auth.getProfile();
        })
        .then(function(){
          return dataService.putUserifNotExist({
            'userId': Auth.getProfileId()
          })
        })
        .then(function() {
          $state.go('map.navigate', {});
        })
        .catch(function(error) {
          authCtrl.showError("Could not login", error || "Please try again");
          authCtrl.audio.play('wrong');
        }).finally(function() {
          $ionicLoading.hide()
        })
    }

    function signup(formData) {
      $ionicLoading.show();
      authCtrl.formHelper.validateForm(formData, authCtrl.signUpFormValidations)
        .then(function(credentials) {
          credentials.password1 = credentials.password2 = credentials.password;
          return Auth.signup(credentials);
        })
        .then(function() {
          $state.go('auth.verify.phone', {});
        })
        .catch(function(error) {
          authCtrl.showError("Could not register", error || "Please try again");
          authCtrl.audio.play('wrong');
        })
        .finally(function() {
          $ionicLoading.hide();
        })
    }

    function logout(path) {
      Auth.logout(function() {
        $state.go(path, {})
      }, function() {
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

    function showAlert(title, msg) {
      var d = $q.defer();
      $log.debug(title, msg);
      $ionicPopup.alert({
        title: title,
        template: msg
      }).then(function(response) {
        d.resolve(response)
      }, function(error) {
        d.reject(error)
      });

      return d.promise;
    }



    function verifyOtp(data) {
      $ionicLoading.show();
      try {
        if (SMS) SMS.stopWatch(function() {
          $log.debug('watching', 'watching stopped');
        }, function() {
          $log.debug('failed to stop watching');
        });
      } catch(e) {

      }


      authCtrl.formHelper.validateForm(data, authCtrl.OtpFormValidations)
        .then(function(response) {
          $log.debug(response);
          return Auth.verifyOtp(response)
        })
        .then(function(response) {
          return Auth.getUser();
        })
        .then(function() {
          return Auth.getProfile();
        })
        .then(function() {
          $ionicLoading.hide();
          return authCtrl.showAlert("Correct!", "Phone Number verified!");
        }).then(function() {
          $state.go('user.personalise.social', {});
        })
        .catch(function(error) {
          authCtrl.showError("Could not verify", error);
          try {
            if (SMS) SMS.startWatch(function() {
              $log.debug('watching', 'watching started');
            }, function() {
              $log.debug('failed to start watching');
            });
          } catch(e) {

          }
        })
        .finally(function() {
          $ionicLoading.hide();
        });
    }




    function resendOTP() {
      Auth.resendOTP().then(function() {
        authCtrl.showAlert("OTP Sent", "We have sent you otp again");
        authCtrl.startCounter();
      }, function() {
        authCtrl.showError("Could not send otp", "Try again after sometime");
      })
    }

    function startCounter() {
      authCtrl.counter = authCtrl.max_counter;
      authCtrl.start = $interval(function() {
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
    //
    // $scope.$on('smsArrived', function (event, data) {
    //   $ionicLoading.show({
    //     template: 'Getting OTP From SMS'
    //   });
    //   authCtrl.autoVerifyPhoneStatus = 'Getting OTP From SMS';
    //   Auth.getOTPFromSMS(data.message, function (otp) {
    //     $ionicLoading.show({
    //       template: 'OTP received. Verifying..'
    //     });
    //     authCtrl.autoVerifyPhoneStatus = 'OTP received. Verifying..';
    //     Auth.verifyOtp({'code': otp}, function (success) {
    //       authCtrl.autoVerifyPhoneStatus = 'Verified';
    //       otpVerifiedSuccessHandler(success);
    //     }, function () {
    //       $ionicLoading.hide();
    //       authCtrl.autoVerifyPhoneStatus = 'Error Verifying OTP. Try Again';
    //     });
    //   }, function () {
    //     $ionicLoading.hide();
    //     authCtrl.autoVerifyPhoneStatus = 'Error Getting OTP From SMS';
    //     //authCtrl.showError("Could not get OTP","Error fetching OTP");
    //   });
    //   if (SMS) {
    //     SMS.stopWatch(function () {
    //       $log.debug('watching', 'watching stopped');
    //     }, function () {
    //       updateStatus('failed to stop watching');
    //     });
    //     SMS.startWatch(function () {
    //       $log.debug('watching', 'watching started');
    //     }, function () {
    //       updateStatus('failed to start watching');
    //     });
    //   }
    // });


    //
    // authCtrl.googleSignOut = function() {
    //   window.plugins.googleplus.logout(
    //     function(msg) {
    //       alert(msg);
    //     }
    //   );
    // };

    function closeKeyboard() {
      try {
        cordova.plugins.Keyboard.close();
      } catch (e) {
        $log.debug(e);
      }
      $log.debug("Close keyboard returns nothing");
    }

    function verifyOtpResetPassword(formData) {
      $ionicLoading.show();
      authCtrl.formHelper.validateForm(formData, authCtrl.OtpFormValidations)
        .then(function(response) {
          return Auth.verifyOtpResetPassword(response);
        })
        .then(function() {
          $state.go('auth.change_password', {});
        }).catch(function(error) {
          authCtrl.showAlert("Could not verify", error || "You entered wrong OTP!");
        })
        .finally(function() {
          $ionicLoading.hide();
        })
    }


    function changePassword(formData) {
      $ionicLoading.show();
      authCtrl.formHelper.validateForm(formData, authCtrl.changePasswordFormValidations)
        .then(function(credentials) {
          credentials.secret_key = '@#2i0-jn9($un1w8utqc2dms!$#5+5';
          credentials.new_password1 = credentials.password1;
          credentials.new_password2 = credentials.password2;
          delete credentials.password1;
          delete credentials.password2;
          return Auth.changePassword(credentials)
        })
        .then(function(success) {
          $ionicLoading.hide();
          return authCtrl.showAlert('Success', 'You have reset your password').then(function() {
            $state.go('auth.signin', {});
          });
        })
        .catch(function(error) {
          $ionicLoading.hide();
          authCtrl.showError("Could not reset", error || "Please Try again");
        })
    }

    function cleanLocalStorage() {
      Auth.cleanLocalStorage();
      $state.go('auth.signin', {});
    }


  $scope.$on('smsArrived',function(e,sms){
    $log.debug("smsArrived",sms);
    Auth.getOTPFromSMS(sms)
    .then(function(otp){
      authCtrl.verification = {'otp':otp};
      document.getElementById('verifyOtpFormSubmit').click()
      $log.debug(otp);
    })
    .catch(function(){
      $log.debug("fail");
    })
  })
  }
})();
