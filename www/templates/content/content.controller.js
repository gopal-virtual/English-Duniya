(function() {
  'use strict';

  angular
    .module('zaya-content')
    .controller('contentController', contentController);

  contentController.$inject = ['$stateParams', 'orientation', '$log','$scope'];

  /* @ngInject */
  function contentController($stateParams, orientation, $log, $scope) {
    var contentCtrl = this;
    contentCtrl.onPlayerReady = onPlayerReady;
    contentCtrl.config = {
      sources: [$stateParams.video],
      autoplay : true,
      plugins : {
          controls: {
              autoHide: true,
              autoHideTime: 500,
          },
      },
      theme: "lib/videogular-themes-default/videogular.css"
    };

    function onPlayerReady(API) {
      contentCtrl.API = API;
    }

    $scope.$on("$ionicView.beforeEnter", function(event, data) {
      orientation.setLandscape();
    });

  }

})();
