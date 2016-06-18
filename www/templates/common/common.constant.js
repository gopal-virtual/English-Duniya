(function() {
  var ROOT = 'templates';

  angular
    .module('common')
    .constant('CONSTANT', {
      'LOCK': false,
      'BACKEND_SERVICE_DOMAIN': 'http://cc-test.zaya.in/',
      'RESOURCE_SERVER': 'http://cc-test.zaya.in/',
      // 'BACKEND_SERVICE_DOMAIN' : 'http://192.168.1.6:9000/',

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
        'DATA': '/data'
      },
      'VIEW': '.view.html',
      'CONFIG': {
        'AUTH': {
          'GOOGLEPLUS': {
            'scopes': 'email profile',
            'webApiKey': '306430510808-i5onn06gvm82lhuiopm6l6188133j5r4.apps.googleusercontent.com',
            'offline': true
          },
          'FB': ['email', 'public_profile']
        }
      },
      'CLIENTID': {
        'FACEBOOK': '1159750564044149',
        'GOOGLE': '1011514043276-7q3kvn29jkegl2d1v7dtlbtipqqgo1rr.apps.googleusercontent.com',
        // 'ELL': '1e7aa89f-3f50-433a-90ca-e485a92bbda6',
        'ELL': '12e069db-f819-4592-93bf-50bad801243d'
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
        'SPEAKER_IMAGE_SELECTED': '<img class="content-image sound-image" src="img/icons/sound_selected.png">',
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
