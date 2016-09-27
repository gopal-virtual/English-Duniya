window.createGame = function(scope, stateParams, lessons, audio, injector, log, lessonutils, selected_region, first_node_index, last_node_index) {
    'use strict';

    var game = new Phaser.Game("100", "100", Phaser.CANVAS, 'map_canvas', null, true, true, null);
    var gameSprites;
    var sprites = {};
    var temp = {};
    // var desertRegion, regionGroups.tundra, regionGroups.forest;
    var region = ["desert","tundra","forest","peru"];

    var groups = {
        "region" : {},
        "nonRegion" : {},
        "regionBg" : {},
    }
    var nonRegionGroups = {};
    var regionGroups = {};
    var regionBgGroups = {};
    var regionHeight = {
        "desert" : 2845,
        "tundra" : 2796,
        "forest" : 2856,
        "peru" : 1872,
        // "region5" : 392,
    }
    var totalRegionHeight = 0;
    for (var key in regionHeight) {
        totalRegionHeight += regionHeight[key];
    }
    var svgPathHeight = 10000;
    var regionOffset = {};
    var tresholdOffset = 200;
    var regionRange = {};
    var points = {
        "x" : [],
        "y" : []
    };
    var regionNodes = {
        "desert" : 27,
        "tundra" : 26,
        "forest" : 33,
        "peru" : 23
    }
    var regionPathOffset = {
        "desert" : 450,
        "tundra" : 450
    }
    var totalLesson = lessons.length;
    var renderedRegion = ["desert"];
    // var renderedRegion = [];
    // for (var key in regionNodes) {
    //     if (totalLesson > regionNodes[key]) {
    //         totalLesson -= regionNodes[key];
    //         renderedRegion.push(key);
    //     }else{
    //         renderedRegion.push(key);
    //         break;
    //     }
    // }
    log.debug("Tese are the lessons",lessons);
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
            this.load.image('star-confetti', 'img/assets/star_particle.png');
            this.load.image('lock-glow', 'img/assets/lock_glow.png');

            this.load.spritesheet('paper-confetti', 'img/assets/confetti_particle.png',16,21);
            this.load.spritesheet('lock-unlock', 'img/assets/locks.png', 184, 184);
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
            this.load.spritesheet('node-video', 'img/icons/video.png',65,68);
            this.load.spritesheet('node-practice', 'img/icons/practice.png', 66, 68);
            this.load.spritesheet('node-port', 'img/icons/icon-port.png',113,132);

            this.load.image('node', 'img/icons/icon-node.png');
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
            audio.play('background');

            // debug value
            this.game.time.advancedTiming = true;
        },
        create: function() {
            var _this = this;
            var game_scale = game.world.width / 360;
            gameSprites = [
            {
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
            },
            {
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
                "id":"cloudMiddle",
                "name" : "cloud_middle",
                "region" : "peru",
                "x" : 190,
                "y" : 794,
                "scale" : [game_scale,1],
            },{
                "id":"cloudLeft",
                "name" : "cloud_left",
                "region" : "peru",
                "x" : 80,
                "y" : 830,
                "scale" : [game_scale,1],
            },{
                "id":"cloudRightBehind",
                "name" : "cloud_right_behind",
                "region" : "peru",
                "x" : 290,
                "y" : 810,
                "scale" : [game_scale,1],
            },{
                "id":"cloudRight",
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
            var star = [];
            var starClone = [];
            var star_x = [-12, 0, 12];
            var star_y = [-10, -15, -10];


            function addGroups(region){

                for (var i = renderedRegion.length - 1; i >= 0; i--) {
                    groups.regionBg[region[i]] = game.add.group();
                }
                groups.nonRegion["nodePath"] = game.add.group();
                for (var i = renderedRegion.length - 1; i >= 0; i--) {
                    groups.region[region[i]] = game.add.group();
                }
                groups.nonRegion["nodes"] = game.add.group();
                groups.nonRegion["stars"] = game.add.group();
                groups.nonRegion["unlockAnim"] = game.add.group();
                groups.nonRegion["starClone"] = game.add.group();

            }

            function renderWorld(region){

                game.input.maxPointers = 1;
                var totalRegionHeight = 0;
                var tempRegionHeight = 0;
                for (var i = region.length - 1; i >= 0; i--) {
                    totalRegionHeight += regionHeight[region[i]];
                    regionRange[region[i]] = {};
                    regionRange[region[i]]["upperLimit"] = tempRegionHeight;
                    regionOffset[region[i]] = tempRegionHeight;
                    tempRegionHeight += regionHeight[region[i]];
                    regionRange[region[i]]["lowerLimit"] = tempRegionHeight;
                    regionRange[region[i]]["upperTreshold"] = regionRange[region[i]].upperLimit + game.camera.height + tresholdOffset;
                    regionRange[region[i]]["lowerTreshold"] = regionRange[region[i]].lowerLimit - game.camera.height - tresholdOffset;
                }
                game.world.setBounds(0, 0, game.width, totalRegionHeight);
                game.forceSingleUpdate = true;
            }

            function renderRegion(region){
                // for (var i = 0; i < region.length; i++) {
                //     region[i]
                // }

                for (var i = region.length - 1; i >= 0; i--) {

                    groups.regionBg[region[i]].position.set(0, 0 + regionOffset[region[i]]);
                    groups.region[region[i]].position.set(0, 0 + regionOffset[region[i]]);
                    var background = groups.regionBg[region[i]].create(0, 0, region[i]);
                    // groups.region[key].add(regionBgGroups[key]);
                    background.scale.setTo(game_scale, 1);
                }

            }

            function fetchMapPath (region,points){

                var fetchMapRequest = $.get("img/assets_svg/"+region[0]+"-path.svg", function(data) {
                    var x = [];
                    var y = [];
                    // var ydiff = [];
                    // var renderRegionHeight = 0;
                    // for (var i = 0; i < renderedRegion.length; i++) {
                    //     renderRegionHeight += regionHeight[region[i]];
                    // }
                    // //
                    // //
                    var path = data.getElementById("mappathid");
                    for (var i = path.getTotalLength() - 1; i >= 0 ; i-=75) {
                        var pathPoint = path.getPointAtLength(i);
                        //
                        // if (svgPathHeight - pathPoint.y + 100 > renderRegionHeight) {
                        //     //
                        //     break;
                        // }
                        x.push(parseInt(pathPoint.x));
                        y.push(parseInt(pathPoint.y));
                    }

                    points.x = x.reverse();
                    points.y = y.reverse();
                log.debug("Points",points.x,points.y);
                });
                return fetchMapRequest;

            }


            // var tempPoints = {
            //     "x" : [],
            //     "y" : []
            // };
            // var gameSprites =  game.cache.getJSON('gamesprites');

            function renderNodePath(region,points){

                points.tempX = [];
                points.tempY = [];
                for (var i = 0, points_count = points.x.length; i < points_count; i++) {
                    // if (points.y[i]  - (60 - regionOffset[region[region.length - 1]]) < ) {}
                    
                    points.tempX.push(points.x[i]);
                    points.tempY.push(points.y[i] + regionPathOffset[region]);
                }
                var increment = 1 / game.world.height;
                // Somewhere to draw to
                var bmd = game.add.bitmapData(game.width, game.world.height);
                for (var j = 0; j < 1; j += increment) {
                //
                    var posx = game.math.catmullRomInterpolation(points.tempX, j);
                    var posy = game.math.catmullRomInterpolation(points.tempY, j);
                    //
                    bmd.rect(posx, posy, 4, 4, '#FFFFFF');
                    log.debug("pos",posx,posy);
                }
                groups.nonRegion.nodePath.create(0,0,bmd);
            }


            // nongroups.region.nodePath.callAll('kill');
            function renderSprites(region,gameSprites){

                for (var i = 0; i < gameSprites.length; i++) {
                    if (region.indexOf(gameSprites[i].region) == -1) {
                        //
                        continue;
                    }
                    //

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
            }


            // placing lesson node
            // 1. lesson node count
            // 2. Node should follow a particular path
            // path

            // sand particles
            function renderParticles(){

                for (var i = 0; i < 100; i++) {
                    var s = game.add.sprite(game.world.randomX, game.rnd.between(regionOffset.desert, game.world.height), 'particle' + game.rnd.between(1, 3));
                    s.scale.setTo(game.rnd.between(1, 2) / 20);
                    game.physics.arcade.enable(s);
                    s.body.velocity.x = game.rnd.between(-200, -550);
                    s.body.velocity.y = game.rnd.between(50, 70);
                    s.autoCull = true;
                    s.checkWorldBounds = true;
                    s.events.onOutOfBounds.add(_this.resetSprite, _this);
                }
                // snow particles
                for (var i = 0; i < 100; i++) {
                    var s = game.add.sprite(game.world.randomX, game.rnd.between(regionOffset.tundra, regionOffset.desert - 200), 'snow' + game.rnd.between(1, 2));
                    s.scale.setTo(game.rnd.between(1, 2) / 10);
                    game.physics.arcade.enable(s);
                    s.body.velocity.x = game.rnd.between(-50, -200);
                    s.body.velocity.y = game.rnd.between(50, 70);
                    s.autoCull = true;
                    s.checkWorldBounds = true;
                    s.events.onOutOfBounds.add(_this.resetSnowSprite, _this);
                }
            }

            // var stars = this.game.add.group();
            function createStars(count, x, y) {
                for (var i = 0; i < count; i++) {
                    star[i] = groups.nonRegion.stars.create(x[0] + x[i + 1], y[0] + y[i + 1], 'star');
                    star[i].anchor.setTo(0.5, 0.5);
                }
                return star;
            }

            function lessonType(lesson, test) {
                if (!lesson.locked) {
                    return lesson.tag.toLowerCase() != 'no tag' ? lesson.tag.toLowerCase() : '';
                } else {
                    return ''
                }
            };



            function renderNodesByOne(){
                log.debug('node index', last_node_index, first_node_index)
                points.tempX = points.tempX.reverse();
                points.tempY = points.tempY.reverse();


                // port node
                var port_back = game.add.button(game.world.centerX + 50, game.world.height - 200, 'node-port', function(){
                    if((first_node_index - 5) > 0){
                        var end_index = first_node_index - 1;
                        var start_index = end_index - 5;
                        scope.$emit('prevRegion', start_index, end_index);
                    }
                }, this, 0,0,1,0);
                var port_forward = game.add.button(game.world.centerX + 50, game.world.height - 500, 'node-port', function(){
                    if(last_node_index + 1 < lessons.length){
                        var start_index = last_node_index + 1;
                        var end_index = start_index + 5;
                        scope.$emit('nextRegion', start_index, end_index);
                    }
                }, this, 0,0,1,0);

                port_back.scale.setTo(0.5)
                port_forward.scale.setTo(0.5)
                // end : port node

                for (var j = 0, i = last_node_index, distance = 1 / (lessons.length); i >= first_node_index; j += distance, i--) {
                    log.debug("LESSONS",lessons[i])
                    var currentLesson = lessons[i].node;
                    var locked = lessons[i].locked ? '-locked' : '';
                    var type = lessonType(currentLesson, i) == '' ? '' : '-' + lessonType(currentLesson, i);
                    var posx = game.math.catmullRomInterpolation(points.tempX, j);
                    var posy = game.math.catmullRomInterpolation(points.tempY, j);
                    log.debug('coordinate',posx,posy)
                    // node.scale.setTo(0.5)
                    if(!lessons[i].locked){
                        var node = game.make.button(posx, posy, 'node' + '-' + lessonutils.resourceType(lessons[i]), false, this, 0,0,1,0);
                        log.debug('current lesson' ,currentLesson);

                        !locked && lessons[i + 1] && lessons[i + 1].locked && localStorage.setItem('region',posy);

                        if(!locked && lessons[i + 1] && lessons[i + 1].locked){
                            temp["activeLessonKey"] = i;
                            temp["activeLessonPosY"] = posy;
                            temp["activeLessonPosX"] = posx;
                            temp["nodeWobbleTween"] = game.add.tween(node.scale).to({ x: [1.2, 1], y: [1.2, 1] }, 700, Phaser.Easing.Back.Out, true, 1000).loop(true);
                        }

                        if (stateParams.activatedLesson && stateParams.activatedLesson.node.id == currentLesson.id) {
                            temp["lessonFromQuizKey"] = i;
                        }

                        node.inputEnabled = true;
                        node.currentLesson = currentLesson;
                        node.type = lessonType(currentLesson, i);
                        node.events.onInputUp.add(
                            function(currentLesson, game, posy, i, temp, currentObject) {
                                return function() {
                                    var displacement = game.kineticScrolling.velocityY > -30 && game.kineticScrolling.velocityY < 30;
                                    if (!currentLesson.locked && displacement) {
                                        localStorage.setItem('currentPosition', (posy - game.height / 2));
                                        var currentPosition = {
                                            "x": game.input._x,
                                            "y": game.input._y,
                                        }


                                        var animateStarFlag = {
                                            isCurrentNode : temp.activeLessonKey==i,
                                            clickedNodeStar : lessons[i].stars
                                        }
                                        localStorage.setItem("animateStarFlag",JSON.stringify(animateStarFlag));
                                        scope.$emit('openNode', currentObject, currentPosition);
                                    } else if (currentLesson.locked && displacement) {
                                        audio.play('locked');
                                    } else {}
                                }
                            }(currentLesson, game, posy, i, temp, lessons[i])
                        );
                        // icon.anchor.setTo(0.5,0.5);
                        // icon.scale.setTo(0.3,0.3);
                        node.anchor.setTo(0.5, 0.5);
                        // node.scale.setTo(1.8, 1.8);
                        // add stars
                        groups.nonRegion.nodes.add(node);

                        //
                        if (!locked && currentLesson.stars >= 0) {
                            // var stars = game.add.group();
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
                }

                //
                // localStorage.setItem('demo_node', JSON.stringify({
                //         x: node.x - node.width / 2,
                //         y: game.height - (game.world.height - node.y) - node.height / 2,
                //         width: node.width,
                //         height: node.height,
                //         node: node.currentLesson,
                //         type: node.type
                //     })
                // );
            }


            // Place nodes
            function renderNodes(){

                for (var j = 0, i = lessons.length - 1, distance = 1 / (lessons.length); i >= 0; j += distance, i--) {

                    var currentLesson = lessons[i];
                    var locked = currentLesson.locked ? '-locked' : '';
                    var type = lessonType(currentLesson, i) == '' ? '' : '-' + lessonType(currentLesson, i);
                    var posx = game.math.catmullRomInterpolation(points.tempX, j);
                    var posy = game.math.catmullRomInterpolation(points.tempY, j);
                    var node = game.make.button(posx, posy, 'node' + type + locked);


                    !locked && lessons[i + 1] && lessons[i + 1].locked && localStorage.setItem('region',posy);

                    if(!locked && lessons[i + 1] && lessons[i + 1].locked){
                        temp["activeLessonKey"] = i;
                        temp["activeLessonPosY"] = posy;
                        temp["activeLessonPosX"] = posx;
                        temp["nodeWobbleTween"] = game.add.tween(node.scale).to({ x: [1.2, 1], y: [1.2, 1] }, 700, Phaser.Easing.Back.Out, true, 1000).loop(true);
                    }

                    if (stateParams.activatedLesson && stateParams.activatedLesson.node.id == currentLesson.id) {
                        temp["lessonFromQuizKey"] = i;
                    }

                    node.inputEnabled = true;
                    node.currentLesson = currentLesson;
                    node.type = lessonType(currentLesson, i);
                    node.events.onInputUp.add(
                        function(currentLesson, game, posy, i, temp) {
                            return function() {
                                var displacement = game.kineticScrolling.velocityY > -30 && game.kineticScrolling.velocityY < 30;
                                if (!currentLesson.locked && displacement) {
                                    localStorage.setItem('currentPosition', (posy - game.height / 2));
                                    var currentPosition = {
                                        "x": game.input._x,
                                        "y": game.input._y,
                                    }


                                    var animateStarFlag = {
                                        isCurrentNode : temp.activeLessonKey==i,
                                        clickedNodeStar : lessons[i].stars
                                    }
                                    localStorage.setItem("animateStarFlag",JSON.stringify(animateStarFlag));
                                    scope.$emit('openNode', currentLesson, currentPosition);
                                } else if (currentLesson.locked && displacement) {
                                    audio.play('locked');
                                } else {}
                            }
                        }(currentLesson, game, posy, i, temp)
                    );
                    // icon.anchor.setTo(0.5,0.5);
                    // icon.scale.setTo(0.3,0.3);
                    node.anchor.setTo(0.5, 0.5);
                    // node.scale.setTo(1.8, 1.8);
                    // add stars
                    groups.nonRegion.nodes.add(node);

                    //
                    if (!locked && currentLesson.stars >= 0) {
                        // var stars = game.add.group();
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

                //
                localStorage.setItem('demo_node', JSON.stringify({
                        x: node.x - node.width / 2,
                        y: game.height - (game.world.height - node.y) - node.height / 2,
                        width: node.width,
                        height: node.height,
                        node: node.currentLesson,
                        type: node.type
                    })
                );
            }

            function animateStar(lessonKey){
                // var d = $q.defer()

                var promise = new Promise(function(resolve,reject){
                    // setTimeout(function(){

                        //
                        //

                        //
                        var lessonTag =  {
                            "vocabulary" : 1,
                            "reading" : 2,
                            "grammar" : 3,
                            "listening" : 4
                        }
                        var j =  lessons.length - lessonKey - 1;
                        var posx = _this.math.catmullRomInterpolation(points.x, j/lessons.length);
                        var posy = _this.math.catmullRomInterpolation(points.y, j/lessons.length);
                        // log.debug("In star animation function, \nlessonFromQuizKey: ",lessonKey," activeLessonKey: ",temp.activeLessonKey,"\nactivatedLesson: ",lessons[lessonKey],"\nactiveLesson: ",lessons[temp.activeLessonKey]);
                        var starCloneTween = [];
                        for (var i = 0; i < lessons[lessonKey].stars; i++) {

                                starClone[i] = groups.nonRegion.starClone.create((posx+ star_x[i])*game_scale, posy + star_y[i], 'star_medium');

                                starClone[i].anchor.setTo(0.5, 0.5);
                                starCloneTween[i] = {};

                                starCloneTween[i]["pos"] = game.add.tween(starClone[i]).to( { x: ((lessonTag[lessons[lessonKey].tag.toLowerCase()]-1)*game.width)/4, y: parseInt(game.camera.y)}, 1000, Phaser.Easing.Exponential.InOut);
                                starCloneTween[i]["scale"] = game.add.tween(starClone[i].scale).from( { x: 0, y: 0 }, 800, Phaser.Easing.Bounce.Out,false,i*800);
                                starCloneTween[i]["scalePos"] = game.add.tween(starClone[i]).to( { x: (lessonTag[lessons[lessonKey].tag.toLowerCase()]>2?"+100":"-100"), y: "-100" }, 800, Phaser.Easing.Cubic.Out,false,i*800);
                                starCloneTween[i]["rotate"] = game.add.tween(starClone[i]).to( { angle: 450 }, 3000, Phaser.Easing.Quadratic.Out);
                                starCloneTween[i].scale.chain(starCloneTween[i].pos);
                                starCloneTween[i].scale.start();
                                starCloneTween[i].scalePos.start();
                                starCloneTween[i].rotate.start();
                                // log.debug("Star Clone "+i+":",starClone[i],"\nstarCloneTween "+i+":",starCloneTween[i]);
                                function playStarAudio() {
                                    audio.play('star_hud');
                                }
                                if (i == lessons[lessonKey].stars - 1) {
                                    starCloneTween[i].rotate.onComplete.add(destroyStar,this);
                                    function destroyStar() {
                                        groups.nonRegion.starClone.callAll('kill');
                                        //
                                        //
                                        //
                                            //
                                            resolve(true);
                                    }
                                }
                                starCloneTween[i].scale.onStart.add(playStarAudio,this);

                        }
                        // resolve(true)
                    // },800);
                });
                return promise;

            }

            function killUselessRegions(region) {

                for (var i = region.length - 1; i >= 0; i--) {
                    //
                    //
                    //
                    if(regionRange[region[i]].lowerLimit > game.camera.y && regionRange[region[i]].upperLimit <= game.camera.y ){
                        //
                        continue;
                    }
                    //
                    //
                    groups.regionBg[region[i]].callAll('kill');
                    groups.region[region[i]].callAll('kill');

                }
            }

            // function wiggle(aProgress: number, aPeriod1: number, aPeriod2: number): number {
            //     var current1: number = aProgress * Math.PI * 2 * aPeriod1;
            //     var current2: number = aProgress * (Math.PI * 2 * aPeriod2 + Math.PI / 2);
            //     return Math.sin(current1) * Math.cos(current2);
            // }

            function animateUnlock(lockedNode) {

                //
                //
                // var autoScrollFlag = true;

                var randomX = 100;
                var randomY = 100;
                var unlockAnimTween = {};
                var lockVibrateArray = {
                    "x" : [],
                    "y" : []
                }
                for (var i = 0; i < 100; i++) {
                    randomY = game.rnd.between(-1, 1);
                    randomX = game.rnd.between(-1, 1);
                    lockVibrateArray.x[i] = temp.activeLessonPosX + randomX;
                    lockVibrateArray.y[i] = temp.activeLessonPosY + randomY;
                }
                //
                // confetti.width = 150;
                // confetti.height = 150;
                // unlockAnimTween["scaleLock"] = game.add.tween(lockedNode.lock.scale).from({x:0.2, y: 0.2},1000,Phaser.Easing.Linear.None,true);
                unlockAnimTween["shakeLock"] = game.add.tween(lockedNode.lock).to({ x: lockVibrateArray.x, y: lockVibrateArray.y}, 1000, Phaser.Easing.Linear.None,true);
                unlockAnimTween["scaleLock2"] = game.add.tween(lockedNode.lock.scale).to({x:0.4, y: 0.4},1000,Phaser.Easing.Bounce.Out);
                unlockAnimTween["lockGlowScale"] = game.add.tween(lockedNode.glow.scale).to({x:1,y:1},400,Phaser.Easing.Exponential.Out,true,1000);
                // unlockAnimTween["lockGlow"] = game.add.tween(lockedNode.glow.scale).to({x:0.8, y:0.8},500,Phaser.Easing.Cubic.InOut,false,0,1,true);
                unlockAnimTween["hideOverlay"] = game.add.tween(lockedNode.overlay).to({alpha: 0},400,Phaser.Easing.Exponential.In,true,1800);
                unlockAnimTween["shrinkLock"] = game.add.tween(lockedNode.lock.scale).to({x:0,y:0},100,Phaser.Easing.Exponential.In);
                unlockAnimTween["hideGlow"] = game.add.tween(lockedNode.glow).to({alpha: 0},800,Phaser.Easing.Exponential.In);
                unlockAnimTween.shakeLock.chain(unlockAnimTween.scaleLock2);
                unlockAnimTween.lockGlowScale.chain(unlockAnimTween.hideGlow, unlockAnimTween.shrinkLock, unlockAnimTween.hideOverlay);
                // unlockAnimTween.lockGlow.chain(unlockAnimTween.shrinkGlow);

                unlockAnimTween.shakeLock.onComplete.add(unlockIt,this);
                unlockAnimTween.shrinkLock.onComplete.add(unlockComplete,this);
                function unlockIt(){
                    lockedNode.lock.animations.add("unlock");
                    lockedNode.lock.animations.play("unlock",30);
                    lockedNode.confetti.start(true,5000,null,20);
                }

                function unlockComplete() {
                    temp.nodeWobbleTween.resume();
                    setTimeout(function(){
                        groups.nonRegion.unlockAnim.callAll("kill");
                    },3000);
                }
                // unlockAnimTween.shake.onRepeat.add(vibrateValue, this);
            }

            function hideActiveNode(lockedNode){

                temp.nodeWobbleTween.pause();
                lockedNode["overlay"] = groups.nonRegion.unlockAnim.create(temp.activeLessonPosX,temp.activeLessonPosY,'node');
                lockedNode["glow"] = groups.nonRegion.unlockAnim.create(temp.activeLessonPosX,temp.activeLessonPosY,'lock-glow');
                lockedNode["confetti"] = game.add.emitter(temp.activeLessonPosX,temp.activeLessonPosY,50);
                lockedNode["lock"] = groups.nonRegion.unlockAnim.create(temp.activeLessonPosX,temp.activeLessonPosY,'lock-unlock');
                lockedNode.overlay.anchor.setTo(0.5,0.5);
                lockedNode.lock.anchor.setTo(0.5,0.5);
                lockedNode.lock.scale.setTo(0.2,0.2);
                lockedNode.glow.anchor.setTo(0.5,0.5);
                lockedNode.glow.scale.setTo(0,0);
                lockedNode.confetti.makeParticles('paper-confetti',[0,1,2,3,4],50);
                lockedNode.confetti.minParticleSpeed.set(-800, -800);
                lockedNode.confetti.maxParticleSpeed.set(800, 800);
                // confetti.gravity = 0;
                groups.nonRegion.unlockAnim.add(lockedNode.confetti);
                // lockedNode.glow.scale.setTo(0,0);
                // unlockAnimTween = {};
            }

            function newNodeUnlock() {
                var lockedNode = {};
                hideActiveNode(lockedNode);
                animateStar(temp.lessonFromQuizKey).then(function(){
                    if (game.camera.y+game.height/2 > temp.activeLessonPosY) {
                        scrollTo(temp.activeLessonPosY);
                    }
                    animateUnlock(lockedNode);
                });
            }

            function scrollTo(limitY){
                //
                //
                // var intervalScroll = setInterval(function(){

                game.add.tween(game.camera).to({y:"-200"},800,Phaser.Easing.Quadratic.InOut,true);
                    // }
                //     //
                //     game.camera.y-=3;
                // });
                // function clearScroll() {
                //     clearInterval(intervalScroll);
                // }
            }

            function gameStart(){



                addGroups(renderedRegion);
                renderWorld(renderedRegion);
                renderRegion(renderedRegion);
                // renderSprites(renderedRegion,gameSprites);
                // renderParticles();
                var fetchMapRequest = fetchMapPath(renderedRegion,points);
                fetchMapRequest.then(function(){
                    scope.$emit('removeLoader');
                    renderNodePath(renderedRegion,points);
                    renderNodesByOne();





                    scope.$emit('show_demo');
                    _this.init();
                    killUselessRegions(renderedRegion);
                    game.kineticScrolling.start();
                    var lessonFromQuizStars = typeof(temp.lessonFromQuizKey)!="undefined"?lessons[temp.lessonFromQuizKey].stars:false;
                    var animateStarFlag = JSON.parse(localStorage.getItem("animateStarFlag"));
                    if (animateStarFlag) {



                        if (animateStarFlag.isCurrentNode && lessonFromQuizStars) {
                            //
                            scope.$emit('animateStar');
                            setTimeout(function(){
                                newNodeUnlock();
                            },800)
                        }

                        if(lessonFromQuizStars > animateStarFlag.clickedNodeStar && lessonFromQuizStars){
                            scope.$emit('animateStar');
                            setTimeout(function(){
                                animateStar(temp.lessonFromQuizKey);
                            },800)
                        }
                    }else{

                    }
                    // .then(function(){
                    // });
                    // animateUnlock();
                    // $ionicLoading.hide();
                },function(error){
                    log.error("Failed to fetchMapPath",error);
                })




            }

            gameStart();





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
            this.game.camera.y = localStorage.getItem('currentPosition') ? parseInt(localStorage.getItem('currentPosition')) : parseInt(((~~this.world.height / this.game.height) - 1) * this.game.height);

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

        optimize: function(camera,regionRange){
            var lowerCameraBoundary, upperCameraBoundary;
            // var i = 0;
            for (var i = 0; i < renderedRegion.length; i++) {
                if(regionRange[renderedRegion[i]].lowerLimit > camera.y && regionRange[renderedRegion[i]].upperLimit < camera.y ){
                    if (camera.y < regionRange[renderedRegion[i]].upperTreshold && i < renderedRegion.length - 1) {
                        if (groups.region[renderedRegion[i+1]].countLiving() == 0){

                            groups.regionBg[renderedRegion[i + 1]].callAll('revive');
                            groups.region[renderedRegion[i + 1]].callAll('revive');
                        }

                    } else if (camera.y > regionRange[renderedRegion[i]].upperTreshold && i < renderedRegion.length - 1){
                        if (groups.region[renderedRegion[i + 1]].countLiving() != 0){

                            groups.regionBg[renderedRegion[i + 1]].callAll('kill');
                            groups.region[renderedRegion[i + 1]].callAll('kill');
                        }
                    }

                    if ((camera.y + camera.height) > regionRange[renderedRegion[i]].lowerTreshold  && i > 0) {
                        if (groups.region[renderedRegion[i - 1]].countLiving() == 0){

                            groups.regionBg[renderedRegion[i - 1]].callAll('revive');
                            groups.region[renderedRegion[i - 1]].callAll('revive');
                        }
                    } else if ((camera.y + camera.height) < regionRange[renderedRegion[i]].lowerTreshold  && i > 0){
                        if (groups.region[renderedRegion[i - 1]].countLiving() != 0){

                            groups.regionBg[renderedRegion[i - 1]].callAll('kill');
                            groups.region[renderedRegion[i - 1]].callAll('kill');
                        }
                    }
                }

            }

        },
        interactiveAnimate : function() {
            if (game.camera.y + 200 < regionOffset.tundra && game.camera.y + 200 > regionOffset.tundra - 360) {
                // game.debug.spriteInfo(sprites.plantLeft, 20, 32);
                if (temp.plantLeftX == undefined && temp.plantRightX ==undefined) {
                        temp["plantLeftX"] = sprites.plantLeft.x;
                        temp["plantRightX"] = sprites.plantRight.x;
                }
               sprites.plantLeft.x = temp.plantLeftX - (180 * (regionOffset.tundra - game.camera.y - 200)/360);
               sprites.plantRight.x = temp.plantRightX + (180 * (regionOffset.tundra - game.camera.y - 200)/360);
            }

            if (game.camera.y + 100 < regionOffset.peru + 800 && game.camera.y + 100 > regionOffset.peru + 800 - 360) {
                // game.debug.spriteInfo(sprites.cloudLeft, 20, 32);
                var checkTempClouds = temp.cloudLeft==undefined && temp.cloudMiddle==undefined && temp.cloudRight==undefined && temp.cloudRightBehin==undefined;
                if (checkTempClouds) {
                        temp["cloudLeft"] = {
                            "x" : sprites.cloudLeft.x,
                            "y" : sprites.cloudLeft.y
                        };
                        temp["cloudRight"] = {
                            "x" : sprites.cloudRight.x,
                            "y" : sprites.cloudRight.y
                        };
                        temp["cloudMiddle"] = {
                            "x" : sprites.cloudMiddle.x,
                            "y" : sprites.cloudMiddle.y
                        };
                        temp["cloudRightBehind"] = {
                            "x" : sprites.cloudRightBehind.x,
                            "y" : sprites.cloudRightBehind.y
                        };
                }
                //
               sprites.cloudLeft.x = temp.cloudLeft.x + ((regionOffset.peru + 800 - game.camera.y - 100)/8);
               sprites.cloudRight.x = temp.cloudRight.x + ((regionOffset.peru + 800 - game.camera.y - 100)/8);
               sprites.cloudMiddle.x = temp.cloudMiddle.x - ((regionOffset.peru + 800 - game.camera.y - 100)/8);
               sprites.cloudRightBehind.x = temp.cloudRightBehind.x - ((regionOffset.peru + 800 - game.camera.y - 100)/8);
               sprites.cloudLeft.y = temp.cloudLeft.y + ((regionOffset.peru + 800 - game.camera.y - 100)/8);
               sprites.cloudRight.y = temp.cloudRight.y + ((regionOffset.peru + 800 - game.camera.y - 100)/8);
               sprites.cloudMiddle.y = temp.cloudMiddle.y + ((regionOffset.peru + 800 - game.camera.y - 100)/8);
               sprites.cloudRightBehind.y = temp.cloudRightBehind.y + ((regionOffset.peru + 800 - game.camera.y - 100)/8);
               sprites.cloudLeft.alpha = 1 - (regionOffset.peru + 800 - game.camera.y - 100)/720;
               sprites.cloudRight.alpha = 1 - (regionOffset.peru + 800 - game.camera.y - 100)/720;
               sprites.cloudMiddle.alpha = 1 - (regionOffset.peru + 800 - game.camera.y - 100)/720;
               sprites.cloudRightBehind.alpha = 1 - (regionOffset.peru + 800 - game.camera.y - 100)/720;

            }

            if (game.camera.y + 500 < regionOffset.tundra && game.camera.y + 500 > regionOffset.forest + 300) {
                // game.debug.spriteInfo(sprites.yellowButterfly,20,132);
                if (temp.yellowButterflyY == undefined) {
                        temp["yellowButterflyY"] = sprites.yellowButterfly.y;
                }
                sprites.yellowButterfly.y = temp.yellowButterflyY - (regionOffset.tundra - game.camera.y - 500);
            }
        },

        update: function() {
            //
            // this.dragMap();
            // log.log("CAMERA",game.camera.y);
            this.optimize(game.camera,regionRange);


        },
        render: function() {
            // game.debug.pointer(game.input.mousePointer);
            // game.debug.pointer(game.input.pointer1);
            // game.debug.pointer(game.input.pointer2);
            // game.debug.pointer(game.input.pointer3);
            // game.debug.pointer(game.input.pointer4);
            // game.debug.pointer(game.input.pointer5);
            // game.debug.pointer(game.input.pointer6);

            // function interactiveAnimate(){

            // }
            // this.interactiveAnimate();
            // game.camera.y-= 4;

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
    scope.$on('reloadMap',function(){

      // game.destroy();
      // location.reload();
    })


};
