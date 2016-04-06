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
