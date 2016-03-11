(function(){
  var ROOT = 'templates';

  angular
    .module('zaya-user')
    .constant('CONSTANT',{
      'PATH' : {
        'PROFILE' : ROOT+'/profile',
        'USER' : ROOT+'/user',
      },
      'VIEW' : 'view.html'
    })
})();
