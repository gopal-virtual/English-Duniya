(function() {
    'use strict';

    angular
        .module('zaya-map')
        .directive('mapCanvas', mapCanvas)

    /* @ngInject */
    function mapCanvas($injector, $state, $timeout, $log, audio, CONSTANT, lessonutils, $ionicLoading, analytics, localized, User) {
        var mapCanvas = {
            restrict: 'A',
            templateUrl: CONSTANT.PATH.MAP + '/map.canvas' + CONSTANT.VIEW,
            scope: {
              lessons : '=mapLessons',
              totalstars : '=mapTotalstars',
              demo : '=mapDemo',
              mediaSyncStatus : '=mediaSync',
            },
            link: linkFunc,
        };

        return mapCanvas;

        function linkFunc(scope, el, attr, ctrl) {
          $log.debug("Scoe Directive",scope);
            $timeout(
              function(){
                var demoAudio  = CONSTANT.PATH.LOCALIZED_AUDIO+localized.audio.demo.StartEnglish.lang[User.getActiveProfileSync().data.profile.language];
                  createGame(scope, scope.lessons, audio, $injector, $log, lessonutils, $ionicLoading, analytics, demoAudio)
              }
            );
        }
    }

})();
