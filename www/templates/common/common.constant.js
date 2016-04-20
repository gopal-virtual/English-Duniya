(function(){
  var ROOT = 'templates';

  angular
    .module('common')
    .constant('CONSTANT',{
      'BACKEND_SERVICE_DOMAIN' : 'http://cc-test.zaya.in/',
      //'BACKEND_SERVICE_DOMAIN' : 'http://192.168.10.159:8000/',
      'PATH' : {
        'INTRO' : ROOT+'/intro',
        'AUTH' : ROOT+'/auth',
        'QUIZ' : ROOT+'/quiz',
        'PROFILE' : ROOT+'/profile',
        'USER' : ROOT+'/user',
        'PLAYLIST' : ROOT+'/playlist',
        'HOME' : ROOT+'/home',
        'RESULT' : ROOT+'/result',
        'SEARCH' : ROOT+'/search',
        'GROUP' : ROOT+'/group',
        'COMMON' : ROOT + '/common',
        'MAP' : ROOT + '/map'
      },
      'VIEW' : '.view.html',
      'CLIENTID' : {
        'FACEBOOK' : '1159750564044149',
        'GOOGLE' : '1011514043276-7q3kvn29jkegl2d1v7dtlbtipqqgo1rr.apps.googleusercontent.com'
      }
    })
})();
