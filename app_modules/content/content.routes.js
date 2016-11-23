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
              vocab_data : function(){
                  return {
                      node : {
                          title : "Vocabulary, Ambulance, chocolate etc",
                          background : "rgb(38, 31, 94)",
                          intro : CONSTANT.ASSETS.SOUND + '/vocab-intro.mp3'
                      },
                      objects : [
                          {
                              title : "AMBULANCE",
                              image : CONSTANT.ASSETS.IMG.TEMP + '/ambulance.png',
                              sound : CONSTANT.ASSETS.SOUND + '/ambulance.mp3',
                              color : "rgb(42, 151, 213)"
                          },
                          {
                              title : "chocolate",
                              image : CONSTANT.ASSETS.IMG.TEMP + '/chocolate.png',
                              sound : CONSTANT.ASSETS.SOUND + '/chocolate.mp3',
                              color : "rgb(213, 129, 42)"
                          },
                          {
                              title : "Hat",
                              image : CONSTANT.ASSETS.IMG.TEMP + '/hat.png',
                              sound : CONSTANT.ASSETS.SOUND + '/hat.mp3',
                              color : "rgb(187, 150, 255)"
                          },
                          {
                              title : "ice-cream",
                              image : CONSTANT.ASSETS.IMG.TEMP + '/ice_cream.png',
                              sound : CONSTANT.ASSETS.SOUND + '/ice-cream.mp3',
                              color : "rgb(189, 213, 42)"
                          },
                          {
                              title : "Hat",
                              image : CONSTANT.ASSETS.IMG.TEMP + '/hat.png',
                              sound : CONSTANT.ASSETS.SOUND + '/hat.mp3',
                              color : "rgb(255, 217, 120)"
                          },
                          {
                              title : "ice-cream",
                              image : CONSTANT.ASSETS.IMG.TEMP + '/ice_cream.png',
                              sound : CONSTANT.ASSETS.SOUND + '/ice-cream.mp3',
                              color : "rgb(135, 7, 76)"
                          }
                      ]
                  }
              }
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
