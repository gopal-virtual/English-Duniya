(function () {
  'use strict';

  angular
    .module('zaya-user')
    .controller('userController', userController);

  userController.$inject = [
    'CONSTANT',
    '$scope',
    '$state',
    'Auth',
    'Rest',
    '$log',
    '$ionicPopup',
    '$ionicPlatform',
    '$ionicLoading',
    '$ionicModal',
    'formHelper',
    'network',
    'content',
    '$ionicSlideBoxDelegate',
    '$timeout',
    'User',
    'audio',
    'notification',
    '$stateParams'
  ];

  function userController(CONSTANT,
                          $scope,
                          $state,
                          Auth,
                          Rest,
                          $log,
                          $ionicPopup,
                          $ionicPlatform,
                          $ionicLoading,
                          $ionicModal,
                          formHelper,
                          network,
                          content,
                          $ionicSlideBoxDelegate,
                          $timeout,
                          User,
                          audio,
                          notification,
                          $stateParams) {
    var userCtrl = this;
    userCtrl.calcAge = calcAge;
    userCtrl.closeKeyboard = closeKeyboard;
    userCtrl.createProfile = createProfile;
    userCtrl.validatePersonaliseForm = validatePersonaliseForm;
    userCtrl.showError = showError;
    userCtrl.convertDate = convertDate;
    userCtrl.tabIndex = 0;
    userCtrl.personaliseFormValidations =  {
      // 'gender': ['required'],
      // 'firstName': ['required'],
      'grade': ['required'],
      // 'motherTongue': ['required']
    };
    userCtrl.skills = [{
      "id": "6ef60d7e-64a2-4779-8aba-eae1d2de9246",
      "title": "Vocabulary",
      "lesson_scores": 220,
      "question_scores": 0
    }, {
      "id": "d711986f-0451-46d3-b68b-2d2500a1bb1e",
      "title": "Reading",
      "lesson_scores": 180,
      "question_scores": 0
    }, {
      "id": "152df66c-0f88-4932-86f2-592fa9d58b0e",
      "title": "Grammar",
      "lesson_scores": 200,
      "question_scores": 0
    }, {
      "id": "a28050a4-adb8-4b0c-8505-3b79d0db8128",
      "title": "Listening",
      "lesson_scores": 100,
      "question_scores": 0
    }];
    userCtrl.network = network;
    userCtrl.goToMap = goToMap;
    userCtrl.splitName = splitName;
    userCtrl.nextSlide = nextSlide;
    userCtrl.disableSwipe = disableSwipe;
    userCtrl.playAudio = playAudio;
    userCtrl.selectProfile = selectProfile;
    userCtrl.playAudio(-1);
    $log.debug("Hukata")
    $scope.audio = audio;
    // $timeout(function () {
    //   userCtrl.playAudio(0);
    // }, 5000);

    $log.debug("StateParams",$stateParams)
    if($stateParams.profiles){
      userCtrl.profiles = $stateParams.profiles;
      $log.debug("Profiles",userCtrl.profiles)
    }else{
      User.profile.getAll().then(function (data) {
        userCtrl.profiles = data;
      })
    }
    function playAudio(index) {
      var src;
      if (index == -1) {
        src = 'sound/voice_welcome_name.mp3'
      }
      if (index == 0) {
        src = 'sound/voice_name.mp3'
      }
      if (index == 1) {
        src = 'sound/voice_gender.mp3'
      }
      if (index == 2) {
        src = 'sound/voice_class.mp3'
      }
      if(src){
        audio.player.play(src);
      }else{
        audio.player.stop();
      }
    }

    function splitName() {
      userCtrl.user.first_name = userCtrl.user.name.substr(0, userCtrl.user.name.indexOf(" ") > 0 ? userCtrl.user.name.indexOf(" ") : userCtrl.user.name.length);
      userCtrl.user.last_name = userCtrl.user.name.substr(userCtrl.user.name.indexOf(" ") > 0 ? userCtrl.user.name.indexOf(" ") + 1 : userCtrl.user.name.length, userCtrl.user.name.length);

    }

    function disableSwipe() {
      $ionicSlideBoxDelegate.enableSlide(false);
    }

    function nextSlide() {
      $ionicSlideBoxDelegate.$getByHandle('slide').next();
    }

    function goToMap() {
      $ionicLoading.show({
        hideOnStateChange: true
      })
      $state.go('map.navigate', {})
    }

    function calcAge(dateString) {
      var birthday = +new Date(dateString);
      return ~~((Date.now() - birthday) / (31557600000));
    }


    // YOU ARE HERE
    // $ionicPlatform.registerBackButtonAction(function (event) {
    //   event.preventDefault();
    // }, 100);

    function convertDate(date) {
      function pad(s) {
        return (s < 10) ? '0' + s : s;
      }

      var d = new Date(date);

      return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
    }


    function openSettings() {
      $scope.settings.show();
    }

    function closeSettings() {
      $scope.settings.hide();
    }

    function createProfile(formData) {

      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      userCtrl.splitName();
      delete formData['name'];


      User.profile.add(formData)
        .then(function (response) {
          User.setActiveProfileSync(response);
          return content.createLessonDBIfNotExists()
        })
        .then(function () {
          $log.debug("CREATING USER");
          localStorage.setItem('demo_flag', 1);
          localStorage.setItem('diagnosis_flag', false);
          $state.go('litmus_start');

          // $state.go('quiz.questions', {'type':'litmus','id':'litmus_question'});
          $log.debug("CHECK 4")
          notification.online.set();
        })
        .catch(function (error) {
          userCtrl.showError('Could not make your profile', error || 'Please try again');
          $ionicLoading.hide();
        })
    }

    function updateProfile(userdata) {
      // body...
    }

    function logout(type) {
      userCtrl.closeSettings();
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });

      if (type == 'clean') {
        Auth.clean(function () {
          $state.go('auth.signup', {})
        })
      } else {
        Auth.logout(function () {
          $state.go('auth.signup', {})
        }, function () {
        })
      }
    }

    function showError(title, msg) {
      $ionicPopup.alert({
        title: title,
        template: msg
      });
    }

    function showAlert(title, msg) {
      var d = $q.defer();
      $ionicPopup.alert({
        title: title,
        template: msg
      }).then(function (response) {
        d.resolve(response)
      }, function (error) {
        d.reject(error)
      });

      return d.promise;
    }

    function validatePersonaliseForm(formData) {
      if (formData.first_name && !formData.first_name.$viewValue) {
        userCtrl.showError("Child's name", "Please enter child's name");
        return false;
      }
      if (formData.dob && !formData.dob.$viewValue) {
        userCtrl.showError("DOB", "Please select a DOB");
        return false;
      }
      if (formData.gender && !formData.gender.$viewValue) {
        userCtrl.showError("Gender", "Please select a gender");
        return false;
      }
      if (formData.gender && !formData.gender.$viewValue) {
        userCtrl.showError("Grade", "Please select a grade");
        return false;
      }
      return true;
    }

    function closeKeyboard() {
      try {
        cordova.plugins.Keyboard.close();
      } catch (e) {
      }
    }

    function selectProfile(profile) {
          User.profile.select(profile)
      $state.go('map.navigate')

    }

    $scope.$watch("userCtrl.user.name", function () {
      try {
        userCtrl.user.name = userCtrl.user.name.replace(/  +/g, ' ');
      }
      catch (err) {
      }
    });

  }
})();
