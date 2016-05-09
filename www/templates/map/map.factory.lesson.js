(function() {
    'use strict';

    angular
        .module('zaya-map')
        .factory('extendLesson', extendLesson);

    extendLesson.$inject = ['$log'];

    /* @ngInject */
    function extendLesson($log) {
        var extendLesson = {
            getLesson: getLesson
        };

        return extendLesson;

        function setLock(lesson, bool){
            lesson.locked = bool;
        }

        function getLesson(lesson) {

            angular.forEach(lesson, function(value, key){
                setLock(value,true);

                // unlock first lessons
                if(key == 0){
                    setLock(value, false);
                }

                // if score is > 80%, unlock the next lesson
                if(value.type.total_score > 0){
                    if(((value.type.obtained_score / value.type.total_score) * 100) > 80){
                        lesson[key + 1] && setLock(lesson[key + 1], false) ;
                    }
                }
            })

            return lesson;
        }

    }
})();
