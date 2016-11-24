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
      .state('content.vocabulary',{
          url : '/vocabulary',
          abstract : true,
          resolve : {
              vocab_data : ['$log', 'Rest',function($log, Rest){
                //   https://cc-test.zaya.in/api/v1/accounts/0429fb91-4f3c-47de-9adb-609996962188/lessons/a5be805c-8b2c-48dd-8efa-ad2588b03c99/
                  return Rest.one('accounts','0429fb91-4f3c-47de-9adb-609996962188').one('lessons','a5be805c-8b2c-48dd-8efa-ad2588b03c99')
                  .get().then(function(response){
                      $log.debug('card', response.plain())
                      return response.plain().objects[1].objects;
                  })

              }]
          },
          views : {
              'state-content' : {
                  template : '<ion-nav-view name="state-vocab"></ion-nav-view>'
              }
          }
      })
      .state('content.vocabulary.overview', {
          url : '/overview',
          nativeTransitions : null,
          onEnter : ['orientation',function(orientation){
              orientation.setLandscape();
          }],
          views : {
              'state-vocab' : {
                  templateUrl : CONSTANT.PATH.CONTENT + '/content.vocabulary.overview' + CONSTANT.VIEW,
                  controller : 'vocabularyOverviewController as vocabOverviewCtrl'
              }
          }
      })
      .state('content.vocabulary.card', {
          url : '/card',
          nativeTransitions : null,
          onEnter : ['orientation',function(orientation){
              orientation.setLandscape();
          }],
          views : {
              'state-vocab' : {
                  templateUrl : CONSTANT.PATH.CONTENT + '/content.vocabulary' + CONSTANT.VIEW,
                  controller : 'vocabularyCardController as vocabCardCtrl'
              }
          }
      })
  }
})();
