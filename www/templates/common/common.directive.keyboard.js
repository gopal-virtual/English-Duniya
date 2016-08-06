(function() {
    'use strict';

    angular
        .module('common')
        .directive('virtualKeyboard', virtualKeyboard);

    /* @ngInject */
    function virtualKeyboard(CONSTANT) {
        var directive = {
            restrict: 'E',
            templateUrl: CONSTANT.PATH.COMMON + '/common.keyboard' + CONSTANT.VIEW,
            scope: {
                'reference' : '='
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
        var keyCtrl = this;

        keyCtrl.input = input;
        keyCtrl.erase = erase;

        function input (key) {
            keyCtrl.reference += key;
        }
        function erase (key) {
            keyCtrl.reference = keyCtrl.reference.substr(0,keyCtrl.reference.length - 1);
        }
    }
})();
