(function(){
  var ROOT = 'templates';

  angular
    .module('zaya')
    .constant('CONSTANT',{
      // 'BACKEND_SERVICE_DOMAIN' : 'http://gopal.zaya.in',
      'BACKEND_SERVICE_DOMAIN' : 'http://192.168.10.121:9000',
      'PATH' : {
        'AUTH' : ROOT+'/auth',
        'PROFILE' : ROOT+'/profile',
        'USER' : ROOT+'/user',
        'QUIZ' : ROOT+'/quiz'
      },
      // 'CONTROLLER' : 'controller.js',
      'VIEW' : 'view.html'
    })
})();
