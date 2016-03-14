(function () {
  'use strict';

  angular
    .module('zaya', [
      // external
      'ionic',
      'restangular',
      'ionic-native-transitions',

      // core
      'common',
      'zaya-user',
      'zaya-intro',
      'zaya-auth',
      'zaya-quiz',
      'zaya-group'
    ]);

})();
