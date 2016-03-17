(function() {
    'use strict';

    angular
        .module('zaya-search')
        .controller('searchController', searchController);

    searchController.$inject = ['CONSTANT'];

    function searchController(CONSTANT) {
        var searchCtrl = this;

        searchCtrl.tabIndex = 0;
        searchCtrl.tab = [
          {
            type : 'node',
            path : CONSTANT.PATH.SEARCH + '/search.nodes' + CONSTANT.VIEW,
            icon : 'ion-ios-book'
          },
          {
            type : 'group',
            path : CONSTANT.PATH.SEARCH + '/search.groups' + CONSTANT.VIEW,
            icon : 'ion-person-stalker'
          },
          {
            type : 'user',
            path : CONSTANT.PATH.SEARCH + '/search.users' + CONSTANT.VIEW,
            icon : 'ion-person-add'
          }
        ]
    }
})();
