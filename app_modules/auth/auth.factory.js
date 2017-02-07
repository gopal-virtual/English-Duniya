
(function() {
  'use strict';
  angular
    .module('zaya-auth')
    .factory('Auth', Auth)
  Auth.$inject = [
            'Restangular',
            'CONSTANT',
            '$log',
            'Rest',
            '$q',
            '$state',
            'device',
            '$http',
            'pouchDB'
    ];

  function Auth(
            Restangular,
            CONSTANT,
            $log,
            Rest,
            $q,
            $state,
            device,
            $http,
            pouchDB
        ) {
    var rest_auth = Restangular.withConfig(function(RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + '/rest-auth');
      RestangularConfigurer.setRequestSuffix('/');
      RestangularConfigurer.setDefaultHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      });
    });
    var Auth = {};
    Auth.login = login;
    Auth.logout = logout;
    Auth.clean = clean; // find out where it is used
    Auth.cleanLocalStorage = cleanLocalStorage;
    Auth.signup = signup;
    Auth.reset = reset;
    Auth.isAuthorised = isAuthorised;
    Auth.canSendOtp = canSendOtp;
    Auth.dateCompare = dateCompare;
    Auth.verifyOtp = verifyOtp;
    Auth.resetPassword = resetPassword;
    Auth.resendOTP = resendOTP;
    Auth.getUser = getUser;
    Auth.getProfile = getProfile;
    Auth.isVerified = isVerified;
    Auth.getOTPFromSMS = getOTPFromSMS;
    Auth.setAuthProvider = setAuthProvider;
    Auth.verifyOtpResetPassword = verifyOtpResetPassword;
    Auth.changePassword = changePassword;
    Auth.hasProfile = hasProfile;
    Auth.getProfileId = getProfileId;
    Auth.getLocalProfile = getLocalProfile;
    Auth.autoLogin = autoLogin;
    Auth.updateProfile = updateProfile;
    Auth.loginIfNotAuthorised = loginIfNotAuthorised;
    Auth.createCouchIfNot = createCouchIfNot;

    return Auth;



    function createCouchIfNot() {
      $log.debug("Inside curateCouchIfNot");

      // return $http.get().then(function () {
      //   $log.debug("Db exists")
      // }).catch(function () {
      //   $log.debug("Db does not exists")
      //   // return $http.put('http://zaya-couch:zayaayaz1234@ci-couch.zaya.in/device'+device.uuid,{username:'zaya-couch',password:'zayaayaz1234'});
      // });
    }

    function autoLogin(user_credentials){


      return rest_auth.all('no-login')
        .post($.param(user_credentials))
        .then(function(response){


          localStorage.setItem('Authorization', response.key || response.token);
          return Auth.getUser()
        })
        .then(function(response){


          return $q.resolve(response);
        })

    }

    function loginIfNotAuthorised(){


      var user_credentials = {
          username: device.uuid,
          password1: device.uuid,
          password2: device.uuid,
          device_id: device.uuid
        };
      if(Auth.isAuthorised()){


        return $q.resolve()
      }else{


        return Auth.autoLogin(user_credentials);
      }
    }
    function login(url, user_credentials) {
      var d = $q.defer();
      rest_auth.all(url).post($.param(user_credentials)).then(function(response) {
        Auth.setAuthProvider(url);
        localStorage.setItem('Authorization', response.key || response.token);
        d.resolve(response);
      }, function(response) {
        ;
        if (response.data && response.data.email) {
          d.reject(response.data.email[0]);
      } else if (response.data && response.data.phone_number) {
          d.reject(response.data.phone_number[0]);
      } else if (response.data && response.data.non_field_errors) {
          d.reject(response.data.non_field_errors[0]);
        } else {
          d.reject("Please try again.");
        }
      });
      return d.promise;
    }

    function logout(success, failure) {
      ;
      rest_auth.all('logout').post().then(function(response) {
        if (localStorage.getItem('authProvider') == 'google') {
          window.plugins.googleplus.disconnect();
        }
        if (localStorage.getItem('authProvider') == 'facebook') {
          facebookConnectPlugin.logout();
        }
        //   localStorage.removeItem('Authorization');
        //   localStorage.removeItem('user_details');
        //   localStorage.removeItem('authProvider');
        Auth.cleanLocalStorage();
        success();
      }, function(error) {
        failure();
      })
    }

    function clean(success) {
        Auth.cleanLocalStorage();
      if (success)
        success();
    }

    function cleanLocalStorage() {

        localStorage.clear();
    }

    function signup(user_credentials, success, failure) {
      var d = $q.defer();
      rest_auth.all('registration').post($.param(user_credentials), success, failure).then(function(response) {
        localStorage.setItem('Authorization', response.key);
        d.resolve(response)
      }, function(error) {
        d.reject(error.data.details || 'Please try again.');
      });
      return d.promise;
    }

    function reset(email, atype, success, failure) {
      type == 'password' && rest_auth.all('password').all('reset').post(email);
    }

    function isAuthorised() {
      return localStorage.Authorization;
    }

    function canSendOtp(max_otp_send_count) {
      var last_otp_date = localStorage.getItem('last_otp_date');
      var otp_sent_count = localStorage.getItem('otp_sent_count');
      if (last_otp_date && otp_sent_count) {
        if (this.dateCompare(new Date(), new Date((last_otp_date)))) {
          localStorage.setItem('last_otp_date', new Date());
          localStorage.setItem('otp_sent_count', 1);
          return true;
        } else {
          if (otp_sent_count < max_otp_send_count) {
            localStorage.setItem('last_otp_date', new Date());
            localStorage.setItem('otp_sent_count', ++otp_sent_count);
            return true;
          } else {
            return false;
          }
        }
      } else {
        localStorage.setItem('last_otp_date', new Date());
        localStorage.setItem('otp_sent_count', 1);
        return true;
      }
    }
    // remove util funstion from auth factory
    function dateCompare(date_1, date_2) { // Checks if date_1 > date_2
      var month_1 = date_1.getMonth();
      var month_2 = date_2.getMonth();
      var day_1 = date_1.getDate();
      var day_2 = date_2.getDate();
      if (month_1 > month_2) {
        return true;
      } else if (month_1 == month_2) {
        return day_1 > day_2;
      } else return false;
    }

    function verifyOtp(credentials) {
      var d = $q.defer();
      rest_auth.all('sms-verification').post($.param(credentials)).then(function(response) {
        d.resolve(response);
      }, function(error) {
        d.reject(error.data.details)
      });
      return d.promise;

    }

    function resetPassword(reset_password_credentials) {
      var d = $q.defer();

      rest_auth.all('password/reset').post($.param(reset_password_credentials)).then(function(response) {
        d.resolve(response);
      }, function(error) {

        d.reject(error.data.email || error.data.phone_number)
      })
      return d.promise;

    }

    function resendOTP() {
      var d = $q.defer();
      rest_auth.all('resend-sms-verification').post('').then(function(response) {
        d.resolve(response);
      }, function(error) {
        d.reject(error);
      })
      return d.promise;
    }

    function getUser() {
      var d = $q.defer();
      Restangular.oneUrl('user_details', CONSTANT.BACKEND_SERVICE_DOMAIN + 'rest-auth/user/').get().then(function(response) {
        localStorage.setItem('user_details', JSON.stringify(response));
        d.resolve(response);
      }, function(response) {
        d.reject(response);
      });
      return d.promise;
    }

    function getProfile() {

      var d = $q.defer();
      if(JSON.parse(localStorage.user_details).profile)
      {
        Rest.one('profiles', JSON.parse(localStorage.user_details).profile).get().then(function(profile) {
          localStorage.setItem('profile', JSON.stringify(profile));
          d.resolve(profile);
        }, function(response) {
          d.reject(response);
        });
      }
      else{
        d.reject({message:'no_profile'})
      }
      return d.promise;
    }

    function isVerified() {
      var user_details = JSON.parse(localStorage.getItem('user_details'));
      if (user_details) {
        return user_details.is_verified;
      } else {
        return false;
      }
    }

    function getOTPFromSMS(message) {
      var d = $q.defer()
      var string = message.data.body;
      // if (message.data.address == '+12023353814' || message.data.address.indexOf('044')) {
        if(string.indexOf("ED") >= 0){
        var start_position = string.indexOf("ED-") + 3;
        var end_position = string.indexOf("is") - 1;
        var otp = string.substring(start_position, end_position);
        if (!isNaN(otp)) {
          d.resolve(otp)
        } else {
          d.reject();
        }
      } else {
        d.reject();
      }
      return d.promise;

    }

    function setAuthProvider(authProvider) {
      localStorage.setItem('authProvider', authProvider);
      return authProvider;
    }

    function verifyOtpResetPassword(otp) {
      var d = $q.defer();
      rest_auth.all('password/reset/sms-verification').post($.param(otp)).then(function(response) {
        d.resolve(response);
      }, function(error) {
        d.reject(error.data.details);
      })
      return d.promise;
    }

    function changePassword(credentials) {
      var d = $q.defer();
      rest_auth.all('password/change').post($.param(credentials)).then(function(response) {
        localStorage.removeItem('Authorization');
        d.resolve(response);
      }, function(error) {
        d.reject(error.data.details);
      })
      return d.promise;
    }

    function hasProfile() {
      if (localStorage.getItem('user_details')) {
        return JSON.parse(localStorage.getItem('user_details')).profile === null ? false : true;
      } else {
        return false;
      }
    }

    function getProfileId() {
      return JSON.parse(localStorage.getItem('user_details')).profile;
    }

    function getLocalProfile() {
      return JSON.parse(localStorage.getItem('profile'));
    }
    function updateProfile(profile) {
      localStorage.setItem('profile',JSON.stringify(profile));
    }

  }
})();
