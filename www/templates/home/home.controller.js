(function(){
  'use strict';

  angular
    .module('zaya')
    .controller('homeController',homeController)

  homeController.$inject = ['$scope'];

  function homeController($scope) {
    var homeCtrl = this;
    homeCtrl.carouselOptions = {
        "loop": false,
        "margin": 0,
        "items": 1,
        "stagePadding": 20,
        "nav": false,
        "autoplay": false,
        "center" : true
    };
  }
})();
