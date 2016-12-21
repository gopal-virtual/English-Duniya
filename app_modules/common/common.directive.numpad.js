(function() {
    'use strict';

    angular
        .module('common')
        .directive('virtualNumpad', virtualNumpad);

    /* @ngInject */
    function virtualNumpad(CONSTANT,$log) {
        var directive = {
            restrict: 'E',
            templateUrl: CONSTANT.PATH.COMMON + '/common.numpad' + CONSTANT.VIEW,
            scope: {
                'reference' : '=',
                'limit' : '='
            },
            controller: numController,
            controllerAs: 'numCtrl',
            bindToController: true
        };

        return directive;
    }

    numController.$inject = ['$log'];

    /* @ngInject */
    function numController($log) {
        // angular.element("#audioplayer")[0].pause();
        var numCtrl = this;

        numCtrl.input = input;
        numCtrl.erase = erase;

        function input (num, limit) {
            if(numCtrl.reference.length <= numCtrl.limit){
                numCtrl.reference += num;
                angular.element("#audioSource")[0].src = 'sound/pop.mp3';
                angular.element("#audioplayer")[0].load();
                angular.element("#audioplayer")[0].play();
            }
        }
        function erase (num) {
            numCtrl.reference = numCtrl.reference.substr(0,numCtrl.reference.length - 1);
            angular.element("#audioSource")[0].src = 'sound/pop.mp3';
            angular.element("#audioplayer")[0].load();
            angular.element("#audioplayer")[0].play();
        }
    }
})();
