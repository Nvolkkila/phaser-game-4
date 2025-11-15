console.log("Creating Phaser 3 game...");

const config = {
  type: Phaser.AUTO,
  width: 1400,
  height: 840,
  parent: "gameDiv",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 2500 },
      debug: true,
      tileBias: 32,
    },
  },
  scene: [loadState, menuState, playState, GameOverState],
};

const game = new Phaser.Game(config);
console.log("Phaser game initialized");
