const levelState = {
  key: "levelState",

  create: function () {
    console.log("Going to level 2");
    this.scene.start("level2State");
  },
};
