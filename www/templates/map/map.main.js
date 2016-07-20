window.createGame = function(scope, stateParams, lessons, audio, injector, log) {
    'use strict';

    var lessons = lessons;
    var game = new Phaser.Game("100", "100", Phaser.CANVAS, 'map_canvas', null, true, true, null);
    var gameSprites;
    var sprites = {};
    var temp = {};
    // var desertRegion, regionGroups.tundra, regionGroups.forest;
    var region = ["desert","tundra","forest","peru","region5"];
    var groups = {
        "region" : {},
        "nonRegion" : {},
        "regionBg" : {},
    }
    var nonRegionGroups = {};
    var regionGroups = {};
    var regionBgGroups = {};
    var regionHeight = {
        "desert" : 2420,
        "tundra" : 2796,
        "forest" : 2856,
        "peru" : 1872,
        "region5" : 392,
    }
    var regionOffset = {
        "desert" : regionHeight.tundra + regionHeight.forest + regionHeight.peru + regionHeight.region5,
        "tundra" : regionHeight.forest + regionHeight.peru + regionHeight.region5,
        "forest" : regionHeight.peru + regionHeight.region5,
        "peru" : regionHeight.region5,
        "region5" : 0,
    }
    var tresholdOffset = -200;
    var regionRange = {
        "desert" : {
            upperLimit : regionOffset.desert,
            lowerLimit : regionOffset.desert + regionHeight.desert,
        },
        "tundra" : {
            upperLimit : regionOffset.tundra,
            lowerLimit : regionOffset.desert,
        },
        "forest" : {
            upperLimit : regionOffset.forest,
            lowerLimit : regionOffset.tundra,
        },
        "peru" : {
            upperLimit : regionOffset.peru,
            lowerLimit : regionOffset.forest,
        },
        "region5" : {
            upperLimit : regionOffset.region5,
            lowerLimit : regionOffset.peru,
        }
    };

    var playState = {
        preload: function() {
            // crisp image rendering
            this.game.renderer.renderSession.roundPixels = true;
            //   Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);  //for Canvas, modern approach
            Phaser.Canvas.setSmoothingEnabled(this.game.context, true); //also for Canvas, legacy approach
            //   PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; //for WebGL

            this.load.image('desert', 'img/assets/desert_bg.png');
            this.load.image('tundra', 'img/assets/snow_bg.png');
            this.load.image('forest', 'img/assets/forest_bg.png');
            this.load.image('peru', 'img/assets/peru_bg.png');
            this.load.image('region5', 'img/assets/region5.png');

            // this.load.image('tent', 'img/assets/tent.png');
            this.load.image('amazon_tree', 'img/assets/amazon_tree.png');
            this.load.image('two_stone', 'img/assets/two_stone.png');
            this.load.image('one_stone', 'img/assets/one_stone.png');
            this.load.image('particle1', 'img/assets/particle1.png');
            this.load.image('particle2', 'img/assets/particle2.png');
            this.load.image('particle3', 'img/assets/particle3.png');
            this.load.image('snow1', 'img/assets/snow.png');
            this.load.image('snow2', 'img/assets/snow1.png');
            this.load.image('snow_cactus', 'img/assets/snow_cactus.png');
            this.load.image('cloud_middle', 'img/assets/cloud_middle.png');
            this.load.image('cloud_left', 'img/assets/cloud_left.png');
            this.load.image('cloud_right', 'img/assets/cloud_right.png');
            this.load.image('cloud_right_behind', 'img/assets/cloud_right_behind.png');
            this.load.image('forest_plant_left', 'img/assets/plant_left.png');
            this.load.image('forest_plant_right', 'img/assets/plant_right.png');

            this.load.spritesheet('fire_animation', 'img/assets/fire_animation.png', 122, 193, 39);
            this.load.spritesheet('cactus_animation', 'img/assets/cactus_animation.png', 180, 303, 35);
            this.load.spritesheet('plant_animation', 'img/assets/plant_animation.png', 201, 275);
            //   this.load.spritesheet('cactus_second_animation', 'img/assets/cactus_second_animation.png', 551, 754);
            this.load.spritesheet('camel_animation', 'img/assets/camel_animation.png', 336, 256);
            this.load.spritesheet('scorpion_animation', 'img/assets/scorpion_animation.png', 103, 95);
            this.load.spritesheet('seal_animation', 'img/assets/seal_animation.png', 286, 270, 19);
            this.load.spritesheet('penguin_animation', 'img/assets/penguin_animation.png', 153, 183, 22);
            this.load.spritesheet('whale_animation', 'img/assets/whale_animation.png', 275, 255, 16);
            this.load.spritesheet('tent_animation', 'img/assets/tent_animation.png', 734, 394);
            this.load.spritesheet('yellow_butterfly', 'img/assets/yellow_butterfly_animation.png', 100, 69);
            this.load.spritesheet('pink_butterfly', 'img/assets/pink_butterfly_animation.png', 95, 75);
            this.load.spritesheet('sloth', 'img/assets/sloth_animation.png', 387, 397);
            this.load.spritesheet('snake', 'img/assets/snake_animation.png', 200, 180);
            this.load.spritesheet('toucan', 'img/assets/toucan_animation.png', 512, 274, 18);
            this.load.spritesheet('llama', 'img/assets/llama_animation.png', 124, 201);
            this.load.spritesheet('llama2', 'img/assets/llama2_animation.png', 124, 201);

            this.load.image('node', 'img/icons/node.png');
            this.load.image('node-litmus', 'img/icons/icon-litmus-node.png');
            this.load.image('node-vocabulary', 'img/icons/icon-vocabulary-node.png');
            this.load.image('node-listening', 'img/icons/icon-listening-node.png');
            this.load.image('node-grammar', 'img/icons/icon-grammar-node.png');
            this.load.image('node-reading', 'img/icons/icon-reading-node.png');
            this.load.image('node-locked', 'img/icons/icon-node-locked.png');
            this.load.image('star_big', 'img/icons/icon-star-2.png');
            this.load.image('star_medium', 'img/icons/icon-star-medium.png');
            this.load.image('star', 'img/icons/icon-star-small.png');
            this.load.image('nostar', 'img/icons/icon-nostar.png');

            // debug value
            this.game.time.advancedTiming = true;
            for(var key in regionRange){
                regionRange[key].upperTreshold = regionRange[key].upperLimit + game.camera.height + tresholdOffset;
                regionRange[key].lowerTreshold = regionRange[key].lowerLimit - game.camera.height + tresholdOffset;
            }

            groups.regionBg["desert"] = game.add.group();
            groups.regionBg["peru"] = game.add.group();
            groups.regionBg["forest"] = game.add.group();
            groups.regionBg["tundra"] = game.add.group();
            groups.regionBg["region5"] = game.add.group();
            groups.nonRegion["nodePath"] = game.add.group();
            groups.region["desert"] = game.add.group();
            groups.region["peru"] = game.add.group();
            groups.region["forest"] = game.add.group();
            groups.region["tundra"] = game.add.group();
            groups.region["region5"] = game.add.group();
            groups.nonRegion["starClone"] = game.add.group();
        },
        create: function() {

            var game_scale = game.world.width / 360;

            for (var key in regionOffset) {
                groups.regionBg[key].position.set(0, 0 + regionOffset[key]);
                groups.region[key].position.set(0, 0 + regionOffset[key]);
                var background = groups.regionBg[key].create(0, 0, key);
                // groups.region[key].add(regionBgGroups[key]);
                background.scale.setTo(game_scale, 1);
            }

            this.game.world.setBounds(0, 0, this.game.width, regionHeight.desert + regionHeight.tundra + regionHeight.forest + regionHeight.peru + regionHeight.region5);


            var points = {
                'x': [182,160,186,256,289,280,257,198,130,86,116,186,255,279,221,146,72,27,54,111,175,238,290,300,236,163,91,53,69,110,173,245,298,252,180,107,46,72,145,220,286,290,272,222,160,118,110,114,134,164,198,231,256,268,265,233,159,85,78,116,158,194,219,219,192,179,207,221,165,104,58,98,172,243,219,171,129,125,197,272,315,246,171,98,73,134,209,282,262,199,134,70,63,128,199,269,292,227,153,82,52,110,185,260,326,272,214,171,178,213,223,175,108,77,117,152,140,100,99,161,226,284,271,196,124,121,156,188,199,171,121,147,190,221,229,210,174,158,160,163,143,134,147,192,248,270,245,206,161,133,165,221,281,317,287,236,206,231,211,189,186,196,227,207,163,158,185,222,211,162,118,153,228,278,216,148,120,173,242,230,183,181,181,181,181,181,181,181,181,181],
                'y': [116,187,252,278,341,415,487,531,563,620,684,712,739,804,846,855,867,919,988,1036,1075,1116,1169,1240,1277,1295,1316,1372,1445,1507,1546,1569,1611,1665,1686,1702,1742,1807,1818,1815,1839,1913,1986,2041,2082,2143,2217,2292,2364,2433,2500,2567,2638,2712,2787,2850,2853,2848,2910,2975,3037,3103,3173,3248,3318,3390,3460,3527,3576,3620,3678,3730,3747,3768,3829,3887,3949,4018,4033,4033,4076,4099,4107,4121,4179,4217,4220,4231,4293,4334,4370,4410,4469,4505,4529,4557,4621,4642,4631,4651,4716,4756,4764,4768,4792,4843,4889,4950,5023,5089,5161,5216,5249,5312,5374,5440,5513,5576,5645,5686,5725,5771,5826,5833,5851,5920,5986,6054,6127,6196,6251,6318,6380,6448,6522,6594,6660,6733,6808,6882,6955,7029,7102,7162,7211,7279,7350,7413,7474,7541,7607,7657,7702,7764,7831,7886,7953,8022,8093,8165,8239,8314,8382,8452,8512,8586,8655,8720,8791,8848,8908,8961,8955,8989,9028,9059,9124,9174,9201,9267,9325,9399,9474,9549,9624,9699,9774,9849,9924,9999]
            };

            // var gameSprites =  game.cache.getJSON('gamesprites');
            gameSprites = [{
                "id" : "testCactus",
                "name" : "cactus_animation",
                "region" : "desert",
                "x" : 292,
                "y" : 2265,
                "scale" : 0.7,
                "animation" : {
                    "key" : "wind",
                }
            },{
                "name" : "cactus_animation",
                "region" : "desert",
                "x" : 62,
                "y" : 2165,
                "scale" : 0.6,
                "animation" : {
                    "key" : "wind",
                }
            },{
                "name" : "cactus_animation",
                "region" : "desert",
                "x" : 330,
                "y" : 1585,
                "scale" : 0.6,
                "animation" : {
                    "key" : "wind",
                }
            },{
                "name" : "cactus_animation",
                "region" : "desert",
                "x" : 334,
                "y" : 1245,
                "scale" : 0.6,
                "animation" : {
                    "key" : "wind",
                }
            },{
                "name" : "cactus_animation",
                "region" : "desert",
                "x" : 36,
                "y" : 1265,
                "scale" : 0.6,
                "animation" : {
                    "key" : "wind",
                }
            },{
                "name" : "cactus_animation",
                "region" : "desert",
                "x" : 92,
                "y" : 822,
                "scale" : 0.6,
                "animation" : {
                    "key" : "wind",
                }
            },{
                "name" : "cactus_animation",
                "region" : "desert",
                "x" : 310,
                "y" : 551,
                "scale" : 0.6,
                "animation" : {
                    "key" : "wind",
                }
            },{
                "name" : "cactus_animation",
                "region" : "desert",
                "x" : 70,
                "y" : 405,
                "scale" : 0.6,
                "animation" : {
                    "key" : "wind",
                }
            },{
                "name" : "camel_animation",
                "region" : "desert",
                "x" : 80,
                "y" : 1945,
                "scale" : 0.6,
                "angle" : -14,
                "animation" : {
                    "key" : "wind",
                }
            },{
                "name" : "plant_animation",
                "region" : "desert",
                "x" : 54,
                "y" : 1540,
                "scale" : 0.5,
                "animation" : {
                    "key" : "wave",
                }
            },{
                "name" : "plant_animation",
                "region" : "desert",
                "x" : 330,
                "y" : 20,
                "scale" : 0.3,
                "animation" : {
                    "key" : "wave",
                }
            },{
                "name" : "plant_animation",
                "region" : "desert",
                "x" : 230,
                "y" : 110,
                "scale" : 0.3,
                "animation" : {
                    "key" : "wave",
                }
            },{
                "name" : "snow_cactus",
                "region" : "tundra",
                "x" : 75,
                "y" : 2656,
                "scale" : 0.7,
            },{
                "name" : "tent_animation",
                "region" : "desert",
                "x" : 85,
                "y" : 168,
                "scale" : 0.5,
                "mirror" : true,
                "animation" : {
                    "key" : "shake"
                }
            },{
                "name" : "scorpion_animation",
                "region" : "desert",
                "x" : 300,
                "y" : 805,
                "animation" : {
                    "key" : "clap"
                }
            },{
                "name" : "fire_animation",
                "region" : "desert",
                "x" : 185,
                "y" : 198,
                "animation" : {
                    "key" : "burn"
                }
            },{
                "name" : "two_stone",
                "region" : "desert",
                "x" : 350,
                "y" : 62,
                "scale" : 0.6,
            },{
                "name" : "two_stone",
                "region" : "desert",
                "x" : 317,
                "y" : 99,
                "scale" : 0.5,
            },{
                "name" : "two_stone",
                "region" : "desert",
                "x" : 280,
                "y" : 127,
                "scale" : 0.5,
            },{
                "name" : "two_stone",
                "region" : "desert",
                "x" : 25,
                "y" : 37,
                "scale" : 0.5,
            },{
                "name" : "penguin_animation",
                "region" : "tundra",
                "x" : 80,
                "y" : 1450,
                "scale" : 1,
                "animation" : {
                    "key" : "flap"
                }
            },{
                "name" : "penguin_animation",
                "region" : "tundra",
                "x" : 200,
                "y" : 776,
                "scale" : 0.5,
                "mirror" : true,
                "animation" : {
                    "key" : "flap"
                }
            },{
                "name" : "seal_animation",
                "region" : "tundra",
                "x" : 306,
                "y" : 2049,
                "animation" : {
                    "key" : "oink"
                }
            },{
                "name" : "whale_animation",
                "region" : "tundra",
                "x" : 172,
                "y" : 533,
                "scale" : 0.7,
                "animation" : {
                    "key" : "splash"
                }
            },{
                "id" : "yellowButterfly",
                "name" : "yellow_butterfly",
                "region" : "forest",
                "x" : 58,
                "y" : 2668,
                "animation" : {
                    "key" : "flutter"
                }
            },{
                "name" : "pink_butterfly",
                "region" : "forest",
                "x" : 279,
                "y" : 1920,
                "animation" : {
                    "key" : "flutter"
                }
            },{
                "name" : "sloth",
                "region" : "forest",
                "x" : 280,
                "y" : 1290,
                "animation" : {
                    "key" : "slothy"
                }
            },{
                "name" : "amazon_tree",
                "region" : "forest",
                "x" : 181,
                "y" : 561,
                "background" : true,
                "scale" : [game_scale,1],
            },{
                "name" : "toucan",
                "region" : "forest",
                "x" : 350,
                "y" : 2533,
                "animation" : {
                    "key" : "slothy"
                }
            },{
                "name" : "snake",
                "region" : "forest",
                "x" : 248,
                "y" : 690,
                "animation" : {
                    "key" : "hiss"
                }
            },{
                "name" : "llama",
                "region" : "peru",
                "x" : 269,
                "y" : 1628,
                "animation" : {
                    "key" : "llamaWiggle"
                }
            },{
                "name" : "llama2",
                "region" : "peru",
                "x" : 295,
                "y" : 1350,
                "animation" : {
                    "key" : "llamaWiggle"
                }
            },{
                "name" : "cloud_middle",
                "region" : "peru",
                "x" : 190,
                "y" : 794,
                "scale" : [game_scale,1],
            },{
                "name" : "cloud_left",
                "region" : "peru",
                "x" : 80,
                "y" : 830,
                "scale" : [game_scale,1],
            },{
                "name" : "cloud_right_behind",
                "region" : "peru",
                "x" : 290,
                "y" : 810,
                "scale" : [game_scale,1],
            },{
                "name" : "cloud_right",
                "region" : "peru",
                "x" : 280,
                "y" : 780,
                "scale" : [game_scale,1],
            },{
                "id" : "plantLeft",
                "name" : "forest_plant_left",
                "region" : "tundra",
                "anchor" : [0,1],
                "x" : -50,
                "y" : 50,
                "scale" : [game_scale,1],
            },{
                "id" : "plantRight",
                "name" : "forest_plant_right",
                "region" : "tundra",
                "anchor" : [1,1],
                "x" : this.game.width + 30,
                "y" : 50,
                "scale" : [game_scale,1],
            }];



            for (var i = 0, points_count = points.x.length; i < points_count; i++) {
                points.x[i] *= game_scale;
                points.y[i] -= (60 - regionOffset.peru);
            }

            this.increment = 1 / this.world.height;

            // Somewhere to draw to
            this.bmd = this.add.bitmapData(this.game.width, this.world.height);
            // this.bmd.addToWorld();
            // nodeGroup.add(this.bmd);
            // Draw the path
            for (var j = 0; j < 1; j += this.increment) {
                var posx = this.math.catmullRomInterpolation(points.x, j);
                var posy = this.math.catmullRomInterpolation(points.y, j);
                this.bmd.rect(posx, posy, 4, 4, '#219C7F');
            }
            groups.nonRegion.nodePath.create(0,0,this.bmd);
            // nongroups.region.nodePath.callAll('kill');

            for (var i = 0; i < gameSprites.length; i++) {
                if (gameSprites[i].background == true) {
                    var gameSprite = groups.regionBg[gameSprites[i].region].create(gameSprites[i].x * game_scale, gameSprites[i].y, gameSprites[i].name);
                }else{
                    var gameSprite = groups.region[gameSprites[i].region].create(gameSprites[i].x * game_scale, gameSprites[i].y, gameSprites[i].name);
                }
                // gameSprites[i].scale != undefined ? gameSprite.scale.setTo(gameSprites[i].scale) : false;
                gameSprite.anchor.setTo(0.5);
                if (gameSprites[i].scale) {
                    if (!Array.isArray(gameSprites[i].scale)){
                        gameSprite.scale.setTo(gameSprites[i].mirror?-gameSprites[i].scale:gameSprites[i].scale, gameSprites[i].scale);
                    }else{
                        gameSprite.scale.setTo(gameSprites[i].mirror?-gameSprites[i].scale[0]:gameSprites[i].scale[0], gameSprites[i].scale[1]);
                    }
                }else {
                    gameSprite.scale.setTo(gameSprites[i].mirror?-1:1,1);
                }
                if (gameSprites[i].anchor) {
                    if (!Array.isArray(gameSprites[i].anchor)){
                        gameSprite.anchor.setTo(gameSprites[i].anchor);
                    }else{
                        gameSprite.anchor.setTo(gameSprites[i].anchor[0],gameSprites[i].anchor[1]);
                    }
                }
                if (gameSprites[i].angle) {
                    gameSprite.angle = gameSprites[i].angle;
                }
                if (gameSprites[i].animation) {
                    gameSprite.animations.add(gameSprites[i].animation.key);
                    gameSprite.animations.play(gameSprites[i].animation.key,gameSprites[i].animation.fps?gameSprites[i].animation.fps:20,gameSprites[i].animation.loop != false);
                }
                if (gameSprites[i].id) {
                    sprites[gameSprites[i].id] = gameSprite;
                }
            }

            // placing lesson node
            // 1. lesson node count
            // 2. Node should follow a particular path
            // path

            // sand particles
            for (var i = 0; i < 100; i++) {
                var s = this.game.add.sprite(this.world.randomX, this.game.rnd.between(regionOffset.desert, this.world.height), 'particle' + this.game.rnd.between(1, 3));

                s.scale.setTo(this.game.rnd.between(1, 2) / 20);
                this.game.physics.arcade.enable(s);
                s.body.velocity.x = this.game.rnd.between(-200, -550);
                s.body.velocity.y = this.game.rnd.between(50, 70);
                s.autoCull = true;
                s.checkWorldBounds = true;
                s.events.onOutOfBounds.add(this.resetSprite, this);
            }
            // snow particles
            for (var i = 0; i < 100; i++) {
                var s = this.game.add.sprite(this.world.randomX, this.game.rnd.between(regionOffset.tundra, regionOffset.desert - 200), 'snow' + this.game.rnd.between(1, 2));

                s.scale.setTo(this.game.rnd.between(1, 2) / 10);
                this.game.physics.arcade.enable(s);
                s.body.velocity.x = this.game.rnd.between(-50, -200);
                s.body.velocity.y = this.game.rnd.between(50, 70);
                s.autoCull = true;
                s.checkWorldBounds = true;
                s.events.onOutOfBounds.add(this.resetSnowSprite, this);
            }

            var star = [];
            // var stars = this.game.add.group();
            function createStars(count, x, y) {
                for (var i = 0; i < count; i++) {
                    star[i] = stars.create(x[0] + x[i + 1], y[0] + y[i + 1], 'star');
                    star[i].anchor.setTo(0.5, 0.5);
                    // star[i].scale.setTo(0.2,0.2);
                }
                return star;
            }
            var star_x = [-12, 0, 12];
            var star_y = [-10, -15, -10];

            function lessonType(lesson, test) {
                if (!lesson.locked) {
                    return lesson.tag.toLowerCase() != 'no tag' ? lesson.tag.toLowerCase() : '';
                } else {
                    return ''
                }
            };
            // Place nodes
            for (var j = 0.95, i = lessons.length - 1, nodeCount = 1 / (lessons.length); i >= 0; j -= nodeCount, i--) {
                var currentLesson = lessons[i];
                var locked = currentLesson.locked ? '-locked' : '';
                var type = lessonType(currentLesson, i) == '' ? '' : '-' + lessonType(currentLesson, i);
                var posx = this.math.catmullRomInterpolation(points.x, 1-j);
                var posy = this.math.catmullRomInterpolation(points.y, 1-j);
                var node = this.game.add.button(posx, posy, 'node' + type + locked);


                !locked && lessons[i + 1] && lessons[i + 1].locked && this.add.tween(node.scale).to({ x: [1.2, 1], y: [1.2, 1] }, 700, Phaser.Easing.Back.Out, true, 1000).loop(true);
                !locked && lessons[i + 1] && lessons[i + 1].locked && localStorage.setItem('region',posy);

                if(!locked && lessons[i + 1] && lessons[i + 1].locked){
                    temp["activeLessonKey"] = i;
                }

                if (stateParams.activatedLesson && stateParams.activatedLesson.node.id == currentLesson.id) {
                    temp["activatedLessonKey"] = i;
                }

                node.inputEnabled = true;
                node.currentLesson = currentLesson;
                node.type = lessonType(currentLesson, i);
                node.events.onInputUp.add(
                    function(currentLesson, game, posy) {
                        return function() {
                            var displacement = game.kineticScrolling.velocityY > -30 && game.kineticScrolling.velocityY < 30;
                            if (!currentLesson.locked && displacement) {
                                localStorage.setItem('currentPosition', (posy - game.height / 2));
                                var currentPosition = {
                                    "x": game.input._x,
                                    "y": game.input._y,
                                }
                                scope.$emit('openNode', currentLesson, currentPosition);
                                // scope.$emit('game', game);
                            } else if (currentLesson.locked && displacement) {
                                audio.play('locked');
                            } else {}
                        }
                    }(currentLesson, this.game, posy)
                );
                // icon.anchor.setTo(0.5,0.5);
                // icon.scale.setTo(0.3,0.3);
                node.anchor.setTo(0.5, 0.5);
                // node.scale.setTo(1.8, 1.8);
                // add stars
                log.debug("AIIII",i,currentLesson.stars);
                if (!locked && currentLesson.stars >= 0) {
                    var stars = this.game.add.group();
                    if (currentLesson.stars == 0) {
                        createStars(0, $.merge([posx], star_x), $.merge([posy], star_y));
                    } else if (currentLesson.stars == 1) {
                        createStars(1, $.merge([posx], star_x), $.merge([posy], star_y));
                    } else if (currentLesson.stars == 2) {
                        createStars(2, $.merge([posx], star_x), $.merge([posy], star_y));
                    } else if (currentLesson.stars == 3) {
                        createStars(3, $.merge([posx], star_x), $.merge([posy], star_y));
                    } else {}
                }
            }

            log.debug('node position ', node.currentLesson);
            localStorage.setItem('demo_node', JSON.stringify({
                    x: node.x - node.width / 2,
                    y: this.game.height - (this.world.height - node.y) - node.height / 2,
                    width: node.width,
                    height: node.height,
                    node: node.currentLesson,
                    type: node.type
                })

            );

            scope.$emit('show_demo');
            this.init();
            this.game.kineticScrolling.start();
            // log.debug("GUchaMI",temp.activeLessonKey);
            // log.debug("GUchaMI2",temp.activatedLessonKey);

            var _this = this;
            var starClone = [];
            function animateStar(){
                setTimeout(function(){
                    if (!stateParams.activatedLesson && temp.activeLessonKey != temp.activatedLessonKey - 1) {
                        // log.debug("GUchaMI",temp.activeLessonKey);
                        // log.debug("GUchaMI2",temp.activatedLessonKey);
                        return ;
                    }
                    // log.debug("GUchaMI",temp.activeLessonKey);
                    // log.debug("GUchaMI2",temp.activatedLessonKey);

                    log.debug(currentLesson.tag);
                    var lessonTag =  {
                        "vocabulary" : 1,
                        "reading" : 2,
                        "grammar" : 3,
                        "lisetening" : 4
                    }
                    var j =  lessons.length - temp.activatedLessonKey - 1;
                    var posx = _this.math.catmullRomInterpolation(points.x, j/lessons.length);
                    var posy = _this.math.catmullRomInterpolation(points.y, j/lessons.length);
                    // starClone.push(createStars(currentLesson.stars, $.merge([posx], star_x), $.merge([posy], star_y)));
                    // log.debug(currentLesson.stars);
                    // log.debug(lessons[temp.activatedLessonKey].stars);
                    // log.debug(temp.activeLesson);
                    var starCloneTween = [];    
                    // log.debug(lessonTag[lessons[j].tag.toLowerCase()]*game.world.width);
                    for (var i = 0; i < lessons[temp.activatedLessonKey].stars; i++) {
                        // setTimeout(function(){
                            log.debug($.merge([posx], star_x), $.merge([posy], star_y));

                            starClone[i] = stars.create(posx + star_x[i], posy + star_y[i], 'star_medium');
                            starClone[i].anchor.setTo(0.5, 0.5);
                            log.debug("adding tween",starClone[i],"to",parseInt(game.camera.y));
                            log.debug(starClone[i]);
                            starCloneTween[i] = {};
                            // var starClone = createStars(currentLesson.stars, $.merge([posx], star_x), $.merge([posy], star_y));
                            starCloneTween[i]["pos"] = game.add.tween(starClone[i]).to( { x: (lessonTag[stateParams.activatedLesson.node.tag.toLowerCase()]*game.width)/5, y: parseInt(game.camera.y)}, 1000, Phaser.Easing.Exponential.InOut);
                            starCloneTween[i]["scale"] = game.add.tween(starClone[i].scale).from( { x: 0.1, y: 0.1 }, 800, Phaser.Easing.Bounce.Out,false,i*800);
                            starCloneTween[i]["scalePos"] = game.add.tween(starClone[i]).to( { x: "+100", y: "-100" }, 800, Phaser.Easing.Cubic.Out,false,i*800);
                            starCloneTween[i]["rotate"] = game.add.tween(starClone[i]).to( { angle: 450 }, 2600, Phaser.Easing.Quadratic.Out);
                            starCloneTween[i].scale.chain(starCloneTween[i].pos);
                            starCloneTween[i].scale.start();
                            starCloneTween[i].scalePos.start();
                            starCloneTween[i].rotate.start();
                            // starCloneTween[i].pos.repeat(10, 1000);
                            // starCloneTween[i].scale.repeat(10, 1000);    
                        // },1000)
                    }
                },800);
            }

            animateStar();
            // for (var key in regionRange){
            //     if(regionRange[key].lowerLimit > game.camera.y && regionRange[key].upperLimit < game.camera.y ){
            //         var delGroup = region.slice();
            //         delGroup.splice(region.indexOf(key),1);
            //         for (var i = 0; i < delGroup.length; i++) {
            //            groups.region[delGroup[i]].callAll('kill');
            //         }
            //         break;
            //     }
            // }
            // log.debug("DEBUG",game.kineticScrolling);
            log.debug(sprites);

        },
        init: function() {
            this.game.kineticScrolling = this.game.plugins.add(Phaser.Plugin.KineticScrolling);
            this.game.kineticScrolling.configure({
                kineticMovement: true,
                timeConstantScroll: 325, //really mimic iOS
                horizontalScroll: false,
                verticalScroll: true,
                horizontalWheel: false,
                verticalWheel: true,
                deltaWheel: 400
            });
            this.game.camera.y = localStorage.getItem('currentPosition') ? localStorage.getItem('currentPosition') : ((~~this.world.height / this.game.height) - 1) * this.game.height;
        },
        resetSprite: function(sprite) {
            sprite.x = this.game.world.bounds.right;
            if (sprite.y > this.world.height)
                sprite.y = regionOffset.desert;
        },
        resetSnowSprite: function(sprite) {
            sprite.x = this.game.world.bounds.right;
            if (sprite.y > regionOffset.desert)
                sprite.y = regionOffset.tundra;
        },
        update: function() {
            // log.debug("groups.region.desert",groups.region.desert);
            // this.dragMap();
            // log.log("CAMERA",game.camera.y);
            // optimize(game.camera,regionRange);

            
        },

        render: function() {
            if (game.camera.y + 200 < regionOffset.tundra && game.camera.y + 200 > regionOffset.tundra - 360) {
                // log.debug("Hello ",gameSprites[gameSprites.length - 2].name,gameSprites[gameSprites.length - 2].x );
                game.debug.spriteInfo(sprites.plantLeft, 20, 32);
                if (temp.plantLeftX == undefined && temp.plantRightX ==undefined) {
                    // originalX = {
                        temp["plantLeftX"] = sprites.plantLeft.x;
                        temp["plantRightX"] = sprites.plantRight.x;
                    // }
                }
                // log.debug(temp);
                // log.debug(originalX.plant_left - (180 * (regionOffset.tundra - game.camera.y - 200)/360));
               sprites.plantLeft.x = temp.plantLeftX - (180 * (regionOffset.tundra - game.camera.y - 200)/360);
               sprites.plantRight.x = temp.plantRightX + (180 * (regionOffset.tundra - game.camera.y - 200)/360);
            }

            if (game.camera.y + 500 < regionOffset.tundra && game.camera.y + 500 > regionOffset.forest + 300) {
                if (temp.yellowButterflyY == undefined) {
                    // temp = {
                        temp["yellowButterflyY"] = sprites.yellowButterfly.y;
                    // }
                }
                sprites.yellowButterfly.y = temp.yellowButterflyY - (regionOffset.tundra - game.camera.y - 500);
                game.debug.spriteInfo(sprites.yellowButterfly,20,132);
            }
              // this.game.debug.text("fps : "+game.time.fps || '--', 2, 100, "#00ff00");
        }
    }

    game.state.add('play', playState);
    game.state.start('play');

    // phaser destroy doesn't remove canvas element --> removed manually in app run
    scope.$on('$destroy', function() {
        game.destroy(); // Clean up the game when we leave this scope
        var canvas = document.querySelector('#map_canvas');
        canvas.parentNode.removeChild(canvas);
    });

    function optimize(camera,regionRange){
        var lowerCameraBoundary, upperCameraBoundary;
        // var i = 0;
        for(var key in regionRange){
            // i++;
            if (regionRange.hasOwnProperty(key)) {
                if(regionRange[key].lowerLimit > camera.y && regionRange[key].upperLimit < camera.y ){
                    if (camera.y < regionRange[key].upperTreshold && region.indexOf(key) < region.length - 1) {
                        if (groups.region[region[region.indexOf(key) + 1]].countLiving() == 0){
                            // log.debug('revive '+region[region.indexOf(key) + 1]);
                            groups.region[region[region.indexOf(key) + 1]].callAll('revive');
                        }

                    } else if (camera.y > regionRange[key].upperTreshold && region.indexOf(key) < region.length - 1){
                        if (groups.region[region[region.indexOf(key) + 1]].countLiving() != 0){
                            // log.debug('kill '+region[region.indexOf(key) + 1]);
                            groups.region[region[region.indexOf(key) + 1]].callAll('kill');
                        }
                    }

                    if ((camera.y + camera.height) > regionRange[key].lowerTreshold  && region.indexOf(key) > 0) {
                        if (groups.region[region[region.indexOf(key) - 1]].countLiving() == 0){
                            // log.debug('revive '+region[region.indexOf(key) - 1]);
                            groups.region[region[region.indexOf(key) - 1]].callAll('revive');
                        }
                    } else if ((camera.y + camera.height) < regionRange[key].lowerTreshold  && region.indexOf(key) > 0){
                        if (groups.region[region[region.indexOf(key) - 1]].countLiving() != 0){
                            // log.debug('kill '+region[region.indexOf(key) - 1]);
                            groups.region[region[region.indexOf(key) - 1]].callAll('kill');
                        }
                    }
                }

            }
        }
    }
};
