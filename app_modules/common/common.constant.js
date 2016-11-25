(function() {
  var ROOT = 'templates';

  angular
    .module('common')
    .constant('CONSTANT', {
      'APP':{
      'TYPE': 'na',
      'VERSION': '0.1.8'
      },
      'BUNDLED': false,
      'LOCK': true,
      'FAKE_LOGIN': true,
      'FAKE_ID_DEVICE': 'micromaxtest3',
      'FAKE_DEVICE': true,
      'CONTENT_TEST':true,
      'DEBUG' : true,
      'BACKEND_SERVICE_DOMAIN': 'https://cc-test.zaya.in/',
      'RESOURCE_SERVER': 'https://cc-test.zaya.in',
      'LESSONS_DB_SERVER': 'https://ci-couch.zaya.in/lessonsdb',
      'PROFILES_DB_SERVER': 'https://ci-couch.zaya.in/device',
      'LESSON_DB_VERSION': 'na',
      'ANALYTICS' : true,
      'GRADE' : [1,2,3],
      'QUESTION_DEMO' : false,
      'QUESTION' : {
        'DEMO' : '5ecf8ad5-4c3a-4a67-9758-dd7e3993c4d8'
      },
      'PATH': {
        'INTRO': ROOT + '/intro',
        'AUTH': ROOT + '/auth',
        'QUIZ': ROOT + '/quiz',
        'PROFILE': ROOT + '/profile',
        'USER': ROOT + '/user',
        'PLAYLIST': ROOT + '/playlist',
        'HOME': ROOT + '/home',
        'RESULT': ROOT + '/result',
        'SEARCH': ROOT + '/search',
        'GROUP': ROOT + '/group',
        'COMMON': ROOT + '/common',
        'MAP': ROOT + '/map',
        'CONTENT': ROOT + '/content',
        'DATA': 'data'
      },
      'VIEW': '.view.html',
      'CONFIG': {
        'NOTIFICATION' : {
          'SENDERID' : 150596025418
        },
        'AUTH': {
          'GOOGLEPLUS': {
            'scopes': 'email profile',
            'webClientId': '484139127663-85i2cme4uqr97fepn7n0a4la9i8rvbcm.apps.googleusercontent.com',
            'offline': true
          },
          'FB': ['email', 'public_profile']
        }
      },

      'CLIENTID': {
        'FACEBOOK': '1159750564044149',
        'GOOGLE': '484139127663-85i2cme4uqr97fepn7n0a4la9i8rvbcm.apps.googleusercontent.com',
        'ELL': '1e7aa89f-3f50-433a-90ca-e485a92bbda6'
      },
      'ASSETS': {
        'IMG': {
          'ICON': 'img/icons',
          'TEMP' : 'img/temp'
        },
        'SOUND' : 'sound/temp'
      },
      'STAR': {
        'ONE': 70,
        'TWO': 85,
        'THREE': 100
      },
      'WIDGETS': {
        'SPEAKER_IMAGE': '<div class="sound-image sbtn sbtn-sound"></div>',
        'SPEAKER_IMAGE_SELECTED': '<div class="sound-image sbtn sbtn-sound activated animation-repeat-bounce"></div>',
        'OPTIONS': {
          'LAYOUT_THRESHOLD': 55,
          'FONT_SIZE_THRESHOLD': 6
        },
        'QUESTION_TYPES': {
          'CHOICE_QUESTION': 'choicequestion',
          'SCQ': 'scq',
          'MCQ': 'mcq'
        },
        'LAYOUT': {
          'LIST': 'list',
          'GRID': 'grid'
        }
      },
      'ATTEMPT': {
        'STATUS': {
          'ATTEMPTED': 1,
          'SKIPPED': 2,
          'NOT_ATTEMPTED': 3
        }
      },
      'DIAGNOSIS_MEDIA' : ["/media/ell/images/train_I22SVA.png","/media/ell/images/she-got-a-good-grade_G2W46Q.png","/media/ell/sounds/why-is-the-girl-happy_6N4EU5.mp3","/media/ell/images/t-shirt_E5B2T4.png","/media/ell/images/pencil_PT9T9L.png","/media/ell/images/how-are-you_FUTRW7.png","/media/ell/images/i-am-finethankyou_1B2M2M.png","/media/ell/sounds/how-are-you-aap-kaise-ho_WPHQ9H.mp3","/media/ell/images/orange_B3P0RA.png","/media/ell/images/sing_K6PD5E.png","/media/ell/images/girl-with-umbrella_5LR7P6.png","/media/ell/sounds/why-does-the-girl-have-an-umbrella_8VETBE.mp3","/media/ell/images/boy-has-a-green-book_A6CHBM.png","/media/ell/sounds/who-has-a-green-book_CB7LAP.mp3","/media/ell/images/dress-b_3IRUON.png","/media/ell/sounds/which-dress-is-blue_15UQWO.mp3","/media/ell/images/pen_E6O5ND.png","/media/ell/images/behind_7SMX9O.png","/media/ell/images/cat_07LDWL.png","/media/ell/images/student_2Z18AN.png","/media/ell/images/teacher-1_JTETOS.png","/media/ell/sounds/student_HXEEAT.mp3","/media/ell/images/ankur-has-less-hair_4GK96O.png","/media/ell/images/policeman_055JHM.png","/media/ell/images/dog-behind-the-box_GXMV8O.png","/media/ell/sounds/where-is-the-cat_0E1M5W.mp3","/media/ell/images/write-1_WZ7GI9.png","/media/ell/images/vijay-is-taller_ERCR7X.png","/media/ell/sounds/who-is-taller_VVTPB6.mp3","/media/ell/images/red-bird_THDY5I.png","/media/ell/images/elephant_Y706D3.png","/media/ell/images/d_JWKHIB.png","/media/ell/images/q_Q090I9.png","/media/ell/sounds/name-of-d_41T384.mp3","/media/ell/images/night_XESRY7.png","/media/ell/images/what-is-your-name-2_ESZ1RM.png","/media/ell/images/how-are-you_FUTRW7.png","/media/ell/sounds/what-is-your-name-aapka-naam-kya-hai_7T3AX6.mp3","/media/ell/images/book_D7ISM9.png","/media/ell/images/4-bananas_9IYY2R.png","/media/ell/sounds/how-many-bananas-are-there_U5F0QB.mp3","/media/ell/images/ankur-is-faster_VHB4P6.png","/media/ell/images/car_IVE2DQ.png","/media/ell/sounds/which-car-is-red_30TB9C.mp3","/media/ell/images/box-with-book_KOA7Y5.png","/media/ell/sounds/what-is-on-the-box_12F6V7.mp3","/media/ell/images/c_3JZI69.png","/media/ell/images/n_X8OY7Z.png","/media/ell/sounds/name-of-c_IBTJHG.mp3","/media/ell/images/apple_8WP22E.png","/media/ell/images/f_82WG2F.png","/media/ell/images/h_PBGDWV.png","/media/ell/sounds/name-of-h_VCWKOO.mp3","/media/ell/images/green_68Y6BQ.png"]
    })
})();
