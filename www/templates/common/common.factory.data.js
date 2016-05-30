(function() {
    'use strict';

    angular
        .module('common')
        .factory('data', data);

    data.$inject = ['pouchDB','$http','$log'];

    /* @ngInject */
    function data(pouchDB, $http,$log) {
        var db = pouchDB('ed');

        var data = {
            getQuestion: getQuestion
        };

        return data;

        function getQuestion() {
            $http.get('templates/common/questions.json').success(function(data) {
            });
        }
    }
})();
