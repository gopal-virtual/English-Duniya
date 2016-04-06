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

      // core
      'common',
      'zaya-user',
      'zaya-map',
      'zaya-playlist',
      'zaya-profile',
      'zaya-intro',
      'zaya-auth',
      'zaya-quiz',
      'zaya-search',
      'zaya-group'
    ]);

})();
