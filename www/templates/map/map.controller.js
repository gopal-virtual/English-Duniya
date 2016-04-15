(function() {
    'use strict';

    angular
        .module('zaya-map')
        .controller('mapController', mapController);

    mapController.$inject = ['$scope','$log','$ionicPopup'];

    function mapController($scope,$log, $ionicPopup) {
        var mapCtrl = this;
        mapCtrl.nodeDetails = [
          { name : 'Video', icon : 'video', type : 'video'},
          { name : 'Quiz', icon : 'quiz' , type : 'quiz'},
          { name : 'Practice', icon : 'practice', type : 'practice'},
        ]
        $scope.$on('openNode',function (arg) {
          $ionicPopup.show({
            title: "<strong>Node Name</strong>",
            scope: $scope,
            template: '<button class="button button-energized button-block" ng-repeat="node in mapCtrl.nodeDetails">{{node.name}}</button>',
            buttons : [
              { text : 'Cancel', type: 'button-assertive'}
            ]
          });
        })
    }
})();
