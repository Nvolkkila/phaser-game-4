var playState = {
  create: function () {
    console.log("Play state create started");
    game.physics.startSystem(Phaser.Physics.ARCADE);

    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 7; j++) {
        game.add.sprite(i * 100, j * 70, "sky");
      }
    }

    this.player = game.add.sprite(100, 200, "player");
    game.physics.arcade.enable(this.player);
    this.player.body.gravity.y = 500;
    this.player.body.collideWorldBounds = true;

    this.floors = game.add.group();
    this.floors.enableBody = true;
    for (var i = 0; i < 10; i++) {
      var floor = this.floors.create(i * 50, 300, "floor");
      floor.body.immovable = true;
    }

    this.coin = game.add.sprite(250, 250, "coin");
    game.physics.arcade.enable(this.coin);

    this.cursors = game.input.keyboard.createCursorKeys();

    this.scoreText = game.add.text(10, 10, "Score: 0", {
      font: "20px Arial",
      fill: "#fff",
    });
    game.global.score = 0;
    console.log("Play state create finished - game should be visible");
  },

  update: function () {
    game.physics.arcade.collide(this.player, this.floors);
    game.physics.arcade.overlap(
      this.player,
      this.coin,
      this.takeCoin,
      null,
      this
    );

    this.player.body.velocity.x = 0;

    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -150;
    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = 150;
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.body.velocity.y = -300;
    }
  },

  takeCoin: function (player, coin) {
    coin.kill();
    game.global.score += 10;
    this.scoreText.text = "Score: " + game.global.score;
  },
};
