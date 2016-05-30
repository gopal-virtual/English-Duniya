(function() {
  'use strict';

  angular
    .module('common')
    .factory('data', data);

  data.$inject = ['pouchDB', '$http', '$log'];

  /* @ngInject */
  function data(pouchDB, $http, $log) {
    var db = pouchDB('ed');

    var data = {
      setQuestion: setQuestion,
      getQuestions: getQuestions
    };

    return data;

    function setQuestion() {
      $http.get('templates/common/questions.json').success(function(data) {
          db.bulkDocs(data);
      });
    }
    function getQuestions(){
        db.get('574814c61d41c8170fed4e08').then(function (doc) {
          $log.debug(doc);
        });
    }
  }
})();
