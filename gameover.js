var GameOverState = {
  create: function () {
    var gameOverLabel = game.add.text(
      game.world.centerX,
      game.world.centerY,
      "Game Over",
      { font: "40px Arial", fill: "#ffffff" }
    );
    gameOverLabel.anchor.setTo(0.5, 0.5);
  },
};
