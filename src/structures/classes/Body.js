class Body {
    constructor() {
        this.rightArm = 2;
        this.leftArm = 2;

        this.rightLeg = 2;
        this.leftLeg = 2;
    }

    hurt(limb = "rightArm" || "leftArm" || "rightLeg" || "leftLeg") {
        this[limb]--;
        if (this[limb] < 0) this[limb] = 0;
    }
}

module.exports = Body;