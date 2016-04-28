(function() {
  angular
    .module('zaya-quiz')
    .controller('QuizController', QuizController)

  QuizController.$inject = ['quiz','$stateParams', '$state', '$scope', 'audio','$log','$ionicModal', 'CONSTANT', '$ionicSlideBoxDelegate'] ;

  function QuizController(quiz, $stateParams, $state, $scope, audio, $log, $ionicModal, CONSTANT, $ionicSlideBoxDelegate) {
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
    quizCtrl.decide = decide;
    quizCtrl.canSubmit = canSubmit;
    quizCtrl.feedback = feedback;
    quizCtrl.submitAttempt = submitAttempt;
    quizCtrl.isAttempted = isAttempted;
    quizCtrl.isCorrect = isCorrect;
    quizCtrl.isCorrectAttempted = isCorrectAttempted;
    quizCtrl.isKeyCorrect = isKeyCorrect;
    quizCtrl.isKeyAttempted = isKeyAttempted;
    quizCtrl.attemptAndNext = attemptAndNext;

    // initialisation call
    quizCtrl.setCurrentIndex(0);
    quizCtrl.init(quizCtrl.quiz);

    //audio
    quizCtrl.playAudio = playAudio;

    //question layouts
    quizCtrl.GRID_TYPE = ['audio_to_text','text_to_pic','pic_to_text','audio_to_pic'];
    quizCtrl.LIST_TYPE = ['audio_to_text_longer','text_to_pic_longer','pic_to_text_longer','audio_to_pic_longer'];


    quizCtrl.slideHasChanged = slideHasChanged;
    quizCtrl.slideTo = slideTo;

    $scope.modal = {};

    function init (quiz) {

      // init report object
      if($state.current.name=="quiz.summary"){
        quizCtrl.report = $stateParams.report;
        quizCtrl.report = {"quiz_id":"10014638-8567-4a33-814a-1b7bfedf0664","attempts":{"cbe39272-ccbd-4e05-9532-d53699ec59cd":[3],"61524a03-4acd-4b1d-ae96-96702387e7e3":[3],"5b66574b-621b-435e-a812-db7be6a94dfd":[3],"cda26918-b9d4-4120-afe4-1e627691454f":[3],"1eac2901-3f1a-4e48-b2cb-706964aece32":[3]}};
        // Quiz.saveReport(quizCtrl.report);

        // quizCtrl.report =
        $log.debug(JSON.stringify(quizCtrl.report));
      }
      else if($state.current.name=="quiz.questions"){
        $log.debug(quizCtrl.quiz);
        quizCtrl.report = {};
        quizCtrl.report.quiz_id =  quiz.node.id;
        quizCtrl.report.attempts = {};
        for (var i = 0; i < quiz.objects.length; i++) {
          quizCtrl.report.attempts[quiz.objects[i].node.id] = [];
        }
        // init attempted

        for (var i = 0; i < quizCtrl.quiz.objects.length; i++) {
          if(i!= 0)
          quizCtrl.quiz.objects[i].isVisited = false;
          else
          quizCtrl.quiz.objects[i].isVisited = true;

          if((quizCtrl.quiz.objects[i].node.type.type=='choicequestion' && !quizCtrl.quiz.objects[i].node.type.content.is_multiple) /*|| quizCtrl.quiz.objects[i].node.content_type=='dr question'*/){
            quizCtrl.quiz.objects[i].attempted = "";
          }
          else if(quizCtrl.quiz.objects[i].node.type.type=='choicequestion' && quizCtrl.quiz.objects[i].node.type.content.is_multiple){
            quizCtrl.quiz.objects[i].attempted = {};
          }
          //else if(quizCtrl.quiz.objects[i].node.content_type=='sentence ordering' || quizCtrl.quiz.objects[i].node.content_type=='sentence structuring'){
          //  quizCtrl.quiz.objects[i].attempted = [];
          //}
          else{}
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

      quizCtrl.currentIndex = (quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1) ? ++quizCtrl.currentIndex : quizCtrl.currentIndex;
    }

    function decide() {
      if(!quizCtrl.isCorrectAttempted(quizCtrl.quiz.objects[quizCtrl.currentIndex])){
        $log.debug("!quizCtrl.isCorrectAttempted");
        quizCtrl.submitAttempt(
          quizCtrl.quiz.objects[quizCtrl.currentIndex].node.id,
          quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
        );
        quizCtrl.feedback(
          quizCtrl.quiz.objects[quizCtrl.currentIndex],
          quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
        );
      }
      else if(quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1){
        quizCtrl.nextQuestion();
      }
      else {
        // final question -> go to summary
        $state.go('quiz.summary',{report : angular.copy(quizCtrl.report)});
      }
    }

    function canSubmit(){

      // SCQ | DR
      if((quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && !quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple) || quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "dr question"){
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted;
      }
      // MCQ
      if(quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple){
        //removes false keys
        quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted = _.pick(quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted, _.identity);
        // true if attempted and key count is more than one
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted && _.size(quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted)>1;
      }
      if(quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "sentence ordering" || quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "sentence structuring"){
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted.length ? true : false;
      }
    }

    function feedback (question,attempt){

      return quizCtrl.isCorrect(question,attempt) ?   $scope.openModal('correct') : $scope.openModal('wrong') ;
    }

    function submitAttempt (question_id,attempt) {
      quizCtrl.report.attempts[question_id].push(angular.copy(attempt));
    }

    function isAttempted (question_id) {
      return quizCtrl.report.attempts[question_id].length ? true : false;
    }

    function isCorrect(question,attempt){

      // multiple choice
      if(question.node.type.type=='choicequestion' && question.node.type.content.is_multiple){
        return _.chain(attempt).map(function(num,key){return parseInt(key);}).isEqual(question.node.type.answer).value();
      }
      // single choice
      if(question.node.type.type=='choicequestion' && !question.node.type.content.is_multiple){
        return attempt == question.node.type.answer[0];
      }
      // dr
      if(question.node.type.type=='dr question'){
        return attempt == question.node.type.answer[0];
      }
      // sor | sst
      if(question.node.type.type=='sentence ordering' || question.node.type.type=='sentence structuring'){
        return angular.equals(question.node.type.answer,attempt);
      }
    }

    function isCorrectAttempted (question){
      // multiple choice

      if(question.node.type.type=='choicequestion' && question.node.type.content.is_multiple){
        for (var i = 0; i < quizCtrl.report.attempts[question.node.id].length; i++) {
          if(_.chain(quizCtrl.report.attempts[question.node.id][i]).map(function(num,key){return num?parseInt(key):false;}).reject(function(num){ return !num; }).isEqual(question.node.type.answer).value())
            return true;
        }
        return false;
      }
      // single choice
      if(question.node.type.type=='choicequestion' && !question.node.type.content.is_multiple){
        return quizCtrl.report.attempts[question.node.id].indexOf(question.node.type.answer[0])!=-1 ?(true) : false;
      }
      // to be tested for new api
      // dr
      //if(question.node.type.type=='dr question'){
      //  return quizCtrl.report.attempts[question.node.id].indexOf(question.node.type.answer[0].toLowerCase())!=-1 ? true : false;
      //}
      //if(question.node.type.type=='sentence ordering' || question.node.type.type=='sentence structuring'){
      //  for (var i = 0; i < quizCtrl.report.attempts[question.node.id].length; i++) {
      //    if(angular.equals(quizCtrl.report.attempts[question.node.id][i],question.node.type.answer))
      //      return true;
      //  }
      //  return false;
      //}
    }

    function isKeyCorrect (question,key){

      return question.node.type.answer.indexOf(key)!=-1 ? true : false;
    }

    function isKeyAttempted (question,key){

      if(question.node.type.content.is_multiple){
        return _.chain(quizCtrl.report.attempts[question.node.id]).last().has(key).value();
      }
      else{
        return quizCtrl.report.attempts[question.node.id].indexOf(key)!=-1 ? true : false;
      }
    }

    function playAudio(key){
      angular.element("#audioplayer")[0].pause();
      if(key)
      {
        angular.element("#audioSource")[0].src = key;
      }
      else{
        angular.element("#audioSource")[0].src = 'sound/water-drop.mp3';
      }
      angular.element("#audioplayer")[0].load();
      angular.element("#audioplayer")[0].play();
    }


    $ionicModal.fromTemplateUrl(CONSTANT.PATH.QUIZ + '/quiz.feedback' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function()
    {
      $scope.modal.show();
      return true;
    };
    $scope.closeModal = function()
    {
      $scope.modal.hide();
    }

    function attemptAndNext(){
      quizCtrl.submitAttempt(
        quizCtrl.quiz.objects[quizCtrl.currentIndex].node.id,
        quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
      );

      if(quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1){
        $ionicSlideBoxDelegate.next();
      }
      else {
        // final question -> go to summary
        $state.go('quiz.summary',{report : angular.copy(quizCtrl.report)});
      }
    }


    function slideHasChanged(index){
      quizCtrl.setCurrentIndex(index);
      quizCtrl.quiz.objects[index].isVisited = true;
    }
    function slideTo(index) {
      $ionicSlideBoxDelegate.slide(index);
    }
  }
})();
