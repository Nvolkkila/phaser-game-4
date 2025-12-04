const level2State = {
  key: "level2State",

  create: function () {
    this.registry.set("currentLevel", "level2State");

    // Underwater parallax background layers
    const bgLayers = [
      { key: "underwater-far", x: -1000, scale: 6, scrollFactor: 0.2 },
      { key: "underwater-sand", x: -800, scale: 4, scrollFactor: 0.4 },
      { key: "underwater-fg1", x: -500, scale: 2.5, scrollFactor: 0.6 },
      { key: "underwater-fg2", x: -300, scale: 2, scrollFactor: 0.8 },
    ];

    bgLayers.forEach((layer) => {
      const bg = this.add.image(layer.x, 0, layer.key);
      bg.setOrigin(0, 0);
      bg.setDisplaySize(69 * 32 * layer.scale, 25 * 32 * 4);
      bg.setScrollFactor(layer.scrollFactor);
    });

    // Setup tilemap
    try {
      this.map = this.make.tilemap({ key: "map2" });
      const groundTileset = this.map.addTilesetImage(
        "TX Tileset Ground",
        "ground-tiles"
      );
      const villageTileset = this.map.addTilesetImage(
        "TX Village Props",
        "village-tiles"
      );

      const layers = [
        this.map.createLayer("Cave", [groundTileset, villageTileset], 0, 0),
        this.map.createLayer("Ground", [groundTileset, villageTileset], 0, 0),
        this.map.createLayer("Props", [groundTileset, villageTileset], 0, 0),
      ];

      layers.forEach((layer) => layer.setScale(4));

      // Set collision on Ground layer
      if (layers[1]) {
        layers[1].setCollisionByExclusion([-1]);
        this.layer1 = layers[1];
        this.debugGraphics = this.add.graphics();
      }

      this.physics.world.setBounds(
        0,
        0,
        this.map.widthInPixels * 4,
        this.map.heightInPixels * 4
      );
      this.physics.world.gravity.y = 300;
      this.debugEnabled = true;
    } catch (error) {
      console.error("Tilemap error:", error);
    }

    // Create player
    this.player = this.physics.add.sprite(400, 1600, "player");
    this.player.setBounce(0.1);
    this.player.setScale(0.25);
    this.player.body.setMaxVelocity(300, 600);
    this.player.body.setDrag(100, 50);
    this.player.setCollideWorldBounds(true);

    if (this.layer1) {
      this.physics.add.collider(this.player, this.layer1);
    }

    // Create animations
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 1 }),
      frameRate: 8,
      repeat: -1,
    });

    if (
      this.textures.exists("fish") &&
      this.textures.get("fish").frameTotal > 1
    ) {
      this.anims.create({
        key: "fishSwim",
        frames: this.anims.generateFrameNumbers("fish", { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });
    }

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

    // Create portal at bottom-right corner
    this.teleport = this.physics.add.sprite(8700, 3000, "portal");
    this.teleport.setScale(0.3);
    this.teleport.body.setAllowGravity(false);
    if (this.anims.exists("portalSpin")) {
      this.teleport.anims.play("portalSpin", true);
    }

    // Create large enemy fish
    this.enemiesList = [];
    const enemyData = [
      { x: 700, y: 1000, minX: 700, maxX: 1350 },
      { x: 2400, y: 1000, minX: 2700, maxX: 3350 },
      { x: 4100, y: 1000, minX: 4150, maxX: 4650 },
      { x: 6100, y: 1000, minX: 6150, maxX: 6850 },
      { x: 7000, y: 1000, minX: 7150, maxX: 8000 },
    ];

    enemyData.forEach((data) => {
      const enemy = this.physics.add.sprite(data.x, data.y, "fish");
      enemy.setScale(1.5);
      enemy.body.setAllowGravity(false);
      if (this.anims.exists("fishSwim")) {
        enemy.anims.play("fishSwim", true);
      }
      enemy.body.setVelocityX(150);
      enemy.setData("minX", data.minX);
      enemy.setData("maxX", data.maxX);
      enemy.setData("direction", 1);
      this.enemiesList.push(enemy);
    });

    // Create small ambient fish
    this.smallFishList = [];
    const smallFishData = [
      { x: 1500, y: 2000, minX: 1200, maxX: 2000, minY: 1100, maxY: 3200 },
      { x: 3000, y: 2300, minX: 2500, maxX: 3500, minY: 1100, maxY: 3200 },
      { x: 5000, y: 2600, minX: 4500, maxX: 5500, minY: 1100, maxY: 3200 },
      { x: 6500, y: 2900, minX: 6000, maxX: 7000, minY: 1100, maxY: 3200 },
      { x: 2000, y: 2400, minX: 1500, maxX: 2500, minY: 1100, maxY: 3200 },
      { x: 4500, y: 2700, minX: 4000, maxX: 5000, minY: 1100, maxY: 3200 },
      { x: 7500, y: 2200, minX: 7000, maxX: 8000, minY: 1100, maxY: 3200 },
      { x: 1000, y: 3000, minX: 600, maxX: 1400, minY: 1100, maxY: 3200 },
      { x: 5500, y: 3200, minX: 5000, maxX: 6000, minY: 1100, maxY: 3200 },
      { x: 8000, y: 2500, minX: 7500, maxX: 8500, minY: 1100, maxY: 3200 },
      { x: 1800, y: 1800, minX: 1400, maxX: 2200, minY: 1100, maxY: 3200 },
      { x: 3500, y: 2800, minX: 3000, maxX: 4000, minY: 1100, maxY: 3200 },
      { x: 5300, y: 2200, minX: 4800, maxX: 5800, minY: 1100, maxY: 3200 },
      { x: 7000, y: 2600, minX: 6500, maxX: 7500, minY: 1100, maxY: 3200 },
      { x: 2500, y: 3100, minX: 2000, maxX: 3000, minY: 1100, maxY: 3200 },
      { x: 4200, y: 2400, minX: 3700, maxX: 4700, minY: 1100, maxY: 3200 },
      { x: 6800, y: 3000, minX: 6300, maxX: 7300, minY: 1100, maxY: 3200 },
      { x: 800, y: 2100, minX: 400, maxX: 1200, minY: 1100, maxY: 3200 },
      { x: 5800, y: 2900, minX: 5300, maxX: 6300, minY: 1100, maxY: 3200 },
      { x: 8300, y: 3100, minX: 7800, maxX: 8800, minY: 1100, maxY: 3200 },
    ];

    smallFishData.forEach((data) => {
      const fish = this.physics.add.sprite(data.x, data.y, "fish");
      fish.setScale(0.4);
      fish.body.setAllowGravity(false);
      fish.body.setFriction(0);
      fish.body.setBounce(1, 1);
      fish.body.setCollideWorldBounds(true);
      if (this.anims.exists("fishSwim")) {
        fish.anims.play("fishSwim", true);
      }
      fish.body.setVelocity(
        Phaser.Math.Between(80, 150),
        Phaser.Math.Between(40, 80)
      );
      fish.setData("minX", data.minX);
      fish.setData("maxX", data.maxX);
      fish.setData("minY", data.minY);
      fish.setData("maxY", data.maxY);
      this.smallFishList.push(fish);
    });

    // Fish wall collision handler
    this.fishHitWall = (fish) => {
      const speed = Math.min(
        Math.sqrt(fish.body.velocity.x ** 2 + fish.body.velocity.y ** 2),
        150
      );
      const angle45Speed = speed / Math.sqrt(2);

      if (fish.body.blocked.left) {
        fish.x += 15;
        fish.body.velocity.x = angle45Speed;
        fish.body.velocity.y =
          angle45Speed * (fish.body.velocity.y > 0 ? 1 : -1);
      }
      if (fish.body.blocked.right) {
        fish.x -= 15;
        fish.body.velocity.x = -angle45Speed;
        fish.body.velocity.y =
          angle45Speed * (fish.body.velocity.y > 0 ? 1 : -1);
      }
      if (fish.body.blocked.up) {
        fish.y += 15;
        fish.body.velocity.y = angle45Speed;
        fish.body.velocity.x =
          angle45Speed * (fish.body.velocity.x > 0 ? 1 : -1);
      }
      if (fish.body.blocked.down) {
        fish.y -= 15;
        fish.body.velocity.y = -angle45Speed;
        fish.body.velocity.x =
          angle45Speed * (fish.body.velocity.x > 0 ? 1 : -1);
      }
      fish.setFlipX(fish.body.velocity.x < 0);
    };

    // Add fish colliders
    if (this.layer1) {
      this.smallFishList.forEach((fish) => {
        this.physics.add.collider(
          fish,
          this.layer1,
          this.fishHitWall,
          null,
          this
        );
      });
    }

    this.physics.add.collider(
      this.smallFishList,
      this.smallFishList,
      (fish1, fish2) => {
        fish1.setFlipX(fish1.body.velocity.x < 0);
        fish2.setFlipX(fish2.body.velocity.x < 0);
      }
    );

    // Setup input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.input.keyboard.on("keydown-F", () => {
      this.debugEnabled = !this.debugEnabled;
      this.physics.world.drawDebug = this.debugEnabled;
      this.debugGraphics?.clear();

      if (this.debugEnabled && this.layer1) {
        this.layer1.renderDebug(this.debugGraphics, {
          tileColor: null,
          collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128),
          faceColor: new Phaser.Display.Color(40, 39, 37, 255),
        });
      }
    });

    // Setup camera and underwater effect
    const worldWidth = 69 * 32 * 4;
    const worldHeight = 25 * 32 * 4;

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.06, 0.06);
    this.cameras.main.setZoom(0.7);
    this.cameras.main.setAlpha(0.9);
    this.cameras.main.fadeIn(1000, 0, 50, 100);

    this.underwaterOverlay = this.add.rectangle(
      worldWidth / 2,
      worldHeight / 2,
      worldWidth,
      worldHeight,
      0x0066cc,
      0.7
    );
    this.underwaterOverlay.setDepth(1000);
    this.underwaterOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);

    // Setup UI
    this.score = 0;
    this.scoreText = this.add
      .text(32, 32, "Score: 0", {
        fontSize: "60px",
        fill: "#fff",
        backgroundColor: "#00000060",
      })
      .setScrollFactor(0)
      .setDepth(2000);

    this.hp = 3;
    this.hpText = this.add
      .text(32, 110, "HP: ❤❤❤", {
        fontSize: "60px",
        fill: "#ff0000",
        backgroundColor: "#00000060",
      })
      .setScrollFactor(0)
      .setDepth(2000);

    this.isInvincible = false;

    // Create water surface
    this.waterSurfaceY = 800;
    this.isOnWaterSurface = false;
    this.waterBobPhase = 0;

    this.waterLine = this.add.graphics();
    this.waterLine.lineStyle(8, 0x0099ff, 1);
    this.waterLine.beginPath();
    this.waterLine.moveTo(0, this.waterSurfaceY);
    this.waterLine.lineTo(worldWidth, this.waterSurfaceY);
    this.waterLine.strokePath();
    this.waterLine.setDepth(500);

    this.waterZone = this.add.zone(
      worldWidth / 2,
      this.waterSurfaceY,
      worldWidth,
      20
    );
    this.physics.world.enable(this.waterZone);
    this.waterZone.body.setAllowGravity(false);
    this.waterZone.body.moves = false;

    if (this.debugEnabled && this.layer1) {
      this.layer1.renderDebug(this.debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255),
      });
    }
  },

  update: function () {
    if (!this.player) return;

    // Determine water state
    const playerCenter = this.player.y;
    const isAboveWater = playerCenter < this.waterSurfaceY - 30;
    const isBelowWater = playerCenter > this.waterSurfaceY + 30;
    const isOnSurface = !isAboveWater && !isBelowWater;

    // Horizontal movement
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

    // Vertical movement based on water state
    if (isOnSurface) {
      this.physics.world.gravity.y = 300;
      if (this.cursors.up.isDown || this.wKey.isDown) {
        this.waterBobPhase += 0.2;
        const bobForce = Math.sin(this.waterBobPhase) * 150 - 100;
        this.player.setVelocityY(this.player.body.velocity.y + bobForce * 0.1);
        this.player.setAccelerationY(0);
      } else if (this.cursors.down.isDown || this.sKey.isDown) {
        this.player.setAccelerationY(800);
        this.waterBobPhase = 0;
      } else {
        const floatForce = (this.waterSurfaceY - playerCenter) * 15;
        this.player.setVelocityY(
          this.player.body.velocity.y * 0.9 + floatForce * 0.1
        );
        this.player.setAccelerationY(0);
        this.waterBobPhase = 0;
      }
    } else if (isAboveWater) {
      this.physics.world.gravity.y = 800;
      this.player.setAccelerationY(0);
      this.waterBobPhase = 0;
    } else {
      this.physics.world.gravity.y = 300;
      this.waterBobPhase = 0;
      if (this.cursors.up.isDown || this.wKey.isDown) {
        this.player.setAccelerationY(-800);
      } else if (this.cursors.down.isDown || this.sKey.isDown) {
        this.player.setAccelerationY(800);
      } else {
        this.player.setAccelerationY(0);
      }
    }

    // Check teleport collision - level complete
    if (this.physics.overlap(this.player, this.teleport)) {
      this.score += 50;
      this.registry.set("finalScore", this.score);
      this.scene.start("Level3State");
      return;
    }

    // Update small fish movement
    this.smallFishList.forEach((fish) => {
      if (fish.x >= fish.getData("maxX")) {
        fish.body.velocity.x = -Math.abs(fish.body.velocity.x);
        fish.setFlipX(false);
      } else if (fish.x <= fish.getData("minX")) {
        fish.body.velocity.x = Math.abs(fish.body.velocity.x);
        fish.setFlipX(true);
      }

      if (fish.y >= fish.getData("maxY")) {
        fish.body.velocity.y = -Math.abs(fish.body.velocity.y);
      } else if (fish.y <= fish.getData("minY")) {
        fish.body.velocity.y = Math.abs(fish.body.velocity.y);
      }
    });

    // Update large fish enemies
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

      // Check damage from any fish
      if (
        !this.isInvincible &&
        (this.physics.overlap(this.player, enemy) ||
          this.smallFishList.some((fish) =>
            this.physics.overlap(this.player, fish)
          ))
      ) {
        this.hp = Math.max(0, this.hp - 1);
        this.hpText.setText("HP: " + ("❤".repeat(this.hp) || "💀"));

        this.player.setVelocityX(enemy.getData("direction") * -300);
        this.player.setVelocityY(-400);

        if (this.hp <= 0) {
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

        this.time.delayedCall(1500, () => {
          this.isInvincible = false;
        });
      }
    });
  },
};
