(function() {
    angular
      .module('zaya-quiz')
      .controller('QuizController', QuizController)

    QuizController.$inject = ['quiz', '$stateParams', '$state', '$scope', 'audio', '$log', '$ionicModal', 'CONSTANT', '$ionicSlideBoxDelegate', 'Utilities', 'Quiz', 'Auth', '$ionicLoading', '$ionicPopup'];

    function QuizController(quiz, $stateParams, $state, $scope, audio, $log, $ionicModal, CONSTANT, $ionicSlideBoxDelegate, Utilities, Quiz, Auth, $ionicLoading, $ionicPopup) {
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
      quizCtrl.calculateResult = calculateResult;
      quizCtrl.MARKS_MULTIPIER = 10;
      quizCtrl.quizResult = {};
      quizCtrl.utilities = Utilities;
      quizCtrl.submitQuiz = submitQuiz;
      quizCtrl.endQuiz = endQuiz;
      //audio
      quizCtrl.playAudio = playAudio;

      //question layouts
      quizCtrl.GRID_TYPE = ['audio_to_text', 'text_to_pic', 'pic_to_text', 'audio_to_pic'];
      quizCtrl.LIST_TYPE = ['audio_to_text_longer', 'text_to_pic_longer', 'pic_to_text_longer', 'audio_to_pic_longer'];

      //slide box
      quizCtrl.slideHasChanged = slideHasChanged;
      quizCtrl.slideTo = slideTo;

      // initialisation call
      quizCtrl.setCurrentIndex(0);
      quizCtrl.init(quizCtrl.quiz);

      $scope.modal = {};



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
          quizCtrl.quiz = $stateParams.quiz;
          quizCtrl.quizResult = quizCtrl.calculateResult(quizCtrl.report, quizCtrl.quiz);
          Quiz.saveReport({
              node: quizCtrl.quiz.node.id,
              person: Auth.getProfileId(),
              score: quizCtrl.quizResult.marks
            }, function(success) {
              var report_id = success.id;
              angular.forEach(quizCtrl.report.attempts, function(value, key) {
                // 1 - Attempted
                // 2 - Skipped
                // 3 - NotAttempted
                var attempt = {
                  answer: value.length > 0 ? value : null,
                  status: value.length > 0 ? 1 : 2,
                  person: Auth.getProfileId(),
                  report: report_id,
                  node: key
                }
                Quiz.saveAttempt(attempt, function(response) {
                  $log.debug(response);
                }, function(error) {
                  $log.debug(error);
                })
              });
            }, function(error) {

            })
            // quizCtrl.report = {"quiz_id":"10014638-8567-4a33-814a-1b7bfedf0664","attempts":{"cbe39272-ccbd-4e05-9532-d53699ec59cd":[3],"61524a03-4acd-4b1d-ae96-96702387e7e3":[3],"5b66574b-621b-435e-a812-db7be6a94dfd":[3],"cda26918-b9d4-4120-afe4-1e627691454f":[3],"1eac2901-3f1a-4e48-b2cb-706964aece32":[2]}};
            // quizCtrl.quiz = {"node":{"id":"10014638-8567-4a33-814a-1b7bfedf0664","content_type_name":"assessment","type":{"id":"7053747a-2967-431a-bc68-2aa23b8bd1c4","score":100},"created":"2016-04-25T11:36:53.969858Z","updated":"2016-04-25T11:36:53.969884Z","title":"Assessment test","description":"Assessment description","object_id":"7053747a-2967-431a-bc68-2aa23b8bd1c4","stauts":"PUBLISHED","lft":10,"rght":21,"tree_id":1,"level":1,"parent":"5cb5adc2-84f8-41d2-9272-81790cb314c2","content_type":26,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[{"node":{"id":"cbe39272-ccbd-4e05-9532-d53699ec59cd","content_type_name":"json question","type":{"id":"249fdc1f-b466-4993-be6e-555fb6052a55","created":"2016-04-25T11:49:39.453229Z","updated":"2016-04-25T11:49:39.453251Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:49:39.486776Z","updated":"2016-04-25T11:49:39.486799Z","title":"Audio to text","description":"","object_id":"249fdc1f-b466-4993-be6e-555fb6052a55","stauts":"PUBLISHED","lft":13,"rght":14,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"61524a03-4acd-4b1d-ae96-96702387e7e3","content_type_name":"json question","type":{"id":"e7962a73-0199-477d-9838-8f8e419907b8","created":"2016-04-25T11:50:41.767437Z","updated":"2016-04-25T11:50:41.767456Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:50:41.799933Z","updated":"2016-04-25T11:50:41.799953Z","title":"Audio to text","description":"","object_id":"e7962a73-0199-477d-9838-8f8e419907b8","stauts":"PUBLISHED","lft":17,"rght":18,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"5b66574b-621b-435e-a812-db7be6a94dfd","content_type_name":"json question","type":{"id":"d72b724c-f8af-4221-815d-08abba56bda2","created":"2016-04-25T11:43:38.461255Z","updated":"2016-04-25T11:43:38.461273Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:43:38.493848Z","updated":"2016-04-25T11:43:38.493870Z","title":"Audio to text","description":"","object_id":"d72b724c-f8af-4221-815d-08abba56bda2","stauts":"PUBLISHED","lft":11,"rght":12,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"cda26918-b9d4-4120-afe4-1e627691454f","content_type_name":"json question","type":{"id":"8f9e4441-2e51-4834-860b-9324a6468889","created":"2016-04-25T11:50:17.262086Z","updated":"2016-04-25T11:50:17.262103Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:50:17.295078Z","updated":"2016-04-25T11:50:17.295097Z","title":"Audio to text","description":"","object_id":"8f9e4441-2e51-4834-860b-9324a6468889","stauts":"PUBLISHED","lft":15,"rght":16,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]},{"node":{"id":"1eac2901-3f1a-4e48-b2cb-706964aece32","content_type_name":"json question","type":{"id":"1678c124-710c-4b52-98a8-a873624d2dd0","created":"2016-04-25T11:50:45.706748Z","updated":"2016-04-25T11:50:45.706765Z","microstandard":"a48b89d6-cfdf-4119-b335-863e57606c31","is_critical_thinking":false,"level":1,"answer":[3],"score":20,"content":{"image":null,"choices":[{"image":"http://lorempixel.com/100/100/","key":1,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":2,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":3,"audio":null,"option":null},{"image":"http://lorempixel.com/100/100/","key":4,"audio":null,"option":null}],"layout_type":"audio_to_pic","audio":"http://soundbible.com/grab.php?id=769&type=mp3","is_multiple":false},"type":"choicequestion"},"created":"2016-04-25T11:50:45.739207Z","updated":"2016-04-25T11:50:45.739227Z","title":"Audio to text","description":"","object_id":"1678c124-710c-4b52-98a8-a873624d2dd0","stauts":"PUBLISHED","lft":19,"rght":20,"tree_id":1,"level":2,"parent":"10014638-8567-4a33-814a-1b7bfedf0664","content_type":22,"account":"1e7aa89f-3f50-433a-90ca-e485a92bbda6"},"objects":[]}]}

        } else if ($state.current.name == "quiz.questions") {
          quizCtrl.report = {};
          quizCtrl.report.quiz_id = quiz.node.id;
          quizCtrl.report.attempts = {};
          for (var i = 0; i < quiz.objects.length; i++) {
            quizCtrl.report.attempts[quiz.objects[i].node.id] = [];
          }
          // init attempted

          for (var i = 0; i < quizCtrl.quiz.objects.length; i++) {
            if (i != 0)
              quizCtrl.quiz.objects[i].isVisited = false;
            else
              quizCtrl.quiz.objects[i].isVisited = true;

            if ((quizCtrl.quiz.objects[i].node.type.type == 'choicequestion' && !quizCtrl.quiz.objects[i].node.type.content.is_multiple) /*|| quizCtrl.quiz.objects[i].node.content_type=='dr question'*/ ) {
              quizCtrl.quiz.objects[i].attempted = "";
            } else if (quizCtrl.quiz.objects[i].node.type.type == 'choicequestion' && quizCtrl.quiz.objects[i].node.type.content.is_multiple) {
              quizCtrl.quiz.objects[i].attempted = {};
            }
            //else if(quizCtrl.quiz.objects[i].node.content_type=='sentence ordering' || quizCtrl.quiz.objects[i].node.content_type=='sentence structuring'){
            //  quizCtrl.quiz.objects[i].attempted = [];
            //}
            else {}
          }
        } else {}

      }

      function isCurrentIndex(index) {

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
        if (!quizCtrl.isCorrectAttempted(quizCtrl.quiz.objects[quizCtrl.currentIndex])) {
          $log.debug("!quizCtrl.isCorrectAttempted");
          quizCtrl.submitAttempt(
            quizCtrl.quiz.objects[quizCtrl.currentIndex].node.id,
            quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
          );
          quizCtrl.feedback(
            quizCtrl.quiz.objects[quizCtrl.currentIndex],
            quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted
          );
        } else if (quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1) {
          quizCtrl.nextQuestion();
        } else {
          // final question -> go to summary
          $state.go('quiz.summary', {
            report: angular.copy(quizCtrl.report)
          });
        }
      }

      function canSubmit() {

        // SCQ | DR
        if ((quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && !quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple) || quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "dr question") {
          return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted;
        }
        // MCQ
        if (quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple) {
          //removes false keys
          quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted = _.pick(quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted, _.identity);
          // true if attempted and key count is more than one
          return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted && _.size(quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted) > 1;
        }
        if (quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "sentence ordering" || quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "sentence structuring") {
          return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted.length ? true : false;
        }
      }

      function feedback(question, attempt) {

        return quizCtrl.isCorrect(question, attempt) ? $scope.openModal('correct') : $scope.openModal('wrong');
      }

      function submitAttempt(question_id, attempt) {
        if(quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && !quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple && attempt != '') {
        quizCtrl.report.attempts[question_id].push(angular.copy(attempt));
      }else if(quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.type == "choicequestion" && quizCtrl.quiz.objects[quizCtrl.currentIndex].node.type.content.is_multiple && attempt.length > 0) {
        quizCtrl.report.attempts[question_id].push(angular.copy(attempt));

      }

    }


    function isAttempted(question_id) {
      return quizCtrl.report.attempts[question_id].length ? true : false;
    }

    function isCorrect(question, attempt) {

      // multiple choice
      if (question.node.type.type == 'choicequestion' && question.node.type.content.is_multiple) {
        return _.chain(attempt).map(function(num, key) {
          return parseInt(key);
        }).isEqual(question.node.type.answer).value();
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
            }).isEqual(question.node.type.answer).value())
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

    function playAudio(key) {
      angular.element("#audioplayer")[0].pause();
      if (key) {
        angular.element("#audioSource")[0].src = key;
      } else {
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
    $scope.openModal = function() {
      $scope.modal.show();
      return true;
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    }

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
        stars: 0
      };
      $log.debug(quizCtrl.report);
      angular.forEach(quiz.objects, function(value) {
        if (isAttempted(value.node.id)) {
          if (quizCtrl.isCorrectAttempted(value)) {
            result.analysis[value.node.id] = "Correct";
            result.marks += parseInt(value.node.level) * quizCtrl.MARKS_MULTIPIER;
            result.correct_questions++;
          } else {
            result.analysis[value.node.id] = "Wrong";
          }
        } else {
          result.analysis[value.node.id] = "Unattemted"
        }

      })
      var percent_correct = parseInt((result.correct_questions / quiz.objects.length) * 100);
      $log.debug(percent_correct);
      if (percent_correct >= 80) {
        if (percent_correct >= 90) {
          if (percent_correct >= 95) {
            result.stars = 3;
          } else {
            result.stars = 2;
          }
        } else {
          result.stars = 1;
        }
      }
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
           if(res) {
             angular.forEach(quiz.objects, function(value, key) {
               $log.debug(value);

               quizCtrl.submitAttempt(value.node.id,
                 value.attempted)
             })
             $state.go('quiz.summary', {
               report: angular.copy(quizCtrl.report),
               quiz: angular.copy(quizCtrl.quiz)
             });
           } else {
             console.log('You are not sure');
           }
         });;
    }
    function endQuiz() {

        $ionicPopup.confirm({
           title: 'End Quiz?',
           template: 'Are you sure you want to end quiz?'
         }).then(function(res) {
           if(res) {
             $ionicLoading.show({
               noBackdrop: false,
               hideOnStateChange: true
             });
             $state.go('map.navigate',{});
           } else {
             console.log('You are not sure');
           }
         });;
    }
  }
})();
