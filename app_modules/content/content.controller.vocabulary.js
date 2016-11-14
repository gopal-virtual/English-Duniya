(function() {
    'use strict';

    angular
        .module('zaya-content')
        .controller('vocabularyController', vocabularyController);

    vocabularyController.$inject = ['$state'];

    /* @ngInject */
    function vocabularyController($state) {
        var vocabCtrl = this;
        vocabCtrl.prev = prev;
        vocabCtrl.next = next;
        vocabCtrl.submit = submit;
        vocabCtrl.currentIndex = 0;
        vocabCtrl.vocab_data = $state.current.data.vocab_data;

        function prev () {
            vocabCtrl.currentIndex = (vocabCtrl.currentIndex > 0) ? --vocabCtrl.currentIndex : vocabCtrl.currentIndex;
        }

        function next () {
            vocabCtrl.currentIndex = (vocabCtrl.currentIndex < vocabCtrl.vocab_data.objects.length - 1 ) ? ++vocabCtrl.currentIndex : vocabCtrl.currentIndex;
        }

        function submit () {}


    }
})();
