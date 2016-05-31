(function () {
  'use strict';
  angular
    .module('zaya-auth')
    .factory('Auth', Auth)
  Auth.$inject = ['Restangular', 'CONSTANT', '$cookies', '$log', '$window','Rest'];
  function Auth(Restangular, CONSTANT, $cookies, $log, $window, Rest) {
    var rest_auth = Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(CONSTANT.BACKEND_SERVICE_DOMAIN + '/rest-auth');
      RestangularConfigurer.setRequestSuffix('/');
      RestangularConfigurer.setDefaultHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      });
    });
    var Auth = {};
    Auth.login = login;
    Auth.logout = logout;
    Auth.clean = clean;
    Auth.signup = signup;
    Auth.reset = reset;
    Auth.isAuthorised = isAuthorised;
    Auth.canSendOtp = canSendOtp;
    Auth.dateCompare = dateCompare;
    Auth.verifyOtp = verifyOtp;
    Auth.resetPassword = resetPassword;
    Auth.resendOTP = resendOTP;
    Auth.getUser = getUser;
    Auth.isVerified = isVerified;
    Auth.getOTPFromSMS = getOTPFromSMS;
    Auth.setAuthProvider = setAuthProvider;
    Auth.verifyOtpResetPassword = verifyOtpResetPassword;
    Auth.changePassword = changePassword;
    Auth.hasProfile = hasProfile;
    Auth.getProfileId = getProfileId;

    return Auth ;

    function login(url, user_credentials, success, failure) {
        rest_auth.all(url).post($.param(user_credentials)).then(function (response) {
            localStorage.setItem('Authorization', response.key || response.token);
            success(response);
        }, function (response) {
            failure(response);
        })
    }
    function logout(success, failure) {
        rest_auth.all('logout').post().then(function (response) {
            if(localStorage.getItem('authProvider') == 'google')
            {
                window.plugins.googleplus.logout();
            }
            if(localStorage.getItem('authProvider') == 'facebook')
            {
                facebookConnectPlugin.logout();
            }
            //   localStorage.removeItem('Authorization');
            //   localStorage.removeItem('user_details');
            //   localStorage.removeItem('authProvider');
            Auth.clean();
            success();
        }, function (error) {
            failure();
        })
    }
    function clean(success){
        localStorage.clear();
        if(success)
        success();
    }
    function signup (user_credentials, success, failure) {
        rest_auth.all('registration').post($.param(user_credentials), success, failure).then(function (response) {
            localStorage.setItem('Authorization', response.key);
            success(response);
        }, function (response) {
            failure(response);
        })
    }
    function reset (email, atype, success, failure) {
        type == 'password' && rest_auth.all('password').all('reset').post(email);
        type == 'username' && rest_auth.all('username').all('reset').post(email);
    }
    function isAuthorised () {
        return localStorage.Authorization;
    }
    function canSendOtp (max_otp_send_count) {
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
        }
        else {
            localStorage.setItem('last_otp_date', new Date());
            localStorage.setItem('otp_sent_count', 1);
            return true;
        }
    }
    // remove util funstion from auth factory
    function dateCompare (date_1, date_2) { // Checks if date_1 > date_2
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
    function verifyOtp (verification_credentials, success, failure) {
        $log.debug(JSON.stringify(verification_credentials));
        rest_auth.all('sms-verification').post($.param(verification_credentials), success, failure).then(function (response) {
            success(response);
        }, function (response) {
            failure(response);
        })
    }
    function resetPassword (reset_password_credentials, success, failure) {
        rest_auth.all('password/reset').post($.param(reset_password_credentials), success, failure).then(function (response) {
            success(response);
        }, function (response) {
            failure(response);
        })
    }
    function resendOTP (success, failure) {
        rest_auth.all('resend-sms-verification').post('', success, failure).then(function (response) {
            success(response);
        }, function (response) {
            failure(response);
        })
    }
    function getUser (success, failure) {
        Restangular.oneUrl('user_details', CONSTANT.BACKEND_SERVICE_DOMAIN + 'rest-auth/user/').get().then(function (response) {
            localStorage.setItem('user_details', JSON.stringify(response));
            success(response);
            return Rest.one('profiles',JSON.parse(localStorage.user_details).profile).get()
        }, function (response) {
            failure(response);
        })
        .then(function(profile){
            localStorage.setItem('profile', JSON.stringify(profile));
        });
    }
    function isVerified () {
        var user_details = JSON.parse(localStorage.getItem('user_details'));
        if (user_details) {
            return user_details.is_verified;
        }
        else {
            return false;
        }
    }
    function getOTPFromSMS (message,success,failure) {
        var string = message.data.body;
        if(message.data.address == '+12023353814')
        {
            var e_position = string.indexOf("Enter");
            var o_position = string.indexOf("on");
            success(string.substring(e_position + 6, o_position - 1));
        }
        else{
            failure();
        }

    }
    function setAuthProvider (authProvider){
        localStorage.setItem('authProvider',authProvider);
        return authProvider;
    }
    function verifyOtpResetPassword(otp,success,failure){
        rest_auth.all('password/reset/sms-verification').post($.param(otp), success, failure).then(function (response) {
            success(response);
        }, function (response) {
            failure(response);
        })
    }
    function changePassword (credentials, success, failure) {
        rest_auth.all('password/change').post($.param(credentials), success, failure).then(function (response) {
            localStorage.removeItem('Authorization');
            success(response);
        }, function (response) {
            failure(response);
        })
    }
    function hasProfile(){
        return JSON.parse(localStorage.getItem('user_details')).profile == null ? false : true;
    }

    function getProfileId(){
        return JSON.parse(localStorage.getItem('user_details')).profile;
    }

  }
})();
