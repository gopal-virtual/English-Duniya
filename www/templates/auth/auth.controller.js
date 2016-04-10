(function() {
  'use strict';

  angular
    .module('zaya-auth')
    .controller('authController', authController)

  authController.$inject = ['$state', 'Auth', 'audio', '$rootScope', '$ionicPopup','$log','$cordovaOauth', 'CONSTANT'];

  function authController($state, Auth, audio, $rootScope, $ionicPopup, $log, $cordovaOauth, CONSTANT) {
    var authCtrl = this;
    var email_regex = /\S+@\S+/;
    var indian_phone_regex = /^[7-9][0-9]{9}$/;
    var username_regex = /^[a-z0-9]*$/;
    var min = 5;
    var max = 50;

    authCtrl.audio = audio;
    authCtrl.login = login;
    authCtrl.signup = signup;
    authCtrl.rootScope = $rootScope;
    authCtrl.validCredential = validCredential;
    authCtrl.showError = showError;
    authCtrl.getToken = getToken;

    function validEmail(email) {
      return email_regex.test(email);
    }
    function validPhoneNumber(number){
      return indian_phone_regex.test(number);
    }
    function validUsername(username) {
      return username_regex.test(username);
    }

    function login(url, user_credentials) {
      user_credentials = ( url == 'login' )? cleanCredentials(user_credentials) : user_credentials;
      Auth.login(url, user_credentials, function(response) {
        $state.go('user.main.home', {});
      }, function(response) {
        authCtrl.showError(_.chain(response.data).keys().first(),response.data[_.chain(response.data).keys().first()].toString());
        authCtrl.audio.play('wrong');
      })
    }
    function getToken(webservice) {
      if(webservice=='facebook'){
        $cordovaOauth.facebook(CONSTANT.CLIENTID.FACEBOOK, ["email"]).then(function(result) {
            authCtrl.login('facebook',{"access_token" : result.access_token});
        }, function(error) {
            authCtrl.showError("Error", error);
        });
      }
      if(webservice == 'google'){
        $cordovaOauth.google(CONSTANT.CLIENTID.GOOGLE, ["email"]).then(function(result) {
          authCtrl.login('google',{"access_token" : result.access_token});
        }, function(error) {
          authCtrl.showError("Error", error);
        });
      }
    }

    function signup(user_credentials) {
      user_credentials = cleanCredentials(user_credentials);
      Auth.signup(user_credentials, function(response) {
        $state.go('user.personalise.social', {});
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
      if(!isNaN(parseInt(user_credentials.useridentity,10)) && validPhoneNumber(parseInt(user_credentials.useridentity,10)))
      {
        user_credentials['phone_number'] = parseInt(user_credentials.useridentity,10);
      }
      if(validUsername(user_credentials.useridentity))
      {
        user_credentials['username'] = user_credentials.useridentity;
      }
      delete user_credentials['useridentity'];
      return user_credentials;
    }

    function validCredential(formData) {
      $log.debug(formData);
      if(!formData.useridentity.$viewValue){
        authCtrl.showError("Username / Phone","Its empty! Enter a valid username or phone");
        return false;
      }
      else if(formData.useridentity.$viewValue && !isNaN(parseInt(formData.useridentity.$viewValue,10)) && !validPhoneNumber(formData.useridentity.$viewValue)){
        authCtrl.showError("Phone","Enter a Indian valid phone number");
        return false;
      }
      else if(formData.useridentity.$viewValue && formData.useridentity.$viewValue.indexOf('@')==-1 && !validUsername(formData.useridentity.$viewValue)){
        authCtrl.showError("Username","Username can only contain lower case or number");
        return false;
      }
      else if(formData.useridentity.$viewValue && formData.useridentity.$viewValue.indexOf('@')!=-1 && !validEmail(formData.useridentity.$viewValue)){
        authCtrl.showError("Email","Enter a valid email");
        return false;
      }
      else if(formData.useridentity.$viewValue.length < min){
        authCtrl.showError("Username / Phone","Minimum "+min+" characters required");
        return false;
      }
      else if(formData.useridentity.$viewValue.length > max){
        authCtrl.showError("Username / Phone","Maximum "+max+" can be used");
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
    };


  }
})();
