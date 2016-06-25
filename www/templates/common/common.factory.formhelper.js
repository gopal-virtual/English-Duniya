(function() {
  'use strict';

  angular
    .module('common')
    .factory('formHelper', formHelper);

  formHelper.$inject = ['$log', 'CONSTANT', '$q'];

  function formHelper($log, CONSTANT, $q) {
    var passwordMinLength = 6;
    var passwordMaxLength = 15;
    var countryCode = '+91';
    var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var phoneRegex = /^[7-9][0-9]{9}$/;
    var error = {
      'emailAddress': {
        'required': 'Email Address is Required',
        'emailAddress': 'Invalid Email Address'
      },
      'phoneNumber': {
        'required': 'Phone Number is Required',
        'phoneNumber': 'Invalid Phone Number'
      },
      'password': {
        'required': 'Password is Required',
        'password': 'Invalid Password',
        'short': 'Password less than ' + passwordMinLength + ' chars.',
        'long': 'Password more than ' + passwordMaxLength + ' chars.',
      },
      'password1': {
        'required': 'Password is Required',
        'password': 'Invalid Password',
        'short': 'Password less than ' + passwordMinLength + ' chars.',
        'long': 'Password more than ' + passwordMaxLength + ' chars.',
      },
      'password2': {
        'required': 'Confirm password is Required',
        'equals-password1': 'Confirm Password should match password',
      },
      'userIdentity': {
        'required': 'Email Address / Phone Number  is Required',
        'userIdentity': 'Invalid Email Address / Phone Number'
      },
      'otp': {
        'required': 'OTP  is Required',
        'otp': 'Invalid OTP'
      },
      'gender':{
        'required': 'Gender is Required'
      },
      'motherTongue':{
        'required': 'Mother Tongue is Required'
      },
      'firstName':{
        'required': 'Name is Required'
      },
      'grade':{
        'required': 'Grade is Required'
      }

    }
    var formHelper = {
      validateForm: validateForm,
      isValidPhoneNumber: isValidPhoneNumber,
      isValidEmailAddress: isValidEmailAddress,
      isValidPassword: isValidPassword,
      isValidUserIdentity: isValidUserIdentity,
      isValidOtp: isValidOtp,
      isFieldEmpty: isFieldEmpty,
      getUserIdentityType: getUserIdentityType,
      cleanData: cleanData,
      getPasswordError: getPasswordError
    };

    return formHelper;

    function isValidPhoneNumber(input) {
      return phoneRegex.test(input);
    }

    function isValidEmailAddress(input) {
      return emailRegex.test(input);
    }

    function getPasswordError(input) {
      return input.length < passwordMinLength ? error.password.short : input.length > passwordMaxLength ? error.password.long : true;
    }

    function isValidPassword(input) {
      return input.length < passwordMinLength ? false : input.length > passwordMaxLength ? false : true;
    }
    function isFieldEmpty(input) {
      if (input === undefined || input === null || input === '')
        return true;
      else
        return false;
    }

    function isValidUserIdentity(input) {
      if (isValidPhoneNumber(input) || isValidEmailAddress(input)) {
        return true;
      }
      return false;
    }

    function isValidOtp(input) {
      if (!isNaN(input)) {
        return true;
      }
      return false;
    }

    function getUserIdentityType(string) {
      if (isValidPhoneNumber(string)) {
        return 'phoneNumber';
      } else if (isValidEmailAddress(string)) {
        return 'emailAddress';
      } else {
        if (!isNaN(string)) {
          return error.phoneNumber.phoneNumber;
        } else {
          return error.emailAddress.emailAddress;
        }
      }
    }

    function validateForm(formData, validationRules) {
      var d = $q.defer();
      var errors = []
      angular.forEach(validationRules, function(fieldRules, fieldName) {
        var fieldValue = formData[fieldName].$viewValue
        if (isFieldEmpty(fieldValue)) {
          if (fieldRules.indexOf('required') >= 0) {
            errors.push(error[fieldName].required);
          }
        } else {
          if (fieldRules.indexOf('emailAddress') >= 0 && !formHelper.isValidEmailAddress(fieldValue)) {
            errors.push(error[fieldName].emailAddress);
          }
          if (fieldRules.indexOf('phoneNumber') >= 0 && !formHelper.isValidPhoneNumber(fieldValue)) {
            errors.push(error[fieldName].phoneNumber);
          }
          if (fieldRules.indexOf('userIdentity') >= 0 && !formHelper.isValidUserIdentity(fieldValue)) {
            errors.push(error[fieldName].userIdentity);
          }
          if (fieldRules.indexOf('otp') >= 0 && !formHelper.isValidOtp(fieldValue)) {
            errors.push(error[fieldName].otp);
          }
          if (fieldRules.indexOf('password') >= 0 && !formHelper.isValidPassword(fieldValue)) {
            errors.push(formHelper.getPasswordError(fieldValue));
          }
          if (fieldRules.indexOf('equals-password1') >= 0 && (formData.password1.$viewValue !== formData.password2.$viewValue)) {
            errors.push(error[fieldName]['equals-password1']);
          }
        }


      })
      if (errors.length > 0) {
        d.reject(errors[0]);
      } else {
        d.resolve(formHelper.cleanData(formData, validationRules));
      }
      return d.promise;
    }

    function cleanData(formData, fieldList) {

      var data = {};
      angular.forEach(fieldList, function(fieldRules, fieldName) {
        var fieldValue = formData[fieldName].$viewValue;
        if (fieldName === 'userIdentity') {
          if (formHelper.getUserIdentityType(fieldValue) === 'phoneNumber') {
            data.phone_number = countryCode + fieldValue;
          } else {
            data.email = fieldValue;
          }
        }
        if (fieldName === 'phoneNumber') {
          data.phone_number = countryCode + fieldValue;
        }
        if (fieldName === 'emailAddress') {
          data.email = fieldValue
        }
        if (fieldName === 'password') {
          data.password = fieldValue
        }
        if (fieldName === 'otp') {
          data.code = fieldValue
        }
        if (fieldName === 'password1') {
          data.password1 = fieldValue
        }
        if (fieldName === 'password2') {
          data.password2 = fieldValue
        }
        if (fieldName === 'motherTongue') {
          data.mother_tongue = fieldValue
        }
        if (fieldName === 'gender') {
          data.gender = fieldValue
        }
        if (fieldName === 'grade') {
          data.grade = fieldValue
        }
        if (fieldName === 'firstName') {
          data.first_name = fieldValue
        }


      });
      return data;
    }
  }
})();
