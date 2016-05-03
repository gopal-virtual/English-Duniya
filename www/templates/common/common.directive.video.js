(function() {
  'use strict';

  angular
    .module('common')
    .directive('trackVideo', trackVideo);

  /* @ngInject */
  function trackVideo($window, $log, orientation) {
    var video = {
      restrict: 'A',
      link: linkFunc,
    };

    return video;

    // full screen not working ; instead used css to immitate full screen effect ; check below
    function toggleFullScreen() {
      if (!document.fullscreenElement && // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }

    function linkFunc(scope, el, attr, ctrl) {
      el.bind('playing', function() {
        // toggleFullScreen();
        document.querySelector("ion-modal-view").classList.remove('modal-dark');
        document.querySelector("ion-modal-view").classList.add('modal-black');
        el.addClass('fullscreen');
        orientation.setLandscape();
      });
      el.bind('pause', function() {
        // toggleFullScreen();
        document.querySelector("ion-modal-view").classList.remove('modal-black');
        document.querySelector("ion-modal-view").classList.add('modal-dark');
        el.removeClass('fullscreen');
        orientation.setPortrait();
      });
      el.bind('click',function (event) {
        event.stopPropagation();
      })
    }
  }

})();
