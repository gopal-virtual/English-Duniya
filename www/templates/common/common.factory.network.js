(function() {
  'use strict';

  angular
    .module('common')
    .factory('network', network);

  network.$inject = [];

  /* @ngInject */
  function network() {
    var network = {
      isOnline: isOnline,
      getConnectionType: getConnectionType
    };

    return network;

    function isOnline() {
      if (window.Connection) {
        if (navigator.connection.type == Connection.NONE) {
          return false;
        } else {
          return true;
        }
      }
      return true;
    }

    function getConnectionType() {
      return navigator.connection.type;
    }
  }
})();
