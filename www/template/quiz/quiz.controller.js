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

    quizCtrl.init = function (quiz) {
      // init report object
      quizCtrl.report = {};
      quizCtrl.report.quiz_id = quiz.info.id;
      quizCtrl.report.attempts = {};
      for (var i = 0; i < quiz.questions.length; i++) {
        quizCtrl.report.attempts[quiz.questions[i].info.id] = [];
      }
    }

    // traversing the question
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

    //log attempts & feedback
    quizCtrl.submit = function () {
      if(!quizCtrl.isCorrectAttempted(quizCtrl.quiz.questions[quizCtrl.currentIndex])){
        quizCtrl.submitAttempt(
          quizCtrl.quiz.questions[quizCtrl.currentIndex].info.id,
          quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted
        );
        quizCtrl.feedback(
          quizCtrl.quiz.questions[quizCtrl.currentIndex],
          quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted
        );
      }
      else{
        quizCtrl.nextQuestion();
      }
    }
    quizCtrl.feedback = function (question,attempt){
      if(quizCtrl.isCorrect(question,attempt)){
        quizCtrl.audio.play('correct');
      }
      else{
        quizCtrl.audio.play('wrong');
      }
    }
    quizCtrl.submitAttempt = function (question_id,attempt) {
      quizCtrl.report.attempts[question_id].push(attempt);
    }
    quizCtrl.isAttempted = function (question_id) {
      return quizCtrl.report.attempts[question_id].length ? true : false;
    }
    quizCtrl.isCorrect = function(question,attempt){
      // multiple choice
      if(question.info.content_type=='choice question' && question.info.question_type.is_multiple){
        return angular.equals(attempt.sort(),question.info.answer.sort());
      }
      // single choice
      if(question.info.content_type=='choice question' && !question.info.question_type.is_multiple){
        return attempt == question.info.answer[0];
      }
    }
    quizCtrl.isCorrectAttempted = function(question){
      // multiple choice
      if(question.info.content_type=='choice question' && question.info.question_type.is_multiple){
        // return true;
      }
      // single choice
      if(question.info.content_type=='choice question' && !question.info.question_type.is_multiple){
        return quizCtrl.report.attempts[question.info.id].indexOf(question.info.answer[0])!=-1 ? true : false;
      }
    }
    quizCtrl.isKeyCorrect = function(question,key,attempt){
        return question.info.answer.indexOf(key)!=-1 ? true : false;
    }
    quizCtrl.isKeyAttempted = function(question_id,key){
      return quizCtrl.report.attempts[question_id].indexOf(key)!=-1 ? true : false;
    }

    // initialisation call
    quizCtrl.setCurrentIndex(0);
    quizCtrl.init(quizCtrl.quiz);
  }
})();
