(function() {
    'use strict';

    angular
        .module('zaya-content')
        .controller('vocabularyOverviewController', vocabularyOverviewController);

    vocabularyOverviewController.$inject = ['$log', '$state', '$stateParams', 'audio','$timeout','$interval','$scope', 'CONSTANT'];

    /* @ngInject */
    function vocabularyOverviewController($log, $state, $stateParams,  audio, $timeout, $interval, $scope, CONSTANT) {
        var vocabOverviewCtrl = this;
        vocabOverviewCtrl.currentIndex = -1;
        vocabOverviewCtrl.vocab_data = $stateParams.vocab_data.objects;
        vocabOverviewCtrl.audio = audio;
        vocabOverviewCtrl.playDelayed = playDelayed;
        vocabOverviewCtrl.automateCard = automateCard;
        vocabOverviewCtrl.CONSTANT = CONSTANT;
        vocabOverviewCtrl.getSoundArr = getSoundArr;
        var timeout = '';

        $log.debug('vocab state params',$stateParams)

        function playDelayed (url) {
            $timeout(function(){
                vocabOverviewCtrl.audio.player.play(url)
            },100)
        }

        function setCurrentIndex(index){
            vocabOverviewCtrl.currentIndex = index;
        }

        function getSoundArr (soundArr) {
            var soundArrPath = [];
            for (var i = 0; i < soundArr.length; i++) {
                soundArrPath.push(soundArr[i].path)
            }
            return soundArrPath;
        }

        function automateCard() {
            var sound = vocabOverviewCtrl.vocab_data[vocabOverviewCtrl.currentIndex].node.type.sound;
            vocabOverviewCtrl.audio.player.chain(
                0, getSoundArr(sound),
                function(){
                    if(vocabOverviewCtrl.currentIndex < vocabOverviewCtrl.vocab_data.length - 1){
                        timeout = $timeout(function(){
                            ++vocabOverviewCtrl.currentIndex;
                            vocabOverviewCtrl.automateCard()
                        },1000)
                    }
                    else{
                        $state.go('content.vocabulary.instruction',{})
                    }
            })
        }

        ++vocabOverviewCtrl.currentIndex;
        automateCard();

        $scope.$on('appResume', function(){
            setCurrentIndex(0);
            automateCard();
        })
        $scope.$on('appPause', function(){
            vocabOverviewCtrl.audio.player.removeCallback();
            $timeout.cancel( timeout );
        })

    }
})();
