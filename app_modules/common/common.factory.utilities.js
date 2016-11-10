(function () {
  'use strict';

  angular
    .module('common')
    .factory('Utilities',utilities)

    function utilities($log) {
      return {
        range : function (num) {
          return new Array(num);
          },
          starCount : function (star, index) {
            var count = star - index;
            return count > 0 ? count : 0;
          }
      };
    }
})();
