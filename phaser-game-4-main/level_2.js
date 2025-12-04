const level2State = {
  key: "level2State",

  create: function () {
    console.log("Level 2 scene created");
    this.registry.set("currentLevel", "level2State");

    // Underwater parallax background layers (69 tiles wide)
    // Far layers need to be larger since they scroll slower
    let bgFar = this.add.image(-1000, 0, "underwater-far");
    bgFar.setOrigin(0, 0);
    bgFar.setDisplaySize(69 * 32 * 6, 25 * 32 * 4);
    bgFar.setScrollFactor(0.2);

    let bgSand = this.add.image(-800, 0, "underwater-sand");
    bgSand.setOrigin(0, 0);
    bgSand.setDisplaySize(69 * 32 * 4, 25 * 32 * 4);
    bgSand.setScrollFactor(0.4);

    let bgFg1 = this.add.image(-500, 0, "underwater-fg1");
    bgFg1.setOrigin(0, 0);
    bgFg1.setDisplaySize(69 * 32 * 2.5, 25 * 32 * 4);
    bgFg1.setScrollFactor(0.6);

    let bgFg2 = this.add.image(-300, 0, "underwater-fg2");
    bgFg2.setOrigin(0, 0);
    bgFg2.setDisplaySize(69 * 32 * 2, 25 * 32 * 4);
    bgFg2.setScrollFactor(0.8);

    try {
      this.map = this.make.tilemap({ key: "map2" });
      console.log("Map 2 loaded:", this.map);
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
        "Cave",
        [groundTileset, villageTileset],
        0,
        0
      );
      const layer2 = this.map.createLayer(
        "Ground",
        [groundTileset, villageTileset],
        0,
        0
      );
      const layer3 = this.map.createLayer(
        "Props",
        [groundTileset, villageTileset],
        0,
        0
      );

      layer1.setScale(4);
      layer2.setScale(4);
      layer3.setScale(4);

      console.log("Layers created:", layer1, layer2, layer3);

      // Set collision on Ground layer (layer2), not Cave
      if (layer2) {
        layer2.setCollisionByExclusion([-1]);
        this.layer1 = layer2;
        this.debugGraphics = this.add.graphics();
      }

      this.physics.world.setBounds(
        0,
        0,
        this.map.widthInPixels * 4,
        this.map.heightInPixels * 4
      );
      // Underwater gravity - very low for swimming
      this.physics.world.gravity.y = 300;
      this.debugEnabled = true;
      this.physics.world.drawDebug = this.debugEnabled;
    } catch (error) {
      console.error("Tilemap error:", error);
    }

    this.player = this.physics.add.sprite(400, 1600, "player");
    this.player.setBounce(0.1);
    this.player.setScale(0.25);
    // Underwater physics: slower max velocity and high drag for gliding
    this.player.body.setMaxVelocity(300, 600);
    this.player.body.setDrag(100, 50);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 1 }),
      frameRate: 8,
      repeat: -1,
    });

    // Only create enemy animation if the spritesheet loaded correctly
    if (
      this.textures.exists("enemy") &&
      this.textures.get("enemy").frameTotal > 1
    ) {
      this.anims.create({
        key: "enemyWalk",
        frames: this.anims.generateFrameNumbers("enemy", { start: 0, end: 1 }),
        frameRate: 6,
        repeat: -1,
      });
    }

    // Create portal animation
    if (
      this.textures.exists("portal") &&
      this.textures.get("portal").frameTotal > 1
    ) {
      this.anims.create({
        key: "portalSpin",
        frames: this.anims.generateFrameNumbers("portal", {
          start: 0,
          end: 10,
        }),
        frameRate: 12,
        repeat: -1,
      });
    }

    this.coinsList = [];

    // Coin positions
    let coinPositions = [
      [1090, 2250],
      [3350, 2250],
      [3600, 1700],
    ];

    coinPositions.forEach((pos, i) => {
      let coin = this.physics.add.sprite(pos[0], pos[1], "coin");
      coin.setScale(0.1);
      coin.body.setAllowGravity(false);
      coin.setData("collected", false);

      this.tweens.add({
        targets: coin,
        y: coin.y - 20,
        duration: 1000,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
        delay: i * 200,
      });

      this.coinsList.push(coin);
    });

    // Create teleport (hidden until all coins collected)
    this.teleport = this.physics.add.sprite(4800, 1700, "portal");
    this.teleport.setScale(0.3);
    this.teleport.body.setAllowGravity(false);
    this.teleport.setVisible(false);
    this.teleport.body.enable = false;
    if (this.anims.exists("portalSpin")) {
      this.teleport.anims.play("portalSpin", true);
    }

    this.teleportActivated = false;

    // Create enemies
    this.enemiesList = [];

    let enemyData = [
      { x: 700, y: 1400, minX: 700, maxX: 1350 }, // Left side enemy
      { x: 4100, y: 1400, minX: 4150, maxX: 4650 }, // Right side enemy
    ];

    enemyData.forEach((data) => {
      let enemy = this.physics.add.sprite(data.x, data.y, "enemy");
      enemy.setScale(0.25);

      enemy.body.setSize(391, 499);

      if (this.anims.exists("enemyWalk")) {
        enemy.anims.play("enemyWalk", true);
      } else {
        enemy.anims.play("walk", true);
      }

      enemy.body.setVelocityX(150);
      enemy.setData("minX", data.minX);
      enemy.setData("maxX", data.maxX);
      enemy.setData("direction", 1);

      this.enemiesList.push(enemy);
    });

    // Instant death
    this.deathZone = this.add.zone(3950, 2100, 350, 100);
    this.physics.world.enable(this.deathZone);
    this.deathZone.body.setAllowGravity(false);
    this.deathZone.body.moves = false;

    if (this.layer1) {
      this.physics.add.collider(this.player, this.layer1);
      this.enemiesList.forEach((enemy) => {
        this.physics.add.collider(enemy, this.layer1);
      });
    }

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

    this.cameras.main.setBounds(0, 0, 69 * 32 * 4, 25 * 32 * 4);
    this.cameras.main.startFollow(this.player, true, 0.06, 0.06);
    this.cameras.main.setZoom(0.6);

    // Underwater color filter - blue tint overlay
    this.cameras.main.setAlpha(0.9);
    this.cameras.main.fadeIn(1000, 0, 50, 100);

    // Add blue overlay rectangle covering entire world
    let worldWidth = 69 * 32 * 4;
    let worldHeight = 25 * 32 * 4;
    this.underwaterOverlay = this.add.rectangle(
      worldWidth / 2,
      worldHeight / 2,
      worldWidth,
      worldHeight,
      0x0066cc,
      0.25
    );
    this.underwaterOverlay.setDepth(1000);
    this.underwaterOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.score = 0;
    this.scoreText = this.add.text(32, 32, "Score: 0", {
      fontSize: "60px",
      fill: "#fff",
      backgroundColor: "#00000060",
    });
    this.scoreText.setScrollFactor(0);
    this.scoreText.setDepth(2000);

    this.hp = 3;
    this.hpText = this.add.text(32, 110, "HP: ❤❤❤", {
      fontSize: "60px",
      fill: "#ff0000",
      backgroundColor: "#00000060",
    });
    this.hpText.setScrollFactor(0);
    this.hpText.setDepth(2000);

    this.isInvincible = false;

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

    // Underwater movement - slower and more gradual
    if (this.cursors.left.isDown || this.aKey.isDown) {
      this.player.setAccelerationX(-400);
      this.player.anims.play("walk", true);
      this.player.flipX = false;
    } else if (this.cursors.right.isDown || this.dKey.isDown) {
      this.player.setAccelerationX(400);
      this.player.anims.play("walk", true);
      this.player.flipX = true;
    } else {
      this.player.setAccelerationX(0);
      this.player.anims.stop();
    }

    // Underwater swimming - hold to swim up continuously
    if (this.cursors.up.isDown || this.wKey.isDown) {
      this.player.setAccelerationY(-800);
    } else if (this.cursors.down.isDown || this.sKey.isDown) {
      this.player.setAccelerationY(800);
    } else {
      this.player.setAccelerationY(0);
    }

    // Check coin
    this.coinsList.forEach((coin) => {
      if (
        !coin.getData("collected") &&
        this.physics.overlap(this.player, coin)
      ) {
        console.log("Coin collected!");
        coin.setData("collected", true);
        coin.destroy();
        this.score += 10;
        this.scoreText.setText("Score: " + this.score);

        // Check if score reached 30
        if (this.score >= 30 && !this.teleportActivated) {
          console.log("30 points reached! Teleport activated!");
          this.teleportActivated = true;
          this.teleport.setVisible(true);
          this.teleport.body.enable = true;

          // Flash effect when teleport appears
          this.tweens.add({
            targets: this.teleport,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
              this.teleport.alpha = 1;
            },
          });
        }
      }
    });

    // Check teleport collision, go to level 2
    if (
      this.teleportActivated &&
      this.physics.overlap(this.player, this.teleport)
    ) {
      console.log("Player entered teleport! Level complete!");
      this.registry.set("finalScore", this.score);
      console.log("Going to level 2");
      this.scene.start("level2State");
      return;
    }

    // Update enemies
    this.enemiesList.forEach((enemy) => {
      if (enemy.x >= enemy.getData("maxX")) {
        enemy.setVelocityX(-150);
        enemy.setData("direction", -1);
        enemy.setFlipX(false);
      } else if (enemy.x <= enemy.getData("minX")) {
        enemy.setVelocityX(150);
        enemy.setData("direction", 1);
        enemy.setFlipX(true);
      }

      // Check collision with player
      if (!this.isInvincible && this.physics.overlap(this.player, enemy)) {
        // Take damage
        this.hp -= 1;
        if (this.hp < 0) this.hp = 0;
        let hearts = "";

        for (let i = 0; i < this.hp; i++) {
          hearts += "❤";
        }
        this.hpText.setText("HP: " + (hearts || "💀"));

        console.log("Player took damage! HP remaining:", this.hp);

        // Knockback player
        this.player.setVelocityX(enemy.getData("direction") * -300);
        this.player.setVelocityY(-400);

        // Check if dead
        if (this.hp <= 0) {
          console.log("Player died! Game over");
          this.registry.set("finalScore", this.score);
          this.scene.start("GameOverState");
          return;
        }

        this.isInvincible = true;
        this.tweens.add({
          targets: this.player,
          alpha: 0.3,
          duration: 100,
          yoyo: true,
          repeat: 7,
          onComplete: () => {
            this.player.alpha = 1;
          },
        });

        // Remove invincibility after duration
        this.time.delayedCall(1500, () => {
          this.isInvincible = false;
          console.log("Invincibility ended");
        });
      }
    });

    // Check death zone collision (instant kill)
    if (this.physics.overlap(this.player, this.deathZone)) {
      console.log("Player hit death zone! Instant kill");
      this.registry.set("finalScore", this.score);
      this.scene.start("GameOverState");
      return;
    }

    // No fall death in level 2 - bottom is safe
  },
};
