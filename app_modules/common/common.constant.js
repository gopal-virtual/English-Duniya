(function() {
  var ROOT = 'templates';

  angular
    .module('common')
    .constant('CONSTANT', {
      'APP':{
      'TYPE': 'na',
      'VERSION': '0.1.8'
      },
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
        }
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
      }
    })
})();
