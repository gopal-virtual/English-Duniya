(function () {
  'use strict';

  angular
    .module('zaya', [
      // external
      'ionic',
      'restangular',
      'ionic-native-transitions',
      'ngMessages',
      'ngCookies',
      'ngCordovaOauth',

      // core
      'common',
      'zaya-map',
      'zaya-user',
      'zaya-profile',
      'zaya-intro',
      'zaya-auth',
      'zaya-quiz',
    ]);

})();
