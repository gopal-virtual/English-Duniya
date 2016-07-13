window.createGame = function(scope, lessons, audio, injector, log) {
    'use strict';

    var lessons = lessons;
    var game = new Phaser.Game("100", "100", Phaser.CANVAS, 'map_canvas', null, true, true, null);

    // var desertRegion, regionGroups.tundra, regionGroups.forest;
    var region = ["desert","tundra","forest","peru"];
    var regionGroups = {};
    var regionHeight = {
        "desert" : 2420,
        "tundra" : 2796,
        "forest" : 2942,
        "peru" : 1872,
    }
    var regionOffset = {
        "desert" : regionHeight.tundra + regionHeight.forest + regionHeight.peru,
        "tundra" : regionHeight.forest + regionHeight.peru,
        "forest" : regionHeight.peru,
        "peru" : 0,
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
            upperLimit : 0,
            lowerLimit : regionOffset.forest,
        },
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

            // this.load.image('tent', 'img/assets/tent.png');
            this.load.image('tent_green', 'img/assets/tent_green.png');
            this.load.image('two_stone', 'img/assets/two_stone.png');
            this.load.image('one_stone', 'img/assets/one_stone.png');
            this.load.image('particle1', 'img/assets/particle1.png');
            this.load.image('particle2', 'img/assets/particle2.png');
            this.load.image('particle3', 'img/assets/particle3.png');
            this.load.image('snow1', 'img/assets/snow.png');
            this.load.image('snow2', 'img/assets/snow1.png');
            this.load.image('snow_cactus', 'img/assets/snow_cactus.png');

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

            this.load.image('node', 'img/icons/node.png');
            this.load.image('node-litmus', 'img/icons/icon-litmus-node.png');
            this.load.image('node-vocabulary', 'img/icons/icon-vocabulary-node.png');
            this.load.image('node-listening', 'img/icons/icon-listening-node.png');
            this.load.image('node-grammar', 'img/icons/icon-grammar-node.png');
            this.load.image('node-reading', 'img/icons/icon-reading-node.png');
            this.load.image('node-locked', 'img/icons/icon-node-locked.png');
            this.load.image('star', 'img/icons/icon-star-small.png');
            this.load.image('nostar', 'img/icons/icon-nostar.png');
            // debug value
            this.game.time.advancedTiming = true;
            for(var key in regionRange){
                regionRange[key].upperTreshold = regionRange[key].upperLimit + game.camera.height + tresholdOffset;
                regionRange[key].lowerTreshold = regionRange[key].lowerLimit - game.camera.height + tresholdOffset;
            }

            regionGroups["desert"] = game.add.group();
            regionGroups["tundra"] = game.add.group();
            regionGroups["forest"] = game.add.group();
            regionGroups["peru"] = game.add.group();
        },
        create: function() {
            
            // regionGroups.desert = this.game.add.group();
            // regionGroups.tundra = this.game.add.group();
            // regionGroups.forest = this.game.add.group();

            // this.desert_offset = regionHeight['tundra'] + regionHeight['forest'];
            // this.tundra_offest = regionHeight['forest'];

            regionGroups.desert.position.set(0,0 + regionOffset.desert);
            regionGroups.tundra.position.set(0,0 + regionOffset.tundra);
            regionGroups.forest.position.set(0,0 + regionOffset.forest);
            regionGroups.peru.position.set(0,0 + regionOffset.peru);
            // this.iceregion_height = 4533 - desert_height - tundra_height;
            // this.regionGroups.forest_height = 300;
            

            // var lilyPads; // group
            // function create() {   
            //     lilyPads = game.add.group();   // create in a for loop, whatever   
            //     var lily = lilyPads.create(Math.random() * game.width, Math.random() * game.height, 'lilypad', 0);   
            //     lily.events.onOutOfBounds.add(lilyPadOOB, this);   
            //     lily.checkWorldBounds = true;
            // }// sprite out of boundsfunction 
            
            // lilyPadOOB(lily) {   
            //     lily.kill();
            // }// called when you need to spawn a recycled / new sprite
            // function spawnLilyPad() {   
            //     var lily = lilyPads.getFirstDead();   
            //     if (!lily) {      
            //         lily = lilyPads.create(0, 0, 'lilypad');      
            //         lily.events.onOutOfBounds.add(lilyPadOOB, this);      
            //         lily.checkWorldBounds = true;   
            //     }   lily.reset(x, y);   
            //     lily.animations.frame = 0;
            // }


            
            var desert = regionGroups.desert.create(0, 0, 'desert');
            var tundra = regionGroups.tundra.create(-1, 0, 'tundra');
            var forest = regionGroups.forest.create(0, 0, 'forest');
            var peru = regionGroups.peru.create(0,0, 'peru');
            // regionGroups.desert.events.onOutOfBounds.add(logy);
            function logy(){
                log.debug("Out");
            }
            // regionGroups.desert.setAll('checkWorldBounds', true);
            // regionGroups.tundra.setAll('checkWorldBounds', true);
            // regionGroups.desert.setAll('outOfBoundsKill', true);
            // regionGroups.tundra.setAll('outOfBoundsKill', true);
            // var forest = this.game.add.sprite(-1, 0, 'forest');

            var game_scale = game.world.width / desert.width;

            var points = {
                'x': [181,170,205,225,180,109,77,121,153,132,90,118,188,255,299,227,147,113,148,183,200,206,217,226,228,229,209,172,157,160,159,139,137,165,221,278,281,239,187,148,164,215,276,317,287,233,207,232,205,188,190,211,225,182,154,175,214,218,168,119,154,233,272,201,133,129,177,240,292,288,232,195,179,180,180,180,180,180],
                'y': [86,163,235,311,373,409,476,541,614,689,757,825,864,908,970,996,1004,1064,1136,1207,1285,1365,1444,1524,1604,1684,1761,1831,1909,1989,2069,2146,2226,2300,2357,2412,2489,2557,2618,2684,2761,2822,2874,2940,3012,3070,3143,3215,3290,3368,3447,3524,3599,3666,3739,3815,3885,3961,4023,4086,4143,4136,4179,4215,4255,4330,4394,4442,4500,4577,4635,4705,4783,4863,4943,5023,5103,5183]
            };
            
            var cactus_points = [{
                x: 292 * game_scale,
                y: 2265,
                scale: 0.7
            }, {
                x: 62 * game_scale,
                y: 2165,
                scale: 0.6
            }, {
                x: 330 * game_scale,
                y: 1585,
                scale: 0.6
            }, {
                x: 334 * game_scale,
                y: 1245,
                scale: 0.6
            }, {
                x: 36 * game_scale,
                y: 1265,
                scale: 0.6
            }, {
                x: 92 * game_scale,
                y: 822,
                scale: 0.6
            }, {
                x: 310 * game_scale,
                y: 551,
                scale: 0.6
            }, {
                x: 70 * game_scale,
                y: 405,
                scale: 0.6
            }];

            var plant_points = [{
                x: 54 * game_scale,
                y: 1540,
                scale: 0.5
            }, {
                x: 330 * game_scale,
                y: 20,
                scale: 0.3
            }, {
                x: 230 * game_scale,
                y: 110,
                scale: 0.3
            }, {
                x: 60 * game_scale,
                y: 50,
                scale: 0.3,
                mirror: true
            }];

            var tent_point = {
                x: 85,
                y: 168,
                scale: 0.5,
                mirror: true
            };

            var camel_point = {
                x: 80,
                y: 1945,
                scale: 0.6,
            };

            var scorpion_point = {
                x: 300,
                y: 805,
            };

            var one_stone_points = [{
                x: 42 * game_scale,
                y: 1873,
                scale: 1
            }, {
                x: 214 * game_scale,
                y: 1797,
                scale: 1
            }, {
                x: 45 * game_scale,
                y: 1235,
                scale: 1
            }, {
                x: 345 * game_scale,
                y: 1202,
                scale: 1
            }];

            var two_stone_points = [{
                x: 350,
                y: 62,
                scale: 0.6
            }, {
                x: 317,
                y: 99,
                scale: 0.5
            }, {
                x: 280,
                y: 127,
                scale: 0.5
            }, {
                x: 25,
                y: 37,
                scale: 0.5
            }];

            var penguin_points = [{
                x: 80,
                y: 1553,
                scale: 1
            }, {
                x: 200,
                y: 776,
                scale: 0.5,
                mirror: true
            }]

            var seal_point = {
                x: 306,
                y: 2049,
            }

            var whale_point = {
                x: 172,
                y: 533,
            }


            desert.scale.setTo(game_scale, 1);
            // tundra.scale.setTo(game_scale, 1);
            // forest.scale.setTo(game_scale, 1);
            this.game.world.setBounds(0, 0, this.game.width, regionHeight.desert + regionHeight.tundra + regionHeight.forest + regionHeight.peru);
            

            for (var i = 0, points_count = points.x.length; i < points_count; i++) {
                points.x[i] *= game_scale;
                points.y[i] += regionHeight.peru + regionHeight.forest + 30;
            }

            this.increment = 1 / this.world.height;

            // Somewhere to draw to
            this.bmd = this.add.bitmapData(this.game.width, this.world.height);
            this.bmd.addToWorld();
            // Draw the path
            for (var j = 0; j < 1; j += this.increment) {
                var posx = this.math.catmullRomInterpolation(points.x, j);
                var posy = this.math.catmullRomInterpolation(points.y, j);
                this.bmd.rect(posx, posy, 4, 4, '#219C7F');
            }



            for (var i = 0, two_stone_count = two_stone_points.length; i < two_stone_count; i++) {
                var two_stone = regionGroups.desert.create(two_stone_points[i].x*game_scale, two_stone_points[i].y, 'two_stone');
                two_stone.anchor.setTo(0.5, 0.5);
                two_stone.scale.setTo(two_stone_points[i].scale);
            }

            // place snow_cactus
            var snow_cactus = regionGroups.tundra.create(75, 1956, 'snow_cactus');
            snow_cactus.anchor.setTo(0.5, 0.5);
            snow_cactus.scale.setTo(0.7);

            // place cactus
            for (var i = 0, cactus_count = cactus_points.length; i < cactus_count; i++) {
                var cactus_animation = regionGroups.desert.create(cactus_points[i].x, cactus_points[i].y, 'cactus_animation');
                cactus_animation.animations.add('wind');
                cactus_animation.animations.play('wind', 20, true);
                cactus_animation.anchor.setTo(0.5, 0.5);
                cactus_animation.scale.setTo(cactus_points[i].scale);
            }

            for (var i = 0, plant_count = plant_points.length; i < plant_count; i++) {
                var plant_animation = regionGroups.desert.create(plant_points[i].x, plant_points[i].y, 'plant_animation');
                plant_animation.animations.add('wind2');
                plant_animation.animations.play('wind2', 20, true);
                plant_animation.anchor.setTo(0.5, 0.5);
                if (plant_points[i].mirror == true) {
                    plant_animation.scale.setTo(-plant_points[i].scale, plant_points[i].scale);
                } else {
                    plant_animation.scale.setTo(plant_points[i].scale);
                }
            }

            // place tent
            // for (var i = 0, tent_count = tent_point.length; i < tent_count; i++) {
                var tent_animation = regionGroups.desert.create(tent_point.x*game_scale, tent_point.y, 'tent_animation');
                tent_animation.animations.add('tentshake');
                tent_animation.animations.play('tentshake', 20, true);
                tent_animation.anchor.setTo(0.5, 0.5);
                tent_animation.scale.setTo(-tent_point.scale, tent_point.scale);
            // }

            // fire animation
            var fire_animation = regionGroups.desert.create((tent_point.x + 100)*game_scale, tent_point.y + 30, 'fire_animation');
            fire_animation.anchor.setTo(0.5, 0.5);
            fire_animation.animations.add('light');
            fire_animation.animations.play('light', 20, true);

            // camel animation
            var camel_animation = regionGroups.desert.create(camel_point.x*game_scale, camel_point.y, 'camel_animation');
            camel_animation.anchor.setTo(0.5, 0.5);
            camel_animation.scale.setTo(camel_point.scale);
            camel_animation.angle = -14;
            camel_animation.animations.add('disco');
            camel_animation.animations.play('disco', 60, true);
            //
            // scorpion animation
            var scorpion_animation = regionGroups.desert.create(scorpion_point.x*game_scale, scorpion_point.y, 'scorpion_animation');
            scorpion_animation.anchor.setTo(0.5, 0.5);
            scorpion_animation.angle = -10;
            scorpion_animation.animations.add('walk');
            scorpion_animation.animations.play('walk', 20, true);
            //
            // seal animation
            var seal_animation = regionGroups.tundra.create(seal_point.x*game_scale, seal_point.y, 'seal_animation');
            seal_animation.anchor.setTo(0.5, 0.5);
            seal_animation.animations.add('oink');
            seal_animation.animations.play('oink', 20, true);
            //
            // penguin animation
            for (var i = 0, penguin_count = penguin_points.length; i < penguin_count; i++) {
                var penguin_animation = regionGroups.tundra.create(penguin_points[i].x*game_scale, penguin_points[i].y, 'penguin_animation');
                penguin_animation.anchor.setTo(0.5, 0.5);
                var flap = penguin_animation.animations.add('flap');
                penguin_animation.animations.play('flap', 30, true);
                if (penguin_points[i].mirror == true) {
                    penguin_animation.scale.setTo(-penguin_points[i].scale, penguin_points[i].scale);
                } else {
                    penguin_animation.scale.setTo(penguin_points[i].scale);
                }
            }
            //
            // whale animation
            var whale_animation = regionGroups.tundra.create(whale_point.x*game_scale,whale_point.y, 'whale_animation');
            whale_animation.anchor.setTo(0.5, 0.5);
            whale_animation.scale.setTo(0.8);
            var tailwave = whale_animation.animations.add('tailwave');
            whale_animation.animations.play('tailwave', 10, true);

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
                var s = this.game.add.sprite(this.world.randomX, this.game.rnd.between(0, regionOffset.desert - 200), 'snow' + this.game.rnd.between(1, 2));

                s.scale.setTo(this.game.rnd.between(1, 2) / 10);
                this.game.physics.arcade.enable(s);
                s.body.velocity.x = this.game.rnd.between(-50, -200);
                s.body.velocity.y = this.game.rnd.between(50, 70);
                s.autoCull = true;
                s.checkWorldBounds = true;
                s.events.onOutOfBounds.add(this.resetSnowSprite, this);
            }
            //   var stars = this.game.add.group();
            function createStars(count, x, y) {
                for (var i = 0; i < count; i++) {
                    var star = stars.create(x[0] + x[i + 1], y[0] + y[i + 1], 'star');
                    star.anchor.setTo(0.5, 0.5);
                }
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
            for (var j = 0, i = lessons.length - 1, nodeCount = 1 / (lessons.length); i >= 0; j += nodeCount, i--) {
                var currentLesson = lessons[i];
                var locked = currentLesson.locked ? '-locked' : '';
                var type = lessonType(currentLesson, i) == '' ? '' : '-' + lessonType(currentLesson, i);
                var posx = this.math.catmullRomInterpolation(points.x, j);
                var posy = this.math.catmullRomInterpolation(points.y, j);
                var node = this.game.add.button(posx, posy, 'node' + type + locked);


                !locked && lessons[i + 1] && lessons[i + 1].locked && this.add.tween(node.scale).to({ x: [1.2, 1], y: [1.2, 1] }, 700, Phaser.Easing.Back.Out, true, 1000).loop(true);
                !locked && lessons[i + 1] && lessons[i + 1].locked && localStorage.setItem('region',posy);
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



            for (var key in regionRange){
                if(regionRange[key].lowerLimit > game.camera.y && regionRange[key].upperLimit < game.camera.y ){
                   var delGroup = region;
                   delGroup.splice(delGroup.indexOf(key),1);
                   log.debug(delGroup);
                   for (var i = 0; i < delGroup.length; i++) {
                       regionGroups[delGroup[i]].callAll('kill');
                   }
                   break;
                    // regionGroups[key].callAll('kill');                    
                }
            }
            log.debug("DEBUG",game.kineticScrolling);
            // log.debug(this.game);

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
                sprite.y = this.game.world.bounds.top;
        },
        update: function() {
            // log.debug("regionGroups.desert",regionGroups.desert);
            // this.dragMap();
            // log.log("CAMERA",game.camera.y);
            optimize(game.camera,regionRange);
        },

        render: function() {
              this.game.debug.text("fps : "+game.time.fps || '--', 2, 100, "#00ff00");
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
        var i = 0;
        // var offset = 0;
        // var treshold = offset + camera.height;
        // var currentLimit, upperLimit, lowerLimit;
        for(var key in regionRange){
            i++;
            if (regionRange.hasOwnProperty(key)) {
                if(regionRange[key].lowerLimit > camera.y && regionRange[key].upperLimit < camera.y ){
                    if (camera.y < regionRange[key].upperTreshold && region.indexOf(key) < region.length - 1) {
                        if (regionGroups[region[region.indexOf(key) + 1]].countLiving() == 0){
                            log.debug('revive '+region[region.indexOf(key) + 1]);
                            regionGroups[region[region.indexOf(key) + 1]].callAll('revive');
                        }

                    } else if (camera.y > regionRange[key].upperTreshold && region.indexOf(key) < region.length - 1){
                        if (regionGroups[region[region.indexOf(key) + 1]].countLiving() != 0){
                            log.debug('kill '+region[region.indexOf(key) + 1]);
                            regionGroups[region[region.indexOf(key) + 1]].callAll('kill');
                        }
                    }

                    if ((camera.y + camera.height) > regionRange[key].lowerTreshold  && region.indexOf(key) > 0) {
                        if (regionGroups[region[region.indexOf(key) - 1]].countLiving() == 0){
                            log.debug('revive '+region[region.indexOf(key) - 1]);
                            regionGroups[region[region.indexOf(key) - 1]].callAll('revive');
                        }
                    } else if ((camera.y + camera.height) < regionRange[key].lowerTreshold  && region.indexOf(key) > 0){
                        if (regionGroups[region[region.indexOf(key) - 1]].countLiving() != 0){
                            log.debug('kill '+region[region.indexOf(key) - 1]);
                            regionGroups[region[region.indexOf(key) - 1]].callAll('kill');
                        }
                    }
                }

            }
        }
    }
};

