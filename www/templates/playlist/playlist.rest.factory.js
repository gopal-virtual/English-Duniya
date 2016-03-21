(function() {
    'use strict';

    angular
        .module('zaya-playlist')
        .factory('playlistData', playlistData);

    playlistData.$inject = [];

    function playlistData() {
        var playlist = {
          playlist : {
              id : 100,
              title : "Root",
              description : "Root",
              root : true,
              children : [
                {
                  id : 1,
                  title : "English",
                  description : "lorem some desction for the subjjectt lorem some desction for the subjjecttlorem some desction for the subjjecttlorem some desction for the subjjecttlorem some desction for the subjjecttlorem some desction for the subjjecttlorem some desction for the subjjecttlorem some desction for the subjjectt",
                  image : "path",
                  children : [
                    {
                      id : 10,
                      title : "Lorem ipsum dolor sit amet",
                      description : "Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet",
                      children : [
                        {
                          id : 2,
                          title : "dolor sit amet",
                          description : "ipsum dolor sit ametLorem ipsum dolor sit amet",
                        },
                      ]
                    },
                    {
                      id : 11,
                      title : "Lorem hello are you",
                      description : "dolor sit ametLorem ipsum olor sit ametLorem ipsum dolor sit amet",
                      children : [
                        {
                          id : 111,
                          title : "Lorsdlfkj sdlfkj",
                          description : "dolor sdlfkjsdf sdflskdjfsd s",
                          children : []
                        },
                        {
                          id : 111,
                          title : "sdflksf sdlfsdk",
                          description : "dolor sdlscfsdf dffkjsdf sdflskdjfsd s",
                          children : []
                        },
                        {
                          id : 111,
                          title : "sdfsdf fsdf dsfj",
                          description : "dolor sdlsdffsfsd sdflskdjfsd s",
                          children : []
                        },
                        {
                          id : 111,
                          title : "dfd dfdf",
                          description : "ddsfsf sdflskdjfsd",
                          children : []
                        },
                      ]
                    },
                    {
                      id : 12,
                      title : "Lorem ipsum dolor sit amet",
                      description : "Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet",
                      children : []
                    }
                  ]
                },
                {
                  id : 2,
                  title : "Math",
                  description : "lorem some desction for the subjjectt",
                  image : "path",
                  children : []
                },
                {
                  id : 2,
                  title : "Geography",
                  description : "lorem some desction for the subjjectt",
                  image : "path",
                  children : []
                },
                {
                  id : 4,
                  title : "Science",
                  description : "lorem some desction for the subjjectt",
                  image : "path",
                  children : []
                },
                {
                  id : 4,
                  title : "Biology",
                  description : "lorem some desction for the subjjectt",
                  image : "path",
                  children : []
                },
                {
                  id : 4,
                  title : "Bio technology",
                  description : "lorem some desction for the subjjectt",
                  image : "path",
                  children : []
                },
                {
                  id : 4,
                  title : "Linkin Park",
                  description : "lorem some desction for the subjjectt",
                  image : "path",
                  children : []
                }
              ]
          }
        };

        return playlist;

    }
})();
