var menuState = {
  create: function () {
    var titleLabel = game.add.text(game.world.centerX, 80, "Game Uppgift", {
      font: "50px Arial",
      fill: "#ffffff",
    });
    titleLabel.anchor.setTo(0.5, 0.5);

    var startLabel = game.add.text(
      game.world.centerX,
      game.world.centerY,
      "Press the UP arrow key to start",
      { font: "25px Arial", fill: "#ffffff" }
    );
    startLabel.anchor.setTo(0.5, 0.5);

    var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.addOnce(this.start, this);
  },

  start: function () {
    game.state.start("play");
  },
};
