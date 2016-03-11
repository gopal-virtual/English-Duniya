(function() {
  'use strict';

  angular
    .module('zaya')
    .config(mainRoute);

  function mainRoute($urlRouterProvider) {
    $urlRouterProvider.otherwise('/auth/main');
  }
})();
