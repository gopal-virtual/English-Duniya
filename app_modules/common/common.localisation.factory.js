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
          'hi': 'हिंदी से अंग्रेजी',
          'en': 'english to english',
          'ta': 'தமிழ் ஆங்கிலத்திற்கு',
          'gu': 'ગુજરાતી માંથી ઇંગલિશ શિકાવાનું',
        },
        'enter_your_name': {
          'hi': 'आपका नाम क्या है?',
          'en': 'What is your name',
          'ta': 'உங்கள் பெயர் என்ன?',
          'gu': 'તમારું નામ સુ છે?'
        },
        'boyorgirl': {
          'hi': 'लड़का या लड़की',
          'en': 'Boy or Girl',
          'ta': 'பையன் அல்லது பெண்',
          'gu': 'છોકરો કે છોકરી'
        },
        'boy': {
          'hi': 'लड़का',
          'en': 'Boy',
          'ta': 'பையன்',
          'gu': 'છોકરો'
        },
        'girl': {
          'hi': 'लड़की',
          'en': 'Girl',
          'ta': 'பெண்',
          'gu': 'છોકરી'
        },
        'select_your_class': {
          'hi': 'आप कौन सी कक्षा मे हो?',
          'en': 'Select your class',
          'ta': 'நீங்கள் எந்த வர்க்கம் உள்ளன?',
          'gu': 'તમે કાયા વર્ગ માં ચો?'
        },
        'litmus_start': {
          'hi': 'चलो अब हम एक छोटासा अभ्यास करेंगे!',
          'en': 'Let us practice now!',
          'ta': 'எங்களுக்கு இப்போது ஒரு சிறிய நடைமுறையில் சாப்பிடலாம்!',
          'gu': 'ચાંલ્લો હવે આપડે એક નાનું સ્વાધ્યાય કરશુ!',
        }
      }
    };
    var localizedAudio = {
      personalise: {
        'welcome': {
          'hi': 'sound/welcome_to_ed_write_your_name.mp3',
        },
         'select_your_language': {
        },
        'enter_your_name': {
          'hi': 'sound/voice_name.mp3',
        },
        'select_your_gender': {
          'hi': 'sound/voice_gender.mp3',
        },
        'select_your_class': {
          'hi': 'sound/voice_class.mp3'
        }
      }
    };
    return {
      text: localizedText,
      audio: localizedAudio
    };
  }
})();