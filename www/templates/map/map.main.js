window.createGame = function(scope, injector) {
  'use strict';

  console.log(document.querySelector('#map_canvas'));
  var game = new Phaser.Game("100%", "100%", Phaser.AUTO, 'map_canvas', {
    preload: preload,
    create: create,
    update: update
  })

  function preload() {
    game.load.image('cloud1', 'img/cloud1.png');
    game.load.image('cloud2', 'img/cloud2.png');
    game.load.image('cloud3', 'img/cloud3.png');
    game.load.image('cloud4', 'img/cloud4.png');
    game.load.image('cloud5', 'img/cloud5.png');
    game.load.image('cloud6', 'img/cloud6.png');
    game.load.image('cloud7', 'img/cloud7.png');
    game.load.image('path', 'img/path.png');
    game.load.image('node', 'img/node.png');
  }

  function create() {
    game.stage.backgroundColor = "#AAD9E8";
    game.world.setBounds(0, 0, game.width, game.height * 3);
    init();
    var cloudCount = 20;
    for (var i = 0; i < cloudCount; i++) {
      var cloud = game.add.sprite(game.world.randomX, game.world.randomY, 'cloud' + game.rnd.between(1, 7));
      var scaleFactor = game.rnd.between(3,6)/10;
      cloud.scale.setTo(scaleFactor, scaleFactor);
      game.physics.arcade.enable(cloud);
      cloud.body.velocity.x = game.rnd.between(-5, -75);
      cloud.autoCull = true;
      cloud.checkWorldBounds = true;
      cloud.events.onOutOfBounds.add(resetSprite, this);
    }

    // game.add.sprite(game.width / 2, 0, 'path').scale.setTo(0.5, 0.5);

    var nodeCount = 20
    for (var i = 0; i < nodeCount; i++) {
      var node = game.add.sprite((i*10)+50, i * (game.world.height / nodeCount), 'node');
      node.scale.setTo(0.5, 0.5);
    }

  }
  function resetSprite(sprite) {
    sprite.x = game.world.bounds.right;
  }

  function init() {
    game.camera.y = game.height * 2;
  }

  function update() {
    dragMap(this);
  }

  function dragMap(ref) {
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
  }

  function render() {
  }
  scope.$on('$destroy', function() {
    // phaser destroy is broken, check for fix
    // game.destroy(); // Clean up the game when we leave this scope
  });
};
