(function() {
  'use strict';

  angular
    .module('zaya-user')
    .controller('userController', userController);

  userController.$inject = ['CONSTANT', '$scope', '$state', 'Auth', 'Rest', '$log', '$ionicPopup', '$ionicPlatform', '$ionicLoading', '$ionicModal', 'formHelper', 'network', 'data'];

  function userController(CONSTANT, $scope, $state, Auth, Rest, $log, $ionicPopup, $ionicPlatform, $ionicLoading, $ionicModal, formHelper, network, dataService) {
    var userCtrl = this;
    userCtrl.calcAge = calcAge;
    userCtrl.closeKeyboard = closeKeyboard;
    userCtrl.createProfile = createProfile;
    userCtrl.validatePersonaliseForm = validatePersonaliseForm;
    userCtrl.showError = showError;
    userCtrl.convertDate = convertDate;
    userCtrl.tabIndex = 0;
    userCtrl.personaliseFormValidations = $state.current.data.personaliseFormValidations;
    userCtrl.skills = $state.current.data.skills;
    userCtrl.network = network;
    userCtrl.goToMap = goToMap;

    function goToMap() {
      $ionicLoading.show({
        hideOnStateChange: true
      })
      $state.go('map.navigate', {})
    }

    $ionicPlatform.registerBackButtonAction(function(event) {
      userCtrl.goToMap();
    }, 101);

    function calcAge(dateString) {
      var birthday = +new Date(dateString);
      return ~~((Date.now() - birthday) / (31557600000));
    }

    function convertDate(date) {
      function pad(s) {
        return (s < 10) ? '0' + s : s;
      }
      var d = new Date(date);
      $log.debug([d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-'))
      return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
    }

    function showError(title, msg) {
      $log.debug(title, msg);
      $ionicPopup.alert({
        title: title,
        template: msg
      });
    }

    function showAlert(title, msg) {
      var d = $q.defer();
      $log.debug(title, msg);
      $ionicPopup.alert({
        title: title,
        template: msg
      }).then(function(response) {
        d.resolve(response)
      }, function(error) {
        d.reject(error)
      });

      return d.promise;
    }

    function validatePersonaliseForm(formData) {
      $log.debug(formData);
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
        $log.debug(e);
      }
    }


    function createProfile(formData) {
      $log.debug(formData)
      $ionicLoading.show({
        noBackdrop: false,
        hideOnStateChange: true
      });
      formHelper.validateForm(formData, userCtrl.personaliseFormValidations)
        .then(function(data) {
          return Rest.all('profiles').post(data);
        })
        .then(function(response) {
          return Auth.getUser();
        })
        .then(function(response) {
          return Auth.getProfile();
        })
        .then(function() {
          return dataService.putUserifNotExist({
            'userId': Auth.getProfileId()
          })
        })
        .then(function() {
          $state.go('map.navigate', {});
        })
        .catch(function(error) {
          $ionicPopup.alert({
            title: 'Could not make your profile',
            template: error || 'Please try again'
          });
          $ionicLoading.hide();
        })
    }
  }
})();
