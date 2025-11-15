const menuState = {
  key: "menuState",

  create: function () {
    console.log("Menu state created");

    let width = this.cameras.main.width;
    let height = this.cameras.main.height;

    let titleText = this.add.text(width / 2, height / 2 - 100, "GAME TITLE", {
      fontSize: "72px",
      fontFamily: "Arial Black",
      fill: "#ffffff",
      stroke: "#00ff00",
      strokeThickness: 4,
    });
    titleText.setOrigin(0.5);

    let startText = this.add.text(
      width / 2,
      height / 2 + 50,
      "Press SPACE to Start",
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
