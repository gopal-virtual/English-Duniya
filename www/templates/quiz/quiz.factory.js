(function () {
  'use strict';
  angular
    .module('zaya-quiz')
    .factory('Quiz', Quiz)
  Quiz.$inject = ['Restangular', 'CONSTANT', '$cookies', '$log', '$window'];
  function Quiz(Restangular, CONSTANT, $cookies, $log, $window) {
    var rest = Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + '/api/v1');
      RestangularConfigurer.setRequestSuffix('/');
      RestangularConfigurer.setDefaultHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      });
    });
    return {
      saveReport : function(data,success,failure){
        rest.all('reports').post($.param(data)).then(function(response){
          success(response);
        },function(error){
          failure(error);
        })
      },
      saveAttempt : function(data,success,failure){
        rest.all('attempts').post($.param(data)).then(function(response){
          success(response);
        },function(error){
          failure(error);
        })
        }
    }
  }
})();
