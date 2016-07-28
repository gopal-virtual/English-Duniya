window.createGame = function(scope, stateParams, lessons, audio, injector, log) {
    'use strict';

    var lessons = lessons;
    var game = new Phaser.Game("100", "100", Phaser.CANVAS, 'map_canvas', null, true, true, null);
    var gameSprites;
    var sprites = {};
    var temp = {};
    // var desertRegion, regionGroups.tundra, regionGroups.forest;
    var region = ["desert","tundra","forest","peru"];
    var gradeRegion = {
        "0" : 1,
        "1" : 2,
        "2" : 3,
        "3" : 4
    };
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
        // "region5" : 392,
    }
    var totalRegionHeight = 0;
    for (var key in regionHeight) {
        totalRegionHeight += regionHeight[key];
    }
    var svgPathHeight = 10000;
    var regionOffset = {};
    var tresholdOffset = -200;
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
    var totalLesson = lessons.length;
    var renderedRegion = [];
    for (var key in regionNodes) {
        if (totalLesson > regionNodes[key]) {
            totalLesson -= regionNodes[key];
            renderedRegion.push(key);
        }else{
            renderedRegion.push(key);
            break;
        }
    }
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


            $.get("img/assets/map_path.svg", function(data) {
                var x = [];
                var y = [];
                var ydiff = [];
                var renderRegionHeight = 0;
                for (var i = 0; i < renderedRegion.length; i++) {
                    renderRegionHeight += regionHeight[region[i]];
                }
                // log.warn("Region height", renderRegionHeight);
                // log.warn("SVG height", data.getElementById("mappathid").getTotalLength());
                var path = data.getElementById("mappathid");
                for (var i = path.getTotalLength() - 1; i >= 0 ; i-=75) {
                    var pathPoint = path.getPointAtLength(i);
                    // log.debug(parseInt(pathPoint.y) - (totalRegionHeight - renderRegionHeight),parseInt(pathPoint.x),svgPathHeight - parseInt(pathPoint.y));
                    if (svgPathHeight - pathPoint.y + 100 > renderRegionHeight) {
                        // log.warn("Should be cut here",pathPoint.y,svgPathHeight- pathPoint.y);
                        break;
                    }
                    x.push(parseInt(pathPoint.x));
                    y.push(parseInt(pathPoint.y) - (totalRegionHeight - renderRegionHeight));
                }

                points.x = x.reverse();
                points.y = y.reverse();
            });

            // for(var key in regionRange){
            //     regionRange[key].upperTreshold = regionRange[key].upperLimit + game.camera.height + tresholdOffset;
            //     regionRange[key].lowerTreshold = regionRange[key].lowerLimit - game.camera.height + tresholdOffset;
            // }

            // groups.regionBg["desert"] = game.add.group();
            // groups.regionBg["peru"] = game.add.group();
            // groups.regionBg["forest"] = game.add.group();
            // groups.regionBg["tundra"] = game.add.group();
            // groups.regionBg["region5"] = game.add.group();
            // groups.nonRegion["nodePath"] = game.add.group();
            // groups.region["desert"] = game.add.group();
            // groups.region["peru"] = game.add.group();
            // groups.region["forest"] = game.add.group();
            // groups.region["tundra"] = game.add.group();
            // groups.region["region5"] = game.add.group();
            
        },
        create: function() {
            var _this = this;
            var game_scale = game.world.width / 360;
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
            var star = [];
            var starClone = [];
            var star_x = [-12, 0, 12];
            var star_y = [-10, -15, -10];


            function addGroups(region){
                for (var i = 0; i < renderedRegion.length; i++) {
                    groups.regionBg[region[i]] = game.add.group();
                }
                groups.nonRegion["nodePath"] = game.add.group();
                for (var i = 0; i < renderedRegion.length; i++) {
                    groups.region[region[i]] = game.add.group();
                }
                groups.nonRegion["starClone"] = game.add.group();
                groups.nonRegion["nodes"] = game.add.group();
                groups.nonRegion["stars"] = game.add.group();

            }

            function renderWorld(region){
                var totalRegionHeight = 0;
                // var revRegion = region.reverse();
                var tempRegionHeight = 0;
                for (var i = region.length - 1; i >= 0; i--) {
                    log.debug(region[i]);
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


            // var tempPoints = {
            //     "x" : [],
            //     "y" : []
            // };
            // var gameSprites =  game.cache.getJSON('gamesprites');
            
            function renderNodePath(region,points){
                log.info("info rendering path ...")
                points.tempX = [];
                points.tempY = [];
                for (var i = 0, points_count = points.x.length; i < points_count; i++) {
                    // if (points.y[i]  - (60 - regionOffset[region[region.length - 1]]) < ) {}
                    // log.info(points);
                    points.tempX.push(points.x[i] * game_scale);
                    points.tempY.push(points.y[i] );
                }
                var increment = 1 / game.world.height;
                // Somewhere to draw to
                var bmd = game.add.bitmapData(game.width, game.world.height);
                for (var j = 0; j < 1; j += increment) {
                    
                // log.warn("Points",points);
                // log.warn("TempPoints",tempPoints);
                    var posx = game.math.catmullRomInterpolation(points.tempX, j);
                    var posy = game.math.catmullRomInterpolation(points.tempY, j);
                    // log.info("Posx",posx,"Posy",posy);
                    bmd.rect(posx, posy, 4, 4, '#219C7F');
                }
                groups.nonRegion.nodePath.create(0,0,bmd);
            }


            // nongroups.region.nodePath.callAll('kill');
            function renderSprites(region,gameSprites){
                for (var i = 0; i < gameSprites.length; i++) {
                    if (region.indexOf(gameSprites[i].region) == -1) {
                        // log.debug("breaking at",gameSprites[i].region)
                        continue;
                    }
                    // log.debug("Sprite",gameSprites[i].name)

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
                    // star[i].scale.setTo(0.2,0.2);
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

            // Place nodes
            function renderNodes(){
                for (var j = 0, i = lessons.length - 1, distance = 1 / (lessons.length); i >= 0; j += distance, i--) {
                    var currentLesson = lessons[i];
                    var locked = currentLesson.locked ? '-locked' : '';
                    var type = lessonType(currentLesson, i) == '' ? '' : '-' + lessonType(currentLesson, i);
                    var posx = game.math.catmullRomInterpolation(points.tempX, j);
                    var posy = game.math.catmullRomInterpolation(points.tempY, j);
                    var node = game.make.button(posx, posy, 'node' + type + locked);


                    !locked && lessons[i + 1] && lessons[i + 1].locked && game.add.tween(node.scale).to({ x: [1.2, 1], y: [1.2, 1] }, 700, Phaser.Easing.Back.Out, true, 1000).loop(true);
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
                        }(currentLesson, game, posy)
                    );
                    // icon.anchor.setTo(0.5,0.5);
                    // icon.scale.setTo(0.3,0.3);
                    node.anchor.setTo(0.5, 0.5);
                    // node.scale.setTo(1.8, 1.8);
                    // add stars
                    groups.nonRegion.nodes.add(node);

                    // log.debug("AIIII",i,currentLesson.stars);
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
                
                log.debug('node position ', node.currentLesson);
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

            function animateStar(){
                setTimeout(function(){
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
                    log.info("In star animation function, \nactivatedLessonKey: ",temp.activatedLessonKey," activeLessonKey: ",temp.activeLessonKey,"\nactivatedLesson: ",lessons[temp.activatedLessonKey],"\nactiveLesson: ",lessons[temp.activeLessonKey]);
                    log.warn("lessonTag: ",lessonTag[lessons[temp.activatedLessonKey].tag.toLowerCase()]>2?"+100":"-100")
                    var starCloneTween = [];
                    // log.debug(lessonTag[lessons[j].tag.toLowerCase()]*game.world.width);
                    for (var i = 0; i < lessons[temp.activatedLessonKey].stars; i++) {
                        // setTimeout(function(){
                            // log.debug($.merge([posx], star_x), $.merge([posy], star_y));

                            starClone[i] = groups.nonRegion.starClone.create(posx + star_x[i], posy + star_y[i], 'star_medium');
                            starClone[i].anchor.setTo(0.5, 0.5);
                            // log.debug("adding tween",starClone[i],"to",parseInt(game.camera.y));
                            // log.debug(starClone[i]);
                            starCloneTween[i] = {};

                            // var starClone = createStars(currentLesson.stars, $.merge([posx], star_x), $.merge([posy], star_y));
                            starCloneTween[i]["pos"] = game.add.tween(starClone[i]).to( { x: ((lessonTag[lessons[temp.activatedLessonKey].tag.toLowerCase()]-1)*game.width)/5, y: parseInt(game.camera.y)}, 1000, Phaser.Easing.Exponential.InOut);
                            starCloneTween[i]["scale"] = game.add.tween(starClone[i].scale).from( { x: 0.1, y: 0.1 }, 800, Phaser.Easing.Bounce.Out,false,i*800);
                            starCloneTween[i]["scalePos"] = game.add.tween(starClone[i]).to( { x: (lessonTag[lessons[temp.activatedLessonKey].tag.toLowerCase()]>2?"+100":"-100"), y: "-100" }, 800, Phaser.Easing.Cubic.Out,false,i*800);
                            starCloneTween[i]["rotate"] = game.add.tween(starClone[i]).to( { angle: 450 }, 3000, Phaser.Easing.Quadratic.Out);
                            starCloneTween[i].scale.chain(starCloneTween[i].pos);
                            starCloneTween[i].scale.start();
                            starCloneTween[i].scalePos.start();
                            starCloneTween[i].rotate.start();
                            // log.debug(starCloneTween[i]);
                            log.info("Star Clone "+i+":",starClone[i],"\nstarCloneTween "+i+":",starCloneTween[i]);
                            function playStarAudio() {
                                audio.play('star_hud');
                            }
                            function destroyStar() {
                                groups.nonRegion.starClone.callAll('kill');
                            }
                            starCloneTween[i].scale.onStart.add(playStarAudio,this);
                            starCloneTween[i].rotate.onComplete.add(destroyStar,this);
                    }
                },800);
            }
            
            function gameStart(){
                
                log.debug("new region array",renderedRegion);
                addGroups(renderedRegion);
                renderWorld(renderedRegion);
                renderRegion(renderedRegion);
                renderSprites(renderedRegion,gameSprites);
                renderNodePath(renderedRegion,points);
                renderParticles();
                renderNodes();
                if (stateParams.activatedLesson && temp.activeLessonKey == temp.activatedLessonKey + 1) {
                    log.debug("Activating star animation");
                    animateStar();
                    scope.$emit('animateStar');
                }

                scope.$emit('show_demo');
                _this.init();
                game.kineticScrolling.start();

            }

            setTimeout(function(){
                gameStart();

            },2000);

            

            log.info("Profile Grade",JSON.parse(localStorage.getItem("profile")).grade);

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
            for(var key in regionRange){
                // i++;
                if (regionRange.hasOwnProperty(key)) {
                    if(regionRange[key].lowerLimit > camera.y && regionRange[key].upperLimit < camera.y ){
                        if (camera.y < regionRange[key].upperTreshold && renderedRegion.indexOf(key) < renderedRegion.length - 1) {
                            if (groups.renderedRegion[renderedRegion[renderedRegion.indexOf(key) + 1]].countLiving() == 0){
                                log.debug('revive '+renderedRegion[renderedRegion.indexOf(key) + 1]);
                                groups.renderedRegion[renderedRegion[renderedRegion.indexOf(key) + 1]].callAll('revive');
                            }

                        } else if (camera.y > regionRange[key].upperTreshold && renderedRegion.indexOf(key) < renderedRegion.length - 1){
                            if (groups.renderedRegion[renderedRegion[renderedRegion.indexOf(key) + 1]].countLiving() != 0){
                                log.debug('kill '+renderedRegion[renderedRegion.indexOf(key) + 1]);
                                groups.renderedRegion[renderedRegion[renderedRegion.indexOf(key) + 1]].callAll('kill');
                            }
                        }

                        if ((camera.y + camera.height) > regionRange[key].lowerTreshold  && renderedRegion.indexOf(key) > 0) {
                            if (groups.renderedRegion[renderedRegion[renderedRegion.indexOf(key) - 1]].countLiving() == 0){
                                log.debug('revive '+renderedRegion[renderedRegion.indexOf(key) - 1]);
                                groups.renderedRegion[renderedRegion[renderedRegion.indexOf(key) - 1]].callAll('revive');
                            }
                        } else if ((camera.y + camera.height) < regionRange[key].lowerTreshold  && renderedRegion.indexOf(key) > 0){
                            if (groups.renderedRegion[renderedRegion[renderedRegion.indexOf(key) - 1]].countLiving() != 0){
                                log.debug('kill '+renderedRegion[renderedRegion.indexOf(key) - 1]);
                                groups.renderedRegion[renderedRegion[renderedRegion.indexOf(key) - 1]].callAll('kill');
                            }
                        }
                    }

                }
            }
        },

        update: function() {
            // log.debug("groups.region.desert",groups.region.desert);
            // this.dragMap();
            // log.log("CAMERA",game.camera.y);
            // this.optimize(game.camera,regionRange);


        },
        render: function() {
            function interactiveAnimate(){
                if (game.camera.y + 200 < regionOffset.tundra && game.camera.y + 200 > regionOffset.tundra - 360) {
                    // game.debug.spriteInfo(sprites.plantLeft, 20, 32);
                    if (temp.plantLeftX == undefined && temp.plantRightX ==undefined) {
                            temp["plantLeftX"] = sprites.plantLeft.x;
                            temp["plantRightX"] = sprites.plantRight.x;
                    }
                   sprites.plantLeft.x = temp.plantLeftX - (180 * (regionOffset.tundra - game.camera.y - 200)/360);
                   sprites.plantRight.x = temp.plantRightX + (180 * (regionOffset.tundra - game.camera.y - 200)/360);
                }

                if (game.camera.y + 500 < regionOffset.tundra && game.camera.y + 500 > regionOffset.forest + 300) {
                    // game.debug.spriteInfo(sprites.yellowButterfly,20,132);
                    if (temp.yellowButterflyY == undefined) {
                            temp["yellowButterflyY"] = sprites.yellowButterfly.y;
                    }
                    sprites.yellowButterfly.y = temp.yellowButterflyY - (regionOffset.tundra - game.camera.y - 500);
                }    
            }
            interactiveAnimate();           
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

    
};
