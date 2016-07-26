(function() {
    'use strict';

    angular
        .module('common')
        .factory('settings', settings);

    settings.$inject = ['network','$ionicLoading','$ionicPopup', 'Auth', 'Rest', '$state'];

    /* @ngInject */
    function settings(network, $ionicLoading, $ionicPopup, Auth, Rest, $state) {

        var settings = {
            updateProfile : updateProfile,
            logout : logout,
            network : network,
            user : JSON.parse(localStorage.user_details) || {},
            splitName : splitName
        };
        settings.user.name = settings.user.first_name + ' ' + settings.user.last_name;

        return settings;

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
              $state.go('auth.signin', {})
            })
          } else {
            Auth.logout(function() {
              $state.go('auth.signin', {})
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
