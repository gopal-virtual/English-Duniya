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
                'type' : '=',
                'reference' : '='
            },
            link: linkFunc,
            controller: Controller,
            controllerAs: 'keyCtrl',
            bindToController: true
        };

        return directive;

        function linkFunc(scope, el, attr, ctrl) {

        }
    }

    Controller.$inject = [];

    /* @ngInject */
    function Controller() {
        var keyCtrl = this;

        keyCtrl.input = input;
        // keyCtrl.keySet = initKeySet(type);

        function input (key) {}

        function initKeySet (type) {
            if(type == 'alpha'){
                return {
                    'a':'a',
                    'b':'b',
                    'c':'c',
                    'd':'d',
                    'e':'e',
                    'f':'f',
                    'g':'g',
                    'h':'h',
                    'i':'i',
                    'j':'j',
                    'k':'k',
                    'l':'l',
                    'm':'m',
                    'n':'n',
                    'o':'o',
                    'p':'p',
                    'q':'q',
                    'r':'r',
                    's':'s',
                    't':'t',
                    'u':'u',
                    'v':'v',
                    'w':'w',
                    'x':'x',
                    'w':'w',
                    'z':'z'
                }
            }
        }
    }
})();
