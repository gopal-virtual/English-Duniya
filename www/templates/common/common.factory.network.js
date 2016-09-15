(function() {
  'use strict';

  angular
    .module('common')
    .factory('network', network);

  network.$inject = ['$log'];

  /* @ngInject */
  function network($log) {
    var network = {
      isOnline: isOnline,
      getConnectionType: getConnectionType
    };

    return network;

    function isOnline() {
      if (window.Connection) {
        if (navigator.connection.type == Connection.NONE) {
          $log.debug("NF")
          return false;
        } else {
          $log.debug("NT")

          return true;
        }
      } else {
        $log.debug("Nt")

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
