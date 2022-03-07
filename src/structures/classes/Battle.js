const { MessageAttachment } = require("discord.js");

class Battle {
    constructor(client) {
        this.client = client;
        this.logs = [];
        this.completeLogs = ["Battle file:\n\n"];
        this.emojisPack1 = [
            ["<:leftArm:924225733432332298>", "<:leftArmHurt:928744800621064223>", "<:leftArmX:928744812876800050>"],
            ["<:leftLeg:924225733906284585>", "<:leftLegHurt:928744812981653524>", "<:leftLegX:928744816441978930>"],
            ["<:rightArm:924225743997771806>", "<:rightArmHurt:928744817293398076>", "<:rightArmX:928744816429391922>"],
            ["<:rightLeg:924225743091814411>", "<:rightLegHurt:928744815422746635>", "<:rightLegX:928744816102223892>"],
        ];
        this.emojisPack2 = {
            "leftArm": ["<:leftArm:924225733432332298>", "<:leftArmHurt:928744800621064223>", "<:leftArmX:928744812876800050>"],
            "leftLeg": ["<:leftLeg:924225733906284585>", "<:leftLegHurt:928744812981653524>", "<:leftLegX:928744816441978930>"],
            "rightArm": ["<:rightArm:924225743997771806>", "<:rightArmHurt:928744817293398076>", "<:rightArmX:928744816429391922>"],
            "rightLeg": ["<:rightLeg:924225743091814411>", "<:rightLegHurt:928744815422746635>", "<:rightLegX:928744816102223892>"],
        };
        this.role = "p1";
        this.played = false;
        this.round = 1;
        this.nextStep = "round";
        this.forfeit = false;
    }

    async giveReplay() {
        const file = new MessageAttachment(Buffer.from(
            this.completeLogs.join("\n")
                .replace("<:invisible:921131991712272384>", "    ")
                .replace("<:decrease:938756248394948620>", "🔻")
                .replace("*", "\u200B")
                .replace("_", "\u200B")
                .replace("`", "\u200B")
                .replace(">", "\u200B")
                .replace("<:leftArmHurt:928744800621064223>", "Bras gauche blessé")
                .replace("<:leftArmX:928744812876800050>", "Bras gauche cassé")
                .replace("<:leftLegHurt:928744812981653524>", "Jambe gauche blessée")
                .replace("<:leftLegX:928744816441978930>", "Jambe gauche détruite")
                .replace("<:rightArmHurt:928744817293398076>", "Bras droit blessé")
                .replace("<:rightArmX:928744816429391922>", "Bras droit détruit")
                .replace("<:rightLegHurt:928744815422746635>", "Jambe droite blessée")
                .replace("<:rightLegX:928744816102223892>", "Jambe droite détruite"),
            "utf-8"), "fight.txt");

        return file;
    }

    fixDatas(d = 0) {
        return Number(d.toFixed(4));
    }
}

module.exports = Battle;