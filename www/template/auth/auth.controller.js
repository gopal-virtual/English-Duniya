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
