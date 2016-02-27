(function() {
    'use strict';

    angular
        .module('zaya')
        .factory('Rest', Rest)
        .factory('Auth', Auth)

    function Rest(Restangular, BACKEND_SERVICE_DOMAIN) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(BACKEND_SERVICE_DOMAIN+'/api/v1');
            RestangularConfigurer.setRequestSuffix('/');
        });
    }
    function Auth(Restangular,BACKEND_SERVICE_DOMAIN){
      var rest_auth = Restangular.withConfig(function(RestangularConfigurer) {
          RestangularConfigurer.setBaseUrl(BACKEND_SERVICE_DOMAIN+'/rest-auth');
          RestangularConfigurer.setRequestSuffix('/');
          RestangularConfigurer.setDefaultHeaders({
            'Content-Type':'application/x-www-form-urlencoded',
          });
      });
      return {
        login : function(user_credentials, success, failure){
          rest_auth.all('login').post($.param(user_credentials)).then(function(response){
            localStorage.setItem('Authorization',response.key);
            success();
          },function(){
            failure();
          })
        },
        logout : function(success,failure){
          rest_auth.all('logout').post().then(function(response){
            localStorage.removeItem('Authorization');
            success();
          },function(error){
            failure();
          })
        },
        signup : function(user_credentials,success,failure){
          rest_auth.all('registration').post($.param(user_credentials),success,failure).then(function(response){
            localStorage.setItem('Authorization',response.key);
            success();
          },function(response){
            failure();
          })
        },
        reset : function (email,type,success,failure) {
          type=='password' && rest_auth.all('password').all('reset').post(email);
          type=='username' && rest_auth.all('username').all('reset').post(email);
        },
        isAuthorised : function(){
          return localStorage.Authorization;
        }
      }
    }
})();
