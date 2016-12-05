(function() {
    'use strict';

    angular
        .module('zaya-map')
        .directive('mapCanvas', mapCanvas)

    /* @ngInject */
    function mapCanvas($injector, $state, $timeout, $log, audio, CONSTANT, lessonutils, $ionicLoading) {
        var mapCanvas = {
            restrict: 'A',
            templateUrl: CONSTANT.PATH.MAP + '/map.canvas' + CONSTANT.VIEW,
            scope: {
              lessons : '=mapLessons',
              totalstars : '=mapTotalstars',
              demo : '=mapDemo',
              mediaSyncStatus : '=mediaSync',
            },
            link: linkFunc,
        };

        return mapCanvas;

        function linkFunc(scope, el, attr, ctrl) {
          $log.debug("Scoe Directive",scope);
            $timeout(
              function(){
                  createGame(scope, scope.lessons, audio, $injector, $log, lessonutils, $ionicLoading)
              }
            );
        }
    }

})();