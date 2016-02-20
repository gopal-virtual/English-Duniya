(function(){
  'use strict';

  angular
    .module('zaya')
    .controller('authController', authController)

    authController.$inject = ['$state'];

  function authController($state) {
    var auth = this;

    auth.login = function (){
      $state.go('user.main.home',{});
    }
  }
})();
