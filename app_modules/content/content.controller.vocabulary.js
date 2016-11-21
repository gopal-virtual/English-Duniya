(function() {
    'use strict';

    angular
        .module('zaya-content')
        .controller('vocabularyController', vocabularyController);

    vocabularyController.$inject = ['$state','audio','$timeout','$interval','$scope'];

    /* @ngInject */
    function vocabularyController($state, audio, $timeout, $interval, $scope) {
        var vocabCtrl = this;
        vocabCtrl.prev = prev;
        vocabCtrl.next = next;
        vocabCtrl.submit = submit;
        vocabCtrl.currentIndex = 0;
        vocabCtrl.vocab_data = $state.current.data.vocab_data;
        vocabCtrl.audio = audio;
        vocabCtrl.playDelayed = playDelayed;
        vocabCtrl.automateCard = automateCard

        function prev () {
            vocabCtrl.currentIndex = (vocabCtrl.currentIndex > 0) ? --vocabCtrl.currentIndex : vocabCtrl.currentIndex;
        }

        function next () {
            vocabCtrl.currentIndex = (vocabCtrl.currentIndex < vocabCtrl.vocab_data.objects.length - 1 ) ? ++vocabCtrl.currentIndex : vocabCtrl.currentIndex;
        }

        function playDelayed (url) {
            $timeout(function(){
                vocabCtrl.audio.player.play(url)
            },100)
        }

        function automateCard(index) {
            $interval(function(){
                ++vocabCtrl.currentIndex;
                $scope.$emit('changeCard')
            },2000,vocabCtrl.vocab_data.objects.length - 1 - vocabCtrl.currentIndex)
        }

        $scope.$on('changeCard', function(){
            $timeout(function(){
                // vocabCtrl.audio.player.play(vocabCtrl.vocab_data.objects[vocabCtrl.currentIndex].sound)
            },200)
        })


        // automateCard(vocabCtrl.currentIndex);

        function submit () {}


    }
})();
