(function() {
    'use strict';

    angular
        .module('zaya-map')
        .directive('mapCanvas', mapCanvas)

    /* @ngInject */
    function mapCanvas($injector, $timeout, $log, audio, CONSTANT) {
        var mapCanvas = {
            restrict: 'A',
            templateUrl: CONSTANT.PATH.MAP + '/map.canvas' + CONSTANT.VIEW,
            scope: {
              lessons : '=',
              animation : '='

            },
            link: linkFunc,
        };

        return mapCanvas;

        function linkFunc(scope, el, attr, ctrl) {
          $timeout(
              function(){
                  createGame(scope, scope.lessons, audio, $injector, $log)
              }
          );
        }
    }

})();
