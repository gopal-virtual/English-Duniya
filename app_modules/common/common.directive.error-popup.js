(function() {
    'use strict';

    angular
        .module('common')
        .directive('errorPopup', errorPopup);

    /* @ngInject */
    function errorPopup(CONSTANT,$log) {
        var directive = {
            restrict: 'E',
            templateUrl: CONSTANT.PATH.COMMON + '/common.error-popup' + CONSTANT.VIEW,
            scope: {
            	'message' : '='	
            },
            controller: errorPopupController,
            controllerAs: 'errorPopupCtrl',
            bindToController: true
        };

        return directive;
    }

    errorPopupController.$inject = ['$log','User','$scope'];

    /* @ngInject */
    function errorPopupController($log, User, $scope) {
        var errorPopupCtrl = this;
        $scope.message = errorPopupCtrl.message;
       	$scope.gender = '';
       	if (User.getActiveProfileSync()) {
       		$scope.gender = User.getActiveProfileSync().data.profile.gender == 'M' ? 'boy' : 'girl';
       	}else{
       		$scope.gender = 'boy';
       	}
    }
})();
