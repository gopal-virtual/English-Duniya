(function() {
  'use strict';

  angular
    .module('common')
    .directive('onFinish', onFinish);

  /* @ngInject */
  function onFinish($timeout) {
    var finish = {
      restrict: 'A',
      link: linkFunc,
    };

    return finish;

    function linkFunc(scope, el, attr) {
      if (scope.$last === true) {
        $timeout(function() {
          scope.$evalAsync(attr.onFinish);
        });
      }

    }
  }
})();
