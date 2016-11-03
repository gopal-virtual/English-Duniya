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
        return true;
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
