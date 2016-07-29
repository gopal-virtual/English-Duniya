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
      } else {
        return true;
      }
    }

    function getConnectionType() {
      if (window.Connection)
        return navigator.connection.type;
      else
        return 'unknown';
    }
  }
})();
