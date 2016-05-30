(function() {
    'use strict';

    angular
        .module('common')
        .factory('ml', ml);

    ml.$inject = [];

    /* @ngInject */
    function ml() {
        var ml = {};

        return ml;
    }
})();
