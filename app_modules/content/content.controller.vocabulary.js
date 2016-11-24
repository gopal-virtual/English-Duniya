(function() {
    'use strict';

    angular
        .module('zaya-content')
        .controller('vocabularyCardController', vocabularyCardController);

    vocabularyCardController.$inject = ['$log', '$state','audio','$timeout','$interval','$scope','vocab_data', 'CONSTANT'];

    /* @ngInject */
    function vocabularyCardController($log, $state, audio, $timeout, $interval, $scope, vocab_data, CONSTANT) {
        var vocabCardCtrl = this;
        vocabCardCtrl.prev = prev;
        vocabCardCtrl.next = next;
        vocabCardCtrl.submit = submit;
        vocabCardCtrl.currentIndex = 0;
        vocabCardCtrl.playDelayed = playDelayed;
        vocabCardCtrl.vocab_data = vocab_data;
        vocabCardCtrl.audio = audio;
        vocabCardCtrl.CONSTANT = CONSTANT;

        $log.debug('vocab lesson',vocabCardCtrl.vocab_data);

        function prev () {
            $log.debug('Clicked : Prev')
            vocabCardCtrl.currentIndex = (vocabCardCtrl.currentIndex > 0) ? --vocabCardCtrl.currentIndex : vocabCardCtrl.currentIndex;
        }

        function next () {
            $log.debug('Clicked : Next')
            vocabCardCtrl.currentIndex = (vocabCardCtrl.currentIndex < vocabCardCtrl.vocab_data.length - 1 ) ? ++vocabCardCtrl.currentIndex : vocabCardCtrl.currentIndex;
        }

        function playDelayed (sound) {
            $timeout(function(){
                vocabCardCtrl.audio.player.chain(CONSTANT.BACKEND_SERVICE_DOMAIN + sound[0].path,CONSTANT.BACKEND_SERVICE_DOMAIN + sound[1].path)
            },100)
        }

        function submit () {}


    }
})();
