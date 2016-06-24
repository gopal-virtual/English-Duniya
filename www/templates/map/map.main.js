window.createGame = function(scope, lessons, audio, injector, log) {
  'use strict';

  var lessons = lessons;
  var game = new Phaser.Game("100", "100", Phaser.CANVAS, 'map_canvas',null,true,true,null);


  var playState = {
    preload: function() {
        // crisp image rendering
      this.game.renderer.renderSession.roundPixels = true;
    //   Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);  //for Canvas, modern approach
      Phaser.Canvas.setSmoothingEnabled(this.game.context, true);  //also for Canvas, legacy approach
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


      var desert = this.game.add.sprite(0, 0 + this.desert_offset , 'desert');
      var tundra = this.game.add.sprite(0, 0 + this.tundra_offest, 'tundra');
      var forest = this.game.add.sprite(-1, 0, 'forest');

      var game_scale = game.world.width / desert.width;

      desert.scale.setTo(game_scale, 1);
      tundra.scale.setTo(game_scale, 1);
      forest.scale.setTo(game_scale, 1);
      this.game.world.setBounds(0, 0, this.game.width, 2155+2378+1031);
      log.debug(this.world.height - 30);

      log.debug('desert', desert.width);
      this.points = {
        'x': [176,166,172,188,207,222,225,211,184,149,116,86,75,87,111,134,149,153,143,124,103,87,95,123,156,189,222,253,282,300,274,237,199,161,125,109,120,137,156,173,187,197,198,189,170,144,119,127,148,170,191,209,222,229,228,220,207,189,171,161,157,157,160,162,161,151,142,136,136,141,154,175,201,230,259,282,289,279,261,239,215,190,164,149,148,159,178,204,232,261,289,312,316,304,280,254,229,210,207,221,232,224,207,195,189,187,189,193,203,221,229,218,198,174,157,155,163,177,195,214,227,220,199,173,147,125,115,138,176,213,251,278,261,227,192,157,129,118,133,163,199,234,251,235,209,185,180,180,180,180,180,180,180,180,180,180,180,180,180,180,180,180,180,180],
        'y': [97,134,171,205,238,273,311,345,372,388,405,429,464,499,529,559,594,632,668,701,733,767,803,828,847,865,885,907,932,964,989,995,997,1001,1014,1046,1083,1116,1150,1183,1219,1255,1293,1330,1363,1391,1419,1455,1487,1517,1549,1583,1618,1656,1694,1731,1766,1800,1833,1870,1907,1945,1983,2021,2059,2096,2133,2170,2208,2246,2281,2313,2340,2365,2389,2419,2456,2493,2526,2557,2587,2615,2643,2676,2714,2751,2783,2811,2837,2861,2887,2917,2954,2989,3019,3047,3075,3108,3145,3177,3213,3250,3284,3320,3358,3396,3434,3471,3508,3541,3578,3614,3646,3675,3709,3747,3784,3819,3853,3885,3921,3958,3989,4017,4045,4075,4111,4139,4145,4139,4135,4157,4188,4205,4218,4234,4259,4295,4329,4352,4365,4379,4410,4444,4471,4500,4537,4575,4613,4651,4689,4727,4765,4803,4841,4879,4917,4955,4993,5031,5069,5107,5145,5183]
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

      var cactus_points = [
      {
        x: 292 * game_scale,
        y: 2000,
        scale: 0.7
      },{
        x: 62 * game_scale,
        y: 1900,
        scale: 0.6
      },{
        x: 330 * game_scale,
        y: 1320,
        scale: 0.6
      },{
        x: 334 * game_scale,
        y: 980,
        scale: 0.6
      },{
        x: 36 * game_scale,
        y: 1000,
        scale: 0.6
      },{
        x: 92 * game_scale,
        y: 557,
        scale: 0.6
      },{
        x: 310 * game_scale,
        y: 286,
        scale: 0.6
      },{
        x: 70 * game_scale,
        y: 140,
        scale: 0.6
      }];

      var plant_points = [{
        x: 54 * game_scale,
        y: 1275 + this.desert_offset,
        scale: 0.5
      },{
        x: 330 * game_scale,
        y: 2123 + this.tundra_offest,
        scale: 0.4
      },{
        x: 230 * game_scale,
        y: 2227 + this.tundra_offest,
        scale: 0.3
      },{
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
      },{
        x: 317,
        y: 2222 + this.tundra_offest,
        scale: 0.5
      },{
        x: 280,
        y: 2250 + this.tundra_offest,
        scale: 0.5
      },{
        x: 19,
        y: 2145 + this.tundra_offest,
        scale: 0.5
      }];

      var penguin_points = [{
        x: 80,
        y: 869 + this.tundra_offest,
        scale: 1
      },{
        x: 200,
        y: 92 + this.tundra_offest,
        scale: 0.5,
        mirror: true
      }]


      for (var i = 0, two_stone_count = two_stone_points.length; i < two_stone_count; i++) {
        var tent = this.game.add.sprite(two_stone_points[i].x, two_stone_points[i].y , 'two_stone');
        tent.anchor.setTo(0.5, 0.5);
        tent.scale.setTo(two_stone_points[i].scale);
      }

      // place snow_cactus
      var snow_cactus = this.game.add.sprite(75, 1956 + this.tundra_offest, 'snow_cactus');
          snow_cactus.anchor.setTo(0.5, 0.5);
          snow_cactus.scale.setTo(0.7);

      // place cactus
      for (var i = 0, cactus_count = cactus_points.length; i < cactus_count; i++) {
        var cactus_animation = this.game.add.sprite(cactus_points[i].x, cactus_points[i].y + this.desert_offset , 'cactus_animation');
        var wind = cactus_animation.animations.add('wind');
        cactus_animation.animations.play('wind', 20, true);
        cactus_animation.anchor.setTo(0.5, 0.5);
        cactus_animation.scale.setTo(cactus_points[i].scale);
      }

      for (var i = 0, plant_count = plant_points.length; i < plant_count; i++) {
        var plant_animation = this.game.add.sprite(plant_points[i].x, plant_points[i].y , 'plant_animation');
        var wind = plant_animation.animations.add('wind');
        plant_animation.animations.play('wind', 20, true);
        plant_animation.anchor.setTo(0.5, 0.5);
        if (plant_points[i].mirror == true) {
          plant_animation.scale.setTo(-plant_points[i].scale,plant_points[i].scale);
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
          tent_animation.scale.setTo(-tent_points[i].scale,tent_points[i].scale);
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
      var camel_animation = this.game.add.sprite(130, 1660 + this.desert_offset, 'camel_animation');
      camel_animation.anchor.setTo(0.5, 0.5);
      camel_animation.angle = -10;
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
          penguin_animation.scale.setTo(-penguin_points[i].scale,penguin_points[i].scale);
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
        log.debug("Lesson Type("+test+")-----"+lesson.locked)
        log.debug(lesson,lesson.locked,lesson.tag.toLowerCase()!='no tag'? '-' + lesson.tag.toLowerCase() : '')
        if(!lesson.locked){
          log.debug("returning ",lesson.tag.toLowerCase()!='no tag'? '-' + lesson.tag.toLowerCase() : '')
          return lesson.tag.toLowerCase()!='no tag'? '-' + lesson.tag.toLowerCase() : '';
        }
        else{
          log.debug("return here")
          return ''
        }
      };
      // Place nodes
      for (var j = 0, i = lessons.length - 1, nodeCount = 1 / (lessons.length); i >= 0; j += nodeCount, i--) {
        var currentLesson = lessons[i];
        // log.debug(i, currentLesson);
        var locked = currentLesson.locked ? '-locked' : '';
        log.debug('FOR: ',i)
        var type = lessonType(currentLesson, i);
        log.debug(type,"type")
        var posx = this.math.catmullRomInterpolation(this.points.x, j);
        var posy = this.math.catmullRomInterpolation(this.points.y , j);
        log.debug('lesson status', 'node' + type + locked);
        var node = this.game.add.button(posx, posy, 'node' + type + locked);

        !locked && lessons[i+1] && lessons[i+1].locked && this.add.tween(node.scale).to({ x: [1.2,1], y: [1.2,1]},700, Phaser.Easing.Back.Out, true, 1000).loop(true);
        node.inputEnabled = true;
        node.events.onInputUp.add(
          function(currentLesson, game, posy) {
            return function() {
              var displacement = game.kineticScrolling.velocityY > -30 && game.kineticScrolling.velocityY < 30;
              if (!currentLesson.locked && displacement) {
                  localStorage.setItem('currentPosition',(posy - game.height/2));
                scope.$emit('openNode', currentLesson);
              }
              else if(currentLesson.locked && displacement){
                  audio.play('locked');
                  scope.$emit('downloadNode',currentLesson)
                  log.debug("Current lesson ",currentLesson)
              }
              else{}
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
        //   log.debug('stars in lesson', currentLesson.stars);
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
        sprite.y = this.desert_offset ;
    },
    resetSnowSprite: function(sprite) {
      sprite.x = this.game.world.bounds.right;
      if (sprite.y > this.desert_offset  )
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
    log.debug('game destoryed');
  });
};
