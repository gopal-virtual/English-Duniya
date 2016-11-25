(function() {
    'use strict';

    angular
        .module('zaya-content')
        .controller('vocabularyCardController', vocabularyCardController);

    vocabularyCardController.$inject = ['$log', '$state','audio','$timeout','$interval','$scope','$stateParams', 'CONSTANT'];

    /* @ngInject */
    function vocabularyCardController($log, $state, audio, $timeout, $interval, $scope, $stateParams, CONSTANT) {
        var vocabCardCtrl = this;
        vocabCardCtrl.prev = prev;
        vocabCardCtrl.next = next;
        vocabCardCtrl.submit = submit;
        vocabCardCtrl.currentIndex = 0;
        vocabCardCtrl.playDelayed = playDelayed;
        vocabCardCtrl.vocab_data = $stateParams.vocab_data.objects;
        vocabCardCtrl.audio = audio;
        vocabCardCtrl.CONSTANT = CONSTANT;
        vocabCardCtrl.getSoundArr = getSoundArr;

        $log.debug('vocab lesson',vocabCardCtrl.vocab_data);

        function prev () {
            $log.debug('Clicked : Prev')
            vocabCardCtrl.currentIndex = (vocabCardCtrl.currentIndex > 0) ? --vocabCardCtrl.currentIndex : vocabCardCtrl.currentIndex;
        }

        function next () {
            $log.debug('Clicked : Next')
            vocabCardCtrl.currentIndex = (vocabCardCtrl.currentIndex < vocabCardCtrl.vocab_data.length - 1 ) ? ++vocabCardCtrl.currentIndex : vocabCardCtrl.currentIndex;
        }

        function getSoundArr (soundArr) {
            var soundArrPath = [];
            for (var i = 0; i < soundArr.length; i++) {
                soundArrPath.push(CONSTANT.BACKEND_SERVICE_DOMAIN + soundArr[i].path)
            }
            return soundArrPath;
        }
        function playDelayed (sound) {
            $timeout(function(){
                vocabCardCtrl.audio.player.chain( 0, getSoundArr(sound) )
            },100)
        }

        playDelayed(vocabCardCtrl.vocab_data[vocabCardCtrl.currentIndex].node.type.sound);

        function submit () {}


    }
})();
