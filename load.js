const loadState = {
  key: "loadState",

  preload: function () {
    console.log("Loading assets...");

    let width = this.cameras.main.width;
    let height = this.cameras.main.height;

    let bg = this.add.rectangle(0, 0, width, height, 0x000000);
    bg.setOrigin(0, 0);

    // Loading text
    let loadingText = this.add.text(width / 2, height / 2 - 50, "Loading...", {
      fontSize: "48px",
      fontFamily: "Arial Black",
      fill: "#ffffff",
      stroke: "#00ff00",
      strokeThickness: 4,
    });
    loadingText.setOrigin(0.5, 0.5);

    // Progress box
    let progressBox = this.add.graphics();
    progressBox.lineStyle(3, 0x00ff00, 1);
    progressBox.strokeRect(width / 2 - 160, height / 2 + 20, 320, 50);
    progressBox.fillStyle(0x111111, 1);
    progressBox.fillRect(width / 2 - 160, height / 2 + 20, 320, 50);

    let progressBar = this.add.graphics();

    // Percentage text
    let percentText = this.make.text({
      x: width / 2,
      y: height / 2 + 45,
      text: "0%",
      style: {
        font: "bold 24px Arial",
        fill: "#00ff00",
      },
    });
    percentText.setOrigin(0.5, 0.5);

    this.load.on("progress", (value) => {
      percentText.setText(parseInt(value * 100) + "%");
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 157, height / 2 + 23, 314 * value, 44);
    });

    // Artificial delay to make it dramatic
    this.minLoadTime = 2000;
    this.loadStartTime = Date.now();

    this.load.on("complete", () => {
      // Fade out effect
      this.tweens.add({
        targets: [loadingText, progressBox, progressBar, percentText],
        alpha: 0,
        duration: 500,
        delay: 200,
      });
    });

    this.load.image("sky", "assets/images/sky2.jpg");
    this.load.spritesheet("player", "assets/images/player.png", {
      frameWidth: 220,
      frameHeight: 500,
    });
    this.load.image("coin", "assets/images/coin.png");

    this.load.image(
      "ground-tiles",
      "assets/levels/tileset/TX Tileset Ground.png"
    );
    this.load.image(
      "village-tiles",
      "assets/levels/tileset/TX Village Props.png"
    );
    this.load.tilemapTiledJSON(
      "map",
      "assets/levels/Pixel art platformer.json"
    );
  },

  create: function () {
    console.log("Load complete - starting menu");

    // Wait for minimum load time before transitioning
    let elapsed = Date.now() - this.loadStartTime;
    let remaining = Math.max(0, this.minLoadTime - elapsed);

    this.time.delayedCall(remaining, () => {
      this.scene.start("menuState");
    });
  },
};
