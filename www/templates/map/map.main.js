window.createGame = function(scope, lessons, injector, log) {
  'use strict';

  var lessons = lessons;
  var game = new Phaser.Game("100", "100" , Phaser.AUTO, 'map_canvas');
  var playState = {
    preload : function () {
      this.load.image('desert', 'img/assets_v0.0.3/desert_bg.png');
      this.load.image('cactus', 'img/assets_v0.0.3/cactus.png');
      this.load.image('tent', 'img/assets_v0.0.3/tent_fire.png');
      // this.load.spritesheet('cactus_animation', 'img/assets_v0.0.2/cactus_sprite.png', 15, 17, 8);
      this.load.image('node', 'img/assets_v0.0.3/node.png');
      // debug value
      this.game.time.advancedTiming = true;
    },
    create : function() {
      var desert = this.game.add.sprite(0,this.game.height * i,'desert');
      desert.scale.setTo(game.world.width/desert.width, 1);

      this.game.world.setBounds(0, 0, this.game.width, desert.height);

      // place tent
      for (var i = 0; i < 3; i++) {
        var tent = this.game.add.sprite(this.game.rnd.between(10,this.game.world.width-10), this.game.rnd.between(0,this.game.world.height),'tent');
      }
      // place cactus
      for (var i = 0; i < 20; i++) {
        var cactus = this.game.add.sprite(this.game.rnd.between(50,this.game.world.width-50), this.game.rnd.between(50,this.game.world.height-50),'cactus');
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
        'x': [100, 200, 100, game.world.centerX, game.world.centerX],
        'y': [0, 400, 800, 1300, game.world.height]
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
