(function(){
  var ROOT = 'template';

  angular
    .module('zaya')
    .constant('CONSTANT',{
      'BACKEND_SERVICE_DOMAIN' : 'http://gopal.zaya.in',
      // 'BACKEND_SERVICE_DOMAIN' : 'http://192.168.1.34:9000',
      'PATH' : {
        'AUTH' : ROOT+'/auth',
        'QUIZ' : ROOT+'/quiz'
      },
      // 'CONTROLLER' : 'controller.js',
      'VIEW' : 'view.html'
    })
})();
