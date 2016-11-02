(function() {
    'use strict';

    angular
        .module('common')
        .directive('validInput', validInput);

    function validInput() {
        var validInput = {
            require: '?ngModel',
            link: linkFunc
        };

        return validInput;

        function linkFunc(scope, element, attrs, ngModelCtrl) {
          if(!ngModelCtrl) {
            return;
          }
          ngModelCtrl.$parsers.push(function(val) {
            var clean = val.replace( /[^a-zA-Z0-9@.!#$%&'*+-/=?^_`{|}~]+/g, '');
            clean = clean.toLowerCase();
            if (val !== clean) {
              ngModelCtrl.$setViewValue(clean);
              ngModelCtrl.$render();
            }
            return clean;
          });
        }
    }
})();
