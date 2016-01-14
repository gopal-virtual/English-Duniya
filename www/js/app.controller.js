(function () {
  'use strict';

  angular
    .module('todo')
    .controller('todoController',todoController);

    todoController.$inject = ['$scope','$ionicModal'];

    function todoController($scope,$ionicModal){
        var main = this;
        main.task = [];
        $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
            main.taskModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        main.createTask = function(task) {
            main.task.push({
                name: task.name
            });
            main.taskModal.hide();
            task.name = "";
        };

        // Open our new task modal
        main.newTask = function() {
            main.taskModal.show();
        };

        // Close the new task modal
        main.closeNewTask = function() {
            main.taskModal.hide();
        };
    }

})();
