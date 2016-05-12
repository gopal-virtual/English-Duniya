(function() {
  var ROOT = 'templates';

  angular
    .module('common')
    .constant('CONSTANT', {
      'BACKEND_SERVICE_DOMAIN': 'http://cc-test.zaya.in/',
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
        'CONTENT': ROOT + '/content'
      },
      'VIEW': '.view.html',
      'CLIENTID': {
        'FACEBOOK': '1159750564044149',
        'GOOGLE': '1011514043276-7q3kvn29jkegl2d1v7dtlbtipqqgo1rr.apps.googleusercontent.com',
        'ELL': '1e7aa89f-3f50-433a-90ca-e485a92bbda6'
      },
      'ASSETS' : {
        'IMG' : {
          'ICON' : 'img/icons',
          'SOUND_PLACEHOLDER' : 'img/icons/sound.png'
        }
      },
      'STAR': {
        'ONE': 60,
        'TWO': 80,
        'THREE': 95
      }
    })
})();
