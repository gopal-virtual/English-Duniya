(function () {
  'use strict';
  angular
    .module('zaya', [
      // external
      'ionic',
      'restangular',
      'ionic-native-transitions',
      'ngCordova',
      'ngMessages',
      'ngCookies',
      'com.2fdevs.videogular',
      'com.2fdevs.videogular.plugins.controls',
      'com.2fdevs.videogular.plugins.buffering',
      'com.2fdevs.videogular.plugins.overlayplay',
      'angular-inview',
      'pouchdb',
      'ionic.ion.imageCacheFactory',
      'nzTour',
      'ngResource',
      'ngCachedResource',
      'ngAudio',
      // core
      'templates',
      'common',
      'zaya-map',
      'zaya-user',
      'zaya-intro',
      'zaya-auth',
      'zaya-quiz',
      'zaya-content',
      'ngRaven'
    ]);

})();
