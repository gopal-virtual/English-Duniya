(function(){
  'use strict';

  angular
    .module('zaya')
    .controller('userMainController',userMainController)

  userMainController.$inject = ['$state'];

  function userMainController($state) {
    var UserMain = this;

    UserMain.goToProfile = function(){ $state.go('user.main.profile',{})}
    UserMain.goToPlaylist = function(){ $state.go('user.main.playlist',{})}
    UserMain.goToHome = function(){ $state.go('user.main.home',{})}
    UserMain.goToResult = function(){ $state.go('user.main.result',{})}
    UserMain.goToSearch = function(){ $state.go('user.main.search',{})}
  }
})();
