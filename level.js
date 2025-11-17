const levelState = {
  key: "levelState",

  create: function () {
    console.log("Levelstate created");

    let width = this.cameras.main.width;
    let height = this.cameras.main.height;

    let currentLevel = this.registry.get("currentLevel") || 2;
    // Increment for next level
    this.registry.set("currentLevel", currentLevel + 1);

    let titleText = this.add.text(
      width / 2,
      height / 2 - 100,
      "Level " + currentLevel,
      {
        fontSize: "72px",
        fontFamily: "Arial Black",
        fill: "#ffffff",
        stroke: "#00ff00",
        strokeThickness: 4,
      }
    );
    titleText.setOrigin(0.5);

    let startText = this.add.text(
      width / 2,
      height / 2 + 50,
      "Press SPACE to continue",
      {
        fontSize: "32px",
        fill: "#fff",
      }
    );
    startText.setOrigin(0.5);

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("playState");
    });
  },
};
