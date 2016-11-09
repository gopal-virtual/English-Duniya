(function() {
    'use strict';

    angular
        .module('common')
        .factory('settings', settings);

    settings.$inject = ['network','$ionicLoading','$ionicPopup', 'Auth', 'Rest', '$state','$log'];

    /* @ngInject */
    function settings(network, $ionicLoading, $ionicPopup, Auth, Rest, $state, $log) {

        var settings = {
            updateProfile : updateProfile,
            logout : logout,
            network : network,
            user : user,
            splitName : splitName
        };


        return settings;
        function user(){
           ;
           if(localStorage.getItem('user_details')){
             var temp = JSON.parse(localStorage.getItem('user_details'));
             temp.name = temp.first_name + ' ' + temp.last_name;
             return temp;
           }
              return {}
        }

        function splitName(){
            settings.user.first_name = settings.user.name.substr(0, settings.user.name.indexOf(" "));
            settings.user.last_name = settings.user.name.substr(settings.user.name.indexOf(" ")+1);
        }

        function logout(type) {
          $ionicLoading.show({
            noBackdrop: false,
            hideOnStateChange: true
          });
          if (type == 'clean') {
            Auth.clean(function() {
              $state.go('auth.signup', {})
            })
          } else {

            Auth.logout(function() {
              $state.go('auth.signup', {})
            }, function() {
              // body...
            })
          }
        }

        function updateProfile(userid, params) {
            $ionicLoading.show()
          Rest.one('users', userid).patch(params).then(function(response) {
            localStorage.setItem('user_details', JSON.stringify(response));
              $ionicLoading.hide();
          }).catch();
        }

    }
})();
