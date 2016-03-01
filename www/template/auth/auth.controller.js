(function(){
  'use strict';

  angular
    .module('zaya')
    .controller('authController', authController)

    authController.$inject = ['$state','Auth'];

  function authController($state,Auth) {
    var authCtrl = this;

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
