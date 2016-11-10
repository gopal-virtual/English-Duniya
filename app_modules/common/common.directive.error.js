(function(){
	angular
		.module('common')
		.directive('widgetError',widgetError)

	function widgetError(CONSTANT){
		var error = {};
		error.restrict = 'E';
		error.templateUrl = CONSTANT.PATH.COMMON + '/common.error' + CONSTANT.VIEW;
		error.controller = ['$rootScope','$scope',function ($rootScope,$scope) {
			$scope.error = function(){
				return $rootScope.error;
			}
		}]
		return error;
	}
})();
