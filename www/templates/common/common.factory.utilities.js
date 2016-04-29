(function () {
  'use strict';

  angular
    .module('common')
    .factory('Utilities',utilities)

    function utilities() {
      return {
        range : function (num) {
          return new Array(num);
        }
      };
    }
})();
