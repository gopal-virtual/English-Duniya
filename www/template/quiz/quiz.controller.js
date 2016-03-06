(function() {
  angular
    .module('zaya')
    .controller('QuizController', QuizController)

  QuizController.$inject = ['quiz','$stateParams', '$state', '$scope', 'audio'] ;

  function QuizController(quiz, $stateParams, $state, $scope, audio) {
    var quizCtrl = this;

    quizCtrl.quiz = quiz;
    quizCtrl.audio = audio;
    var quizQuestions = quizCtrl.quiz.questions;

    quizCtrl.isCurrentIndex = function(index) {
      return quizCtrl.currentIndex == index;
    }
    quizCtrl.setCurrentIndex = function(index) {
      quizCtrl.currentIndex = index;
    }
    quizCtrl.getCurrentIndex = function () {
      return quizCtrl.currentIndex;
    }
    quizCtrl.prevQuestion = function() {
      quizCtrl.currentIndex = (quizCtrl.currentIndex > 0) ? --quizCtrl.currentIndex : quizCtrl.currentIndex;
    }
    quizCtrl.nextQuestion = function() {
      quizCtrl.currentIndex = (quizCtrl.currentIndex < quizQuestions.length - 1) ? ++quizCtrl.currentIndex : quizCtrl.currentIndex;
    }
    quizCtrl.setCurrentIndex(0);
  }
})();
