(function() {
    'use strict';

    angular
        .module('zaya-profile')
        .controller('profileController', profileController);

    profileController.$inject = ['CONSTANT','$state','Auth','Rest','$log','$ionicPopup','$ionicLoading','formHelper'];

    function profileController(CONSTANT, $state, Auth, Rest, $log, $ionicPopup, $ionicLoading,formHelper) {
        var profileCtrl = this;
        profileCtrl.createProfile = createProfile;
        profileCtrl.updateProfile = updateProfile;
        profileCtrl.logout = logout;
        profileCtrl.calcAge = calcAge;
        profileCtrl.closeKeyboard = closeKeyboard;
        profileCtrl.validatePersonaliseForm = validatePersonaliseForm;
        profileCtrl.showError = showError;
        profileCtrl.convertDate = convertDate;
        profileCtrl.tabIndex = 0;
        profileCtrl.personaliseFormValidations = {'gender':['required'],'firstName':['required'],'grade':['required'],'motherTongue':['required']};
        profileCtrl.tab = [
          {
            type : 'group',
            path : CONSTANT.PATH.PROFILE + '/profile.groups' + CONSTANT.VIEW,
            icon : 'ion-person-stalker'
          },
          {
            type : 'badge',
            path : CONSTANT.PATH.PROFILE + '/profile.badges' + CONSTANT.VIEW,
            icon : 'ion-trophy'
          }
        ]

        function calcAge(dateString) {
          var birthday = +new Date(dateString);
          return ~~((Date.now() - birthday) / (31557600000));
        }
        function convertDate(date) {
          function pad(s) { return (s < 10) ? '0' + s : s; }
          var d = new Date(date);
          $log.debug([d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())  ].join('-'))
          return [d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())  ].join('-');
        }

        function createProfile (formData) {
          $log.debug(formData)
            $ionicLoading.show();
            formHelper.validateForm(formData,profileCtrl.personaliseFormValidations)
            .then(function(data){
              return Rest.all('profiles').post(data);
            })
            .then(function(){
              return Auth.getUser();
            })
            .then(function(){
              return data.putUserifNotExist({
                'userId': Auth.getProfileId()
              })
            })
            .then(function(){
              $state.go('map.navigate',{});
            })
            .catch(function(error){
              profileCtrl.showError('Could not make your profile', error || 'Please try again');
            })
            .finally(function(){
              $ionicLoading.hide();
            })

        }

        function updateProfile(userdata) {
          // body...
        }

        function logout() {
          Auth.logout(function () {
            $state.go('auth.signin',{})
          },function () {
            // body...
          })
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
            profileCtrl.showError("Child's name", "Please enter child's name");
            return false;
          }
          if (formData.dob && !formData.dob.$viewValue) {
            profileCtrl.showError("DOB", "Please select a DOB");
            return false;
          }
          if (formData.gender && !formData.gender.$viewValue) {
            profileCtrl.showError("Gender", "Please select a gender");
            return false;
          }
          if (formData.gender && !formData.gender.$viewValue) {
            profileCtrl.showError("Grade", "Please select a grade");
            return false;
          }
          return true;
        }
        function closeKeyboard() {
          try{
            cordova.plugins.Keyboard.close();
          }
          catch(e){
            $log.debug(e);
          }
        }

    }
})();
