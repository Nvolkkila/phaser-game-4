console.log("Creating Phaser 3 game...");

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload() {
    console.log("Boot preload");
    this.load.image("sky", "assets/images/sky.png");
    this.load.spritesheet("player", "assets/images/player.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("coin", "assets/images/coin.png", {
      frameWidth: 20,
      frameHeight: 20,
    });
    this.load.image("floor", "assets/images/floor.png");
  }

  create() {
    console.log("Boot create - starting play");
    this.scene.start("PlayScene");
  }
}

class PlayScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayScene" });
    this.score = 0;
  }

  create() {
    console.log("Play scene created");

    let bg = this.add.image(500, 350, "sky");
    bg.setDisplaySize(1000, 700);

    this.floors = this.physics.add.staticGroup();
    for (let i = 0; i < 20; i++) {
      this.floors.create(i * 50 + 25, 650, "floor");
    }

    this.player = this.physics.add.sprite(200, 400, "player");
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2);

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 1 }),
      frameRate: 8,
      repeat: -1,
    });

    this.coin = this.physics.add.sprite(500, 500, "coin");
    this.coin.setScale(2);

    this.anims.create({
      key: "spin",
      frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 0 }),
      frameRate: 10,
      repeat: -1,
    });
    this.coin.play("spin");

    this.physics.add.collider(this.player, this.floors);
    this.physics.add.overlap(
      this.player,
      this.coin,
      this.collectCoin,
      null,
      this
    );

    this.cursors = this.input.keyboard.createCursorKeys();

    this.scoreText = this.add.text(32, 32, "Score: 0", {
      fontSize: "40px",
      fill: "#fff",
    });

    console.log("Play scene ready");
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-320);
      this.player.play("walk", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(320);
      this.player.play("walk", true);
    } else {
      this.player.setVelocityX(0);
      this.player.stop();
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-660);
    }
  }
  collectCoin(player, coin) {
    coin.destroy();
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 700,
  parent: "gameDiv",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 600 },
      debug: false,
    },
  },
  scene: [BootScene, PlayScene],
};

const game = new Phaser.Game(config);
console.log("Phaser game initialized");
