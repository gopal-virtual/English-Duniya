(function() {
  'use strict';

  angular
    .module('zaya-auth')
    .controller('authController', authController)

  authController.$inject = ['$state', 'Auth', 'audio', '$rootScope', '$ionicPopup','$log'];

  function authController($state, Auth, audio, $rootScope, $ionicPopup, $log) {
    var authCtrl = this;
    var email_regex = /\S+@\S+/;
    var indian_phone_regex = /^[7-9][0-9]{9}$/;
    //var username_regex = /^[a-z0-9]*$/;
    var min = 5;
    var max = 50;
    var country_code;

    authCtrl.audio = audio;
    authCtrl.login = login;
    authCtrl.signup = signup;
    authCtrl.rootScope = $rootScope;
    authCtrl.validCredential = validCredential;
    authCtrl.showError = showError;
    authCtrl.verifyOtpValidations = verifyOtpValidations;
    authCtrl.verifyOtp = verifyOtp;


    function validEmail(email) {
      return email_regex.test(email);
    }
    function validPhoneNumber(number){
      return indian_phone_regex.test(number);
    }
    //function validUsername(username) {
    //  return username_regex.test(username);
    //}

    function login(user_credentials) {
      user_credentials = cleanCredentials(user_credentials);
      Auth.login(user_credentials, function(response) {
        $state.go('user.main.home', {});
      }, function(response) {
        authCtrl.showError(_.chain(response.data).keys().first(),response.data[_.chain(response.data).keys().first()].toString());
        authCtrl.audio.play('wrong');
      })
    }

    function signup(user_credentials) {
      user_credentials = cleanCredentials(user_credentials);
      Auth.signup(user_credentials, function(response) {
        $state.go('auth.verify_phone_number', {});
      }, function(response) {
        authCtrl.showError(_.chain(response.data).keys().first(),response.data[_.chain(response.data).keys().first()].toString());
        authCtrl.audio.play('wrong');
      })
    }

    function cleanCredentials(user_credentials) {
      if(validEmail(user_credentials.useridentity))
      {
        user_credentials['email'] = user_credentials.useridentity;
      }
      else if(!isNaN(parseInt(user_credentials.useridentity,10)) && validPhoneNumber(parseInt(user_credentials.useridentity,10)))
      {
        user_credentials['phone_number'] = country_code+parseInt(user_credentials.useridentity,10);
      }
      delete user_credentials['useridentity'];
      return user_credentials;
    }

    function validCredential(formData) {
      $log.debug(formData);
      if(!formData.phone_number.$viewValue){
        authCtrl.showError("Phone Number","Its empty! Enter a valid phone number");
        return false;
      }
      else if(formData.phone_number.$viewValue && !isNaN(parseInt(formData.phone_number.$viewValue,10)) && !validPhoneNumber(formData.phone_number.$viewValue)){
        authCtrl.showError("Phone","Enter a Indian valid phone number");
        return false;
      }
      else if(!formData.password.$viewValue){
        authCtrl.showError("Password","Its empty! Enter a valid password");
        return false;
      }
      else if(formData.password.$viewValue.length < min){
        authCtrl.showError("Password","Minimum "+min+" characters required");
        return false;
      }
      else if(formData.password.$viewValue.length > max){
        authCtrl.showError("Password","Maximum "+max+" can be used");
        return false;
      }
      else if(formData.email && formData.email.$viewValue && !formData.email.$valid){
        authCtrl.showError("Email","Enter a valid email");
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

    function verifyOtpValidations(formData){
      if(!formData.otp.$viewValue){
        authCtrl.showError("OTP","Its empty! Enter the one time password");
        return false;
      }
      $log.debug("OTP validations passed");
      return true;
    }

    function verifyOtp(otp_credentials){
      $log.debug(JSON.stringify(otp_credentials));
      Auth.verifyOtp(otp_credentials,function(success){
        $log.debug("OTP verified");
        $state.go('user.personalise.social', {});
      },function(error){
        authCtrl.showError("Incorrect OTP!","The one time password you entered is incorrect!");
      })
    }
  }
})();
