(function() {
    'use strict';

    angular
        .module('common')
        .directive('virtualKeyboard', virtualKeyboard);

    /* @ngInject */
    function virtualKeyboard(CONSTANT,$log) {
        var directive = {
            restrict: 'E',
            templateUrl: CONSTANT.PATH.COMMON + '/common.keyboard' + CONSTANT.VIEW,
            scope: {
                'reference' : '=',
                'limit' : '='
            },
            controller: keyController,
            controllerAs: 'keyCtrl',
            bindToController: true
        };

        return directive;
    }

    keyController.$inject = ['$log'];

    /* @ngInject */
    function keyController($log) {
        // angular.element("#audioplayer")[0].pause();
        var keyCtrl = this;

        keyCtrl.input = input;
        keyCtrl.erase = erase;

        function input (key, limit) {
            if(keyCtrl.reference.trim().length <= keyCtrl.limit){
                keyCtrl.reference += key;
                angular.element("#audioSource")[0].src = 'sound/pop.mp3';
                angular.element("#audioplayer")[0].load();
                angular.element("#audioplayer")[0].play();
            }
        }
        function erase (key) {
            keyCtrl.reference = keyCtrl.reference.substr(0,keyCtrl.reference.length - 1);
            angular.element("#audioSource")[0].src = 'sound/pop.mp3';
            angular.element("#audioplayer")[0].load();
            angular.element("#audioplayer")[0].play();
        }
    }
})();
