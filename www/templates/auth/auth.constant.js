(function(){
  var ROOT = 'templates';

  angular
    .module('zaya-auth')
    .constant('CONSTANT',{
      'PATH' : {
        'AUTH' : ROOT+'/auth'
      },
      'VIEW' : 'view.html'
    })
})();
