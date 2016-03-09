(function(){
  angular
    .module('zaya')
    .config(AppConfig)

    function AppConfig($httpProvider, $ionicConfigProvider){
      $httpProvider.interceptors.push(function ($rootScope,$q){
        return {
          request : function(config){
            if(localStorage.Authorization)
              config.headers.Authorization = 'Token '+localStorage.Authorization;
              config.headers.xsrfCookieName = 'csrftoken';
              config.headers.xsrfHeaderName = 'X-CSRFToken';
            return config;
          },

          response : function(response){
            if(response.status==200 && response.data.hasOwnProperty('success')){
              $rootScope.success = $rootScope.success || [];
              $rootScope.success.push(response.data.success);
              setTimeout(function(){
                $rootScope.success.pop();
              },3000)
            }

            return response;
          },
          responseError : function(rejection){
            if([400,500].indexOf(rejection.status)!=-1){
              $rootScope.error = $rootScope.error || [];
              $rootScope.error.push(rejection.data);
              setTimeout(function(){
                $rootScope.error.pop();
              },3000)
            }
            if(rejection.status==404){
              console.log(rejection);
              $rootScope.error = $rootScope.error || [];
              $rootScope.error.push({'Not Found':'Functionality not available'});
              setTimeout(function(){
                $rootScope.error.pop();
              },3000)
            }
            return $q.reject(rejection);
          }
        }
      })

      // $ionicConfigProvider.views.transition("android");

    }
})();
