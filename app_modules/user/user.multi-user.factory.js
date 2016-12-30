(function() {
    'use strict';

    angular
        .module('zaya-user')
        .factory('multiUser', multiUser);

    multiUser.$inject = ['User','$log','$state', 'CONSTANT', '$q', '$ionicLoading', '$rootScope', '$timeout','analytics'];

    /* @ngInject */
    function multiUser(User, $log, $state, CONSTANT, $q, $ionicLoading, $rootScope, $timeout, analytics) {
        var multiUser = {
            getCurrentProfile : getCurrentProfile,
            goToMap : goToMap,
            getProfileMeta : getProfileMeta,
            selectProfile : selectProfile,
            goToCreateNewProfile : goToCreateNewProfile,
            canAdd : canAdd,
            hasCurrentUser : hasCurrentUser,
            getProfiles : getProfiles
        };

        return multiUser;


        function getProfiles() {
            multiUser.profiles = [];
            $log.debug('get profiles')
            User.profile.getAll().then(function (profiles) {
                var promises = [];
                $log.debug('Profile list :', profiles)
                for (var i = 0; i < profiles.length; i++) {
                    if(profiles[i].doc._id == getCurrentProfile()){
                        var currentProfile = profiles.splice(i,1)
                    }
                }
                currentProfile && profiles.unshift(currentProfile[0]);
                angular.forEach(profiles, function(profile, index){
                    promises.push(getProfileMeta(profile, profile.doc._id))
                })
                $q.all(promises).then(function(profiles){
                    multiUser.profiles = profiles;
                })
            })
        }

        function hasCurrentUser (){
            return User.getActiveProfileSync() ? true : false;
        }

        function canAdd (){
            return multiUser.profiles && multiUser.profiles.length < 4;
        }

        function goToCreateNewProfile (){
                localStorage.removeItem('currentPosition');
                localStorage.removeItem('regionPage');
                localStorage.removeItem('profile');
                analytics.log({
                    name : 'CHOOSEPROFILE',
                    type : 'ADD'
                },{
                    time : new Date(),
                }, multiUser.getCurrentProfile());
                $state.go('user.personalise', {})
        }

        function selectProfile(profile, scope) {
            localStorage.removeItem('currentPosition');
            localStorage.removeItem('regionPage');
            analytics.log({
                name : 'CHOOSEPROFILE',
                type : 'SWITCH'
            },{
                time : new Date(),
                from : multiUser.getCurrentProfile(),
                to : profile
            }, multiUser.getCurrentProfile());
            User.profile.select(profile);
            $log.debug('selected profile', profile.id, multiUser.getCurrentProfile())
            if($state.current.name == 'map.navigate'){
                $ionicLoading.show({
                  templateUrl: 'templates/common/common.loader.view.html'
                });
                $state.go('repaint',{})
            }
            else{
                $ionicLoading.show({
                  noBackdrop: false,
                  hideOnStateChange: true
                });
                $state.go('map.navigate');
            }
        }

        function getProfileMeta (profile, profile_id) {
            var stars = 0;
            var levels = 0;
            return User.playlist.get(profile_id).then(function(playlist){
                angular.forEach(playlist,function(playlist_item,index){
                    $log.debug('Playlist item : ', playlist_item)
                    angular.forEach(playlist_item, function(resource, resource_id){
                        $log.debug('Resource id : ', resource_id)
                        if(['dependencyData','lesson_id'].indexOf(resource_id) == -1){
                            var percent = (resource.score / resource.totalScore) * 100;
                            stars += (percent >= CONSTANT.STAR.THREE) ? 3 :
                                     (percent >= CONSTANT.STAR.TWO && percent < CONSTANT.STAR.THREE) ? 2 :
                                     (percent >= CONSTANT.STAR.ONE && percent < CONSTANT.STAR.TWO) ? 1 : 0;
                            levels += 1;
                        }
                    })
                })
                profile["stars"] = stars;
                profile["levels"] = levels + 1;
                return profile;
            })
        }
        function goToMap () {
            $log.debug("Clicked : exit")
            $ionicLoading.show({
              noBackdrop: false,
              hideOnStateChange: true
            });
            $state.go('map.navigate',{})
        }
        function getCurrentProfile (){
            return User.getActiveProfileSync() ? User.getActiveProfileSync()._id : false;
        }

    }
})();
