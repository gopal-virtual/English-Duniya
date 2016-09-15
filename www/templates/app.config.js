(function() {
  angular
    .module('zaya')
    .config(AppConfig)
    .constant('$ionicLoadingConfig', {
      templateUrl:  'templates/common/common.loader.view.html'
    });
  function AppConfig($httpProvider, $ionicConfigProvider, $ionicNativeTransitionsProvider, $logProvider, $windowProvider, pouchDBProvider, POUCHDB_METHODS, $resourceProvider) {


    // global debug log
    $logProvider.debugEnabled(true);
    // request/response interceptors
    $httpProvider.interceptors.push(function($rootScope, $q, $log, $injector) {
      return {
        request: function(config) {
          if (localStorage.Authorization)
            config.headers.Authorization = 'Token ' + localStorage.Authorization;
          config.headers.xsrfCookieName = 'csrftoken';
          config.headers.xsrfHeaderName = 'X-CSRFToken';
          return config;
        },
        response: function(response) {
          if (response.status == 200 && response.data.hasOwnProperty('success')) {
            $rootScope.success = $rootScope.success || [];
            $rootScope.success.push(response.data.success);
            setTimeout(function() {
              $rootScope.success.pop();
            }, 3000)
          }

          return response;
        },
        responseError: function(rejection) {
          if ([401].indexOf(rejection.status) != -1) {
            localStorage.removeItem('Authorization');
            localStorage.setItem('syncing','false');

          }
          if ([400, 500].indexOf(rejection.status) != -1) {
            $rootScope.error = $rootScope.error || [];
            $rootScope.error.push(rejection.data);
            setTimeout(function() {
              $rootScope.error.pop();
            }, 3000)
          }
          if (rejection.status == 404) {
            ;
            $rootScope.error = $rootScope.error || [];
            $rootScope.error.push({
              'Not Found': 'Functionality not available'
            });
            setTimeout(function() {
              $rootScope.error.pop();
            }, 3000)
          }
          return $q.reject(rejection);
        }
      }
    })
    $ionicConfigProvider.views.maxCache(0);
    $ionicConfigProvider.tabs.position('bottom');
    $ionicNativeTransitionsProvider.enable(false, false);
    // Example for nolanlawson/pouchdb-authentication
    var loadMethods = {
      load: 'qify'
    };
    pouchDBProvider.methods = angular.extend({}, POUCHDB_METHODS, loadMethods);
  }
})();
