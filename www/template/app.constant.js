(function(){
  var ROOT = 'template';

  angular
    .module('zaya')
    .constant('CONSTANT',{
      'BACKEND_SERVICE_DOMAIN' : 'http://gopal.zaya.in',
      'PATH' : {
        'AUTH' : ROOT+'/auth'
      },
      // 'CONTROLLER' : 'controller.js',
      'VIEW' : 'view.html'
    })
})();
