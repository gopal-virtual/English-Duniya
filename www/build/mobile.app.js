// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
(function () {
  'use strict';

  angular
    .module('todo', ['ionic'])

})();

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

(function(){
  'use strict';

  runConfig.$inject = ["$ionicPlatform"];
  angular
    .module('todo')
    .run(runConfig);

  function runConfig($ionicPlatform) {
    $ionicPlatform.ready(function() {
      if(window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  }

})();
