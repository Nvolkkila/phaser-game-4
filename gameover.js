const GameOverState = {
  key: "GameOverState",

  create: function () {
    console.log("Game Over state created");

    let width = this.cameras.main.width;
    let height = this.cameras.main.height;

    let gameOverText = this.add.text(width / 2, height / 2 - 100, "GAME OVER", {
      fontSize: "64px",
      fill: "#ff0000",
    });
    gameOverText.setOrigin(0.5);

    let scoreText = this.add.text(
      width / 2,
      height / 2,
      "Final Score: " + this.registry.get("finalScore"),
      {
        fontSize: "32px",
        fill: "#fff",
      }
    );
    scoreText.setOrigin(0.5);

    let restartText = this.add.text(
      width / 2,
      height / 2 + 100,
      "Press SPACE to Restart",
      {
        fontSize: "24px",
        fill: "#fff",
      }
    );
    restartText.setOrigin(0.5);

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("playState");
    });
  },
};
