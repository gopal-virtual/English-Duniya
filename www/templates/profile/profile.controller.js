(function() {
    'use strict';

    angular
        .module('zaya-profile')
        .controller('profileController', profileController);

    profileController.$inject = ['CONSTANT','$state','Auth','Rest','$log','$ionicPopup'];

    function profileController(CONSTANT, $state, Auth, Rest, $log, $ionicPopup) {
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

        function createProfile (userdata) {
          Rest.all('profiles').post(userdata).then(function(response){
              Auth.getUser(function(){
                $state.go('map.navigate',{});
              },function(){
                profileCtrl.showError('Error', 'Error making profile');
              })
          },function(error){
            $ionicPopup.alert({
              title : _.chain(error.data).keys().first(),
              template : error.data[_.chain(error.data).keys().first()].toString(),
            });
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

        function validatePersonaliseForm(formData) {
          $log.debug(formData);
          if (!formData.first_name.$viewValue) {
            profileCtrl.showError("Child's name", "Please enter child's name");
            return false;
          }
          if (!formData.dob.$viewValue) {
            profileCtrl.showError("DOB", "Please select a DOB");
            return false;
          }
          if (!formData.gender.$viewValue) {
            profileCtrl.showError("Gender", "Please select a gender");
            return false;
          }
          if (!formData.gender.$viewValue) {
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
          return true;
        }

    }
})();
