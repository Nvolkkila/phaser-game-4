var loadState = {
  preload: function () {
    var gfx = game.add.graphics(0, 0);
    gfx.beginFill(0xffffff);
    gfx.drawRect(0, 0, 130, 20);
    var texture = gfx.generateTexture();
    gfx.destroy();

    var progressBar = game.add.sprite(
      game.world.centerX,
      game.world.centerY,
      texture
    );
    progressBar.anchor.setTo(0.5, 0.5);

    game.load.onFileComplete.add(function (progress) {
      progressBar.scale.x = progress / 100;
    });

    game.load.image("sky", "assets/images/sky.png");
    game.load.image("player", "assets/images/player.png");
    game.load.image("coin", "assets/images/coin.png");
    game.load.image("floor", "assets/images/floor.png");
    game.load.image("wall", "assets/images/wall.png");
    game.load.image("enemy", "assets/images/enemy.png");
  },

  create: function () {
    game.state.start("menu");
  },
};
