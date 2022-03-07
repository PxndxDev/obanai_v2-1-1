/* eslint-disable no-multi-spaces */
/* eslint-disable no-inline-comments */
/* eslint-disable brace-style */
const Battle = require("./Battle");
const Body = require("./Body");
const { MessageActionRow, MessageButton } = require("discord.js");
const Stats = require("../database/Stats");

class MultiplayerBattle extends Battle {
    constructor(client, {
        player1 = {
            pDatas: {}, pUser: {}, life: 100, energy: 10, maxEnergy: 10, body: new Body(),
        },
        player2 = {
            pDatas: {}, pUser: {}, life: 100, energy: 10, maxEnergy: 10, body: new Body(),
        },
    }) {
        super(client);
        this.player1 = player1;
        this.player2 = player2;
        this.player1.energy = 10 * this.player1.pDatas.endurance;
        this.player2.energy = 10 * this.player2.pDatas.endurance;
        this.player1.maxEnergy = this.player1.energy;
        this.player2.maxEnergy = this.player2.energy;
        this.hasForfeited = null;
        this.player1.afks = 0;
        this.player2.afks = 0;
    }

    async battleRequest(message) {
        const battleRow = new MessageActionRow()
            .addComponents(
                new MessageButton({ customId: "accept", label: "Battons-nous !", style: "DANGER", emoji: "🔥" }),
                new MessageButton({ customId: "deny", label: "Non, désolé.", style: "SECONDARY", emoji: "❌" }),
            );


        const resp = await this.client.interact(this.player2.pUser, message.channel, `⚔️ <@${this.player2.pUser.id}>, vous êtes provoqué en duel par <@${this.player1.pUser.id}>.`, "normal", [battleRow], btn => btn.user.id === this.player2.pUser.id, 60000);
        if (resp === null) {
            await this.client.resp(this.player1.pUser, message.channel, "Votre adversaire semble inactif.", "afk");
            return false;
        } else if (resp.customId === "accept") {
            await this.client.resp(this.player1.pUser, message.channel, "Le combat commence !", "accept");
            return true;
        } else if (resp.customId === "deny") {
            await this.client.resp(this.player1.pUser, message.channel, "Votre adversaire décline le combat.", "error");
            return false;
        }
    }

    async turn(message, player1, player2, logs) {
        if (this.played === false) {
            let attack = "fast";
            let defense = "fast";

            const content = await this.displayInformations();

            const attackChoice = await this.client.interact(player1.pUser, message.channel, `<@${player1.pUser.id}> c'est à votre tour de jouer.\n\n` + content, "normal", require("../../commands/adventure/battle/assets/battle_buttons").attack(player1.pDatas.breath.ressources.emoji, player1.energy), btn => btn.user.id === player1.pUser.id, 30000, true);
            if (attackChoice === "null") {
                attack = "fast";
                player1.afks++;
            } else if (attackChoice) {
                attack = attackChoice.customId;
                if (attack === "forfeit") await this.forfeitFunction(player1, player2, player1, message, logs);
            }

            if (this.forfeit) return;
            if (attack === "forfeit") attack = "fast";

            const defenseChoice = await this.client.interact(player2.pUser, message.channel, `<@${player2.pUser.id}> c'est à votre tour de jouer.\n\n` + content, "normal", require("../../commands/adventure/battle/assets/battle_buttons").defense(player2.pDatas.breath.ressources.emoji, player2.energy), btn => btn.user.id === player2.pUser.id, 30000, true);
            if (defenseChoice === "null") {
                defense = "fast";
                player2.afks++;
            } else if (defenseChoice) {
                defense = defenseChoice.customId;
                if (defense === "forfeit") await this.forfeitFunction(player1, player2, player2, message, logs);
            }

            if (this.forfeit) return;
            if (defense === "forfeit") defense = "fast";

            this.transformToText(attack, defense, player1, player2);
            if (this.nextStep === "round") this.logs.push("⎯⎯⎯⎯⎯⎯⎯⎯喧嘩⎯⎯⎯⎯⎯⎯⎯⎯\n");

            return { attack, defense };
        }
    }

    async displayInformations() {
        const getProgress = (p, type) => {
            let emojiPack = [];
            let progressBar = "";

            if (type === "energy") emojiPack = ["<:e1:928382516354768987>", "<:e2:928382592179404830>", "<:e3:928382593420898304>", "<:e4:928382587725033493>", "<:e5:928382594666594355>", "<:e6:928382595123777628>"];
            if (type === "life") emojiPack = ["<:l1:928382589046251590>", "<:l2:928382590791090256>", "<:l3:928382590107385916>", "<:l4:928382591126618112>", "<:l5:928382528031715368>", "<:l6:928382592066150410>"];

            let percent = 0;
            const blank = ["<:blank:928382558322970724>", "<:blank2:928391410149916692>"];

            if (type === "energy") percent = p.energy * 100 / p.maxEnergy;
            if (type === "life") percent = p.life;

            const checkPercent = (min, max) => percent >= min && percent < max;

            if (checkPercent(0,     5)) progressBar = emojiPack[0]                                         + blank[0].repeat(8) + blank[1];
            if (checkPercent(5,    10)) progressBar = emojiPack[1]                                         + blank[0].repeat(8) + blank[1];
            if (checkPercent(10,   15)) progressBar = emojiPack[1] + emojiPack[2]                          + blank[0].repeat(7) + blank[1];
            if (checkPercent(15,   20)) progressBar = emojiPack[1] + emojiPack[3]                          + blank[0].repeat(7) + blank[1];
            if (checkPercent(20,   25)) progressBar = emojiPack[1] + emojiPack[3]           + emojiPack[2] + blank[0].repeat(6) + blank[1];
            if (checkPercent(25,   30)) progressBar = emojiPack[1] + emojiPack[3].repeat(2)                + blank[0].repeat(6) + blank[1];
            if (checkPercent(30,   35)) progressBar = emojiPack[1] + emojiPack[3].repeat(2) + emojiPack[2] + blank[0].repeat(5) + blank[1];
            if (checkPercent(35,   40)) progressBar = emojiPack[1] + emojiPack[3].repeat(3)                + blank[0].repeat(5) + blank[1];
            if (checkPercent(40,   45)) progressBar = emojiPack[1] + emojiPack[3].repeat(3) + emojiPack[2] + blank[0].repeat(4) + blank[1];
            if (checkPercent(45,   50)) progressBar = emojiPack[1] + emojiPack[3].repeat(4)                + blank[0].repeat(4) + blank[1];
            if (checkPercent(50,   55)) progressBar = emojiPack[1] + emojiPack[3].repeat(4) + emojiPack[2] + blank[0].repeat(3) + blank[1];
            if (checkPercent(55,   60)) progressBar = emojiPack[1] + emojiPack[3].repeat(5)                + blank[0].repeat(3) + blank[1];
            if (checkPercent(60,   65)) progressBar = emojiPack[1] + emojiPack[3].repeat(5) + emojiPack[2] + blank[0].repeat(2) + blank[1];
            if (checkPercent(65,   70)) progressBar = emojiPack[1] + emojiPack[3].repeat(6)                + blank[0].repeat(2) + blank[1];
            if (checkPercent(70,   75)) progressBar = emojiPack[1] + emojiPack[3].repeat(6) + emojiPack[2] + blank[0].repeat(1) + blank[1];
            if (checkPercent(75,   80)) progressBar = emojiPack[1] + emojiPack[3].repeat(7)                + blank[0].repeat(1) + blank[1];
            if (checkPercent(80,   85)) progressBar = emojiPack[1] + emojiPack[3].repeat(7) + emojiPack[2] + blank[0].repeat(0) + blank[1];
            if (checkPercent(85,   90)) progressBar = emojiPack[1] + emojiPack[3].repeat(8)                + blank[0].repeat(0) + blank[1];
            if (checkPercent(90,   95)) progressBar = emojiPack[1] + emojiPack[3].repeat(8) + emojiPack[4];
            if (checkPercent(95,  101)) progressBar = emojiPack[1] + emojiPack[3].repeat(8) + emojiPack[5];

            return progressBar;
        };

        const i = {
            p1: {
                strength: `${this.fixDatas(this.player1.pDatas.strength * (((this.player1.body.rightArm + this.player1.body.leftArm) * 0.125) + 0.5))}`,
                speed: `${this.fixDatas(this.player1.pDatas.speed * (((this.player1.body.rightLeg + this.player1.body.leftLeg) * 0.125) + 0.5))}`,
                agility: `${this.fixDatas(this.player1.pDatas.agility)}`,
                endurance: `${this.fixDatas(this.player1.pDatas.endurance)}`,
                resistance: `${this.fixDatas(this.player1.pDatas.resistance * (((this.player1.body.rightArm + this.player1.body.leftArm + this.player1.body.rightLeg + this.player1.body.leftLeg) * 0.0625) + 0.5))}`,
            },
            p2: {
                strength: `${this.fixDatas(this.player2.pDatas.strength * (((this.player2.body.rightArm + this.player2.body.leftArm) * 0.125) + 0.5))}`,
                speed: `${this.fixDatas(this.player2.pDatas.speed * (((this.player2.body.rightLeg + this.player2.body.leftLeg) * 0.125) + 0.5))}`,
                agility: `${this.fixDatas(this.player2.pDatas.agility)}`,
                endurance: `${this.fixDatas(this.player2.pDatas.endurance)}`,
                resistance: `${this.fixDatas(this.player2.pDatas.resistance * (((this.player2.body.rightArm + this.player2.body.leftArm + this.player2.body.rightLeg + this.player2.body.leftLeg) * 0.0625) + 0.5))}`,
            },
        };

        const l = (str) => str.length;

        let informations = "";

        const addInfos = (p, pi) => {
            informations += `• <@${p.pUser.id}>\n${getProgress(p, "life")} | ❤️ ${p.life}/100\n${getProgress(p, "energy")} | ☄️ ${p.energy}/${p.maxEnergy}\n`;
            informations += `💪 \`${" ".repeat(6 - l(pi.strength))}x${pi.strength}\` ${this.emojisPack1[2][2 - p.body.rightArm]} ${this.emojisPack1[0][2 - p.body.leftArm]}\n`;
            informations += `⚡ \`${" ".repeat(6 - l(pi.speed))}x${pi.speed}\` ${this.emojisPack1[3][2 - p.body.rightLeg]} ${this.emojisPack1[1][2 - p.body.leftLeg]}\n`;
            informations += `🤸 \`${" ".repeat(6 - l(pi.agility))}x${pi.agility}\`\n`;
            informations += `⏲️ \`${" ".repeat(6 - l(pi.endurance))}x${pi.endurance}\`\n`;
            informations += `🛡️ \`${" ".repeat(6 - l(pi.resistance))}x${pi.resistance}\`\n`;
        };

        addInfos(this.player1, i.p1);
        informations += "\n\n";
        addInfos(this.player2, i.p2);

        return informations;
    }

    transformToText(attack, defense, player1, player2) {
        const p1Breath = player1.pDatas.breath.ressources;
        const p2Breath = player2.pDatas.breath.ressources;
        const allAttacks = {
            "fast": "👊 Atq. rapide",
            "charged": "💥 Atq. puissante",
            "breath_style": `${p1Breath.emoji} **${p1Breath.name}** ||${p1Breath.movements.length > 0 ? p1Breath.movements[Math.floor(Math.random() * p1Breath.movements.length)] : ""}||`,
        };
        const allDefenses = {
            "fast": "✊ Déf. rapide",
            "charged": "🛡️ Déf. lourde",
            "breath_style": `${p2Breath.emoji} **${p2Breath.name}** ||${p2Breath.movements.length > 0 ? p2Breath.movements[Math.floor(Math.random() * p2Breath.movements.length)] : ""}||`,
        };

        this.logs.push(`\`${player1.pUser.username} utilise\` ${allAttacks[attack]}, \`${player2.pUser.username} utilise\` ${allDefenses[defense]}`);
        const damageManaged = this.damageManager(attack, defense, player1, player2);

        let response = "<:invisible:921131991712272384> » ";

        if (damageManaged.dodged) {
            response += "Il esquive l'attaque !";
        } else {
            response += `\`${player2.pUser.username}\` -**${damageManaged.damage}** :heart:`;
            player2.life -= damageManaged.damage;
            if (damageManaged.limbChoosen !== null) {
                const limb = player2.body[damageManaged.limbChoosen];
                response += ` | » ${this.emojisPack2[damageManaged.limbChoosen][2 - limb]}` + `\n<:invisible:921131991712272384> » ${this.aptitudeLost(damageManaged.limbChoosen)}`;
            }
        }

        this.logs.push(response, "");
    }

    damageManager(attack, defense, player1, player2) {
        const p1Breath = player1.pDatas.breath;
        const p2Breath = player2.pDatas.breath;

        const speedP1 = this.fixDatas(player1.pDatas.speed * (((player1.body.rightLeg + player1.body.leftLeg) * 0.125) + 0.5));
        const speedP2 = this.fixDatas(player2.pDatas.speed * (((player2.body.rightLeg + player2.body.leftLeg) * 0.125) + 0.5));

        let damage = 0;
        let coeff = 1;
        let limbChoosen = null;
        let limbRendered = null;
        const speedCalc = this.fixDatas((speedP2 / speedP1) * 10);
        const dodged = Math.floor(Math.random() * 100) <= speedCalc && speedCalc >= 0;

        if (!dodged) {
            const damageP1 = this.fixDatas(player1.pDatas.strength * (((player1.body.rightArm + player1.body.leftArm) * 0.125) + 0.5));
            const collectionP2 = this.fixDatas(player2.pDatas.resistance * (((player2.body.rightArm + player2.body.leftArm + player2.body.rightLeg + player2.body.leftLeg) * 0.0625) + 0.5));

            damage = this.fixDatas(Number((10 * damageP1 / (collectionP2)).toFixed(0)));
            if (attack === "charged") coeff += 0.2;
            if (attack === "breath_style") coeff += (p1Breath.affinity / 100);

            if (defense === "charged") coeff -= 0.2;
            if (defense === "breath_style") coeff -= (p2Breath.affinity / 100);

            if (attack === null) coeff = 0;

            damage = Math.floor(damage * this.fixDatas(coeff));

            const allLimbs = ["rightArm", "leftArm", "rightLeg", "leftLeg"].filter(limb => player2.body[limb] > 0);
            const chanceOfHit = Math.floor(Math.random() * 100);

            if (chanceOfHit <= (40 + (this.fixDatas((player2.pDatas.agility / player1.pDatas.agility) * 10)))) {
                const limbsRenders = {
                    "rightArm": "Son bras droit <:rightArm:924225743997771806>",
                    "leftArm": "Son bras gauche <:leftArm:924225733432332298>",
                    "rightLeg": "Sa jambe droite <:rightLeg:924225743091814411>",
                    "leftLeg": "Sa jambe gauche <:leftLeg:924225733906284585>",
                };


                limbChoosen = allLimbs[Math.floor(Math.random() * allLimbs.length)];
                limbRendered = limbsRenders[limbChoosen];
                player2.body.hurt(limbChoosen);
            }
        }

        if (attack === "fast" && player1.energy < player1.maxEnergy) player1.energy++;
        if (attack === "charged") player1.energy -= 3;
        if (attack === "breath_style") player1.energy -= 5;
        if (defense === "fast" && player2.energy < player2.maxEnergy) player2.energy++;
        if (defense === "charged") player2.energy -= 3;
        if (defense === "breath_style") player2.energy -= 5;

        return { damage, dodged, limbChoosen, limbRendered };
    }

    aptitudeLost(limbChoosen) {
        let toReturn = "🛡️ <:decrease:938756248394948620> **`6.25%`** • ";

        switch (limbChoosen) {
            case "rightArm":
            case "leftArm":
                toReturn += "💪 <:decrease:938756248394948620> **`12.5%`**";
                break;
            case "leftLeg":
            case "rightLeg":
                toReturn += "⚡ <:decrease:938756248394948620> **`12.5%`**";
                break;
        }

        return toReturn;
    }

    async forfeitFunction(player1, player2, hasForfeited, msg) {
        const wantToForfeit = await this.client.interact(
            hasForfeited.pUser,
            msg.channel,
            `<@${hasForfeited.pUser.id}>, voulez-vous vraiment abandonner le combat ?`,
            "info",
            [new MessageActionRow()
                .addComponents(
                    new MessageButton().setCustomId("accept").setStyle("SUCCESS").setEmoji("✅"),
                    new MessageButton().setCustomId("deny").setStyle("DANGER").setEmoji("❌"),
                ),
            ],
            (i) => i.user.id === hasForfeited.pUser.id,
            30000,
        );
        if (wantToForfeit.customId === "accept") {
            this.forfeit = true;
            this.hasForfeited = hasForfeited;

            await this.client.resp(hasForfeited.pUser, msg.channel, `🏆 <@${hasForfeited.pUser === player1.pUser ? player2.pUser.id : player1.pUser.id}> gagne ce combat, car son adversaire déclare forfait.`, "normal");
            hasForfeited.life = 0;
        }
    }

    async winDisplay(msg, logs) {
        await Stats.ensure(this.client, this.player1.pUser.id);
        await Stats.ensure(this.client, this.player2.pUser.id);

        const winner = this.player1.life <= 0 ? this.player2 : this.player1;
        const loser = this.player1.life <= 0 ? this.player1 : this.player2;

        await this.client.resp(winner.pUser, msg.channel, `<@${winner.pUser.id}> a gagné ce combat. GG !`, "normal");

        await this.client.Stats.inc(winner.pUser.id, "mpBattle.victories");
        await this.client.Stats.inc(loser.pUser.id, "mpBattle.loses");

        if (await this.client.hasMsg(msg.channel, logs.id) !== false) await logs.delete();
    }

    async afkDisplay(msg, logs) {
        await Stats.ensure(this.client, this.player1.pUser.id);
        await Stats.ensure(this.client, this.player2.pUser.id);

        let loser = null;
        if (this.player1.afks >= 3 && this.player2.afks < 3) {
            loser = this.player1;
        } else if (this.player2.afks >= 3 && this.player1.afks < 3) {
            loser = this.player2;
        } else if (this.player1.afks === 3 && this.player2.afks === 3) {
            loser = "both";
        }

        if (loser !== "both") {
            loser.life = 0;
            await this.client.resp(msg.author, msg.channel, `<@${loser.pUser.id}>, vous avez été pénalisé pour inactivité.`, "afk");
            await this.winDisplay(msg, logs);
        } else {
            await this.client.resp(msg.author, msg.channel, `<@${this.player1.pUser.id}> et <@${this.player1.pUser.id}> avez été pénalisés pour inactivité. Aucun gagnant.`, "afk");

            await this.client.Stats.inc(this.player1.pUser.id, "mpBattle.loses");
            await this.client.Stats.inc(this.player2.pUser.id, "mpBattle.loses");

            if (await this.client.hasMsg(msg.channel, logs.id) !== false) await logs.delete();
        }

    }
}

module.exports = MultiplayerBattle;