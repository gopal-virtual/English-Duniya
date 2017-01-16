(function() {
  'use strict';
  angular
    .module('common')
    .factory('localized', localized);
  /* @ngInject */
  function localized() {
    var localizedText = {
      personalise: {
        'choose_language': {
          'hi': 'हिंदी से अंग्रेजी',
          'en': 'english to english',
          'ta': 'ஆங்கிலம் தமிழ்',
          'gu': 'ઇંગલિશ માટે ગુજરાતી',
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
        }
      },
      litmus: {
        'litmus_start': {
          'hi': 'चलो अब हम एक छोटासा अभ्यास करेंगे!',
          'en': 'Let us practice now!',
          'ta': 'எங்களுக்கு இப்போது ஒரு சிறிய நடைமுறையில் சாப்பிடலாம்!',
          'gu': 'ચાંલ્લો હવે આપડે એક નાનું સ્વાધ્યાય કરશુ!',
        }
      }
    };
    var localizedAudio = {
      "Video": {
        "LearnedFromVideo": {
          "label": "Yay, we learned a lot from video",
          "lang": {
            "hi": "1483685179452-hin-yay_we_learned_a_lot_from_video.mp3"
          }
        }
      },
      "Vocabulary": {
        "ItsYourTurn": {
          "label": "Now it's your turn",
          "lang": {
            "hi": "1483684687362-hin-lets_go_now_its_your_turn.mp3"
          }
        }
      },
      "app": {
        "ExitApp": {
          "label": "Do you want to exit?",
          "lang": {
            "hi": "1483685890819-hin-do_you_want_to_exit.mp3"
          }
        },
        "ExitResource": {
          "label": "Do you want to continue?",
          "lang": {
            "hi": "1483685944972-tel_do_you_want_to_continue.mp3",
            "te": "1483685991759-tel_do_you_want_to_continue.mp3"
          }
        }
      },
      "demo": {
        "StartEnglish": {
          "label": "Let's start learning english now",
          "lang": {
            "hi": "1483682704809-hin-lets_start_learning_english.mp3"
          }
        }
      },
      "diagnosis": {
        "landing": {
          "label": "Let's take a small practice",
          "lang": {
            "hi": "1483679312160-hin-lets_start_a_small_practice.mp3"
          }
        },
        "level1": {
          "label": "Yay, you're at level one",
          "lang": {
            "hi": "1483679731758-hin-wow_you_are_at_level_1.mp3",
            "te": "1483679759724-tel-wow_you_are_at_level_1.mp3"
          }
        },
        "level2": {
          "label": "Yay, you're at level two",
          "lang": {
            "hi": "1483679782910-hin-wow_you_are_at_level_2.mp3",
            "te": "1483679799310-tel-wow_you_are_at_level_2.mp3"
          }
        },
        "level3": {
          "label": "Yay, you're at level three",
          "lang": {
            "hi": "1483679826688-hin-wow_you_are_at_level_3.mp3",
            "te": "1483679861262-tel-wow_you_are_at_level_3.mp3"
          }
        },
        "level4": {
          "label": "Yay, you're at level four",
          "lang": {
            "hi": "1483679993386-hin-wow_you_are_at_level_4.mp3"
          }
        },
        "level5": {
          "label": "Yay, you're at level five",
          "lang": {
            "hi": "1483680015911-hin-wow_you_are_at_level_5.mp3"
          }
        },
        "level6": {
          "label": "Yay, you're at level six",
          "lang": {
            "hi": "1483680037668-hin-wow_you_are_at_level_6.mp3"
          }
        },
        "level7": {
          "label": "Yay, you're at level seven",
          "lang": {
            "hi": "1483680074600-hin-wow_you_are_at_level_7.mp3"
          }
        },
        "level8": {
          "label": "Yay, you're at level eight",
          "lang": {
            "hi": "1483680146938-hin-wow_you_are_at_level_8.mp3"
          }
        },
        "ComingSoon": {
          "label": "Coming soon with more lessons",
          "lang": {
            "hi": "1483684466189-hin-we_will_come_back_soon_with_new_lesson_till_then_you_can_learn_this.mp3",
            "te": "1483684509313-tel-we_will_come_back_soon_with_new_lesson_till_then_you_can_learn_this.mp3"
          }
        }
      },
      "phone": {
        "EnterPhoneNumber": {
          "label": "Type your phone number",
          "lang": {
            "hi": "1483682575829-hin-write_your_number.mp3",
            "te": "1483682593022-tel-write_your_number.mp3"
          }
        },
        "EnterOtp": {
          "label": "Type the code sent on your phone",
          "lang": {
            "hi": "1483680216076-hin-to_verify_your_number_write_the_code_you_got_in_your_phone.mp3",
            "te": "1483680242386-tel-to_verify_your_number_write_the_code_you_got_in_your_phone.mp3"
          }
        }
      },
      "profile": {
        "AddProfile": {
          "label": "Do you want to create a new profile",
          "lang": {
            "hi": "1483680390940-hin-do_you_want_to_create_a_new_profile.mp3"
          }
        },
        "ChangeProfile": {
          "label": "Do you want to change the profile",
          "lang": {
            "hi": "1483680804991-hin-do_you_want_to_select_a_different_profile.mp3",
            "te": "1483680882762-tel-do_you_want_to_select_a_different_profile.mp3"
          }
        },
        "ChooseOrCreate": {
          "label": "Choose your profile or make a new profile",
          "lang": {
            "hi": "1483686138013-hin-choose_your_profile_or_make_new_profile.mp3"
          }
        }
      },
      "registration": {
        "Welcome": {
          "label": "Welcome to English Duniya",
          "lang": {
            "hi": "1483682415957-hin-namaste_welcome_to_english_duniya.mp3",
            "te": "1483682473005-tel-namaste_welcome_to_english_duniya.mp3"
          }
        },
        "SelectLanguage": {
          "label": "<language> to English",
          "lang": {
            "hi": "1483683274454-hin-learn_hi_to_english.mp3"
          }
        },
        "WriteName": {
          "label": "Write your name",
          "lang": {
            "hi": "1483681155637-hin-write_your_name.mp3",
            "te": "1483681208688-tel-write_your_name.mp3"
          }
        },
        "SelectGender": {
          "label": "Boy or Girl?",
          "lang": {
            "hi": "1483680974074-hin-boy_or_girl.mp3",
            "te": "1483681000687-tel-boy_or_girl.mp3"
          }
        },
        "SelectClass": {
          "label": "Which class do you read in?",
          "lang": {
            "hi": "1483681387906-hin-which_class_do_you_read.mp3",
            "te": "1483681559733-tel-which_class_do_you_read.mp3"
          }
        }
      }
    };
    return {
      text: localizedText,
      audio: localizedAudio
    };
  }
})();