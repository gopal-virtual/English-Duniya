(function() {
    'use strict';

    angular
        .module('common')
        .directive('validNumber', validNumber);

    function validNumber() {
        var validNumber = {
            require: '?ngModel',
            link: linkFunc
        };

        return validNumber;

        function linkFunc(scope, element, attrs, ngModelCtrl) {
          if(!ngModelCtrl) {
            return;
          }
          ngModelCtrl.$parsers.push(function(val) {
            var clean = val.replace( /[^0-9]+/g, '');
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
