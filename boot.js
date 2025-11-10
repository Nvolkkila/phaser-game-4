var bootState = {
  preload: function () {
    console.log("Boot preload started");
    game.load.image("sky", "assets/images/sky.png");
    game.load.image("player", "assets/images/player.png");
    game.load.image("coin", "assets/images/coin.png");
    game.load.image("floor", "assets/images/floor.png");
    console.log("Boot preload finished");
  },

  create: function () {
    console.log("Boot create - starting play state");
    game.state.start("play");
  },
};
