(function() {
    'use strict';

    angular
        .module('zaya-playlist')
        .controller('playlistController', playlistController);

    playlistController.$inject = ['$ionicScrollDelegate','$timeout','$stateParams','playlistData'];

    function playlistController($ionicScrollDelegate,$timeout,$stateParams,playlistData) {
        var playlistCtrl = this;
        playlistCtrl.playlist = playlistData.playlist;
        playlistCtrl.playlistId = $stateParams.playlistId;

        $timeout(function() {
            $ionicScrollDelegate.$getByHandle('playlistScrollBottom').scrollBottom();
        });


    }
})();
