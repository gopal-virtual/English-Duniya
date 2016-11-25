(function() {
    'use strict';

    angular
        .module('zaya-content')
        .controller('vocabularyOverviewController', vocabularyOverviewController);

    vocabularyOverviewController.$inject = ['$log', '$state','audio','$timeout','$interval','$scope','vocab_data', 'CONSTANT'];

    /* @ngInject */
    function vocabularyOverviewController($log, $state, audio, $timeout, $interval, $scope, vocab_data, CONSTANT) {
        var vocabOverviewCtrl = this;
        vocabOverviewCtrl.currentIndex = -1;
        vocabOverviewCtrl.vocab_data = vocab_data;
        vocabOverviewCtrl.audio = audio;
        vocabOverviewCtrl.playDelayed = playDelayed;
        vocabOverviewCtrl.automateCard = automateCard;
        vocabOverviewCtrl.CONSTANT = CONSTANT;

        function playDelayed (url) {
            $timeout(function(){
                vocabOverviewCtrl.audio.player.play(url)
            },100)
        }

        function automateCard(index) {
            $interval(function(){
                ++vocabOverviewCtrl.currentIndex;
                $scope.$emit('changeCard', vocabOverviewCtrl.vocab_data[vocabOverviewCtrl.currentIndex].node.type.sound)
                if(vocabOverviewCtrl.currentIndex == vocabOverviewCtrl.vocab_data.length - 1 ){
                    $timeout(function(){
                        $state.go('content.vocabulary.instruction',{})
                    },2500)
                }
            },3000,vocabOverviewCtrl.vocab_data.length - 1 - vocabOverviewCtrl.currentIndex)
        }

        $scope.$on('changeCard', function(event, sound){
            $log.debug('sound',sound)
            $timeout(function(){
                vocabOverviewCtrl.audio.player.chain(CONSTANT.BACKEND_SERVICE_DOMAIN + sound[0].path,CONSTANT.BACKEND_SERVICE_DOMAIN + sound[1].path)
            },200)
        })


        automateCard(vocabOverviewCtrl.currentIndex);


    }
})();
