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
    'content',
    'localized',
    'network',
    'challenge'
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
    content,
    localized,
    network,
    challenge
  ) {
    var quizCtrl = this;
    //bind quiz resolved to controller
    quizCtrl.quiz = quiz;;
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
    quizCtrl.inViewData = {};
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
    quizCtrl.highlightSoundIconFlag = false;
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
    quizCtrl.playQuizIntro = playQuizIntro;
    quizCtrl.intro_end_quiz = intro_end_quiz;
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
    quizCtrl.noPauseFlag = true;
    $scope.tourNextStep = tourNextStep;
    $scope.lessonutils = lessonutils;
    $scope.userGender = User.getActiveProfileSync().data.profile.gender;
    $scope.selectedNode = lessonutils.getLocalLesson();
    $scope.modal = {};
    $scope.logResume = logResume;
    $scope.resultStarFlag = [];
    quizCtrl.closeModalCallback = closeModalCallback;
    $scope.analytics_quit_data = {
      name: 'PRACTICE',
      type: 'QUIT',
      id: quizCtrl.quiz.node.id
    };
    $scope.groups = [];
    $scope.resultButtonAnimationFlag = 0;
    $scope.quizResultButtonAnimation = quizResultButtonAnimation;
    $scope.enableGoToMapButton = false;
    quizCtrl.hasJoinedChallenge = User.hasJoinedChallenge();
    for (var i = 0; i < 10; i++) {
      $scope.groups[i] = {
        name: i,
        items: []
      };
      for (var j = 0; j < 3; j++) {
        $scope.groups[i].items.push(i + '-' + j);
      }
    }

    function logResume() {
      analytics.log({
          name: 'PRACTICE',
          type: 'RESUME',
          id: quizCtrl.quiz.node.id
        }, {
          time: new Date()
        },
        User.getActiveProfileSync()._id
      )
    }

    function isScroll(id) {}

    function redo() {
      if (quizCtrl.quiz.objects[0].node.id === CONSTANT.QUESTION.DEMO) {
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
      var starSound = ["one_star", "two_star", "three_star"];
      var star = 0;
      if (quizCtrl.summary.stars) {
        star = quizCtrl.summary.stars;
      } else if (quizCtrl.summary.score.percent) {
        star = quizCtrl.summary.score.percent > CONSTANT.STAR.THREE ? 3 : quizCtrl.summary.score.percent > CONSTANT.STAR.TWO ? 2 : quizCtrl.summary.score.percent > CONSTANT.STAR.ONE ? 1 : 0;
      } else {
        star = 0;
      }
      $log.debug("playing star sound", star);
      for (var i = 0; i < star; i++) {
        $log.debug("sound source", starSound[i]);
        (function(count) {
          $timeout(function() {
            $scope.resultStarFlag[count] = true;
            $log.debug("sound source", starSound, count, starSound[count]);
            audio.player.play("sound/" + starSound[count] + ".mp3")
              // angular.element("#audioplayer")[0].pause();
              // angular.element("#audioSource")[0].src = ;
              // angular.element("#audioplayer")[0].load();
              // angular.element("#audioplayer")[0].play();
          }, (count + 1) * 1000);
        })(i);
      }
    }

    function submitReport(quiz, report, summary) {
      // $log.debug("Submit Report called");
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
      if ($state.current.name == "quiz.start") {}
      if ($state.current.name == "quiz.summary") {
        quizCtrl.report = $stateParams.report;
        quizCtrl.quiz = $stateParams.quiz;
        quizCtrl.summary = $stateParams.summary;
        quizCtrl.playStarSound();
      } else if ($state.current.name == "quiz.questions") {
        quizCtrl.setCurrentIndex(0);
        quizCtrl.logQuestion(0, 'START');
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
            $log.debug("openModal");
            $scope.modal.show().then(function() {
              $timeout(function() {
                $log.debug("openModal timeout triggered, is modal shown", $scope.modal.isShown());
                if (quizCtrl.currentIndex == quizCtrl.quiz.objects.length - 1) {
                  $log.debug("PRactice end");
                }
                quizCtrl.practiceEnd = true;
                if ($scope.modal.isShown()) {
                  $log.debug("openModal closing modal ");
                  $scope.closeModal(quizCtrl.closeModalCallback);
                }
              }, 2000);
            });
          };
          $scope.closeModal = function(callback) {
            $log.debug("closeModal");
            quizCtrl.canRemoveFeedback = false;
            $scope.modal.hide().then(function() {
              $log.debug("closeModal modal hidden");
              if (callback) {
                $log.debug("closeModal callback found ");
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

    function closeModalCallback() {
      $log.debug("closeModalCallback");
      if (quizCtrl.currentIndex >= quizCtrl.quiz.objects.length - 1) {
        $log.debug("closeModalCallback quizCtrl.currentIndex >= quizCtrl.quiz.objects.length - 1");
        quizCtrl.submitQuiz('practice');
      } else {
        $log.debug("closeModalCallback quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1");
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
      $log.debug("get Feedback");
      quizCtrl.submitAttempt(question.node.id, question.attempted);
      if (quizCtrl.isCorrectAttempted(question)) {
        $log.debug("get Feedback Correct");
        audio.play('correct');
        quizCtrl.summary.analysis[question.node.id] = {
          title: question.node.title,
          status: 'correct',
          score: question.node.type.score
        }
        quizCtrl.summary.score.marks += question.node.id != CONSTANT.QUESTION.DEMO ? question.node.type.score : 0;
        quizCtrl.summary.score.percent = parseInt((quizCtrl.summary.score.marks / quizCtrl.quiz.node.type.score) * 100);
        quizCtrl.summary.stars = quizCtrl.calculateStars(quizCtrl.summary.score.percent);
      } else {
        $log.debug("get Feedback Wrong");
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
      $log.debug("get Feedback Opening Modal");
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
      $timeout(function() {
        quizCtrl.disable_submit = true;
        var temp_quiz = angular.copy(quizCtrl.quiz);
        temp_quiz.suggestion = ml.getNextQSr(quizCtrl.quiz.suggestion.test, ml.mapping);
        if (temp_quiz.suggestion) {
          temp_quiz.objects.push(ml.dqJSON[temp_quiz.suggestion.qSr]);
          content.getAssessment(temp_quiz).then(function(response) {
            response.suggestion = temp_quiz.suggestion;
            $log.debug(response.objects.length, response.objects[response.objects.length - 1], response, "RESPONSE")
            quizCtrl.quiz.objects.push(angular.copy(response.objects[response.objects.length - 1]))
            quizCtrl.quiz.suggestion = (response.suggestion);
            $log.debug(quizCtrl.quiz, response, "Check diff")
              // quizCtrl.quiz = response;
              // quizCtrl.nextQuestion()
            $ionicSlideBoxDelegate.update();
            quizCtrl.report.attempts[quizCtrl.quiz.objects[quizCtrl.currentIndex + 1].node.id] = [];
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
      }, 300)
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
      return question.node.type.answer.indexOf(key) != -1;
    }

    function isKeyAttempted(question, key) {
      if (question.node.type.content.is_multiple) {
        return _.chain(quizCtrl.report.attempts[question.node.id]).last().has(key).value();
      } else {
        return quizCtrl.report.attempts[question.node.id].indexOf(key) != -1;
      }
    }

    function playAudio(key, index) {
      key && analytics.log({
          name: 'QUESTION',
          type: 'PLAY',
          id: quizCtrl.quiz.objects[index].node.id
        }, {
          time: new Date(),
          file: key
        },
        User.getActiveProfileSync()._id
      )
      if (key) {
        audio.player.play(key)
      }
    }

    function stopAudio() {
      audio.player.stop()
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
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.COMMON + '/common.modal-result-quiz' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down',
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.resultMenu = modal;
    });

    function resultButtonAnimation() {
      $log.debug("ANIMATION. Inside button animation")
      $timeout(function() {
        $scope.resultButtonAnimationFlag = 1;
      }, 3000).then(function() {
        $timeout(function() {
          $scope.resultButtonAnimationFlag = 2;
        }, 400)
      })
    }

    function submitQuiz(quizType) {
      if (quizCtrl.summary.analysis[CONSTANT.QUESTION.DEMO])
        delete quizCtrl.summary.analysis[CONSTANT.QUESTION.DEMO];
      if (quizCtrl.report.attempts[CONSTANT.QUESTION.DEMO])
        delete quizCtrl.report.attempts[CONSTANT.QUESTION.DEMO];
      if (quizType === 'practice') {
        var report = quizCtrl.report;
        var quiz = $stateParams.quiz;
        var summary = quizCtrl.summary;
        var lesson = lessonutils.getLocalLesson();
        $scope.modal.hide().then(function() {
          analytics.log({
              name: $stateParams.type == 'litmus' ? 'LITMUS' : 'PRACTICE',
              type: 'END',
              id: quizCtrl.quiz.node.id
            }, {
              time: new Date()
            },
            User.getActiveProfileSync()._id
          );
          !$scope.resultMenu.isShown() && $scope.resultMenu.show().then(function() {
            $log.debug('ANIMATION. result menu was open');
            resultButtonAnimation();
            playStarSound();
            if (!$stateParams.quiz.isPlayed && quizCtrl.hasJoinedChallenge) {
              challenge.addPoints(User.getActiveProfileSync()._id, 50, 'node_complete', $stateParams.quiz.node.id);
            }
            User.skills.update({
                profileId: User.getActiveProfileSync()._id,
                lessonId: quiz.parent,
                id: quiz.node.id,
                score: summary.score.marks,
                totalScore: quiz.node.type.score,
                skill: quiz.node.tag,
              })
              .then(function() {
                return User.scores.getScoreOfAssessment(quiz.node.id, lesson.node.id, User.getActiveProfileSync()._id, quiz.node.playlist_index)
              })
              .then(function(previousScore) {
                if ((!previousScore) || (!previousScore.hasOwnProperty('score')) || (previousScore && parseInt(previousScore.score) < summary.score.marks)) {
                  return User.scores.update({
                    profileId: User.getActiveProfileSync()._id,
                    lessonId: lesson.node.id,
                    id: quiz.node.id,
                    score: summary.score.marks,
                    totalScore: quiz.node.type.score,
                    type: 'assessment',
                    skill: quiz.node.tag,
                    playlist_index: quiz.node.playlist_index
                  })
                }
              })
              .then(function() {
                if (quiz.node.requiresSuggestion) {
                  return ml.setLessonResultMapping().then(function() {
                    var suggestion = ml.getLessonSuggestion({
                      "event": "assessment",
                      "score": summary.score.marks,
                      "totalScore": quiz.node.type.score,
                      "skill": quiz.node.tag.toLowerCase(),
                      "sr": quiz.node.parentHindiLessonId,
                      "miss": quiz.node.miss
                    });
                    //save cache if present
                    $log.debug("caching quiz suggestion 1", suggestion);
                    if (network.isOnline() || JSON.parse(localStorage.getItem('cachedList')).indexOf(suggestion["suggestedLesson"]) >= 0) {
                      suggestion = {
                        "suggestedLesson": suggestion["suggestedLesson"],
                        "dependencyData": suggestion["dependencyData"],
                        "cache": suggestion["cache"],
                        "miss": false
                      };
                      $log.debug('caching quiz hit', network.isOnline(), suggestion);
                    } else {
                      $log.debug('caching quiz miss', network.isOnline(), suggestion);
                      suggestion = {
                        "suggestedLesson": suggestion["miss"],
                        "dependencyData": suggestion["missDependencyData"],
                        "cache": suggestion["cache"],
                        "miss": true
                      };
                      if (suggestion["suggestedLesson"] == null) {
                        $log.debug('caching quiz miss and null', network.isOnline(), suggestion);
                        suggestion = ml.getLessonSuggestion({
                          "event": "assessment",
                          "miss": true
                        });
                        suggestion = {
                          "suggestedLesson": suggestion["suggestedLesson"],
                          "dependencyData": suggestion["dependencyData"],
                          "cache": suggestion["cache"],
                          "miss": false
                        };
                      }
                    }
                    if (suggestion.cache) {
                      localStorage.setItem('cachingList', JSON.stringify(suggestion.cache));
                    }
                    $log.debug("got sugggestion", suggestion);
                    return User.profile.updateRoadMapData(ml.roadMapData, User.getActiveProfileSync()._id).then(function() {
                      return User.playlist.add(User.getActiveProfileSync()._id, suggestion)
                    })
                  })
                } else {
                  return ml.setLessonResultMapping().then(function() {
                    $log.debug('deleteSuccessfulNodeFromRoadmap');
                    ml.deleteSuccessfulNodeFromRoadmap(quiz.node.parent, summary.score.marks / quiz.node.type.score);
                  });
                }
              })
              .then(function(success) {
                $log.debug("playlist added user can go back to map")
                $scope.enableGoToMapButton = true;
                // var report_id = success.id;
                var attempts = [];
                angular.forEach(report.attempts, function(value, key) {
                  attempts.push({
                    answer: value.length > 0 ? value : null,
                    score: summary.analysis[key].score,
                    status: value.length > 0 ? CONSTANT.ATTEMPT.STATUS.ATTEMPTED : CONSTANT.ATTEMPT.STATUS.SKIPPED,
                    // person: Auth.getProfileId(),
                    // report: report_id,
                    node: key
                  });
                });
                return User.reports.save({
                  'score': summary.score.marks,
                  'attempts': attempts,
                  'profileId': User.getActiveProfileSync()._id,
                  'node': quiz.node.id
                })
              })
          });
          // disable state go to summary
          // $state.go('quiz.summary', {
          //   report: (quizCtrl.report),
          //   summary: (quizCtrl.summary),
          //   type: 'practice'
          // })
        });
      } else if (quizType === 'assessment') {
        $ionicPopup.confirm({
          title: 'Submit Quiz?',
          template: 'Are you sure you want to submit quiz?'
        }).then(function(res) {
          if (res) {
            quizCtrl.generateReport(quizCtrl.quiz);
            quizCtrl.summary = quizCtrl.generateSummary(quizCtrl.report, quizCtrl.quiz);
            analytics.log({
                  name: 'QUIZ',
                  type: 'END',
                  id: quizCtrl.quiz.id
                }, {
                  time: new Date()
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
        if (quizCtrl.getQuestionType(value) == CONSTANT.WIDGETS.QUESTION_TYPES.SCQ && value.attempted !== '' && value.id != CONSTANT.QUESTION.DEMO) {
          quizCtrl.submitAttempt(value.node.id,
            value.attempted);
        } else if (quizCtrl.getQuestionType(value) == CONSTANT.WIDGETS.QUESTION_TYPES.MCQ && value.attempted.length > 0 && value.id != CONSTANT.QUESTION.DEMO) {
          quizCtrl.submitAttempt(value.node.id,
            value.attempted);
        }
      });
    }

    function endQuiz() {
      // $log.debug("End quiz called");
      if ($stateParams.type == 'litmus') {
        var levelRec = ml.getLevelRecommendation();
        $log.debug('levelRec', levelRec);
        if (typeof(window.netConnected) == "undefined") {
          window.netConnected = false;
        }
        ml.setLessonResultMapping().then(function() {
          var suggestion = ml.getLessonSuggestion({
            "event": "diagnosisTest",
            "levelRec": levelRec
          });
          localStorage.setItem('cachingList', JSON.stringify(suggestion.cache));
          localStorage.setItem('cachedList', JSON.stringify([]));
          $log.debug("caching diagnosis suggestion", suggestion);
          suggestion = {
            "suggestedLesson": suggestion["suggestedLesson"],
            "dependencyData": suggestion["dependencyData"],
            "miss": false
          };
          $log.debug('caching diagnosis online', network.isOnline(), suggestion);
          User.profile.updateRoadMapData(ml.roadMapData, User.getActiveProfileSync()._id).then(function() {
            User.playlist.add(User.getActiveProfileSync()._id, suggestion).then(function() {
              $log.debug("average level", levelRec.avgLevel);
              $state.go('litmus_result', {
                'average_level': levelRec.avgLevel
              });
            });
          });
        });
        localStorage.setItem('diagnosis_flag', true);
      } else {
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
    // YOU ARE HERE
    // $ionicPlatform.registerBackButtonAction(function(event) {
    //   event.preventDefault()
    // }, 101);
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
      $stateParams.type == 'practice' && analytics.log({
          name: 'PRACTICE',
          type: 'PAUSE',
          id: quizCtrl.quiz.node.id
        }, {
          time: new Date()
        },
        User.getActiveProfileSync()._id
      )
      quizCtrl.pauseModal.show().then(function() {
        audio.player.play(CONSTANT.PATH.LOCALIZED_AUDIO + localized.audio.app.ExitResource.lang[User.getActiveProfileSync().data.profile.language]);
      });
    }
    $scope.closeNodeMenu = function() {
      quizCtrl.pauseModal.hide().then(function() {
        audio.player.stop();
      });
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
      // if (quizCtrl.quiz.objects[questionIndex].node.widgetHtml.indexOf(CONSTANT.WIDGETS.SPEAKER_IMAGE) >= 0) {
      // quizCtrl.quiz.objects[questionIndex].node.widgetHtml = quizCtrl.quiz.objects[questionIndex].node.widgetHtml.replace(CONSTANT.WIDGETS.SPEAKER_IMAGE, CONSTANT.WIDGETS.SPEAKER_IMAGE_SELECTED)
      // }
      // $log.debug("Original WidgetSound",quizCtrl.quiz.objects[questionIndex].node.widgetSound)
      // $log.debug("SoundSource",angular.element("#audioSource")[0].src)
      // $log.debug("Original WidgetSound - bundled","file:///android_asset/www/"+quizCtrl.quiz.objects[questionIndex].node.widgetSound)
      // $log.debug("SoundSource - bundled",angular.element("#audioSource")[0].src)
      // $log.debug("Sound Source not same",angular.element("#audioSource")[0].src != quizCtrl.quiz.objects[questionIndex].node.widgetSound)
      // $log.debug("Sound source not same bunlded","file:///android_asset/www/"+ quizCtrl.quiz.objects[questionIndex].node.widgetSound != angular.element("#audioSource")[0].src )
      // $log.debug("THIS IS THE INDEX",$scope.selectedNode)
      quizCtrl.highlightSoundIconFlag = true;
      if (quizCtrl.quiz.objects[questionIndex].node.widgetSound != null) {
        var watchAudio = $interval(function() {
          // $log.debug("WidgetSound trimmed",quizCtrl.quiz.objects[questionIndex].node.widgetSound.split("/").pop())
          // $log.debug("Source trimmed",angular.element("#audioSource")[0].src.split("/").pop())
          // $log.debug("THIS WHY I HATE BUNDLED",quizCtrl.quiz.objects[questionIndex].node.widgetSound.split("/").pop() != angular.element("#audioSource")[0].src.split("/").pop())
          if (angular.element("#audioplayer")[0].paused || quizCtrl.quiz.objects[questionIndex].node.widgetSound.split("/").pop() != angular.element("#audioSource")[0].src.split("/").pop()) {
            quizCtrl.highlightSoundIconFlag = false;
            $interval.cancel(watchAudio)
              // quizCtrl.quiz.objects[questionIndex].node.widgetHtml = quizCtrl.quiz.objects[questionIndex].node.widgetHtml.replace(CONSTANT.WIDGETS.SPEAKER_IMAGE_SELECTED, CONSTANT.WIDGETS.SPEAKER_IMAGE)
          }
        }, 100)
      } else {
        $log.warn("This question doesn't have sound")
      }
    }

    function next() {
      // if (quizCtrl.summary.stars >= 1) {
      $ionicLoading.show({
        hideOnStateChange: true
      });
      $scope.resultMenu.hide().then(function() {
        $state.go('map.navigate', {
          "activatedLesson": quizCtrl.quiz
        });
      })
      analytics.log({
          name: 'LESSON',
          type: 'END',
          id: $scope.selectedNode.node.id
        }, {
          time: new Date()
        },
        User.getActiveProfileSync()._id
      )
      $stateParams.type == 'practice' && analytics.log({
            name: 'PRACTICE',
            type: 'SWITCH',
            id: quizCtrl.quiz.node.id
          }, {
            time: new Date()
          },
          User.getActiveProfileSync()._id
        )
        // }
        // else {
        //   $scope.showNodeMenu();
        // }
    }
    // intronext
    $scope.tour = {
      config: {
        onComplete: function() {
          quizCtrl.noPauseFlag = false;
          $log.debug('Unsetting noPauseFlag2')
        }
      },
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
        if (nzTour.current.step === 0) {
          audio.player.play('sound/demo-quiz-2.mp3');
        } else if (nzTour.current.step === 1) {
          audio.player.play('sound/demo-quiz-3.mp3');
        } else if (nzTour.current.step === 2) {
          // $log.debug("Unsetting No Pause Flag")
          //HERE YOU ARE
          // $ionicPlatform.registerBackButtonAction(function(event) {
          //   audio.player.stop();
          //   $scope.showNodeMenu();
          // }, 101);
        }
        nzTour.next();
      }
    }

    function playInstruction(index) {
      if (quizCtrl.quiz.objects[index].node.instructionSound) {
        audio.player.play(quizCtrl.quiz.objects[index].node.instructionSound)
        angular.element("#audioplayer")[0].onended = instructionEndCallback
      } else if (quizCtrl.quiz.objects[index].node) {
        audio.player.play(quizCtrl.quiz.objects[index].node.widgetSound);
        quizCtrl.highlightSoundIcon(index);
      }
    }

    function instructionEndCallback() {
      var index = quizCtrl.currentIndex;
      audio.player.play(quizCtrl.quiz.objects[index].node.widgetSound);
      quizCtrl.highlightSoundIcon(index);
    }

    function logQuestion(index, type) {
      var activityName = 'QUESTION';
      if ($stateParams.type === 'litmus') {
        activityName = 'LITMUS';
      }
      analytics.log({
          name: activityName,
          type: type,
          id: quizCtrl.quiz.objects[index].node.id
        }, {
          time: new Date()
        },
        User.getActiveProfileSync()._id
      );
    }

    function intro_end_quiz() {
      $log.debug("Inside onended event");
      // $log.debug("removed event listener quiz",$state);
      angular.element("#audioplayer")[0].onended = null;
      if ($state.current.name == 'quiz.questions') {
        $scope.nodeRibbonFlag = false;
        // $scope.nodeRibbon.hide().then(function(){
        if ($state.is('quiz.questions') && User.demo.isShown(5) && CONSTANT.QUESTION_DEMO) {
          $timeout(function() {
            quizCtrl.noPauseFlag = true;
            if ($stateParams.type !== 'litmus') {
              audio.player.play('sound/demo-quiz-1.mp3');
              nzTour.start($scope.tour); // commenting nztour
              User.demo.setStep(5);
              $timeout(function() {
                if (nzTour.current.step === 0) {
                  tourNextStep();
                }
              }, 3500)
            }
          });
        } else {
          $log.debug('Demo has ended')
          quizCtrl.noPauseFlag = false;
          $log.debug("Unsetting noPauseFlag");
          quizCtrl.playInstruction(0);
        }
        // });
      }
    }
    $ionicModal.fromTemplateUrl(CONSTANT.PATH.CONTENT + '/content.modal-ribbon' + CONSTANT.VIEW, {
      scope: $scope,
      // animation: 'slide-in-up',
      backdropClickToClose: false,
      hardwareBackButtonClose: false
    }).then(function(modal) {
      $scope.nodeRibbon = modal;
      $scope.nodeRibbonFlag = true;
      quizCtrl.noPauseFlag = true;
      //   $log.debug("Setting No Pause Flag");
      //   if(quiz.node.parsed_sound){
      //     audio.player.play(quiz.node.parsed_sound);
      //     angular.element("#audioplayer")[0].onended = intro_end_quiz;
      //     $log.debug("Added onended event");
      //   }
      //   else{
      //     $timeout(function(){
      //       intro_end_quiz();
      //     },1000)
      //   }
    });
    // quizCtrl.playQuizIntro()
    function playQuizIntro() {
      intro_end_quiz()
        // $scope.nodeRibbon.show().then(function(){
        //       if(quiz.node.parsed_sound){
        //             audio.player.play(quiz.node.parsed_sound);
        //             angular.element("#audioplayer")[0].onended = ;
        //         }
        // })
    }
    // $scope.progressBar();
    $scope.$on('backButton', function() {
      $log.debug('back button pressed')
        // $log.debug("nzTour",nzTour.current.step);
      if (!quizCtrl.noPauseFlag) {
        audio.player.stop();
        $scope.showNodeMenu();
      }
    });
    $scope.$on('appResume', function() {
      if ($stateParams.type == 'practice' && $state.current.name != 'quiz.summary' && !$scope.nodeRibbon.isShown()) {
        $scope.closeModal();
        $scope.showNodeMenu();
      } else if ($scope.nodeRibbon.isShown()) {
        audio.player.resume();
      } else {}
    })
    $scope.$on('appPause', function() {
      audio.player.removeCallback();
      audio.player.stop();
      $timeout.cancel(timeout);
    })

    function quizResultButtonAnimation() {
      $timeout(function() {
        $scope.resultButtonAnimationFlag = 1;
      }, 3000).then(function() {
        $timeout(function() {
          $scope.resultButtonAnimationFlag = 2;
        }, 400)
      })
    }
  }
})();