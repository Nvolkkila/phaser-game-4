const playState = {
  key: "playState",

  create: function () {
    console.log("Play scene created");

    let bg = this.add.image(0, 0, "sky");
    bg.setOrigin(0, 0);
    bg.setDisplaySize(39 * 32 * 4, 25 * 32 * 4);
    bg.setScrollFactor(0.85);

    try {
      this.map = this.make.tilemap({ key: "map" });
      console.log("Map loaded:", this.map);
      console.log("Tilesets in map:", this.map.tilesets);

      const groundTileset = this.map.addTilesetImage(
        "TX Tileset Ground",
        "ground-tiles"
      );
      const villageTileset = this.map.addTilesetImage(
        "TX Village Props",
        "village-tiles"
      );

      console.log("Tilesets added:", groundTileset, villageTileset);

      const layer1 = this.map.createLayer(
        "Tile Layer 1",
        [groundTileset, villageTileset],
        0,
        0
      );
      const layer2 = this.map.createLayer(
        "Tile Layer 2",
        [groundTileset, villageTileset],
        0,
        0
      );
      const layer3 = this.map.createLayer(
        "Tile Layer 3",
        [groundTileset, villageTileset],
        0,
        0
      );

      layer1.setScale(4);
      layer2.setScale(4);
      layer3.setScale(4);

      console.log("Layers created:", layer1, layer2, layer3);

      if (layer1) {
        layer1.setCollisionByExclusion([-1]);
        this.layer1 = layer1;
        this.debugGraphics = this.add.graphics();
      }

      this.physics.world.setBounds(
        0,
        0,
        this.map.widthInPixels * 4,
        this.map.heightInPixels * 4
      );
      this.debugEnabled = true;
      this.physics.world.drawDebug = this.debugEnabled;
    } catch (error) {
      console.error("Tilemap error:", error);
    }

    this.player = this.physics.add.sprite(400, 1600, "player");
    this.player.setBounce(0.1);
    this.player.setScale(0.25);
    this.player.body.setMaxVelocity(500, 1500);

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 1 }),
      frameRate: 8,
      repeat: -1,
    });

    // Create coins group
    this.coins = this.physics.add.group();

    // Define coin positions [x, y]
    let coinPositions = [
      [1090, 2250],
      [3350, 2250],
      [3600, 1890],
    ];

    // Create 3 individual coins at specific positions
    coinPositions.forEach((pos, i) => {
      let coin = this.coins.create(pos[0], pos[1], "coin");
      coin.setScale(0.1);
      coin.body.setAllowGravity(false);

      // Bob up and down animation
      this.tweens.add({
        targets: coin,
        y: coin.y - 20,
        duration: 1000,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
        delay: i * 200, // Stagger the animation
      });
    });

    if (this.layer1) {
      this.physics.add.collider(this.player, this.layer1);
    }

    this.physics.add.overlap(
      this.player,
      this.coins,
      this.collectCoin,
      null,
      this
    );

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.input.keyboard.on("keydown-F", () => {
      this.debugEnabled = !this.debugEnabled;
      this.physics.world.drawDebug = this.debugEnabled;
      this.debugGraphics.clear();
      if (this.debugEnabled && this.layer1) {
        this.layer1.renderDebug(this.debugGraphics, {
          tileColor: null,
          collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128),
          faceColor: new Phaser.Display.Color(40, 39, 37, 255),
        });
      }
    });

    this.cameras.main.setBounds(0, 0, 39 * 32 * 4, 25 * 32 * 4);
    this.cameras.main.startFollow(this.player, true, 0.06, 0.06);
    this.cameras.main.setZoom(0.7);

    this.score = 0;
    this.scoreText = this.add.text(32, 32, "Score: 0", {
      fontSize: "60px",
      fill: "#fff",
      backgroundColor: "#00000060",
    });
    this.scoreText.setScrollFactor(0);

    if (this.debugEnabled && this.layer1) {
      this.layer1.renderDebug(this.debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255),
      });
    }

    console.log("Play scene ready");
  },

  update: function () {
    if (!this.player) return;

    if (this.cursors.left.isDown || this.aKey.isDown) {
      this.player.setVelocityX(-500);
      this.player.anims.play("walk", true);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown || this.dKey.isDown) {
      this.player.setVelocityX(500);
      this.player.anims.play("walk", true);
      this.player.flipX = false;
    } else {
      this.player.setVelocityX(0);
      this.player.anims.stop();
    }

    if (
      (this.cursors.up.isDown || this.wKey.isDown) &&
      this.player.body.blocked.down
    ) {
      this.player.setVelocityY(-1200);
    }

    if (this.player.y > 25 * 32 * 4) {
      console.log("Player fell! Triggering game over at y:", this.player.y);
      this.registry.set("finalScore", this.score);
      this.scene.start("GameOverState");
    }
  },

  collectCoin: function (player, coin) {
    coin.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);
  },
};
