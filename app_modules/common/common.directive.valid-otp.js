(function() {
    'use strict';

    angular
        .module('common')
        .directive('validOtp', validOtp);

    function validOtp($log) {
        var validOtp = {
            require: '?ngModel',
            link: linkFunc
        };

        return validOtp;

        function linkFunc(scope, element, attrs, ngModelCtrl) {
          if(!ngModelCtrl) {
            return;
          }

          ngModelCtrl.$parsers.push(function(val) {
            var clean = (val > 999999)?(val.toString()).substring(0,6):val;
            if (val !== clean) {
              ngModelCtrl.$setViewValue(clean);
              ngModelCtrl.$render();
            }
            return clean;
          });
        }
    }
})();
