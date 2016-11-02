(function() {
  'use strict';

  angular
    .module('zaya-content')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
      .state('content', {
          url : '/content',
          abstract : true,
          template : '<ion-nav-view name="state-content"></ion-nav-view>'
      })
      .state('content.video', {
          url : '/video',
          nativeTransitions: null,
          params: {
            video: null,
          },
          onEnter: ['orientation','audio', function(orientation, audio) {
            orientation.setLandscape();
            audio['demo-2'].stop();
          }],
          views : {
              'state-content' : {
                  templateUrl : CONSTANT.PATH.CONTENT + '/content.video' + CONSTANT.VIEW,
                  controller : 'contentController as contentCtrl'
              }
          }
      })
  }
})();
