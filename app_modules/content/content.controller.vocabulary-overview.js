(function() {
    'use strict';

    angular
        .module('zaya-content')
        .controller('vocabularyOverviewController', vocabularyOverviewController);

    vocabularyOverviewController.$inject = ['$state','audio','$timeout','$interval','$scope','vocab_data'];

    /* @ngInject */
    function vocabularyOverviewController($state, audio, $timeout, $interval, $scope, vocab_data) {
        var vocabOverviewCtrl = this;
        vocabOverviewCtrl.currentIndex = -1;
        vocabOverviewCtrl.vocab_data = vocab_data;
        vocabOverviewCtrl.audio = audio;
        vocabOverviewCtrl.playDelayed = playDelayed;
        vocabOverviewCtrl.automateCard = automateCard;

        function playDelayed (url) {
            $timeout(function(){
                vocabOverviewCtrl.audio.player.play(url)
            },100)
        }

        function automateCard(index) {
            $interval(function(){
                ++vocabOverviewCtrl.currentIndex;
                $scope.$emit('changeCard')
            },2000,vocabOverviewCtrl.vocab_data.objects.length - 1 - vocabOverviewCtrl.currentIndex)
        }

        $scope.$on('changeCard', function(){
            $timeout(function(){
                vocabOverviewCtrl.audio.player.play(vocabOverviewCtrl.vocab_data.objects[vocabOverviewCtrl.currentIndex].sound)
            },200)
        })


        automateCard(vocabOverviewCtrl.currentIndex);


    }
})();
