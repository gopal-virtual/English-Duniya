(function() {
  'use strict';

  angular
    .module('zaya-user')
    .config(mainRoute);

  function mainRoute($stateProvider, $urlRouterProvider, CONSTANT) {

    $stateProvider
    // parent state after authentication
      .state('user', {
        url: '/user',
        abstract: true,
        template: '<ion-nav-view name="state-user"></ion-nav-view>',
      })
      .state('user.personalise', {
        url: '/personalise',
        views: {
          'state-user': {
            templateUrl: CONSTANT.PATH.USER + '/user.personalise' + CONSTANT.VIEW,
            // templateUrl: CONSTANT.PATH.USER + '/user.personalise.grade' + CONSTANT.VIEW,
            controller: 'userController as userCtrl'
          }
      },
        onEnter: ['Auth', '$state', '$log', 'User', 'device', function (Auth, $state, $log, User, device) {



        }]
      })
      .state('user.nointernet',{
          url : '/nointernet',
          views : {
              'state-user' : {
                  templateUrl : CONSTANT.PATH.USER + '/user.nointernet' + CONSTANT.VIEW,
                  controller: ['$rootScope','$cordovaNetwork','$state',function($rootScope, $cordovaNetwork, $state){
                    $rootScope.$on('$cordovaNetwork:online',function(event, networkState){
                      $state.go('auth.autologin');
                    })
                  }]
              }
          }
      })
      .state('user.profile', {
        url: '/profile',
        views: {
          'state-user': {
            templateUrl: CONSTANT.PATH.USER + '/user.profile' + CONSTANT.VIEW,
            controller: 'userController as userCtrl'
          }
        }
      })
      .state('user.chooseProfile', {
        url: '/chooseProfile',
        views: {
          'state-user' : {
            templateUrl: CONSTANT.PATH.USER + '/user.chooseProfile' + CONSTANT.VIEW,
            controller: ['User','$log','$state', 'CONSTANT', '$q',function(User, $log, $state, CONSTANT, $q){
                var profileCtrl = this;
                var promises = [];
                profileCtrl.getCurrentProfile = getCurrentProfile;
                profileCtrl.goToMap = goToMap;
                profileCtrl.getProfileMeta = getProfileMeta;
                profileCtrl.selectProfile = selectProfile;

                User.profile.getAll().then(function (profiles) {
                    for (var i = 0; i < profiles.length; i++) {
                        if(profiles[i].doc._id == getCurrentProfile()){
                            var currentProfile = profiles.splice(i,1)
                        }
                    }
                    profiles.unshift(currentProfile[0]);
                    angular.forEach(profiles, function(profile, index){
                        promises.push(getProfileMeta(profile, profile.doc._id))
                    })
                    $q.all(promises).then(function(profiles){
                        profileCtrl.profiles = profiles;
                    })
                })

                function selectProfile(profile) {
                    User.profile.select(profile);
                    $state.go('map.navigate');
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
                    $state.go('map.navigate',{})
                }
                function getCurrentProfile (){
                    return User.getActiveProfileSync()._id;
                }
            }],
            controllerAs : 'profileCtrl'
          }
        },
        params: {
          profiles: null
        }
      })
  }
})();
