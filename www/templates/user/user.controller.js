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
    'User'
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
                          User) {
    var userCtrl = this;
    userCtrl.calcAge = calcAge;
    userCtrl.closeKeyboard = closeKeyboard;
    userCtrl.createProfile = createProfile;
    userCtrl.validatePersonaliseForm = validatePersonaliseForm;
    userCtrl.showError = showError;
    userCtrl.convertDate = convertDate;
    userCtrl.tabIndex = 0;
    userCtrl.personaliseFormValidations = $state.current.data.personaliseFormValidations || {};
    userCtrl.skills = $state.current.data.skills;
    userCtrl.network = network;
    userCtrl.goToMap = goToMap;
    userCtrl.splitName = splitName;
    userCtrl.nextSlide = nextSlide;
    userCtrl.disableSwipe = disableSwipe;
    userCtrl.playAudio = playAudio;

    userCtrl.playAudio(-1);
    $timeout(function () {
      userCtrl.playAudio(0);
    }, 5000);
    function playAudio(index) {
      var src;
      if (index == -1) {
        src = 'sound/voice_welcome.mp3'
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

      angular.element("#audioplayer")[0].pause();
      if (src) {
        angular.element("#audioSource")[0].src = src;
        angular.element("#audioplayer")[0].load();
        angular.element("#audioplayer")[0].play();
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

    $ionicPlatform.registerBackButtonAction(function (event) {
      event.preventDefault();
    }, 100);

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
          

          localStorage.setItem('demo_flag', 1);
          $state.go('quiz.diagnosis', {});
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

    $scope.$watch("userCtrl.user.name", function () {
      try {
        userCtrl.user.name = userCtrl.user.name.replace(/  +/g, ' ');
      }
      catch (err) {
      }
    });

  }
})();
