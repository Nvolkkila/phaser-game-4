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

    if (this.layer1) {
      this.physics.add.collider(this.player, this.layer1);
    }

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 1 }),
      frameRate: 8,
      repeat: -1,
    });

    // Create fish animation (2 columns x 3 rows = 6 frames)
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

    this.teleport = this.physics.add.sprite(4800, 1700, "portal");
    this.teleport.setScale(0.3);
    this.teleport.body.setAllowGravity(false);
    this.teleport.setVisible(false);
    this.teleport.body.enable = false;
    if (this.anims.exists("portalSpin")) {
      this.teleport.anims.play("portalSpin", true);
    }

    this.teleportActivated = true; // Teleport always visible in level 2
    this.teleport.setVisible(true);
    this.teleport.body.enable = true;

    // Create enemies - fish with no gravity
    this.enemiesList = [];

    let enemyData = [
      { x: 700, y: 1000, minX: 700, maxX: 1350 },
      { x: 2400, y: 1000, minX: 2700, maxX: 3350 },
      { x: 4100, y: 1000, minX: 4150, maxX: 4650 },
      { x: 6100, y: 1000, minX: 6150, maxX: 6850 },
      { x: 7000, y: 1000, minX: 7150, maxX: 8000 },
    ];

    enemyData.forEach((data) => {
      let enemy = this.physics.add.sprite(data.x, data.y, "fish");
      enemy.setScale(1.5);

      // Disable gravity for fish
      enemy.body.setAllowGravity(false);

      // Play fish swim animation
      if (this.anims.exists("fishSwim")) {
        enemy.anims.play("fishSwim", true);
      }

      enemy.body.setVelocityX(150);
      enemy.setData("minX", data.minX);
      enemy.setData("maxX", data.maxX);
      enemy.setData("direction", 1);

      this.enemiesList.push(enemy);
    });

    this.smallFishList = [];
    let bigFishY = 1000;

    //smaller fih
    let smallFishData = [
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
      let fish = this.physics.add.sprite(data.x, data.y, "fish");
      fish.setScale(0.4);
      fish.setAlpha(1);

      fish.body.setAllowGravity(false);

      // Make fish slippery - no friction with walls
      fish.body.setFriction(0);
      fish.body.setBounce(1, 1); // Full bounce on collision
      fish.body.setCollideWorldBounds(true);

      // Play fish swim animation
      if (this.anims.exists("fishSwim")) {
        fish.anims.play("fishSwim", true);
      }

      // Random speed and direction
      let speedX = Phaser.Math.Between(80, 150);
      let speedY = Phaser.Math.Between(40, 80);
      fish.body.setVelocity(speedX, speedY);

      fish.setData("minX", data.minX);
      fish.setData("maxX", data.maxX);
      fish.setData("minY", data.minY);
      fish.setData("maxY", data.maxY);
      fish.setData("isAmbient", true);

      this.smallFishList.push(fish);
    });

    // Fish wall collision handler - make them bounce and turn 45 degrees
    this.fishHitWall = function (fish, tile) {
      // Store old velocities
      let oldVelX = fish.body.velocity.x;
      let oldVelY = fish.body.velocity.y;

      // Calculate original speed to maintain it
      let speed = Math.sqrt(oldVelX * oldVelX + oldVelY * oldVelY);
      speed = Math.min(speed, 150); // Cap max speed at 150

      // Push fish away from wall significantly to prevent sticking
      // 45 degree turn means equal X and Y components
      let angle45Speed = speed / Math.sqrt(2); // Split speed evenly for 45 degree angle

      if (fish.body.blocked.left) {
        fish.x += 15;
        fish.body.velocity.x = angle45Speed; // Away from wall
        fish.body.velocity.y = angle45Speed * (oldVelY > 0 ? 1 : -1); // 45 degree angle
      }
      if (fish.body.blocked.right) {
        fish.x -= 15;
        fish.body.velocity.x = -angle45Speed; // Away from wall
        fish.body.velocity.y = angle45Speed * (oldVelY > 0 ? 1 : -1); // 45 degree angle
      }
      if (fish.body.blocked.up) {
        fish.y += 15;
        fish.body.velocity.y = angle45Speed; // Away from wall
        fish.body.velocity.x = angle45Speed * (oldVelX > 0 ? 1 : -1); // 45 degree angle
      }
      if (fish.body.blocked.down) {
        fish.y -= 15;
        fish.body.velocity.y = -angle45Speed; // Away from wall
        fish.body.velocity.x = angle45Speed * (oldVelX > 0 ? 1 : -1); // 45 degree angle
      }

      // Update fish facing direction
      fish.setFlipX(fish.body.velocity.x < 0);
    };

    // Add colliders for fish with map - fish will bounce off walls
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

    // Add collision between fish - they bounce off each other
    this.physics.add.collider(
      this.smallFishList,
      this.smallFishList,
      (fish1, fish2) => {
        // Both fish bounce naturally due to physics bounce property
        // Just update their facing direction
        fish1.setFlipX(fish1.body.velocity.x < 0);
        fish2.setFlipX(fish2.body.velocity.x < 0);
      }
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

    this.cameras.main.setBounds(0, 0, 69 * 32 * 4, 25 * 32 * 4);
    this.cameras.main.startFollow(this.player, true, 0.06, 0.06);
    this.cameras.main.setZoom(0.7);

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

    // Create water surface
    this.waterSurfaceY = 800; // Y position of water surface

    // Visual water surface line (blue line)
    this.waterLine = this.add.graphics();
    this.waterLine.lineStyle(8, 0x0099ff, 1);
    this.waterLine.beginPath();
    this.waterLine.moveTo(0, this.waterSurfaceY);
    this.waterLine.lineTo(worldWidth, this.waterSurfaceY);
    this.waterLine.strokePath();
    this.waterLine.setDepth(500);

    // Create water zone for physics detection
    this.waterZone = this.add.zone(
      worldWidth / 2,
      this.waterSurfaceY,
      worldWidth,
      20
    );
    this.physics.world.enable(this.waterZone);
    this.waterZone.body.setAllowGravity(false);
    this.waterZone.body.moves = false;

    // Track water surface state
    this.isOnWaterSurface = false;
    this.waterBobPhase = 0;

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

    // Check if player is on water surface
    let playerCenter = this.player.y;

    // Determine water state based on center position
    let isAboveWater = playerCenter < this.waterSurfaceY - 30;
    let isBelowWater = playerCenter > this.waterSurfaceY + 30;
    let isOnSurface = !isAboveWater && !isBelowWater;

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

    // Water surface bobbing physics
    if (isOnSurface) {
      // On water surface - bobbing physics
      this.physics.world.gravity.y = 300;

      if (this.cursors.up.isDown || this.wKey.isDown) {
        // Create bobbing effect - keep existing velocity
        this.waterBobPhase += 0.2;
        let bobForce = Math.sin(this.waterBobPhase) * 150 - 100;
        this.player.setVelocityY(this.player.body.velocity.y + bobForce * 0.1);
        this.player.setAccelerationY(0);
      } else if (this.cursors.down.isDown || this.sKey.isDown) {
        // Dive down
        this.player.setAccelerationY(800);
        this.waterBobPhase = 0;
      } else {
        // Gentle floating when not pressing anything - preserve horizontal momentum
        let floatTarget = this.waterSurfaceY;
        let floatForce = (floatTarget - playerCenter) * 15;
        this.player.setVelocityY(
          this.player.body.velocity.y * 0.9 + floatForce * 0.1
        );
        this.player.setAccelerationY(0);
        this.waterBobPhase = 0;
      }
    } else if (isAboveWater) {
      // Above water - normal gravity, keep momentum like a dolphin jump
      this.physics.world.gravity.y = 800;
      this.player.setAccelerationY(0);
      this.waterBobPhase = 0;
    } else {
      // Underwater swimming - hold to swim up continuously
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
      console.log("Player entered teleport! Level 2 complete!");
      this.score += 50;
      this.registry.set("finalScore", this.score);
      console.log("Level 2 complete! Final score:", this.score);
      this.scene.start("GameOverState"); // Or next level
      return;
    }

    // Update ambient fish (smaller ones swimming around)
    this.smallFishList.forEach((fish) => {
      // Bounce within bounds on X axis
      if (fish.x >= fish.getData("maxX")) {
        fish.body.velocity.x = -Math.abs(fish.body.velocity.x);
        fish.setFlipX(false);
      } else if (fish.x <= fish.getData("minX")) {
        fish.body.velocity.x = Math.abs(fish.body.velocity.x);
        fish.setFlipX(true);
      }

      // Bounce within bounds on Y axis
      if (fish.y >= fish.getData("maxY")) {
        fish.body.velocity.y = -Math.abs(fish.body.velocity.y);
      } else if (fish.y <= fish.getData("minY")) {
        fish.body.velocity.y = Math.abs(fish.body.velocity.y);
      }
    });

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

      //Damage system
      if (
        !this.isInvincible &&
        (this.physics.overlap(this.player, enemy) ||
          this.smallFishList.some((fish) =>
            this.physics.overlap(this.player, fish)
          ))
      ) {
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
  },
};
