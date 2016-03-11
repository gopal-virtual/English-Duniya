(function() {
  angular
    .module('zaya-quiz')
    .controller('QuizController', QuizController)

  QuizController.$inject = ['quiz','$stateParams', '$state', '$scope', 'audio'] ;

  function QuizController(quiz, $stateParams, $state, $scope, audio) {
    var quizCtrl = this;

    quizCtrl.quiz = quiz;
    quizCtrl.audio = audio;
    quizCtrl.init = init;

    // traversing the question
    quizCtrl.isCurrentIndex = isCurrentIndex;
    quizCtrl.setCurrentIndex = setCurrentIndex;
    quizCtrl.getCurrentIndex = getCurrentIndex;
    quizCtrl.prevQuestion = prevQuestion;
    quizCtrl.nextQuestion = nextQuestion;

    //log attempts & feedback
    quizCtrl.submit = submit;
    quizCtrl.canSubmit = canSubmit;
    quizCtrl.feedback = feedback;
    quizCtrl.submitAttempt = submitAttempt;
    quizCtrl.isAttempted = isAttempted;
    quizCtrl.isCorrect = isCorrect;
    quizCtrl.isCorrectAttempted = isCorrectAttempted;
    quizCtrl.isKeyCorrect = isKeyCorrect;
    quizCtrl.isKeyAttempted = isKeyAttempted;

    // initialisation call
    quizCtrl.setCurrentIndex(0);
    quizCtrl.init(quizCtrl.quiz);

    function init (quiz) {
      // init report object
      if($state.current.name=="quiz.summary"){
        quizCtrl.report = $stateParams.report;
      }
      else if($state.current.name=="quiz.questions"){
        quizCtrl.report = {};
        quizCtrl.report.quiz_id = quiz.info.id;
        quizCtrl.report.attempts = {};
        for (var i = 0; i < quiz.questions.length; i++) {
          quizCtrl.report.attempts[quiz.questions[i].info.id] = [];
        }
      }
      else{}
    }

    function isCurrentIndex (index) {
      return quizCtrl.currentIndex == index;
    }

    function setCurrentIndex(index) {
      quizCtrl.currentIndex = index;
    }

    function getCurrentIndex() {
      return quizCtrl.currentIndex;
    }

    function prevQuestion() {
      quizCtrl.currentIndex = (quizCtrl.currentIndex > 0) ? --quizCtrl.currentIndex : quizCtrl.currentIndex;
    }

    function nextQuestion() {
      quizCtrl.currentIndex = (quizCtrl.currentIndex < quizCtrl.quiz.questions.length - 1) ? ++quizCtrl.currentIndex : quizCtrl.currentIndex;
    }

    function submit() {
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
      else if(quizCtrl.currentIndex < quizCtrl.quiz.questions.length - 1){
        quizCtrl.nextQuestion();
      }
      else {
        // final question -> go to summary
        $state.go('quiz.summary',{report : angular.copy(quizCtrl.report)});
      }
    }

    function canSubmit(){
      // SCQ | DR
      if((quizCtrl.quiz.questions[quizCtrl.currentIndex].info.content_type == "choice question" && !quizCtrl.quiz.questions[quizCtrl.currentIndex].info.question_type.is_multiple) || quizCtrl.quiz.questions[quizCtrl.currentIndex].info.content_type == "dr question"){
        return quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted;
      }
      // MCQ
      if(quizCtrl.quiz.questions[quizCtrl.currentIndex].info.content_type == "choice question" && quizCtrl.quiz.questions[quizCtrl.currentIndex].info.question_type.is_multiple){
        //removes false keys
        quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted = _.pick(quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted, _.identity);
        // true if attempted and key count is more than one
        return quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted && _.size(quizCtrl.quiz.questions[quizCtrl.currentIndex].attempted)>1;
      }
    }

    function feedback (question,attempt){
      return quizCtrl.isCorrect(question,attempt) ? quizCtrl.audio.play('correct') : quizCtrl.audio.play('wrong') ;
    }

    function submitAttempt (question_id,attempt) {
      quizCtrl.report.attempts[question_id].push(attempt);
    }

    function isAttempted (question_id) {
      return quizCtrl.report.attempts[question_id].length ? true : false;
    }

    function isCorrect(question,attempt){
      // multiple choice
      if(question.info.content_type=='choice question' && question.info.question_type.is_multiple){
        return _.chain(attempt).map(function(num,key){return parseInt(key);}).isEqual(question.info.answer).value();
      }
      // single choice
      if(question.info.content_type=='choice question' && !question.info.question_type.is_multiple){
        return attempt == question.info.answer[0];
      }
      // dr
      if(question.info.content_type=='dr question'){
        return attempt == question.info.answer[0];
      }
    }

    function isCorrectAttempted (question){
      // multiple choice
      if(question.info.content_type=='choice question' && question.info.question_type.is_multiple){
        for (var i = 0; i < quizCtrl.report.attempts[question.info.id].length; i++) {
          if(_.chain(quizCtrl.report.attempts[question.info.id][i]).map(function(num,key){return parseInt(key);}).isEqual(question.info.answer).value())
            return true;
        }
        return false;
      }
      // single choice
      if(question.info.content_type=='choice question' && !question.info.question_type.is_multiple){
        return quizCtrl.report.attempts[question.info.id].indexOf(question.info.answer[0])!=-1 ? true : false;
      }
      // dr
      if(question.info.content_type=='dr question'){
        return quizCtrl.report.attempts[question.info.id].indexOf(question.info.answer[0].toLowerCase())!=-1 ? true : false;
      }
    }

    function isKeyCorrect (question,key){
        return question.info.answer.indexOf(key)!=-1 ? true : false;
    }

    function isKeyAttempted (question,key){
      if(question.info.question_type.is_multiple){
        return _.chain(quizCtrl.report.attempts[question.info.id]).last().has(key).value();
      }
      else{
        return quizCtrl.report.attempts[question.info.id].indexOf(key)!=-1 ? true : false;
      }
    }
  }
})();
