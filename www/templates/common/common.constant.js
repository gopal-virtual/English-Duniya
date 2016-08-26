(function() {
  var ROOT = 'templates';

  angular
    .module('common')
    .constant('CONSTANT', {
      'LOCK': true,
      'BACKEND_SERVICE_DOMAIN': 'https://cc-test.zaya.in/',
      // 'BACKEND_SERVICE_DOMAIN': 'https://eg-api.zaya.in/',
      'RESOURCE_SERVER': 'https://cc-test.zaya.in/',
      // 'RESOURCE_SERVER': 'https://eg-api.zaya.in/',
      // 'BACKEND_SERVICE_DOMAIN' : 'http://192.168.1.6:9000/',
      'QUESTION' : {
        'DEMO' : '33c0asdf-b7f6-4f1c-8db5-234f5613a854'
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
        'ONE': 60,
        'TWO': 80,
        'THREE': 100
      },
      'WIDGETS': {
        'SPEAKER_IMAGE': '<img class="content-image sound-image" src="img/icons/sound.png">',
        'SPEAKER_IMAGE_SELECTED': '<img class="content-image sound-image animation-repeat-bounce" src="img/icons/sound.png">',
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
