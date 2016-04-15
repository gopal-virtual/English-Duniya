window.createGame = function(scope, injector, log) {
  'use strict';

  var game = new Phaser.Game("100", "100" , Phaser.AUTO, 'map_canvas');

  var playState = {
    preload : function () {
      this.load.image('desert', 'img/assets_v0.0.2/desert_bg.png');
      this.load.image('cactus', 'img/assets_v0.0.2/cactus.png');
      this.load.image('node', 'img/assets_v0.0.2/node.png');
      // debug value
      this.game.time.advancedTiming = true;
    },
    create : function() {
      this.game.world.setBounds(0, 0, this.game.width, this.game.height * 2);

      for (var i = 0; i < 2; i++) {
        this.game.add.sprite(0,this.game.height * i,'desert');
      }
      for (var i = 0; i < 10; i++) {
        var cactus = this.game.add.sprite(this.game.rnd.between(10,this.game.world.width-10), this.game.rnd.between(0,this.game.world.height),'cactus');
      }
      var nodeCount = 15
      for (var i = 0; i < nodeCount; i++) {
        var node = this.game.add.button(this.game.world.centerX - 27, i * (this.game.world.height / nodeCount), 'node', function () {
          scope.$emit('openNode',node);
        }, this, 2, 1, 0);
        node.scale.setTo(0.6,0.6);
      }
      this.init();
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
