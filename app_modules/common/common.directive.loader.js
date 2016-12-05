(function() {
    'use strict';

    angular
        .module('zaya-map')
        .directive('loader', loader)

    /* @ngInject */
    function loader(CONSTANT) {
        var loader = {
            restrict: 'E',
            templateUrl: CONSTANT.PATH.COMMON + '/common.loader.animation' + CONSTANT.VIEW,
            link: linkFunc,
        };

        return loader;

        function linkFunc(scope, el, attr, ctrl) {
            var timelineCloud1 = new TimelineMax({ repeat: -1 });
            var timelineCloud2 = new TimelineMax({ repeat: -1 });
            var cloud1 = document.querySelector('#cloud-1');
            var cloud2 = document.querySelector('#cloud-2');
            var plane = document.querySelector('#boy-plane');
            var timelinePlane = new TimelineMax({ repeat : -1})
            var propeler = document.querySelector('#propeler');
            var timelinePropeler = new TimelineMax({ repeat : -1})
            var planeWrapper = document.querySelector('#boy-plane-wrapper');
            var timelinePlaneWrapper = new TimelineMax({repeat : -1})
            timelinePlaneWrapper.fromTo(planeWrapper, 1, {y : -30},{y : 30})
            timelinePlaneWrapper.fromTo(planeWrapper, 1, {y : 30}, {y : -30})
            timelinePlaneWrapper.play();
            TweenLite.set(propeler, {transformOrigin:"50% 50%"})
            timelinePropeler.to(propeler, 1, {rotationX:-720})
            timelinePropeler.play();
            TweenLite.set(plane, {transformOrigin:"50% 50%"})
            timelinePlane.fromTo(plane, 1.2, {rotationZ:5, ease: Circ.easeOut},{rotationZ:-5})
            timelinePlane.fromTo(plane, 1.2, {rotationZ:-5, ease: Circ.easeIn},{rotationZ:5})
            timelinePlane.play();
            timelineCloud1.from(cloud2, 0.8, {scaleX:1.5, scaleY:1.5, x : 250, opacity : 0, ease: Circ.easeOut})
            timelineCloud1.to(cloud2, 0.8, {scaleX:1.5, scaleY:1.5, x : -250, opacity : 0, ease: Circ.easeIn})
            timelineCloud1.from(cloud1, 0.8, {scaleX:0.5, scaleY:0.5, x : 200, opacity : 0, ease: Circ.easeOut}, "-=1")
            timelineCloud1.to(cloud1, 0.8, {scaleX:0.5, scaleY:0.5, x : -200, opacity : 0, ease: Circ.easeIn})
            timelineCloud1.play();
        }
    }

})();
