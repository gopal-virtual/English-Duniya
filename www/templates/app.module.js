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
      'zaya-content',
      'zaya-map',
      'zaya-user',
      'zaya-playlist',
      'zaya-profile',
      'zaya-intro',
      'zaya-auth',
      'zaya-quiz',
      'zaya-search',
      'zaya-group'
    ]);

})();
