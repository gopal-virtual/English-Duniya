(function() {
    'use strict';

    angular
        .module('common')
        .factory('orientation', orientation);

    orientation.$inject = ['$window','$log'];

    /* @ngInject */
    function orientation($window, $log) {
        var orientation = {
            setLandscape : setLandscape,
            setPortrait : setPortrait
        };

        return orientation;

        function setPortrait() {
          try{
            $window.screen.lockOrientation('portrait');
          }
          catch(e){
            $log.debug(e);
          }
        }

        function setLandscape() {
          try{
            $window.screen.lockOrientation('landscape');
          }
          catch(e){
            $log.debug(e);
          }
        }
    }
})();
