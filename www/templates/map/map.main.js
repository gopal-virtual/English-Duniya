window.createGame = function(scope, lessons, audio, injector, log) {
  'use strict';

  var lessons = lessons;
  var game = new Phaser.Game("100", "100", Phaser.CANVAS, 'map_canvas');


  var playState = {
    preload: function() {
        // crisp image rendering
      this.game.renderer.renderSession.roundPixels = true;
    //   Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);  //for Canvas, modern approach
      Phaser.Canvas.setSmoothingEnabled(this.game.context, true);  //also for Canvas, legacy approach
    //   PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST; //for WebGL

      this.load.image('desert', 'img/assets/region.png');
      this.load.image('tent', 'img/assets/tent.png');
      this.load.image('tent_green', 'img/assets/tent_green.png');
      this.load.image('two_stone', 'img/assets/two_stone.png');
      this.load.image('one_stone', 'img/assets/one_stone.png');
      this.load.image('particle1', 'img/assets/particle1.png');
      this.load.image('particle2', 'img/assets/particle2.png');
      this.load.image('particle3', 'img/assets/particle3.png');
      this.load.image('snow1', 'img/assets/snow.png');
      this.load.image('snow2', 'img/assets/snow1.png');

    //   this.load.spritesheet('fire_animation', 'img/assets/fire_animation.png', 122, 193, 39);
      this.load.spritesheet('cactus_animation', 'img/assets/cactus_animation.png', 37, 63, 35);
    //   this.load.spritesheet('cactus_second_animation', 'img/assets/cactus_second_animation.png', 551, 754);
    //   this.load.spritesheet('camel_animation', 'img/assets/camel_animation.png', 336, 256);
    //   this.load.spritesheet('scorpion_animation', 'img/assets/scorpion_animation.png', 103, 95);
    //   this.load.spritesheet('tent_animation', 'img/assets/tent_animation.png', 734, 394);

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
      var desert = this.game.add.sprite(0, 0, 'desert');
      var game_scale = game.world.width / desert.width;
      var desert_height = 2155;
      this.iceregion_height = 3358 - desert_height
      desert.scale.setTo(game_scale, 1);
      this.game.world.setBounds(0, 0, this.game.width, desert.height);
      log.debug(this.world.height - 30);
      var cactus_points = [
          {
        x: 42 * game_scale,
        y: 2050,
        scale: 1
      }, {
        x: 328 * game_scale,
        y: 1998,
        scale: 1
      }, {
        x: 128 * game_scale,
        y: 1904,
        scale: 1
      }, {
        x: 304 * game_scale,
        y: 1798,
        scale: 1
      },
      {
        x: 26 * game_scale,
        y: 1772,
        scale: 1
      }, {
        x: 348 * game_scale,
        y: 1675,
        scale: 1
      }, {
        x: 38 * game_scale,
        y: 1591,
        scale: 1
      }, {
        x: 124 * game_scale,
        y: 1446,
        scale: 1
      }, {
        x: 292 * game_scale,
        y: 1280,
        scale: 1
      }, {
        x: 40 * game_scale,
        y: 1096,
        scale: 1
      },
      {
        x: 76 * game_scale,
        y: 913,
        scale: 1
      }, {
        x: 306 * game_scale,
        y: 768,
        scale: 1
      },
    // {
    //     x: 40 * game_scale,
    //     y: 475,
    //     scale: 1
    //   }, {
    //     x: 42 * game_scale,
    //     y: 254,
    //     scale: 1
    //   }, {
    //     x: 310 * game_scale,
    //     y: 184,
    //     scale: 1
    //   },
  ];
      var tent_points = [{
        x: 258 * game_scale,
        y: 950,
        scale: 1
      }];
      var tent_green_points = [{
        x: 26 * game_scale,
        y: 1403,
        scale: 1
      }]
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
        x: 293,
        y: 2139,
        scale: 1
      }, ]

      // place tent
      for (var i = 0, tent_count = tent_points.length; i < tent_count; i++) {
        var tent = this.game.add.sprite(tent_points[i].x, tent_points[i].y + this.iceregion_height, 'tent');
        tent.anchor.setTo(0.5, 0.5);
        tent.scale.setTo(tent_points[i].scale);
      }
      // fire animation
    //   var fire_animation = this.game.add.sprite(tent_points[0].x, tent_points[0].y + 40 + this.iceregion_height, 'fire_animation');
    //   fire_animation.anchor.setTo(0.5, 0.5);
    //   var light = fire_animation.animations.add('light');
    //   fire_animation.animations.play('light', 20, true);

    //   for (var i = 0, tent_count = tent_green_points.length; i < tent_count; i++) {
    //     var tent = this.game.add.sprite(tent_green_points[i].x, tent_green_points[i].y + this.iceregion_height, 'tent_green');
    //     tent.anchor.setTo(0.5, 0.5);
    //     tent.scale.setTo(tent_green_points[i].scale);
    //   }
      // place stone
      for (var i = 0, one_stone_count = one_stone_points.length; i < one_stone_count; i++) {
        var tent = this.game.add.sprite(one_stone_points[i].x, one_stone_points[i].y + this.iceregion_height, 'one_stone');
        tent.anchor.setTo(0.5, 0.5);
        tent.scale.setTo(one_stone_points[i].scale);
      }
      for (var i = 0, two_stone_count = two_stone_points.length; i < two_stone_count; i++) {
        var tent = this.game.add.sprite(two_stone_points[i].x, two_stone_points[i].y + this.iceregion_height, 'two_stone');
        tent.anchor.setTo(0.5, 0.5);
        tent.scale.setTo(two_stone_points[i].scale);
      }
      // place cactus
      for (var i = 0, cactus_count = cactus_points.length; i < cactus_count; i++) {
        var cactus_animation = this.game.add.sprite(cactus_points[i].x, cactus_points[i].y + this.iceregion_height, 'cactus_animation');
        var wind = cactus_animation.animations.add('wind');
        cactus_animation.animations.play('wind', 20, true);
        cactus_animation.anchor.setTo(0.5, 0.5);
        cactus_animation.scale.setTo(cactus_points[i].scale);
      }

      // catcus animation
      //
    //   // catcus animation
    //   var cactus_second_animation = this.game.add.sprite(0,1000, 'cactus_second_animation');
    //   var wind_second = cactus_second_animation.animations.add('wind_second');
    //   cactus_second_animation.animations.play('wind_second', 20, true);
      //
    //   // camel animation
    //   var camel_animation = this.game.add.sprite(0,100, 'camel_animation');
    //   var neck_move = camel_animation.animations.add('neck_move');
    //   camel_animation.animations.play('neck_move', 60, true);
      //
    //   // scorpion animation
    //   var scorpion_animation = this.game.add.sprite(0,100, 'scorpion_animation');
    //   var walk = scorpion_animation.animations.add('walk');
    //   scorpion_animation.animations.play('walk', 20, true);
      //
    //   // tent animation
    //   var tent_animation = this.game.add.sprite(0,2000, 'tent_animation');
    //   var walk = tent_animation.animations.add('walk');
    //   tent_animation.animations.play('walk', 20, true);

      // placing lesson node
      // 1. lesson node count
      // 2. Node should follow a particular path
      // path
      log.debug('desert', desert.width);
      this.points = {
        'x': [101, 113, 170, 202, 216, 201, 180, 172, 172, 179, 195, 211, 207, 160, 138, 144, 167, 197, 204, 197, 165, 126, 101, 161, 256, 223, 134, 102, 138, 200, 235, 200, 180, 180, 180, 180, 180, 180, 180, 180],
        'y': [50, 64, 109, 148, 189, 235, 287, 346, 404, 456, 495, 529, 574, 644, 693, 748, 803, 854, 877, 941, 980, 1022, 1091, 1116, 1116, 1171, 1209, 1266, 1318, 1342, 1371, 1433, 1494, 1577, 1659, 1742, 1824, 1907, 1950, 2200]
      };

      for (var i = 0, points_count = this.points.x.length; i < points_count; i++) {
        this.points.x[i] *= game_scale;
        this.points.y[i] += this.iceregion_height;
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
      // sand particles
      for (var i = 0; i < 100; i++) {
        var s = this.game.add.sprite(this.world.randomX, this.game.rnd.between(this.iceregion_height, this.world.height), 'particle' + this.game.rnd.between(1, 3));

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
        var s = this.game.add.sprite(this.world.randomX, this.game.rnd.between(0, this.iceregion_height - 500), 'snow' + this.game.rnd.between(1, 2));

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

      function lessonType(lesson, locked) {
        return !locked && lesson.tag.toLowerCase()!='no tag'? '-' + lesson.tag.toLowerCase() : '';
      };
      log.debug('canvas lessons',lessons.length);
      // Place nodes
      for (var j = 0, i = lessons.length - 1, nodeCount = 1 / (lessons.length); i >= 0; j += nodeCount, i--) {
        var currentLesson = lessons[i];
        // log.debug(i, currentLesson);
        var locked = currentLesson.locked ? '-locked' : '';
        var type = lessonType(currentLesson, currentLesson.locked);
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
        sprite.y = this.iceregion_height;
    },
    resetSnowSprite: function(sprite) {
      sprite.x = this.game.world.bounds.right;
      if (sprite.y > this.iceregion_height)
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
