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

        $log.debug('vocab state params',$stateParams)

        function playDelayed (url) {
            $timeout(function(){
                vocabOverviewCtrl.audio.player.play(url)
            },100)
        }

        function automateCard(index, sequence) {
            if(vocabOverviewCtrl.currentIndex == -1){
                ++vocabOverviewCtrl.currentIndex;
                $scope.$emit('changeCard', vocabOverviewCtrl.vocab_data[vocabOverviewCtrl.currentIndex].node.type.sound)
                $timeout(function(){
                    automateCard(vocabOverviewCtrl.currentIndex);
                },3000)
            }
            else{
                $interval(function(){
                    ++vocabOverviewCtrl.currentIndex;
                    $scope.$emit('changeCard', vocabOverviewCtrl.vocab_data[vocabOverviewCtrl.currentIndex].node.type.sound)
                    if(vocabOverviewCtrl.currentIndex == vocabOverviewCtrl.vocab_data.length - 1 ){
                        $timeout(function(){
                            $state.go('content.vocabulary.instruction',{})
                        },2500)
                    }
                },5000,vocabOverviewCtrl.vocab_data.length - 1 - vocabOverviewCtrl.currentIndex)
            }
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
