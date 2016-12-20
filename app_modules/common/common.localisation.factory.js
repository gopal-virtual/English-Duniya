(function() {
  'use strict';
  angular
    .module('common')
    .factory('localized', localized);
  localized.$inject = [
    '$log',
    'CONSTANT',
    '$q',
    'User',
    '$http',
    '$rootScope'
  ];
  /* @ngInject */
  function localized(pouchDB,
    $log,
    CONSTANT,
    $q,
    User,
    $http,
    $rootScope
  ) {
    var localizedText = {
      personalise: {
        'choose_language': {
          'hi' : 'हिंदी से अंग्रेजी',
          'ta' : 'தமிழ் ஆங்கிலத்திற்கு'
        },
        'enter_your_name':{
          'hi' : 'आपका नाम क्या है?',
          'en' : 'What is your name',
          'ta' : 'உங்கள் பெயர் என்ன?'
        },
        'boyorgirl': {
          'hi': 'लड़का या लड़की',
          'en': 'Boy or Girl',
          'ta' : 'பையன் அல்லது பெண்'
        }
      }
    };
     var localizedAudio = {
      personalise: {
        'choose_language': {
          'hi' : 'हिंदी से अंग्रेजी',
          'ta' : 'தமிழ் ஆங்கிலத்திற்கு'
        },
        'enter_your_name':{
          'hi' : 'आपका नाम क्या है?',
          'en' : 'What is your name',
          'ta' : 'உங்கள் பெயர் என்ன?'
        },
        'boyorgirl': {
          'hi': 'लड़का या लड़की',
          'en': 'Boy or Girl',
          'ta' : 'பையன் அல்லது பெண்'
        }
      }
    };
    return localizedText;
  }
})();