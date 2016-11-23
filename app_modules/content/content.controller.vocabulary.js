(function() {
    'use strict';

    angular
        .module('zaya-content')
        .controller('vocabularyCardController', vocabularyCardController);

    vocabularyCardController.$inject = ['$state','audio','$timeout','$interval','$scope','vocab_data'];

    /* @ngInject */
    function vocabularyCardController($state, audio, $timeout, $interval, $scope, vocab_data) {
        var vocabCardCtrl = this;
        vocabCardCtrl.prev = prev;
        vocabCardCtrl.next = next;
        vocabCardCtrl.submit = submit;
        vocabCardCtrl.currentIndex = 0;
        vocabCardCtrl.playDelayed = playDelayed;
        vocabCardCtrl.vocab_data = vocab_data;
        vocabCardCtrl.audio = audio;

        function prev () {
            vocabCardCtrl.currentIndex = (vocabCardCtrl.currentIndex > 0) ? --vocabCardCtrl.currentIndex : vocabCardCtrl.currentIndex;
        }

        function next () {
            vocabCardCtrl.currentIndex = (vocabCardCtrl.currentIndex < vocabCardCtrl.vocab_data.objects.length - 1 ) ? ++vocabCardCtrl.currentIndex : vocabCardCtrl.currentIndex;
        }

        function playDelayed (url) {
            $timeout(function(){
                vocabCardCtrl.audio.player.play(url)
            },100)
        }

        function submit () {}


    }
})();
