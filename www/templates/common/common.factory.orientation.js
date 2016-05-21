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
            isLandscape : isLandscape,
            setPortrait : setPortrait,
            isPortrait : isPortrait,
            getOrientation : getOrientation
        };

        return orientation;

        function setPortrait() {
            $log.debug("orientation",$window.screen);
          try{
            $window.screen.lockOrientation('portrait');
          }
          catch(e){
            $log.debug(e);
          }
        }
        function isPortrait(){
            try {
                return $window.screen.orientation.type == 'portrait-primary' ? true : false;
            } catch (e) {
                $log.debug(e);
            }
        }
        function isLandscape(){
            try {
                return $window.screen.orientation.type == 'landscape-primary' ? true : false;
            } catch (e) {
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
        function getOrientation() {
            try {
                return $window.screen.orientation.type;
            } catch (e) {
                $log.debug(e);
            } finally {
                return false;
            }
        }

    }
})();
