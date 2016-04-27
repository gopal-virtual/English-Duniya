window.createGame = function(scope, lessons, injector, log) {
  'use strict';

  var lessons = lessons;
  var game = new Phaser.Game("100", "100" , Phaser.CANVAS, 'map_canvas');

  var playState = {
    preload : function () {
      this.load.image('desert', 'img/assets/desert.png');
      this.load.image('cactus', 'img/assets/cactus.png');
      this.load.image('tent', 'img/assets/tent_fire.png');
      this.load.image('tent_green', 'img/assets/tent_green.png');
      this.load.image('practice', 'img/icons/practice_active.png');
      this.load.image('two_stone', 'img/assets/two_stone.png');
      this.load.image('one_stone', 'img/assets/one_stone.png');
      this.load.image('particle1', 'img/assets/particle1.png');
      this.load.image('particle2', 'img/assets/particle2.png');
      this.load.image('particle3', 'img/assets/particle3.png');

      // this.load.spritesheet('cactus_animation', 'img/assets_v0.0.2/cactus_sprite.png', 15, 17, 8);
      this.load.image('node', 'img/icons/node.png');
      // debug value
      this.game.time.advancedTiming = true;
    },
    create : function() {
      var desert = this.game.add.sprite(0,0,'desert');
      var game_scale = game.world.width/desert.width;
      desert.scale.setTo(game_scale, 1);
      this.game.world.setBounds(0, 0, this.game.width, desert.height);
      log.debug(this.world.height - 30);
      var cactus_points = [
        {x : 42 , y : 2050 , scale : 1},
        {x : 328 , y : 1998, scale : 1},
        {x : 128, y : 1904, scale : 1},
        {x : 304, y : 1798, scale : 1},
        {x : 26, y : 1772, scale : 1},
        {x : 348, y : 1675, scale : 1},
        {x : 38, y : 1591, scale : 1},
        {x : 124, y : 1446, scale : 1},
        {x : 292, y : 1280, scale : 1},
        {x : 40, y : 1096, scale : 1},
        {x : 76, y : 913, scale : 1},
        {x : 306, y : 768, scale : 1},
        {x : 40, y : 475, scale : 1},
        {x : 42, y : 254, scale : 1},
        {x : 310, y : 184, scale : 1},
      ];
      var tent_points = [
        {x : 258, y : 950, scale : 1 }
      ];
      var tent_green_points = [
        {x : 26, y : 1403, scale : 1}
      ]
      var one_stone_points = [
        {x : 42, y : 1873 , scale : 1},
        {x : 214, y : 1797, scale : 1},
        {x : 45, y : 1235, scale : 1},
        {x : 345, y : 1202, scale : 1}
      ];
      var two_stone_points = [
        {x : 293, y : 2139, scale : 1},
      ]

      // place tent
      for (var i = 0, tent_count = tent_points.length ; i < tent_count; i++) {
        var tent = this.game.add.sprite(tent_points[i].x, tent_points[i].y,'tent');
        tent.anchor.setTo(0.5,0.5);
        tent.scale.setTo(tent_points[i].scale);
      }
      for (var i = 0, tent_count = tent_green_points.length ; i < tent_count; i++) {
        var tent = this.game.add.sprite(tent_green_points[i].x, tent_green_points[i].y,'tent_green');
        tent.anchor.setTo(0.5,0.5);
        tent.scale.setTo(tent_green_points[i].scale);
      }
      // place stone
      for (var i = 0, one_stone_count = one_stone_points.length ; i < one_stone_count; i++) {
        var tent = this.game.add.sprite(one_stone_points[i].x, one_stone_points[i].y,'one_stone');
        tent.anchor.setTo(0.5,0.5);
        tent.scale.setTo(one_stone_points[i].scale);
      }
      for (var i = 0, two_stone_count = two_stone_points.length ; i < two_stone_count; i++) {
        var tent = this.game.add.sprite(two_stone_points[i].x, two_stone_points[i].y,'two_stone');
        tent.anchor.setTo(0.5,0.5);
        tent.scale.setTo(two_stone_points[i].scale);
      }
      // place cactus
      for (var i = 0, cactus_count = cactus_points.length; i < cactus_count; i++) {
        var cactus = this.game.add.sprite(cactus_points[i].x, cactus_points[i].y,'cactus');
        cactus.anchor.setTo(0.5,0.5);
        cactus.scale.setTo(cactus_points[i].scale);
        // catcus animation
        // var cactus_animation = this.game.add.sprite(this.game.rnd.between(10,this.game.world.width-10), this.game.rnd.between(0,this.game.world.height), 'cactus_animation');
        // cactus_animation.scale.setTo(3,3);
        // var walk = cactus_animation.animations.add('walk');
        // cactus_animation.animations.play('walk', 10, true);
      }



      // placing lesson node
      // 1. lesson node count
      // 2. Node should follow a particular path
      // path
      this.points = {
        'x': [101,113,170,202,216,201,180,172,172,179,195,211,207,160,138,144,167,197,204,197,165,126,101,161,256,223,134,102,138,200,235,200,164,164,164,164,164,164,164,164,164],
        'y': [50,64,109,148,189,235,287,346,404,456,495,529,574,644,693,748,803,854,877,941,980,1022,1091,1116,1116,1171,1209,1266,1318,1342,1371,1433,1494,1577,1659,1742,1824,1907,1989,2072,2155]
      };
      this.increment = 1 / game.world.height;

      // Somewhere to draw to
      this.bmd = this.add.bitmapData(this.game.width, this.game.world.height);
      this.bmd.addToWorld();
      // Draw the path
      for (var j = 0; j < 1; j += this.increment) {
        var posx = this.math.catmullRomInterpolation(this.points.x, j);
        var posy = this.math.catmullRomInterpolation(this.points.y, j);
        this.bmd.rect(posx, posy, 4, 4, '#219C7F');
      }
      // Place nodes
      for (var j = 0, i = lessons.length-1, nodeCount = 1/lessons.length; j < 1; j += nodeCount, i--) {
        var posx = this.math.catmullRomInterpolation(this.points.x, j);
        var posy = this.math.catmullRomInterpolation(this.points.y, j);
        var node = this.game.add.button(posx, posy, 'node', function (node) {
          scope.$emit('openNode',node);
        }, this, 2, 1, 0);
        node.anchor.setTo(0.5, 0.5);
        node.id = lessons[i].id;
      }
      for (var i = 0; i < 100; i++)
      {
          var s = this.game.add.sprite(this.world.randomX, this.game.world.randomY, 'particle' + this.game.rnd.between(1, 3));

          s.scale.setTo(this.game.rnd.between(1, 2)/20);
          this.game.physics.arcade.enable(s);
          s.body.velocity.x = this.game.rnd.between(-55, -70);
          s.body.velocity.y = this.game.rnd.between(10, 20);
          s.autoCull = true;
          s.checkWorldBounds = true;
          s.events.onOutOfBounds.add(this.resetSprite, this);
      }

      var logout = this.game.add.button(this.game.width - 100, 0, 'practice',function () {
        scope.$emit('logout');
      },this, 2 , 1 , 0);
      logout.scale.setTo(0.3,0.3);
      logout.fixedToCamera = true;
      logout.cameraOffset.setTo(this.game.width - 70, 20);

      this.init();
      this.game.kineticScrolling.start();
    },
    init : function() {
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
      this.game.camera.y = ((~~this.world.height/this.game.height)-1) * this.game.height;
    },
    resetSprite : function (sprite) {
        sprite.x = this.game.world.bounds.right;
        if(sprite.y > this.world.height)
          sprite.y = this.game.world.bounds.top;
    },
    update : function() {
      // this.dragMap();
    },

    render : function(){
      this.game.debug.text("fps : "+game.time.fps || '--', 2, 14, "#00ff00");
    }
  }

  game.state.add('play',playState);
  game.state.start('play');

  // phaser destroy doesn't remove canvas element --> removed manually in app run
  scope.$on('$destroy', function() {
    game.destroy(); // Clean up the game when we leave this scope
  });
};
