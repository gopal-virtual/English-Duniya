(function() {
    'use strict';

    angular
        .module('zaya-map')
        .directive('mapCanvas', mapCanvas)

    /* @ngInject */
    function mapCanvas($injector, $timeout) {
        var mapCanvas = {
            restrict: 'A',
            template: '<div id="map_canvas"></div>',
            scope: {
              // 'players' : '=',
              // 'mapId' : '='
            },
            link: linkFunc,
            // controller: Controller,
            // controllerAs: 'vm',
            // bindToController: true
        };

        return mapCanvas;

        function linkFunc(scope, el, attr, ctrl) {
          // createGame(scope, scope.players, scope.mapId, $injector)
          console.log('its called');
          $timeout(createGame(scope, $injector));
        }
    }

    // Controller.$inject = ['dependencies'];

    /* @ngInject */
    // function Controller(dependencies) {
    //     var vm = this;
    //
    //     activate();
    //
    //     function activate() {
    //
    //     }
    // }
})();
