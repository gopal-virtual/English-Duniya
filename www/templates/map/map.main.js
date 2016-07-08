window.createGame = function(scope, lessons, audio, injector, log) {
    'use strict';

    var lessons = lessons;
    var game = new Phaser.Game("100", "100", Phaser.CANVAS, 'map_canvas', null, true, true, null);


    var playState = {
        preload: function() {
            // crisp image rendering
            this.game.renderer.renderSession.roundPixels = true;
            //   Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);  //for Canvas, modern approach
            Phaser.Canvas.setSmoothingEnabled(this.game.context, true); //also for Canvas, legacy approach
            //   PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; //for WebGL

            this.load.image('desert', 'img/assets/desert_region.png');
            this.load.image('tundra', 'img/assets/tundra_region.png');
            this.load.image('forest', 'img/assets/forest_region.png');

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
        },
        create: function() {
            var desert_height = 2155;
            var tundra_height = 2378; //2378
            var forest_height = 1031;
            this.desert_offset = tundra_height + forest_height;
            this.tundra_offest = forest_height;

            // this.iceregion_height = 4533 - desert_height - tundra_height;
            // this.forestregion_height = 300;


            var desert = this.game.add.sprite(0, 0 + this.desert_offset, 'desert');
            var tundra = this.game.add.sprite(0, 0 + this.tundra_offest, 'tundra');
            var forest = this.game.add.sprite(-1, 0, 'forest');

            var game_scale = game.world.width / desert.width;

            desert.scale.setTo(game_scale, 1);
            tundra.scale.setTo(game_scale, 1);
            forest.scale.setTo(game_scale, 1);
            this.game.world.setBounds(0, 0, this.game.width, desert_height + tundra_height + forest_height);
            this.points = {
                'x': [181, 167, 170, 185, 205, 222, 225, 210, 180, 144, 109, 81, 77, 95, 121, 142, 153, 148, 132, 110, 90, 91, 118, 153, 188, 222, 255, 284, 299, 266, 227, 187, 147, 114, 113, 129, 148, 167, 183, 195, 200, 203, 206, 211, 217, 223, 226, 228, 228, 228, 229, 223, 209, 191, 172, 161, 157, 157, 160, 163, 159, 147, 139, 135, 137, 147, 165, 191, 221, 252, 278, 289, 281, 262, 239, 214, 187, 160, 148, 150, 164, 187, 215, 245, 276, 304, 317, 309, 287, 260, 233, 211, 207, 221, 232, 222, 205, 194, 188, 187, 190, 196, 211, 228, 225, 206, 182, 160, 154, 161, 175, 194, 214, 227, 218, 195, 168, 141, 119, 120, 154, 193, 233, 271, 272, 238, 201, 164, 133, 119, 129, 151, 177, 207, 240, 273, 292, 298, 288, 260, 232, 211, 195, 184, 179, 179, 180, 180, 180, 180, 180, 180, 180, 180, 180],
                'y': [86, 124, 163, 200, 235, 271, 311, 347, 373, 390, 409, 437, 476, 511, 541, 575, 614, 653, 689, 723, 757, 796, 825, 845, 864, 885, 908, 935, 970, 991, 996, 998, 1004, 1025, 1064, 1101, 1136, 1171, 1207, 1246, 1285, 1325, 1365, 1405, 1444, 1484, 1524, 1564, 1604, 1644, 1684, 1723, 1761, 1796, 1831, 1870, 1909, 1949, 1989, 2029, 2069, 2107, 2146, 2186, 2226, 2265, 2300, 2331, 2357, 2383, 2412, 2450, 2489, 2524, 2557, 2588, 2618, 2647, 2684, 2724, 2761, 2794, 2822, 2849, 2874, 2903, 2940, 2978, 3012, 3041, 3070, 3104, 3143, 3177, 3215, 3254, 3290, 3328, 3368, 3408, 3447, 3487, 3524, 3560, 3599, 3634, 3666, 3700, 3739, 3778, 3815, 3851, 3885, 3923, 3961, 3994, 4023, 4052, 4086, 4124, 4143, 4143, 4136, 4143, 4179, 4200, 4215, 4230, 4255, 4292, 4330, 4364, 4394, 4420, 4442, 4465, 4500, 4539, 4577, 4606, 4635, 4668, 4705, 4743, 4783, 4823, 4863, 4903, 4943, 4983, 5023, 5063, 5103, 5143, 5183]
            };

            for (var i = 0, points_count = this.points.x.length; i < points_count; i++) {
                this.points.x[i] *= game_scale;
                this.points.y[i] += 381;
            }

            this.increment = 1 / this.world.height;

            // Somewhere to draw to
            this.bmd = this.add.bitmapData(this.game.width, this.world.height);
            this.bmd.addToWorld();
            // Draw the path
            for (var j = 0; j < 1; j += this.increment) {
                var posx = this.math.catmullRomInterpolation(this.points.x, j);
                var posy = this.math.catmullRomInterpolation(this.points.y, j);
                this.bmd.rect(posx, posy, 4, 4, '#219C7F');
            }

            var cactus_points = [{
                x: 292 * game_scale,
                y: 2000,
                scale: 0.7
            }, {
                x: 62 * game_scale,
                y: 1900,
                scale: 0.6
            }, {
                x: 330 * game_scale,
                y: 1320,
                scale: 0.6
            }, {
                x: 334 * game_scale,
                y: 980,
                scale: 0.6
            }, {
                x: 36 * game_scale,
                y: 1000,
                scale: 0.6
            }, {
                x: 92 * game_scale,
                y: 557,
                scale: 0.6
            }, {
                x: 310 * game_scale,
                y: 286,
                scale: 0.6
            }, {
                x: 70 * game_scale,
                y: 140,
                scale: 0.6
            }];

            var plant_points = [{
                x: 54 * game_scale,
                y: 1275 + this.desert_offset,
                scale: 0.5
            }, {
                x: 330 * game_scale,
                y: 2123 + this.tundra_offest,
                scale: 0.4
            }, {
                x: 230 * game_scale,
                y: 2227 + this.tundra_offest,
                scale: 0.3
            }, {
                x: 60 * game_scale,
                y: 2145 + this.tundra_offest,
                scale: 0.3,
                mirror: true
            }];

            var tent_points = [{
                x: 85 * game_scale,
                y: 2252,
                scale: 0.5,
                mirror: true
            }];

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
                y: 2180 + this.tundra_offest,
                scale: 0.7
            }, {
                x: 317,
                y: 2222 + this.tundra_offest,
                scale: 0.5
            }, {
                x: 280,
                y: 2250 + this.tundra_offest,
                scale: 0.5
            }, {
                x: 19,
                y: 2145 + this.tundra_offest,
                scale: 0.5
            }];

            var penguin_points = [{
                x: 80,
                y: 869 + this.tundra_offest,
                scale: 1
            }, {
                x: 200,
                y: 92 + this.tundra_offest,
                scale: 0.5,
                mirror: true
            }]


            for (var i = 0, two_stone_count = two_stone_points.length; i < two_stone_count; i++) {
                var tent = this.game.add.sprite(two_stone_points[i].x, two_stone_points[i].y, 'two_stone');
                tent.anchor.setTo(0.5, 0.5);
                tent.scale.setTo(two_stone_points[i].scale);
            }

            // place snow_cactus
            var snow_cactus = this.game.add.sprite(75, 1956 + this.tundra_offest, 'snow_cactus');
            snow_cactus.anchor.setTo(0.5, 0.5);
            snow_cactus.scale.setTo(0.7);

            // place cactus
            for (var i = 0, cactus_count = cactus_points.length; i < cactus_count; i++) {
                var cactus_animation = this.game.add.sprite(cactus_points[i].x, cactus_points[i].y + this.desert_offset, 'cactus_animation');
                var wind = cactus_animation.animations.add('wind');
                cactus_animation.animations.play('wind', 20, true);
                cactus_animation.anchor.setTo(0.5, 0.5);
                cactus_animation.scale.setTo(cactus_points[i].scale);
            }

            for (var i = 0, plant_count = plant_points.length; i < plant_count; i++) {
                var plant_animation = this.game.add.sprite(plant_points[i].x, plant_points[i].y, 'plant_animation');
                var wind = plant_animation.animations.add('wind');
                plant_animation.animations.play('wind', 20, true);
                plant_animation.anchor.setTo(0.5, 0.5);
                if (plant_points[i].mirror == true) {
                    plant_animation.scale.setTo(-plant_points[i].scale, plant_points[i].scale);
                } else {
                    plant_animation.scale.setTo(plant_points[i].scale);
                }
            }

            // place tent
            for (var i = 0, tent_count = tent_points.length; i < tent_count; i++) {
                var tent_animation = this.game.add.sprite(tent_points[i].x, tent_points[i].y + this.tundra_offest, 'tent_animation');
                var tentshake = tent_animation.animations.add('tentshake');
                tent_animation.animations.play('tentshake', 20, true);
                tent_animation.anchor.setTo(0.5, 0.5);
                if (tent_points[i].mirror == true) {
                    tent_animation.scale.setTo(-tent_points[i].scale, tent_points[i].scale);
                } else {
                    tent_animation.scale.setTo(tent_points[i].scale);
                }
            }

            // fire animation
            var fire_animation = this.game.add.sprite(tent_points[0].x + 100, tent_points[0].y + 50 + this.tundra_offest, 'fire_animation');
            fire_animation.anchor.setTo(0.5, 0.5);
            var light = fire_animation.animations.add('light');
            fire_animation.animations.play('light', 20, true);

            // camel animation
            var camel_animation = this.game.add.sprite(80, 1680 + this.desert_offset, 'camel_animation');
            camel_animation.anchor.setTo(0.5, 0.5);
            camel_animation.scale.setTo(0.6);
            camel_animation.angle = -14;
            var neck_move = camel_animation.animations.add('neck_move');
            camel_animation.animations.play('neck_move', 60, true);
            //
            // scorpion animation
            var scorpion_animation = this.game.add.sprite(300, 540 + this.desert_offset, 'scorpion_animation');
            scorpion_animation.anchor.setTo(0.5, 0.5);
            scorpion_animation.angle = -10;
            var walk = scorpion_animation.animations.add('walk');
            scorpion_animation.animations.play('walk', 20, true);
            //
            // seal animation
            var seal_animation = this.game.add.sprite(306, 1365 + this.tundra_offest, 'seal_animation');
            seal_animation.anchor.setTo(0.5, 0.5);
            var oink = seal_animation.animations.add('oink');
            seal_animation.animations.play('oink', 20, true);
            //
            // penguin animation
            for (var i = 0, penguin_count = penguin_points.length; i < penguin_count; i++) {
                var penguin_animation = this.game.add.sprite(penguin_points[i].x, penguin_points[i].y, 'penguin_animation');
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
            var whale_animation = this.game.add.sprite(172, 880, 'whale_animation');
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
                var s = this.game.add.sprite(this.world.randomX, this.game.rnd.between(this.desert_offset, this.world.height), 'particle' + this.game.rnd.between(1, 3));

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
                var s = this.game.add.sprite(this.world.randomX, this.game.rnd.between(0, this.desert_offset - 200), 'snow' + this.game.rnd.between(1, 2));

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
                var posx = this.math.catmullRomInterpolation(this.points.x, j);
                var posy = this.math.catmullRomInterpolation(this.points.y, j);
                var node = this.game.add.button(posx, posy, 'node' + type + locked);


                !locked && lessons[i + 1] && lessons[i + 1].locked && this.add.tween(node.scale).to({ x: [1.2, 1], y: [1.2, 1] }, 700, Phaser.Easing.Back.Out, true, 1000).loop(true);
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


            this.init();
            this.game.kineticScrolling.start();
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
                deltaWheel: 40
            });
            this.game.camera.y = localStorage.getItem('currentPosition') ? localStorage.getItem('currentPosition') : ((~~this.world.height / this.game.height) - 1) * this.game.height;
        },
        resetSprite: function(sprite) {
            sprite.x = this.game.world.bounds.right;
            if (sprite.y > this.world.height)
                sprite.y = this.desert_offset;
        },
        resetSnowSprite: function(sprite) {
            sprite.x = this.game.world.bounds.right;
            if (sprite.y > this.desert_offset)
                sprite.y = this.game.world.bounds.top;
        },
        update: function() {
            // this.dragMap();
        },

        render: function() {
            //   this.game.debug.text("fps : "+game.time.fps || '--', 2, 100, "#00ff00");
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
