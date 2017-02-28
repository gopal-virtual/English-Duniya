(function() {
    'use strict';

    angular
        .module('common')
        .directive('ribbonConfirm', ribbonConfirm);

    /* @ngInject */
    function ribbonConfirm(CONSTANT,$log) {
        var directive = {
            restrict: 'E',
            templateUrl: CONSTANT.PATH.COMMON + '/common.ribbon-confirm' + CONSTANT.VIEW,
            scope: {
                'message' : '=',
                'confirm' : '=',
                'dismiss' : '=',
                'lefticon' : '='
            },
            link: linkFunc,
            controller: ribbonConfirmController,
            controllerAs: 'ribbonCnfCtrl',
            bindToController: true
        };

        return directive;
    }

    function linkFunc(scope, el, attr, ctrl) {
        // scope.message = ctrl.message;
        // scope.confirm = ctrl.confirm;
        // scope.dismiss = ctrl.dismiss;
        // $log.warn('CONFIRM3',scope)
    }

    ribbonConfirmController.$inject = ['$log','$scope','User','audio'];

    /* @ngInject */
    function ribbonConfirmController($log, $scope, User, audio) {
        var ribbonCnfCtrl = this;
        $scope.user = User;
        $scope.audio = audio;
        $log.debug('CONFIRM',$scope);
        $scope.confirm = ribbonCnfCtrl.confirm;
        $scope.dismiss = ribbonCnfCtrl.dismiss;
        $scope.userGender = User.getActiveProfileSync() ? User.getActiveProfileSync().data.profile.gender : 'M';

        function dismiss(){
            $log.warn('CONFIRM2',$scope)
        }


        $log.debug('RIBBON CONFIRM', ribbonCnfCtrl)
        ribbonCnfCtrl.lefticon = ribbonCnfCtrl.lefticon ? ribbonCnfCtrl.lefticon : 'sbtn-correct';
    }
})();
