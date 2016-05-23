(function() {
  angular
    .module('zaya-quiz')
    .controller('QuizController', QuizController)

  QuizController.$inject = ['quiz', '$stateParams', '$state', '$scope', 'audio', '$log', '$ionicModal', 'CONSTANT', '$ionicSlideBoxDelegate', 'Utilities', 'Quiz', 'Auth', '$ionicLoading', '$ionicPopup', 'lessonutils', 'orientation', '$location', '$anchorScroll', '$document', '$ionicScrollDelegate', '$ionicPosition', '$timeout', '$window', 'soundManager', '$cordovaFileTransfer', '$cordovaFile'];

  function QuizController(quiz, $stateParams, $state, $scope, audio, $log, $ionicModal, CONSTANT, $ionicSlideBoxDelegate, Utilities, Quiz, Auth, $ionicLoading, $ionicPopup, lessonutils, orientation, $location, $anchorScroll, $document, $ionicScrollDelegate, $ionicPosition, $timeout, $window, soundManager, $cordovaFileTransfer, $cordovaFile) {
    $scope.$on("$ionicView.beforeEnter", function(event, data) {
      orientation.setPortrait();
    });
    audio.stop('background');
    $scope.orientation = orientation;
    var quizCtrl = this;

    quizCtrl.quiz = quiz;
    quizCtrl.audio = audio;
    $scope.audio = audio;
    quizCtrl.init = init;

    // traversing the question
    quizCtrl.isCurrentIndex = isCurrentIndex;
    quizCtrl.setCurrentIndex = setCurrentIndex;
    quizCtrl.getCurrentIndex = getCurrentIndex;
    quizCtrl.prevQuestion = prevQuestion;
    quizCtrl.nextQuestion = nextQuestion;
    quizCtrl.disableSwipe = disableSwipe;
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
    quizCtrl.calculateResult = calculateResult;
    quizCtrl.MARKS_MULTIPIER = 10;
    quizCtrl.quizResult = {};
    quizCtrl.utilities = Utilities;
    quizCtrl.submitQuiz = submitQuiz;
    quizCtrl.endQuiz = endQuiz;
    // quizCtrl.pauseQuiz = pauseQuiz;
    quizCtrl.restartQuiz = restartQuiz;
    quizCtrl.CONSTANT = CONSTANT;
    //audio
    quizCtrl.playAudio = playAudio;
    quizCtrl.starCount = starCount;
    quizCtrl.preloadSounds = preloadSounds;
    //question layouts
    quizCtrl.GRID_TYPE = ['audio_to_text', 'text_to_pic', 'pic_to_text', 'audio_to_pic'];
    quizCtrl.LIST_TYPE = ['audio_to_text_longer', 'text_to_pic_longer', 'pic_to_text_longer', 'audio_to_pic_longer'];

    //slide box
    quizCtrl.slideHasChanged = slideHasChanged;
    quizCtrl.slideTo = slideTo;

    //Regex operations
    quizCtrl.soundIdRegex = /(?:\[\[)(?:sound)(?:\s)(?:id=)([0-9]+)(?:\]\])/;
    quizCtrl.imageTagRegex = /(?:\[\[)(?:img)(?:\s)(?:id=)([0-9]+)(?:\]\])/;

    quizCtrl.getSoundId = getSoundId;
    quizCtrl.getImageId = getImageId;
    quizCtrl.getImageSrc = getImageSrc;
    quizCtrl.parseToDisplay = parseToDisplay;
    quizCtrl.replaceImageTag = replaceImageTag;
    quizCtrl.removeSoundTag = removeSoundTag;
    quizCtrl.getLayout = getLayout;

    quizCtrl.myStyle = {
      height: '10px',
      width: '0%',
      'background-color': 'yellow'
    }
    quizCtrl.practiceResult = {};
    quizCtrl.preloadImages = preloadImages;

    // scroll quiz
    quizCtrl.nextScrollQuestion = 1;
    quizCtrl.questionInView = questionInView;
    quizCtrl.scrollToNext = scrollToNext;

    //timer
    quizCtrl.counter = 0;
    quizCtrl.timer = new Date(1970, 0, 1).setSeconds(quizCtrl.counter);
    quizCtrl.onTimeout = function() {
      quizCtrl.counter++;
      quizCtrl.timer += 1000;
      quizCtrl.mytimeout = $timeout(quizCtrl.onTimeout, 1000);
    }
    quizCtrl.mytimeout = $timeout(quizCtrl.onTimeout, 1000);

    // initialisation call
    quizCtrl.setCurrentIndex(0);
    quizCtrl.init(quizCtrl.quiz);
    $scope.lessonutils = lessonutils;
    $scope.selectedNode = lessonutils.getLocalLesson();

    $scope.modal = {};

    function starCount(index) {
      var count = quizCtrl.quizResult.stars - index;
      return count > 0 ? count : 0;
    }

    if ($state.current.name == "quiz.summary" || $state.current.name == "quiz.practice.summary") {
      if (quizCtrl.quizResult.stars) {
        var star = quizCtrl.quizResult.stars;
      } else if (quizCtrl.practiceResult.percentCorrect) {
        var star = quizCtrl.practiceResult.percentCorrect > CONSTANT.STAR.THREE ? 3 : quizCtrl.practiceResult.percentCorrect > CONSTANT.STAR.TWO ? 2 : quizCtrl.practiceResult.percentCorrect > CONSTANT.STAR.ONE ? 1 : 0;
      } else {
        var star = 0;
      }
      $log.debug(star);
      for (var i = 0; i < star; i++) {
        $log.debug('star sound', star);
        (i + 1) == 1 && $timeout(function() {
          audio.play('one_star')
        }, 1000);
        (i + 1) == 2 && $timeout(function() {
          audio.play('two_star')
        }, 2000);
        (i + 1) == 3 && $timeout(function() {
          audio.play('three_star')
        }, 3000);
      }
    }

    function init(quiz) {

      // init report object
      if ($state.current.name == "quiz.summary") {
        document.addEventListener("backbutton", onBackKeyDown, false);

        function onBackKeyDown(e) {
          e.preventDefault();
          $ionicLoading.show({
            noBackdrop: false,
            hideOnStateChange: true
          });
          $state.go('map.navigate');
        }

        quizCtrl.report = $stateParams.report;
        $log.debug("Summary")
        $log.debug(quizCtrl.report);
        quizCtrl.quiz = $stateParams.quiz;
        quizCtrl.quizResult = quizCtrl.calculateResult(quizCtrl.report, quizCtrl.quiz);
        $log.debug(quizCtrl.quizResult);
        Quiz.saveReport({
            node: quizCtrl.quiz.node.id,
            person: Auth.getProfileId(),
            score: quizCtrl.quizResult.marks
          }, function(success) {
            var report_id = success.id;
            var attempts = [];
            angular.forEach(quizCtrl.report.attempts, function(value, key) {
              // 1 - Attempted
              // 2 - Skipped
              // 3 - NotAttempted
              attempts.push({
                answer: value.length > 0 ? value : null,
                score: quizCtrl.quizResult.score[key],
                status: value.length > 0 ? 1 : 2,
                person: Auth.getProfileId(),
                report: report_id,
                node: key
              });
            });
            Quiz.saveAttempt(attempts, function(response) {}, function(error) {})
          }, function(error) {

          })
          // quizCtrl.report = {"quiz_id":"10014638-8567-4a33-814a-1b7bfedf0664","attempts":{"cbe39272-ccbd-4e05-9532-d53699ec59cd":[3],"61524a03-4acd-4b1d-ae96-96702387e7e3":[3],"5b66574b-621b-435e-a812-db7be6a94dfd":[3],"cda26918-b9d4-4120-afe4-1e627691454f":[3],"1eac2901-3f1a-4e48-b2cb-706964aece32":[2]}};
          // quizCtrl.quiz = {"node":{"id":"10014638-8567-4a33-814a-1b7bfedf0664","content_type_name":"assessment","type":{"id":"7053747a-2967-431a-bc68-2aa23b8bd1c4","score":100},"created":"2016-04-25T11:36:53.969858Z","updated":"2016-04-25T11:36:53.969884Z","title":"Assessment test","description":"Assessment description","object_id":"7053747a-2967-431a-bc68-2aa23b8bd1c4","stauts":"PUBLISHED","lft":10,"rght":21,"tree_id":1,"level":1,"parent":"5cb5adc2-84f8-41d2-9272-81790cb314c2","content_type":26,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[{"node":{"id":"cbe39272-ccbd-4e05-9532-d53699ec59cd","content_type_name":"json question","type":{"id":"249fdc1f-b466-4993-be6e-555fb6052a55","created":"2016-04-25T11:49:39.453229Z","updated":"2016-04-25T11:49:39.453251Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:49:39.486776Z","updated":"2016-04-25T11:49:39.486799Z","title":"Audio to text","description":"","object_id":"249fdc1f-b466-4993-be6e-555fb6052a55","stauts":"PUBLISHED","lft":13,"rght":14,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"61524a03-4acd-4b1d-ae96-96702387e7e3","content_type_name":"json question","type":{"id":"e7962a73-0199-477d-9838-8f8e419907b8","created":"2016-04-25T11:50:41.767437Z","updated":"2016-04-25T11:50:41.767456Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:50:41.799933Z","updated":"2016-04-25T11:50:41.799953Z","title":"Audio to text","description":"","object_id":"e7962a73-0199-477d-9838-8f8e419907b8","stauts":"PUBLISHED","lft":17,"rght":18,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"5b66574b-621b-435e-a812-db7be6a94dfd","content_type_name":"json question","type":{"id":"d72b724c-f8af-4221-815d-08abba56bda2","created":"2016-04-25T11:43:38.461255Z","updated":"2016-04-25T11:43:38.461273Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:43:38.493848Z","updated":"2016-04-25T11:43:38.493870Z","title":"Audio to text","description":"","object_id":"d72b724c-f8af-4221-815d-08abba56bda2","stauts":"PUBLISHED","lft":11,"rght":12,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"cda26918-b9d4-4120-afe4-1e627691454f","content_type_name":"json question","type":{"id":"8f9e4441-2e51-4834-860b-9324a6468889","created":"2016-04-25T11:50:17.262086Z","updated":"2016-04-25T11:50:17.262103Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:50:17.295078Z","updated":"2016-04-25T11:50:17.295097Z","title":"Audio to text","description":"","object_id":"8f9e4441-2e51-4834-860b-9324a6468889","stauts":"PUBLISHED","lft":15,"rght":16,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"1eac2901-3f1a-4e48-b2cb-706964aece32","content_type_name":"json question","type":{"id":"1678c124-710c-4b52-98a8-a873624d2dd0","created":"2016-04-25T11:50:45.706748Z","updated":"2016-04-25T11:50:45.706765Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:50:45.739207Z","updated":"2016-04-25T11:50:45.739227Z","title":"Audio to text","description":"","object_id":"1678c124-710c-4b52-98a8-a873624d2dd0","stauts":"PUBLISHED","lft":19,"rght":20,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]}]}

      } else if ($state.current.name == "quiz.questions" || $state.current.name == "quiz.practice.questions") {
        quizCtrl.preloadImages(quiz);
        quizCtrl.report = {};
        quizCtrl.practiceResult.totalMarks = quizCtrl.quiz.node.type.score;
        quizCtrl.practiceResult.percentCorrect = 0;
        quizCtrl.practiceResult.scoredMarks = 0;
        quizCtrl.report.quiz_id = quiz.node.id;
        quizCtrl.report.attempts = {};
        for (var i = 0; i < quiz.objects.length; i++) {
          quizCtrl.report.attempts[quiz.objects[i].node.id] = [];
        }
        // init attempted

        for (i = 0; i < quizCtrl.quiz.objects.length; i++) {
          if (i !== 0)
            quizCtrl.quiz.objects[i].isVisited = false;
          else
            quizCtrl.quiz.objects[i].isVisited = true;

          if ((quizCtrl.quiz.objects[i].node.type.type == 'choicequestion' && !quizCtrl.quiz.objects[i].node.type.content.is_multiple) /*|| quizCtrl.quiz.objects[i].node.content_type=='dr question'*/ ) {
            quizCtrl.quiz.objects[i].attempted = "";
          } else if (quizCtrl.quiz.objects[i].node.type.type == 'choicequestion' && quizCtrl.quiz.objects[i].node.type.content.is_multiple) {
            quizCtrl.quiz.objects[i].attempted = [];
          }
          //else if(quizCtrl.quiz.objects[i].node.content_type=='sentence ordering' || quizCtrl.quiz.objects[i].node.content_type=='sentence structuring'){
          //  quizCtrl.quiz.objects[i].attempted = [];
          //}
          else {}
        }
      } else if ($state.current.name = 'quiz.practice.summary') {
        $log.debug("shere");
        $log.debug($stateParams);
        quizCtrl.report = $stateParams.report;
        quizCtrl.quiz = $stateParams.quiz;
        quizCtrl.practiceResult = $stateParams.practiceResult;
        $log.debug(quizCtrl.report);
        Quiz.saveReport({
            node: quizCtrl.quiz.node.id,
            person: Auth.getProfileId(),
            score: quizCtrl.practiceResult.totalMarks
          }, function(success) {
            var report_id = success.id;
            var attempts = [];

            angular.forEach(quizCtrl.quiz.objects, function(question) {
              var attempts_array = quizCtrl.report.attempts[question.node.id];
              quizCtrl.report.attempts[question.node.id].is_correct = false;
              angular.forEach(attempts_array, function(attempt) {
                $log.debug("attempt");
                $log.debug(attempt);
                attempts.push({
                  answer: attempt.length > 0 ? attempt : null,
                  score: quizCtrl.isCorrect(question, attempt) ? question.node.type.score : 0,
                  status: 1, //Skipping is not allowed in practice so status is set to 1
                  person: Auth.getProfileId(),
                  report: report_id,
                  node: question.node.id
                });
                if (quizCtrl.isCorrect(question, attempt)) {
                  $log.debug(quizCtrl.isCorrect(question, attempt), 'is correct');
                  quizCtrl.report.attempts[question.node.id].is_correct = true;
                }
              })
            })
            quizCtrl.practiceResult.analysis = attempts;
            // Quiz.saveAttempt(attempts, function(response) {}, function(error) {})
          }, function(error) {

          })
          // Quiz.saveReport({
          //     node: quizCtrl.quiz.node.id,
          //     person: Auth.getProfileId(),
          //     score:
          //   }, function(success) {
          //     var report_id = success.id;
          //
          //     angular.forEach(quizCtrl.report.attempts, function(value, key) {
          //       // 1 - Attempted
          //       // 2 - Skipped
          //       // 3 - NotAttempted
          //
          //       angular.forEach(value,function(attempt){
          //         var attempt = {
          //           answer: value.length > 0 ? value : null,
          //           score: quizCtrl.quizResult.score[key],
          //           status: value.length > 0 ? 1 : 2,
          //           person: Auth.getProfileId(),
          //           report: report_id,
          //           node: key
          //         }
          //         Quiz.saveAttempt(attempt, function(response) {}, function(error) {})
          //       })
          //     });
          //   }, function(error) {
          //
          //   })
      }

    }

    function isCurrentIndex(index) {

      return quizCtrl.currentIndex == index;
    }

    function setCurrentIndex(index) {
      $log.debug(index)
      quizCtrl.currentIndex = index;
      return true;
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
      quizCtrl.submitAttempt(
        quizCtrl.quiz.objects[quizCtrl.currentIndex].node.id,
        quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
      );
      if (quizCtrl.isCorrectAttempted(quizCtrl.quiz.objects[quizCtrl.currentIndex])) {
        quizCtrl.practiceResult.scoredMarks += quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.score;
        $log.debug("scored marks", quizCtrl.practiceResult.scoredMarks)
        quizCtrl.practiceResult.percentCorrect = parseInt((quizCtrl.practiceResult.scoredMarks / quizCtrl.practiceResult.totalMarks) * 100);
        $log.debug("percent", quizCtrl.practiceResult.percentCorrect)
        quizCtrl.myStyle.width = quizCtrl.practiceResult.percentCorrect + "%";
        audio.play('correct');
      } else {

        audio.play('wrong');
        // SCQ
        if ((quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && !quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple)) {
          quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].attempted = '';
        }
        // MCQ
        if (quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple) {
          quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].attempted = {};
        }
        if (quizCtrl.report.attempts[quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].node.id].length == 2) {
          quizCtrl.quiz.objects.push(angular.copy(quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()]));
        }
      }
      $scope.openModal();
    }

    function canSubmit() {

      $log.debug("can submit for", quizCtrl.currentIndex);

      // SCQ | DR
      if ((quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && !quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple) || quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "dr question") {
        $log.debug(quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted);
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted;
      }
      // MCQ
      if (quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple) {
        //removes false keys
        quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted = _.pick(quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted, _.identity);
        // true if attempted and key count is more than one
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted && _.size(quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted) >= 1;
      }
      if (quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "sentence ordering" || quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "sentence structuring") {
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted.length ? true : false;
      }
    }

    function feedback(question, attempt) {
      return;

      // if (quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1) {
      //   quizCtrl.nextQuestion();
      // } else {
      //   $log.debug("Final")
      //     // final question -> go to summary
      //   $state.go('quiz.practice.summary', {
      //     report: angular.copy(quizCtrl.report)
      //   });
      // }
      $log.debug("b")

      if (isCorrectAttempted(quizCtrl.quiz.objects[quizCtrl.currentIndex])) {

      } else {
        if (quizCtrl.report.attempts[quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].node.id].length == 2) {
          quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].attempted = {};
          quizCtrl.quiz.objects.push(angular.copy(quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()]))
        }

      }
      $scope.openModal();
    }

    function submitAttempt(question_id, attempt) {
      quizCtrl.report.attempts[question_id].push(angular.copy(attempt));
    }


    function isAttempted(question) {
      // multiple choice
      if (question.node.type.type == 'choicequestion' && question.node.type.content.is_multiple) {
        for (var i = 0; i < quizCtrl.report.attempts[question.node.id].length; i++) {
          if (_.chain(quizCtrl.report.attempts[question.node.id][i]).map(function(num, key) {
              return num ? parseInt(key) : false;
            }).reject(function(num) {
              return !num;
            }).value().length > 0)
            return true;
        }
        return false;
      }
      // single choice
      if (question.node.type.type == 'choicequestion' && !question.node.type.content.is_multiple) {
        return quizCtrl.report.attempts[question.node.id].length > 0;
      }
    }

    function isCorrect(question, attempt) {

      // multiple choice
      if (question.node.type.type == 'choicequestion' && question.node.type.content.is_multiple) {
        return _.chain(attempt).map(function(num, key) {
          return parseInt(key);
        }).sort().isEqual(question.node.type.answer.sort()).value();
      }
      // single choice
      if (question.node.type.type == 'choicequestion' && !question.node.type.content.is_multiple) {
        return attempt == question.node.type.answer[0];
      }
      // dr
      if (question.node.type.type == 'dr question') {
        return attempt == question.node.type.answer[0];
      }
      // sor | sst
      if (question.node.type.type == 'sentence ordering' || question.node.type.type == 'sentence structuring') {
        return angular.equals(question.node.type.answer, attempt);
      }
    }

    function isCorrectAttempted(question) {
      // multiple choice
      if (question.node.type.type == 'choicequestion' && question.node.type.content.is_multiple) {
        for (var i = 0; i < quizCtrl.report.attempts[question.node.id].length; i++) {
          if (_.chain(quizCtrl.report.attempts[question.node.id][i]).map(function(num, key) {
              return num ? parseInt(key) : false;
            }).reject(function(num) {
              return !num;
            }).sort().isEqual(question.node.type.answer.sort()).value())
            return true;
        }
        return false;
      }
      // single choice
      if (question.node.type.type == 'choicequestion' && !question.node.type.content.is_multiple) {
        return quizCtrl.report.attempts[question.node.id].indexOf(question.node.type.answer[0]) != -1 ? (true) : false;
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

    function isKeyCorrect(question, key) {

      return question.node.type.answer.indexOf(key) != -1 ? true : false;
    }

    function isKeyAttempted(question, key) {

      if (question.node.type.content.is_multiple) {
        return _.chain(quizCtrl.report.attempts[question.node.id]).last().has(key).value();
      } else {
        return quizCtrl.report.attempts[question.node.id].indexOf(key) != -1 ? true : false;
      }
    }

    function playAudio(key, index) {
      $log.debug('key,index', key, index);
      angular.element("#audioplayer")[0].pause();
      var src;
      $log.debug("a");
      if (key) {
        if (index) {
          src = quizCtrl.quiz.objects[index].node.type.content.widgets.sounds[key];
          // angular.element("#audioSource")[0].src = quizCtrl.quiz.objects[index].node.type.content.widgets.sounds[key];
        } else {

          src =  quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].node.type.content.widgets.sounds[key];
        }

        src = cordova.file.dataDirectory + 'sounds/' + src.split("/").pop();
        // var target = cordova.file.dataDirectory + 'sounds/' + filename;
        // $log.debug(this.loadUrl(src));
        angular.element("#audioSource")[0].src = src;

        angular.element("#audioplayer")[0].load();
        angular.element("#audioplayer")[0].play();
      }

    }


    $ionicModal.fromTemplateUrl(CONSTANT.PATH.QUIZ + '/practice.feedback' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function() {
      $scope.modal.show();
      return true;
    };
    $scope.closeModal = function() {
      if (isCorrectAttempted(quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()]) || quizCtrl.report.attempts[quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].node.id].length >= 2) {
        $log.debug("Correct or last attempt");
        if (quizCtrl.currentIndex >= quizCtrl.quiz.objects.length - 1) {
          $log.debug("Last question exiting now");
          $scope.modal.hide().then(function() {
            $state.go('quiz.practice.summary', {
              quiz: angular.copy(quizCtrl.quiz),
              practiceResult: angular.copy(quizCtrl.practiceResult),
              report: angular.copy(quizCtrl.report)
            });
          });
        } else {
          $scope.modal.hide().then(function() {

            quizCtrl.slideTo(quizCtrl.getCurrentIndex() + 1);
            // quizCtrl.nextQuestion();
          });
        }
      } else {
        $scope.modal.hide()
      }


    };

    function attemptAndNext() {
      quizCtrl.submitAttempt(
        quizCtrl.quiz.objects[quizCtrl.currentIndex].node.id,
        quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
      );
      quizCtrl.audio.play('water-drop');
      if (quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1) {
        $ionicSlideBoxDelegate.next();
      } else {
        // final question -> go to summary
        $state.go('quiz.summary', {
          report: angular.copy(quizCtrl.report),
          quiz: angular.copy(quizCtrl.quiz)
        });
      }
    }


    function slideHasChanged(index) {
      quizCtrl.setCurrentIndex(index);
      quizCtrl.quiz.objects[index].isVisited = true;
    }

    function slideTo(index) {
      $ionicSlideBoxDelegate.slide(index);
    }

    function calculateResult(report, quiz) {
      var result = {
        analysis: {},
        marks: 0,
        correct_questions: 0,
        stars: 0,
        score: {}
      };
      angular.forEach(quiz.objects, function(value) {
        if (isAttempted(value)) {
          $log.debug("d")
          $log.debug(value);

          if (quizCtrl.isCorrectAttempted(value)) {
            $log.debug("coorect attempted");
            result.analysis[value.node.id] = {
              title: value.node.title,
              status: 1
            };
            result.score[value.node.id] = value.node.type.score;
            result.marks += value.node.type.score;
            result.correct_questions++;
          } else {
            $log.debug("in coorect attempted");

            result.analysis[value.node.id] = {
              title: value.node.title,
              status: 0
            };
            result.score[value.node.id] = 0;
          }
        } else {
          result.analysis[value.node.id] = {
            title: value.node.title,
            status: -1
          }
          result.score[value.node.id] = 0;
        }

      });
      // $log.debug(result)
      var percent_correct = parseInt((result.marks / quiz.node.type.score) * 100);
      $log.debug('see the score', result.marks, quiz.node.type.score, percent_correct);
      if (percent_correct >= CONSTANT.STAR.ONE && percent_correct < CONSTANT.STAR.TWO) {
        result.stars = 1;
      } else if (percent_correct >= CONSTANT.STAR.TWO && percent_correct < CONSTANT.STAR.THREE) {
        result.stars = 2;
      } else if (percent_correct >= CONSTANT.STAR.THREE) {
        result.stars = 3;
      } else {}
      return result;
    }

    function range(num) {
      return new Array(num);
    }

    function submitQuiz() {

      $ionicPopup.confirm({
        title: 'Submit Quiz?',
        template: 'Are you sure you want to submit quiz?'
      }).then(function(res) {
        if (res) {
          angular.forEach(quiz.objects, function(value, key) {
            $log.debug("here");
            if (value.node.type.type == 'choicequestion' && !value.node.type.content.is_multiple && value.attempted !== '') {
              quizCtrl.submitAttempt(value.node.id,
                value.attempted);
            } else if (value.node.type.type == 'choicequestion' && value.node.type.content.is_multiple && value.attempted.length > 0) {
              $log.debug("Multiple found");

              quizCtrl.submitAttempt(value.node.id,
                value.attempted);
            }

          });
          $log.debug("Report");
          $log.debug(quizCtrl.report);

          $state.go('quiz.summary', {
            report: angular.copy(quizCtrl.report),
            quiz: angular.copy(quizCtrl.quiz)
          });
        } else {
          console.log('You are not sure');
        }
      });
    }

    function endQuiz() {
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      $state.go('map.navigate', {});
      // $ionicPopup.confirm({
      //   title: 'End Quiz?',
      //   template: 'Are you sure you want to end quiz?'
      // }).then(function(res) {
      //   if (res) {
      //
      //   } else {
      //     console.log('You are not sure');
      //   }
      // });
    }
    // $ionicModal.fromTemplateUrl(CONSTANT.PATH.QUIZ + '/quiz.pause.modal' + CONSTANT.VIEW, {
    //   scope: $scope,
    //   animation: 'slide-in-up'
    // }).then(function(modal) {
    //   quizCtrl.pauseModal = modal;
    // });
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      quizCtrl.pauseModal = modal;
    });

    $scope.showNodeMenu = function() {
      $timeout.cancel(quizCtrl.mytimeout);
      $log.debug('opening modal');
      quizCtrl.pauseModal.show();
    }
    $scope.closeNodeMenu = function() {
      quizCtrl.pauseModal.hide();
      quizCtrl.mytimeout = $timeout(quizCtrl.onTimeout, 1000);
    }

    function restartQuiz() {
      $state.go($state.current, {}, {
        reload: true
      });
      // $ionicLoading.show({
      //   noBackdrop: false,
      //   hideOnStateChange: true
      // });

    }


    function getSoundId(string) {
      if (quizCtrl.soundIdRegex.exec(string))
        return quizCtrl.soundIdRegex.exec(string)[1];
    }

    function getImageId(string) {
      if (quizCtrl.imageTagRegex.exec(string))
        return quizCtrl.imageTagRegex.exec(string)[1];
    }

    function getImageSrc(id, index) {
      if (index) {
        return quizCtrl.quiz.objects[index].node.type.content.widgets.images[id];
      }
      return quizCtrl.quiz.objects[quizCtrl.getCurrentIndex()].node.type.content.widgets.images[id];

    }

    function parseToDisplay(string, index) {
      var text = quizCtrl.replaceImageTag(quizCtrl.removeSoundTag(string, index), index);
      return text.trim() || '<img class="content-image sound-image" src="' + CONSTANT.ASSETS.IMG.SOUND_PLACEHOLDER + '"></img>';

    }

    function removeSoundTag(string) {
      return string.replace(quizCtrl.soundIdRegex, "");
    }

    function replaceImageTag(string, index) {
      return string.replace(quizCtrl.imageTagRegex, "<img class='content-image' src='http://cc-test.zaya.in" + quizCtrl.getImageSrc(quizCtrl.getImageId(string), index) + "'></img>");
    }

    function getLayout(question) {
      angular.forEach(question.node.type.content.options, function(option) {
        var text = quizCtrl.replaceImageTag(quizCtrl.removeSoundTag(option.option));
        text = text.trim();
        if (text.length >= 55) {
          return 'list';
        }
      })
      return 'grid';
    }

    function preloadImages(quiz) {
      angular.forEach(quiz.objects, function(question) {
        angular.forEach(question.node.type.content.widgets.images, function(image) {
          $('<img/>')[0].src = 'http://cc-test.zaya.in' + image;
        })
      })
    }

    function disableSwipe() {
      $ionicSlideBoxDelegate.enableSlide(false);
    }
    quizCtrl.view_data = {}

    function questionInView(index, viewPart) {
      quizCtrl.view_data[index] = viewPart;
      if (viewPart == 'bottom' || viewPart == 'both') {
        quizCtrl.nextScrollQuestion = index + 1;
      }
    }

    function scrollToNext() {
      if (quizCtrl.nextScrollQuestion < quizCtrl.quiz.objects.length) {
        var id = 'question-' + quizCtrl.nextScrollQuestion;
        var position = $('#' + id).position();
        $ionicScrollDelegate.scrollBy(position.left, position.top, true);
      }
    }

    function preloadMapImages(arrayOfImages) {
      $(arrayOfImages).each(function() {
        $('<img/>')[0].src = this;
      });
    }
    preloadMapImages([
      '/img/assets/avatar-boy.png',
      '/img/assets/pause_menu_top.png',
      '/img/assets/pause_menu_middle.png',
      '/img/assets/pause_menu_bottom.png'
    ]);

    function preloadSounds() {
      // soundManager.download("http://cc-test.zaya.in/media/ell/sounds/i-mein_885SAB.mp3")
      ionic.Platform.ready(function(){
        angular.forEach(quiz.objects, function(question) {
            angular.forEach(question.node.type.content.widgets.sounds, function(sound) {
              try {
                soundManager.download("http://cc-test.zaya.in"+sound)
              } catch (e) {
                $log.debug("Error Downloading sound")
              }
            })
          });
        // $log.debug("insidePreload")

          //  var url = "http://cc-test.zaya.in/media/ell/sounds/i-mein_885SAB.mp3";
          //  soundManager.download(url);
          //  var filename = url.split("/").pop();
          //  var targetPath = cordova.file.dataDirectory + 'sounds/' + filename;

          //  $log.debug(targetPath)
            // $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
              // $log.debug("Succ")
                  // $scope.hasil = 'Save file on '+targetPath+' success!';
                  // $scope.mywallpaper=targetPath;
            // }, function (error) {
              // $log.debug("Error")
            // }, function (progress) {
              // $log.debug("P")
              // $scope.downloadProgress = (progress.loaded / progress.total) * 100;
              // $scope.hasil = 'Error Download file';
            // });
    });
    // return;
      // File for download
      // var url = "http://www.gajotres.net/wp-content/uploads/2015/04/logo_radni.png";

      // var filename = url.split("/").pop();
      // File name only

      // Save location
      // var targetPath = cordova.file.dataDirectory + filename;
      // $log.debug(targetPath);
      // $log.debug(cordova.file.dataDirectory);
      // $cordovaFileTransfer.download(url, targetPath, {}, true).then(function(result) {
      //   console.log('Success');
      // }, function(error) {
      //   console.log('Error d');
      // }, function(progress) {
      //   console.log('p');

        // PROGRESS HANDLING GOES HERE
      // });
        // return;

        // angular.forEach(quizCtrl.quiz.objects)
    }
    quizCtrl.preloadSounds()
  }
})();
