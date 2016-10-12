//To do : handle native back button
(function() {
  angular
    .module('zaya-quiz')
    .controller('QuizController', QuizController)

  QuizController.$inject = [
                            'quiz',
                            'widgetParser',
                            '$stateParams',
                            '$state',
                            '$scope',
                            'audio',
                            '$log',
                            '$ionicModal',
                            'CONSTANT',
                            '$ionicSlideBoxDelegate',
                            'Utilities',
                            'Auth',
                            '$ionicLoading',
                            '$ionicPopup',
                            'lessonutils',
                            'orientation',
                            '$ionicScrollDelegate',
                            '$timeout',
                            '$interval',
                            '$q',
                            'ml',
                            'data',
                            '$ionicPlatform',
                            'nzTour',
                            'analytics',
                            'User',
                            'content'
                                ];

  function QuizController(
                            quiz,
                            widgetParser,
                            $stateParams,
                            $state,
                            $scope,
                            audio,
                            $log,
                            $ionicModal,
                            CONSTANT,
                            $ionicSlideBoxDelegate,
                            Utilities,
                            Auth,
                            $ionicLoading,
                            $ionicPopup,
                            lessonutils,
                            orientation,
                            $ionicScrollDelegate,
                            $timeout,
                            $interval,
                            $q,
                            ml,
                            data,
                            $ionicPlatform,
                            nzTour,
                            analytics,
                            User,
                            content
                                    ) {

    var quizCtrl = this;
    //bind quiz resolved to controller
    quizCtrl.quiz = quiz;

    ;
    //report
    quizCtrl.report = {};
    quizCtrl.submitReport = submitReport;
    quizCtrl.generateReport = generateReport;

    //attempts and submission
    quizCtrl.submitAttempt = submitAttempt;
    quizCtrl.isAttempted = isAttempted;
    quizCtrl.isCorrect = isCorrect;
    quizCtrl.isCorrectAttempted = isCorrectAttempted;
    quizCtrl.isKeyCorrect = isKeyCorrect;
    quizCtrl.isKeyAttempted = isKeyAttempted;
    quizCtrl.canSubmit = canSubmit;
    quizCtrl.setSuggestion = setSuggestion;
    quizCtrl.updateSlide = updateSlide;
    quizCtrl.parseHtml = parseHtml;

    //binding services to controller scope
    $scope.audio = audio;
    quizCtrl.audio = audio;
    $scope.orientation = orientation; //find why this is added
    quizCtrl.utilities = Utilities;
    quizCtrl.widgetParser = widgetParser;

    //init
    quizCtrl.init = init;

    // navigation
    quizCtrl.isCurrentIndex = isCurrentIndex;
    quizCtrl.setCurrentIndex = setCurrentIndex;
    quizCtrl.getCurrentIndex = getCurrentIndex;
    quizCtrl.prevQuestion = prevQuestion;
    quizCtrl.nextQuestion = nextQuestion;
    quizCtrl.inViewData = {}
    quizCtrl.inViewTrigger = inViewTrigger;
    quizCtrl.inViewFlag = true;
    //log attempts & feedback
    quizCtrl.getFeedback = getFeedback;
    quizCtrl.generateSummary = generateSummary;
    quizCtrl.summary = {};
    quizCtrl.submitQuiz = submitQuiz;
    quizCtrl.endQuiz = endQuiz;
    quizCtrl.playStarSound = playStarSound;
    quizCtrl.disableSwipe = disableSwipe;
    quizCtrl.canRemoveFeedback = true;
    quizCtrl.next = next;
    quizCtrl.logQuestion = logQuestion;


    // quizCtrl.pauseQuiz = pauseQuiz;
    quizCtrl.restartQuiz = restartQuiz;
    quizCtrl.CONSTANT = CONSTANT;
    //audio
    quizCtrl.playAudio = playAudio;
    quizCtrl.stopAudio = stopAudio;
    // quizCtrl.starCount = starCount;
    quizCtrl.highlightSoundIcon = highlightSoundIcon;
    quizCtrl.playInstruction = playInstruction;
    quizCtrl.calculateStars = calculateStars;

    //timer
    quizCtrl.counter = 0;
    quizCtrl.timer = new Date(1970, 0, 1).setSeconds(quizCtrl.counter);
    quizCtrl.stopTimer = stopTimer;
    quizCtrl.startTimer = startTimer;

    quizCtrl.isScroll = isScroll;
    //helper functions
    quizCtrl.getQuestionType = getQuestionType;
    quizCtrl.redo = redo;


    // initialisation call
    quizCtrl.init(quizCtrl.quiz);

    //state history
    quizCtrl.isAssessment = ($stateParams.type == 'assessment');
    // quizCtrl.tourFlag = true;

    quizCtrl.disable_submit = false;
    quizCtrl.enable_litmus = true;
    $scope.demo = {
      'tourNextStep': tourNextStep,
      'tourFlag': localStorage.getItem('tourFlag')
    }

    $scope.tourNextStep = tourNextStep;
    $scope.lessonutils = lessonutils;
    $scope.selectedNode = lessonutils.getLocalLesson();
    $scope.modal = {};
    quizCtrl.closeModalCallback = closeModalCallback;


    $scope.groups = [];
    for (var i = 0; i < 10; i++) {
      $scope.groups[i] = {
        name: i,
        items: []
      };
      for (var j = 0; j < 3; j++) {
        $scope.groups[i].items.push(i + '-' + j);
      }
    }

    function isScroll(id){

    }

    function redo(){

     if(quizCtrl.quiz.objects[0].node.id === CONSTANT.QUESTION.DEMO){
       quizCtrl.quiz.objects.shift()
     }
       lessonutils.playResource(quizCtrl.quiz)
   }

    function stopTimer() {
      $interval.cancel(quizCtrl.interval);
    }

    function startTimer() {
      quizCtrl.interval = $interval(function() {
        quizCtrl.counter++;
        quizCtrl.timer += 1000;
      }, 1000);
    }

    // function starCount(index) {
    //   var count = quizCtrl.summary.stars - index;
    //   return count > 0 ? count : 0;
    // }

    function playStarSound() {
        var star = 0;
      if (quizCtrl.summary.stars) {
        star = quizCtrl.summary.stars;
      } else if (quizCtrl.summary.score.percent) {
        star = quizCtrl.summary.score.percent > CONSTANT.STAR.THREE ? 3 : quizCtrl.summary.score.percent > CONSTANT.STAR.TWO ? 2 : quizCtrl.summary.score.percent > CONSTANT.STAR.ONE ? 1 : 0;
      } else {
        star = 0;
      }
      for (var i = 0; i < star; i++) {
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

    function submitReport(quiz, report, summary) {
      var lesson = lessonutils.getLocalLesson();

        User.skills.update({
          profileId: User.getActiveProfileSync()._id,
          lessonId: quiz.parent,
          id: quiz.node.id,
          score: summary.score.marks,
          totalScore: quizCtrl.quiz.node.type.score,
          skill: quiz.node.tag
        })
        .then(function() {
          return data.getQuizScore({
              'profileId': User.getActiveProfileSync()._id,
              'lessonId': lesson.node.id,
              'id': quizCtrl.quiz.node.id
            });
        })
        .then(function(previousScore) {
          if ((!previousScore) || (!previousScore.hasOwnProperty('score')) || (previousScore && parseInt(previousScore.score) < summary.score.marks)) {

            return User.scores.update({
              profileId: User.getActiveProfileSync()._id,
              lessonId: lesson.node.id,
              id: quiz.node.id,
              score: summary.score.marks,
              totalScore: quizCtrl.quiz.node.type.score,
              type: 'assessment',
              skill: quiz.node.tag
            })

          }
        })

        .then(function() {
          var attempts = [];
          angular.forEach(report.attempts, function(value, key) {
            attempts.push({
              answer: value.length > 0 ? value : null,
              score: summary.analysis[key].score,
              status: value.length > 0 ? CONSTANT.ATTEMPT.STATUS.ATTEMPTED : CONSTANT.ATTEMPT.STATUS.SKIPPED,
              node: key
            });
          });
          return User.reports.save({
            'score': summary.score.marks,
            'attempts': attempts,
            'profileId': User.getActiveProfileSync()._id,
            'node': quizCtrl.quiz.node.id
          })

        })

    }

    function disableSwipe() {
      $ionicSlideBoxDelegate.enableSlide(false);
    }
    function init(quiz) {
      if ($state.current.name == "quiz.start") {
      }
      if ($state.current.name == "quiz.summary") {
        quizCtrl.report = $stateParams.report;
        quizCtrl.quiz = $stateParams.quiz;
        quizCtrl.summary = $stateParams.summary;
        quizCtrl.playStarSound();
      } else if ($state.current.name == "quiz.questions") {
        quizCtrl.setCurrentIndex(0);
        quizCtrl.logQuestion(0,'START');
        if ($stateParams.type == 'assessment') {
          quizCtrl.startTimer();
        }
        if ($stateParams.type == 'practice') {
          $ionicSlideBoxDelegate.enableSlide(false);

          $ionicModal.fromTemplateUrl(CONSTANT.PATH.QUIZ + '/practice.feedback' + CONSTANT.VIEW, {
            scope: $scope,
            animation: 'slide-in-down',
            hardwareBackButtonClose: false
          }).then(function(modal) {
            $scope.modal = modal;
          });
          $scope.openModal = function() {
            $scope.modal.show();
            $timeout(function() {
              if ($scope.modal.isShown()) {

                $scope.closeModal(quizCtrl.closeModalCallback);
              }
            }, 2000);
          };
          $scope.closeModal = function(callback) {
            quizCtrl.canRemoveFeedback = false;
            $scope.modal.hide().then(function() {
                if(callback){
                    callback();
                }
                quizCtrl.canRemoveFeedback = true;
            });
          };
        }
        quizCtrl.summary.score = {
          percent: 0,
          marks: 0
        };
        quizCtrl.summary.analysis = {};
        quizCtrl.report.attempts = {};

        //init report
        for (i = 0; i < quiz.objects.length; i++) {
          quizCtrl.report.attempts[quiz.objects[i].node.id] = [];
        }
        // init attempted
        for (i = 0; i < quizCtrl.quiz.objects.length; i++) {
          if (i !== 0)
            quizCtrl.quiz.objects[i].isVisited = false;
          else
            quizCtrl.quiz.objects[i].isVisited = true;

          if (quizCtrl.getQuestionType(quizCtrl.quiz.objects[i]) == CONSTANT.WIDGETS.QUESTION_TYPES.SCQ) {
            quizCtrl.quiz.objects[i].attempted = "";
          } else if (quizCtrl.getQuestionType(quizCtrl.quiz.objects[i]) == CONSTANT.WIDGETS.QUESTION_TYPES.MCQ) {
            quizCtrl.quiz.objects[i].attempted = [];
          }
        }
      }

    }
    function closeModalCallback () {
        if (quizCtrl.currentIndex >= quizCtrl.quiz.objects.length - 1) {
          quizCtrl.submitQuiz('practice');
        } else {
          $ionicSlideBoxDelegate.slide(quizCtrl.getCurrentIndex() + 1);
        }
    }
    function parseHtml(index) {
      quizCtrl.quiz.objects[index].node.widgetHtml = quizCtrl.widgetParser.parseToDisplay(quizCtrl.quiz.objects[index].node.title, index, quizCtrl.quiz);

      quizCtrl.quiz.objects[index].node.widgetSound = quizCtrl.widgetParser.getSoundId(quizCtrl.quiz.objects[index].node.title);
      for (j = 0; j < quizCtrl.quiz.objects[index].node.type.content.options.length; j++) {
        quizCtrl.quiz.objects[index].node.type.content.options[j].widgetHtml = quizCtrl.widgetParser.parseToDisplay(quizCtrl.quiz.objects[index].node.type.content.options[j].option, index, quizCtrl.quiz)
        quizCtrl.quiz.objects[index].node.type.content.options[j].widgetSound = quizCtrl.widgetParser.getSoundId(quizCtrl.quiz.objects[index].node.type.content.options[j].option);
      }
    }

    function getQuestionType(question) {
      if (question.node.type.type == CONSTANT.WIDGETS.QUESTION_TYPES.CHOICE_QUESTION) {
        return question.node.type.content.is_multiple ? CONSTANT.WIDGETS.QUESTION_TYPES.MCQ : CONSTANT.WIDGETS.QUESTION_TYPES.SCQ;
      }
    }

    function isCurrentIndex(index) {

      return quizCtrl.currentIndex == index;
    }

    function setCurrentIndex(index) {
      quizCtrl.currentIndex = index;
      return true;
    }

    function getCurrentIndex() {
      return quizCtrl.currentIndex;
    }

    function prevQuestion() {

      quizCtrl.currentIndex = (quizCtrl.currentIndex > 0) ? --quizCtrl.currentIndex : quizCtrl.currentIndex;
    }

    function nextQuestion(shouldScroll) {
      if (quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1) {

        if (shouldScroll) {
          quizCtrl.inViewFlag = false;
          var id = 'question-' + (quizCtrl.getCurrentIndex() + 1);
          var position = $('#' + id).position();
          $ionicScrollDelegate.scrollBy(position.left, position.top, true);
        }


        ++quizCtrl.currentIndex;


      }
      return true;
    }

    function getFeedback(question) {
      quizCtrl.submitAttempt(question.node.id, question.attempted);
      if (quizCtrl.isCorrectAttempted(question)) {
        audio.play('correct');
        quizCtrl.summary.analysis[question.node.id] = {
          title: question.node.title,
          status: 'correct',
          score: question.node.type.score
        }
        quizCtrl.summary.score.marks += question.node.id!=CONSTANT.QUESTION.DEMO ? question.node.type.score : 0;
        quizCtrl.summary.score.percent = parseInt((quizCtrl.summary.score.marks / quizCtrl.quiz.node.type.score) * 100);
        quizCtrl.summary.stars = quizCtrl.calculateStars(quizCtrl.summary.score.percent);
      } else {
        quizCtrl.summary.analysis[question.node.id] = {
          title: question.node.title,
          status: 'incorrect',
          score: 0
        }
        audio.play('wrong');
        // SCQ
        // if (quizCtrl.getQuestionType(question) == CONSTANT.WIDGETS.QUESTION_TYPES.SCQ) {
        //   question.attempted = '';
        // }
        // // MCQ
        // if (quizCtrl.getQuestionType(question) == CONSTANT.WIDGETS.QUESTION_TYPES.MCQ) {
        //   question.attempted = {};
        // }
        // if (quizCtrl.report.attempts[question.node.id].length == 2) {
        //   quizCtrl.quiz.objects.push(angular.copy(question));
        // }
      }
      $scope.openModal();
    }

    function canSubmit() {
      var question = quizCtrl.quiz.objects[quizCtrl.currentIndex];

      // SCQ
      if (quizCtrl.getQuestionType(question) == CONSTANT.WIDGETS.QUESTION_TYPES.SCQ) {
        return quizCtrl.quiz.objects[quizCtrl.currentIndex].attempted;
      }
      // MCQ
      if (quizCtrl.getQuestionType(question) == CONSTANT.WIDGETS.QUESTION_TYPES.MCQ) {
        //removes false keys
        question.attempted = _.pick(question.attempted, _.identity);
        // true if attempted and key count is more than one
        return question.attempted && _.size(question.attempted) >= 1;
      }
    }

    function submitAttempt(questionId, attempt, type) {
      if (type == 'litmus') {
        var isCorrect = quizCtrl.isCorrect(quizCtrl.quiz.objects[quizCtrl.currentIndex], attempt);
        quizCtrl.quiz.suggestion.test[0]['setPreviousAnswer'] = [isCorrect, quizCtrl.quiz.suggestion];
        quizCtrl.quiz.suggestion.test[0]["qSet"][quizCtrl.quiz.suggestion["actualLevel"]] = {
          "sr": quizCtrl.quiz.suggestion.qSr,
          "answered": isCorrect ? "right" : "wrong"
        };
        return true;
      } else {
        quizCtrl.report.attempts[questionId].push(angular.copy(attempt));
        return true;
      }

    }

    function setSuggestion() {
      $timeout(function () {


        quizCtrl.disable_submit = true;
        var temp_quiz = angular.copy(quizCtrl.quiz);
        temp_quiz.suggestion = ml.getNextQSr(quizCtrl.quiz.suggestion.test, ml.mapping);
        if (temp_quiz.suggestion) {


          temp_quiz.objects.push(ml.dqJSON[temp_quiz.suggestion.qSr]);
          content.getAssessment(temp_quiz).then(function(response){
            response.suggestion = temp_quiz.suggestion;
            quizCtrl.quiz = response;


            // quizCtrl.nextQuestion()
            $ionicSlideBoxDelegate.update();
            quizCtrl.report.attempts[quizCtrl.quiz.objects[quizCtrl.currentIndex+1].node.id] = [];

            $timeout(function() {
              quizCtrl.currentIndex++;
              $ionicSlideBoxDelegate.slide(quizCtrl.currentIndex);
              quizCtrl.enable_litmus = true;
              quizCtrl.disable_submit = false;
            }, 300);

          });
        } else {

          quizCtrl.endQuiz();
        }
      },300)




      return true;
    }

    function updateSlide() {
      $ionicSlideBoxDelegate.update();
      $timeout(function() {
        $ionicSlideBoxDelegate.next();
      }, 300)
    }


    function isAttempted(question) {
      // multiple choice
      if (quizCtrl.getQuestionType(question) == CONSTANT.WIDGETS.QUESTION_TYPES.MCQ) {
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
      if (quizCtrl.getQuestionType(question) == CONSTANT.WIDGETS.QUESTION_TYPES.SCQ) {
        return quizCtrl.report.attempts[question.node.id].length > 0;
      }
    }

    function isCorrect(question, attempt) {

      // multiple choice
      if (quizCtrl.getQuestionType(question) == CONSTANT.WIDGETS.QUESTION_TYPES.MCQ) {
        return _.chain(attempt).map(function(num, key) {
          return parseInt(key);
        }).sort().isEqual(question.node.type.answer.sort()).value();
      }
      // single choice
      if (quizCtrl.getQuestionType(question) == CONSTANT.WIDGETS.QUESTION_TYPES.SCQ) {
        return attempt == question.node.type.answer[0];
      }
    }

    function isCorrectAttempted(question) {

      // multiple choice
      if (quizCtrl.getQuestionType(question) == CONSTANT.WIDGETS.QUESTION_TYPES.MCQ) {
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
      if (quizCtrl.getQuestionType(question) == CONSTANT.WIDGETS.QUESTION_TYPES.SCQ) {
        return quizCtrl.report.attempts[question.node.id].indexOf(question.node.type.answer[0]) != -1 ? (true) : false;
      }
    }

    function isKeyCorrect(question, key) {
      return question.node.type.answer.indexOf(key) != -1 ;
    }

    function isKeyAttempted(question, key) {

      if (question.node.type.content.is_multiple) {
        return _.chain(quizCtrl.report.attempts[question.node.id]).last().has(key).value();
      } else {
        return quizCtrl.report.attempts[question.node.id].indexOf(key) != -1 ;
      }
    }

    function playAudio(key, index) {
      angular.element("#audioplayer")[0].pause();
      if (key) {
        var src = key;
        angular.element("#audioSource")[0].src = src;
        angular.element("#audioplayer")[0].load();
        angular.element("#audioplayer")[0].play();
      }
    }
    function stopAudio() {
      angular.element("#audioSource")[0].src = '';
      angular.element("#audioplayer")[0].pause();
    }

    function generateSummary(report, quiz) {
      var result = {
        analysis: {},
        score: {
          marks: 0,
          percent: 0
        },
        stars: 0,
      };
      angular.forEach(quiz.objects, function(value) {
        if (isAttempted(value)) {
          if (quizCtrl.isCorrectAttempted(value)) {
            result.analysis[value.node.id] = {
              title: value.node.widgetHtml,
              status: 'correct',
              score: value.node.type.score
            };
            result.score.marks += value.node.type.score;
          } else {
            result.analysis[value.node.id] = {
              title: value.node.widgetHtml,
              status: 'incorrect',
              score: 0
            };
          }
        } else {
          result.analysis[value.node.id] = {
            title: value.node.widgetHtml,
            status: 'unattempted',
            score: 0
          }
        }
      });
      result.score.percent = parseInt((result.score.marks / quiz.node.type.score) * 100);
      result.stars = quizCtrl.calculateStars(result.score.percent);
      return result;
    }


    function calculateStars(percentScore) {
      if (percentScore >= CONSTANT.STAR.ONE) {
        if (percentScore >= CONSTANT.STAR.TWO) {
          if (percentScore >= CONSTANT.STAR.THREE) {
            return 3;
          }
          return 2;
        }
        return 1;
      }
      return 0;
    }

    function range(num) {
      return new Array(num);
    }

    function submitQuiz(quizType) {
        if(quizCtrl.summary.analysis[CONSTANT.QUESTION.DEMO])
            delete quizCtrl.summary.analysis[CONSTANT.QUESTION.DEMO];
        if(quizCtrl.report.attempts[CONSTANT.QUESTION.DEMO])
            delete quizCtrl.report.attempts[CONSTANT.QUESTION.DEMO];
      if (quizType === 'practice') {
        $log.debug("END PRACTICE",quizCtrl.quiz)
        $scope.modal.hide().then(function() {
            analytics.log(
                {
                    name : 'PRACTICE',
                    type : 'END',
                    id : quizCtrl.quiz.node.type.id
                },
                {
                    time : new Date()
                },
              User.getActiveProfileSync()._id
            ) &&
          $state.go('quiz.summary', {
            report: (quizCtrl.report),
            summary: (quizCtrl.summary),
            type: 'practice'
          });
        });
      } else if (quizType === 'assessment') {
        $ionicPopup.confirm({
          title: 'Submit Quiz?',
          template: 'Are you sure you want to submit quiz?'
        }).then(function(res) {
          if (res) {
            quizCtrl.generateReport(quizCtrl.quiz);
            quizCtrl.summary = quizCtrl.generateSummary(quizCtrl.report, quizCtrl.quiz);
            analytics.log(
                {
                    name : 'QUIZ',
                    type : 'END',
                    id : quizCtrl.quiz.id
                },
                {
                    time : new Date()
                },
              User.getActiveProfileSync()._id
            ) &&
            $state.go('quiz.summary', {
              report: angular.copy(quizCtrl.report),
              summary: angular.copy(quizCtrl.summary),
              type: 'assessment'

            });
          }
        });
      }

    }

    function generateReport(quiz) {
      angular.forEach(quiz.objects, function(value, key) {
        if (quizCtrl.getQuestionType(value) == CONSTANT.WIDGETS.QUESTION_TYPES.SCQ && value.attempted !== '' && value.id !=CONSTANT.QUESTION.DEMO) {
          quizCtrl.submitAttempt(value.node.id,
            value.attempted);
        } else if (quizCtrl.getQuestionType(value) == CONSTANT.WIDGETS.QUESTION_TYPES.MCQ && value.attempted.length > 0 && value.id !=CONSTANT.QUESTION.DEMO) {
          quizCtrl.submitAttempt(value.node.id,
            value.attempted);
        }
      });
    }

    function endQuiz() {
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      if($stateParams.type == 'litmus'){
        var levelRec = ml.getLevelRecommendation();
        $log.debug('levelRec', levelRec);
        $state.go('litmus_result',{'average_level':levelRec.avgLevel})
        localStorage.setItem('diagnosis_flag',true);
      }else{
        $state.go('map.navigate', {});
      }
    }

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      quizCtrl.pauseModal = modal;
    });

    // $ionicPlatform.onHardwareBackButton(function(event) {
    //     if ($state.is('quiz.questions')) {
    //
    //     }
    //   })
    $ionicPlatform.registerBackButtonAction(function(event) {
      event.preventDefault()
    }, 101);
      // $ionicPlatform.registerBackButtonAction(function(event) {
      //     if($state.is('quiz.questions')){
      //         try {
      //             $scope.showNodeMenu();
      //         } catch (error) {
      //             ;
      //         }
      //     }
      // }, 101);

    $scope.showNodeMenu = function() {
      quizCtrl.pauseModal.show();
    }
    $scope.closeNodeMenu = function() {
      quizCtrl.pauseModal.hide();
    }

    function restartQuiz() {
      $state.go($state.current, {}, {
        reload: true
      });
    }



    function inViewTrigger(index, viewPart) {
      quizCtrl.inViewData[index] = viewPart;
      if (quizCtrl.inViewFlag) {
        if (viewPart == 'bottom' || viewPart == 'both' || viewPart == 'neither' || (viewPart == 'top' && quizCtrl.inViewData[index - 1] === undefined)) {
          quizCtrl.setCurrentIndex(index);
        }

      }
    }

    function highlightSoundIcon(questionIndex) {
      if (quizCtrl.quiz.objects[questionIndex].node.widgetHtml.indexOf(CONSTANT.WIDGETS.SPEAKER_IMAGE) >= 0) {
        quizCtrl.quiz.objects[questionIndex].node.widgetHtml = quizCtrl.quiz.objects[questionIndex].node.widgetHtml.replace(CONSTANT.WIDGETS.SPEAKER_IMAGE, CONSTANT.WIDGETS.SPEAKER_IMAGE_SELECTED)
      }
      var watchAudio = $interval(function() {
        if (angular.element("#audioplayer")[0].paused) {
          $interval.cancel(watchAudio)
          quizCtrl.quiz.objects[questionIndex].node.widgetHtml = quizCtrl.quiz.objects[questionIndex].node.widgetHtml.replace(CONSTANT.WIDGETS.SPEAKER_IMAGE_SELECTED, CONSTANT.WIDGETS.SPEAKER_IMAGE)
        }
      }, 100)
    }

    function next() {
      if (quizCtrl.summary.stars >= 1) {
        $ionicLoading.show({
          hideOnStateChange: true
        });
        analytics.log(
            {
                name : 'LESSON',
                type : 'END',
                id : $scope.selectedNode.node.id
            },
            {
                time : new Date()
            },
          User.getActiveProfileSync()._id
        )
        $state.go('map.navigate', {"activatedLesson" : quizCtrl.quiz});
      } else {
        $scope.showNodeMenu();
      }
    }

    // intronext

    $scope.tour = {
      config: {},
      steps: [{
        target: '#step1',
        content: 'This is the first step!',

      }, {
        target: '#step2',
        content: 'Blah blah blah.',

      }, {
        target: '#step3',
        content: 'I guess this is a menu!',

      }]
    };


    function tourNextStep() {

      if (nzTour.current) {
        if(nzTour.current.step === 0){
          angular.element("#audioplayer")[0].pause();
          angular.element("#audioSource")[0].src = 'sound/demo-quiz-2.mp3';
          angular.element("#audioplayer")[0].load();
          angular.element("#audioplayer")[0].play();
        }else if(nzTour.current.step === 1){
          angular.element("#audioplayer")[0].pause();
          angular.element("#audioSource")[0].src = 'sound/demo-quiz-3.mp3';
          angular.element("#audioplayer")[0].load();
          angular.element("#audioplayer")[0].play();
        }
        else if(nzTour.current.step === 2){
          $ionicPlatform.registerBackButtonAction(function(event) {
            $scope.showNodeMenu();
          }, 101);
        }
        nzTour.next();
      }
    }
    function playInstruction(index){

      if(quizCtrl.quiz.objects[index].node.instructionSound){

        angular.element("#audioplayer")[0].pause();
        angular.element("#audioSource")[0].src = quizCtrl.quiz.objects[index].node.instructionSound;
        angular.element("#audioplayer")[0].load();
        angular.element("#audioplayer")[0].play();
      }else if(quizCtrl.quiz.objects[index].node){

        quizCtrl.playAudio(quizCtrl.quiz.objects[index].node.widgetSound,index);
        quizCtrl.highlightSoundIcon(index);
      }
    }

    function logQuestion(index, type){
        analytics.log(
            {
                name : 'QUESTION',
                type : type,
                id : quizCtrl.quiz.objects[index].node.id
            },
            {
                time : new Date()
            },
          User.getActiveProfileSync()._id
        )
    }
    function intro_end_quiz(){
      $log.debug("removed event listener quiz",$state);
      angular.element("#audioplayer")[0].removeEventListener('ended',intro_end_quiz, false);

      if($state.current.name == 'quiz.questions'){
        $scope.nodeRibbonFlag = false;
        $scope.nodeRibbon.hide().then(function(){
          if($state.is('quiz.questions') && User.demo.isShown(5)){

            $timeout(function(){
              if($stateParams.type!=='litmus'){
                angular.element("#audioplayer")[0].pause();
                angular.element("#audioSource")[0].src = 'sound/demo-quiz-1.mp3';
                angular.element("#audioplayer")[0].load();
                angular.element("#audioplayer")[0].play();
                nzTour.start($scope.tour);
                User.demo.setStep(5);
                $timeout(function(){

                  if(nzTour.current.step === 0){
                    tourNextStep();
                  }
                },3500)
              }

            });

          }else{
            $log.debug("playInstruction")
            quizCtrl.playInstruction(0);

            $ionicPlatform.registerBackButtonAction(function(event) {
              $scope.showNodeMenu();
            }, 101);
          }

        });
      }

    }

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.CONTENT + '/content.modal-ribbon' + CONSTANT.VIEW, {
      scope: $scope,
      // animation: 'slide-in-up',
      backdropClickToClose: false,
      hardwareBackButtonClose: false
    }).then(function(modal){
      $scope.nodeRibbon = modal;
      $scope.nodeRibbonFlag = true;
      // modal.show();
      $log.debug(quiz)
      angular.element("#audioplayer")[0].pause();
      angular.element("#audioSource")[0].src = quiz.node.parsed_sound;
      angular.element("#audioplayer")[0].load();
      angular.element("#audioplayer")[0].play();
      $log.debug("Added even listener quiz");
      angular.element("#audioplayer")[0].addEventListener('ended', intro_end_quiz, false);

    })


    // $scope.progressBar();

  }
})();
