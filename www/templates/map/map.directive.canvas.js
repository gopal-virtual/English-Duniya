(function() {
    'use strict';

    angular
        .module('zaya-map')
        .directive('mapCanvas', mapCanvas)

    /* @ngInject */
    function mapCanvas($injector, $state, $stateParams, $timeout, $log, audio, CONSTANT, lessonutils) {
        var mapCanvas = {
            restrict: 'A',
            templateUrl: CONSTANT.PATH.MAP + '/map.canvas' + CONSTANT.VIEW,
            scope: {
              lessons : '=',
              animation : '=',
              startIndex : '=',
              endIndex : '='
            },
            link: linkFunc,
        };

        return mapCanvas;

        function linkFunc(scope, el, attr, ctrl) {
            var region = ["desert","tundra","forest","peru"];
            $timeout(
              function(){
                  createGame(scope, $stateParams, scope.lessons, audio, $injector, $log, lessonutils, region, scope.startIndex, scope.endIndex)
              }
            );
        }
    }

})();
