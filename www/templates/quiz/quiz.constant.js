(function(){
  var ROOT = 'templates';

  angular
    .module('zaya-quiz')
    .constant('CONSTANT',{
      'PATH' : {
        'QUIZ' : ROOT+'/quiz'
      },
      'VIEW' : 'view.html'
    })
})();
