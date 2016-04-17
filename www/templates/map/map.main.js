window.createGame = function(scope, injector) {
  'use strict';

  var game = new Phaser.Game("100%", "100%", Phaser.AUTO, 'map_canvas');

  var playState = {
    preload : function () {
      this.load.image('cloud1', 'img/cloud1.png');
      this.load.image('cloud2', 'img/cloud2.png');
      this.load.image('cloud3', 'img/cloud3.png');
      this.load.image('cloud4', 'img/cloud4.png');
      this.load.image('cloud5', 'img/cloud5.png');
      this.load.image('cloud6', 'img/cloud6.png');
      this.load.image('cloud7', 'img/cloud7.png');
      this.load.image('path', 'img/path.png');
      this.load.image('node', 'img/node.png');
    },
    create : function() {
      this.game.stage.backgroundColor = "#AAD9E8";
      this.game.world.setBounds(0, 0, this.game.width, this.game.height * 3);
      this.init();
      var cloudCount = 20;
      for (var i = 0; i < cloudCount; i++) {
        var cloud = this.game.add.sprite(this.game.world.randomX, this.game.world.randomY, 'cloud' + this.game.rnd.between(1, 7));
        var scaleFactor = this.game.rnd.between(3,6)/10;
        cloud.scale.setTo(scaleFactor, scaleFactor);
        this.game.physics.arcade.enable(cloud);
        cloud.body.velocity.x = this.game.rnd.between(-5, -75);
        cloud.autoCull = true;
        cloud.checkWorldBounds = true;
        cloud.events.onOutOfBounds.add(this.resetSprite, this);
      }
      var nodeCount = 20
      for (var i = 0; i < nodeCount; i++) {
        var node = this.game.add.sprite((i*10)+50, i * (this.game.world.height / nodeCount), 'node');
        node.scale.setTo(0.5, 0.5);
      }

    },

    resetSprite : function(sprite) {
      sprite.x = this.game.world.bounds.right;
    },

    init : function() {
      this.game.camera.y = this.game.height * 2;
    },

    update : function() {
      this.dragMap(this);
    },

    dragMap : function(ref) {
      if (ref.game.input.activePointer.isDown) {
        if (ref.game.origDragPoint) {
          // move the camera by the amount the mouse has moved since last update
          ref.game.camera.x += ref.game.origDragPoint.x - ref.game.input.activePointer.position.x;
          ref.game.camera.y += ref.game.origDragPoint.y - ref.game.input.activePointer.position.y;
        }
        // set new drag origin to current position
        ref.game.origDragPoint = ref.game.input.activePointer.position.clone();
      } else {
        ref.game.origDragPoint = null;
      }
    },
  }

  game.state.add('play',playState);
  game.state.start('play');

  // phaser destroy is broken, check for fix
  // scope.$on('$destroy', function() {
    // game.destroy(); // Clean up the game when we leave this scope
  // });
};
