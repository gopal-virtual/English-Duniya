//To do : handle native back button
(function() {
  angular
    .module('zaya-quiz')
    .controller('QuizController', QuizController)

  QuizController.$inject = ['quiz', 'widgetParser', '$stateParams', '$state', '$scope', 'audio', '$log', '$ionicModal', 'CONSTANT', '$ionicSlideBoxDelegate', 'Utilities', 'Quiz', 'Auth', '$ionicLoading', '$ionicPopup', 'lessonutils', 'orientation', '$location', '$anchorScroll', '$document', '$ionicScrollDelegate', '$ionicPosition', '$timeout', '$window', 'soundManager', '$cordovaFileTransfer', '$cordovaFile', '$interval', '$q', '$ImageCacheFactory'];

  function QuizController(quiz, widgetParser, $stateParams, $state, $scope, audio, $log, $ionicModal, CONSTANT, $ionicSlideBoxDelegate, Utilities, Quiz, Auth, $ionicLoading, $ionicPopup, lessonutils, orientation, $location, $anchorScroll, $document, $ionicScrollDelegate, $ionicPosition, $timeout, $window, soundManager, $cordovaFileTransfer, $cordovaFile, $interval, $q, $ImageCacheFactory) {

    var quizCtrl = this;


    //bind quiz resolved to controller
    quizCtrl.quiz = quiz;

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
    //preload resources
    quizCtrl.preloadResources = preloadResources;
    quizCtrl.preloadSounds = preloadSounds;
    quizCtrl.preloadImages = preloadImages;


    // quizCtrl.pauseQuiz = pauseQuiz;
    quizCtrl.restartQuiz = restartQuiz;
    quizCtrl.CONSTANT = CONSTANT;
    //audio
    quizCtrl.playAudio = playAudio;
    quizCtrl.starCount = starCount;

    quizCtrl.calculateStars = calculateStars;

    //timer
    quizCtrl.counter = 0;
    quizCtrl.timer = new Date(1970, 0, 1).setSeconds(quizCtrl.counter);
    quizCtrl.stopTimer = stopTimer;
    quizCtrl.startTimer = startTimer;


    //helper functions
    quizCtrl.getQuestionType = getQuestionType;


    // initialisation call
    quizCtrl.init(quizCtrl.quiz);

    $scope.lessonutils = lessonutils;
    $scope.selectedNode = lessonutils.getLocalLesson();

    $scope.modal = {};

    function stopTimer() {
      $interval.cancel(quizCtrl.interval);
    }

    function startTimer() {
      quizCtrl.interval = $interval(function() {
        quizCtrl.counter++;
        quizCtrl.timer += 1000;
      }, 1000);
    }

    function starCount(index) {
      var count = quizCtrl.summary.stars - index;
      return count > 0 ? count : 0;
    }

    function playStarSound() {
      var star;
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
      Quiz.saveReport({
        node: quiz.node.id,
        person: Auth.getProfileId(),
        score: summary.score.marks
      }, function(success) {
        var report_id = success.id;
        var attempts = [];
        angular.forEach(report.attempts, function(value, key) {
          attempts.push({
            answer: value.length > 0 ? value : null,
            score: summary.analysis[key].score,
            status: value.length > 0 ? CONSTANT.ATTEMPT.STATUS.ATTEMPTED : CONSTANT.ATTEMPT.STATUS.SKIPPED,
            person: Auth.getProfileId(),
            report: report_id,
            node: key
          });
        });
        Quiz.saveAttempt(attempts, function(response) {}, function(error) {})
      }, function(error) {

      })
    }

    function disableSwipe() {
      $ionicSlideBoxDelegate.enableSlide(false);
    }

    function init(quiz) {
      if ($state.current.name == "quiz.summary") {
        quizCtrl.report = $stateParams.report;
        quizCtrl.quiz = $stateParams.quiz;
        quizCtrl.summary = $stateParams.summary;
        quizCtrl.playStarSound();
        $log.debug("summary")
        $log.debug(quizCtrl.summary)
          // quizCtrl.summary = quizCtrl.generateSummary(quizCtrl.report, quizCtrl.quiz);
        quizCtrl.submitReport(quizCtrl.quiz, quizCtrl.report, quizCtrl.summary);
      } else if ($state.current.name == "quiz.questions") {
        quizCtrl.preloadResources(quiz).then(function(success) {

        });
        quizCtrl.setCurrentIndex(0);
        if ($stateParams.type == 'assessment') {
          quizCtrl.startTimer();
        }
        if ($stateParams.type == 'practice') {
          $ionicSlideBoxDelegate.enableSlide(false);

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
              if (quizCtrl.currentIndex >= quizCtrl.quiz.objects.length - 1) {
                quizCtrl.submitQuiz('practice');
              } else {
                $scope.modal.hide().then(function() {
                  $ionicSlideBoxDelegate.slide(quizCtrl.getCurrentIndex() + 1);
                });
              }
            } else {
              $scope.modal.hide()
            }
          };
        }
        quizCtrl.summary.score = {
          percent: 0,
          marks: 0
        };
        quizCtrl.summary.analysis = {};
        quizCtrl.report.attempts = {};
        //parse all the options and questions to html
        for (i = 0; i < quiz.objects.length; i++) {
          quizCtrl.quiz.objects[i].node.widgetHtml = quizCtrl.widgetParser.parseToDisplay(quizCtrl.quiz.objects[i].node.title, i, quizCtrl.quiz);

          quizCtrl.quiz.objects[i].node.widgetSound = quizCtrl.widgetParser.getSoundId(quizCtrl.quiz.objects[i].node.title);
          for (j = 0; j < quizCtrl.quiz.objects[i].node.type.content.options.length; j++) {
            quizCtrl.quiz.objects[i].node.type.content.options[j].widgetHtml = quizCtrl.widgetParser.parseToDisplay(quizCtrl.quiz.objects[i].node.type.content.options[j].option, i, quizCtrl.quiz)
            quizCtrl.quiz.objects[i].node.type.content.options[j].widgetSound = quizCtrl.widgetParser.getSoundId(quizCtrl.quiz.objects[i].node.type.content.options[j].option);
          }
        }
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
      $log.debug("nextQuestion");
      if (quizCtrl.currentIndex < quizCtrl.quiz.objects.length - 1) {
        if (shouldScroll) {
          quizCtrl.inViewFlag = false;
          var id = 'question-' + (quizCtrl.getCurrentIndex() + 1);
          var position = $('#' + id).position();
          $ionicScrollDelegate.scrollBy(position.left, position.top, true);
        }
        ++quizCtrl.currentIndex;
      }
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
        quizCtrl.summary.score.marks += question.node.type.score;
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
        if (quizCtrl.getQuestionType(question) == CONSTANT.WIDGETS.QUESTION_TYPES.SCQ) {
          question.attempted = '';
        }
        // MCQ
        if (quizCtrl.getQuestionType(question) == CONSTANT.WIDGETS.QUESTION_TYPES.MCQ) {
          question.attempted = {};
        }
        if (quizCtrl.report.attempts[question.node.id].length == 2) {
          quizCtrl.quiz.objects.push(angular.copy(question));
        }
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

    function submitAttempt(questionId, attempt) {
      quizCtrl.report.attempts[questionId].push(angular.copy(attempt));
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
      if(key !== undefined){
        angular.element("#audioplayer")[0].pause();
        var src;
        try{
          src = soundManager.getSound(CONSTANT.RESOURCE_SERVER + quizCtrl.quiz.objects[index].node.type.content.widgets.sounds[key]);
        }
        catch(e){
          src = CONSTANT.RESOURCE_SERVER + quizCtrl.quiz.objects[index].node.type.content.widgets.sounds[key];
        }

        angular.element("#audioSource")[0].src = src;
        angular.element("#audioplayer")[0].load();
        angular.element("#audioplayer")[0].play();
      }


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
              title: value.node.title,
              status: 'correct',
              score: value.node.type.score
            };
            result.score.marks += value.node.type.score;
          } else {
            result.analysis[value.node.id] = {
              title: value.node.title,
              status: 'incorrect',
              score: 0
            };
          }
        } else {
          result.analysis[value.node.id] = {
            title: value.node.title,
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

      if (quizType === 'practice') {
        $scope.modal.remove().then(function() {
          $state.go('quiz.summary', {
            quiz: angular.copy(quizCtrl.quiz),
            summary: angular.copy(quizCtrl.summary),
            report: angular.copy(quizCtrl.report)
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
            $state.go('quiz.summary', {
              report: angular.copy(quizCtrl.report),
              quiz: angular.copy(quizCtrl.quiz),
              summary: angular.copy(quizCtrl.summary)
            });
          }
        });
      }

    }

    function generateReport(quiz) {
      angular.forEach(quiz.objects, function(value, key) {
        if (quizCtrl.getQuestionType(value) == CONSTANT.WIDGETS.QUESTION_TYPES.SCQ && value.attempted !== '') {
          quizCtrl.submitAttempt(value.node.id,
            value.attempted);
        } else if (quizCtrl.getQuestionType(value) == CONSTANT.WIDGETS.QUESTION_TYPES.MCQ && value.attempted.length > 0) {
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
      $state.go('map.navigate', {});
    }

    $ionicModal.fromTemplateUrl(CONSTANT.PATH.MAP + '/map.modal-rope' + CONSTANT.VIEW, {
      scope: $scope,
      animation: 'slide-in-down'
    }).then(function(modal) {
      quizCtrl.pauseModal = modal;
    });

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

    function preloadResources(quiz) {
      var d = $q.defer();
      $q.all([quizCtrl.preloadImages(quiz),
        quizCtrl.preloadSounds(quiz)
      ]).then(function(success) {
        d.resolve(success);
      }, function(error) {
        d.reject(error)
      });
      return d.promise;
    }


    function preloadImages(quiz) {
      var d = $q.defer();
      var images = [];
      angular.forEach(quiz.objects, function(question) {
        angular.forEach(question.node.type.content.widgets.images, function(image) {
          images.push(CONSTANT.RESOURCE_SERVER + image);
        })
      })
      $ImageCacheFactory.Cache(images).then(function() {
        d.resolve('Images Loaded Successfully');
      }, function(failed) {
        d.reject('Error Loading Image' + failed);
      });
      return d.promise;
    }

    function preloadSounds(quiz) {
      var d = $q.defer();
      ionic.Platform.ready(function() {
        var promises = [];
        angular.forEach(quiz.objects, function(question) {
          angular.forEach(question.node.type.content.widgets.sounds, function(sound) {
            try {
              promises.push(soundManager.download(CONSTANT.RESOURCE_SERVER + sound));
            } catch (e) {
              $log.debug("Error Downloading sound")
            }
          })
        });
        $q.all(promises).then(function(success) {
          d.resolve("Sounds Loaded Successfully");
        });
        return d.promise;
      });
    }
  }
})();
