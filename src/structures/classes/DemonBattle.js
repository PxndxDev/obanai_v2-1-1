/* eslint-disable no-multi-spaces */
/* eslint-disable no-inline-comments */
/* eslint-disable brace-style */
const Battle = require("./Battle");
const Body = require("./Body");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const Step = require("./Step");
const Stats = require("../database/Stats");
const Players = require("../database/Players");

class DemonBattle extends Battle {
    constructor(client, {
        player = {
            pDatas: {}, pUser: {}, life: 100, energy: 10, maxEnergy: 10, body: new Body(),
        },
        demon = {
            stats: {}, id: {}, life: 100, energy: 10, maxEnergy: 10, body: new Body(), blood_art: {}, skills: {},
        },
        tutorial = 0,
        step = new Step(client, null, null),
    }) {
        super(client);
        this.player = player;
        this.demon = demon;
        this.player.energy = 10 * this.player.pDatas.endurance;
        this.demon.energy = 10 * this.demon.stats.endurance;
        this.player.maxEnergy = this.player.energy;
        this.demon.maxEnergy = this.demon.energy;
        this.tutorial = tutorial;
        this.step = step;
        this.afks = 0;
        this.lastHeal = 0;
        this.breath_uses = 0;
    }

    async caseP1(message, logs) {
        if (!this.played) {
            for (const log of this.logs) this.completeLogs.push(log);
            this.logs = [];
            this.logs.push(`\`\`\`» Round ${this.round} !\`\`\``);
            if (this.demon.blood_art.enabled) this.demon.blood_art.exe(this);
            if (this.round === 1 && this.tutorial === 1) {
                await this.step.displayInformation(
                    "Affichage du panel de combat",
                    "Voici comment est constitué un combat. Vos statistiques y sont affichés, ainsi que votre énergie. La photo de profile du combattant qui doit jouer est celle affichée.",
                    "https://cdn.discordapp.com/attachments/935645629210820618/939247796781989919/tutorial1_attack.png",
                );
                await this.step.displayInformation(
                    "Affichage du panel de combat - attaques",
                    "Pour attaquer, trois solutions. L'attaque rapide, qui remonte votre énergie, l'attaque chargée, qui inflige plus gros, et une troisième, pour l'instant secrète.",
                    "https://cdn.discordapp.com/attachments/935645629210820618/939247796349993010/tutorial1_attack_buttons.png",
                );
            }
            if (this.round === 2 && this.tutorial === 1) {
                await this.step.displayInformation(
                    "Bonne chance !",
                    "Vous voilà fin prêt pour vous battre. Bon courage, et que votre courage vous guide !",
                    null,
                );
            }
            await this.turn(message);
            if (!this.forfeit) {
                if (await this.client.hasMsg(message.channel, logs.id) !== false) await logs.edit({ embeds: [ new MessageEmbed({ color: this.client.color, fields: [ { name: "<:invisible:921131991712272384>", value: this.logs.join("\n") }] }).setFooter({ text: "Votre journal de combat sera enregistré !" })] });
                else logs = await message.channel.send({ embeds: [ new MessageEmbed({ color: this.client.color, description: this.logs.join("\n") }).setFooter({ text: "Votre journal de combat sera enregistré !" })] });
                this.played = true;
                this.role = "p2";
                this.nextStep = "tour";
            }
        }
    }

    async caseP2(message, logs) {
        if (!this.played) {
            if (this.round === 1 && this.tutorial === 1) {
                await this.step.displayInformation(
                    "Affichage du panel de combat",
                    "La défense est très semblable à l'attaque, trois solutions. La défense rapide, qui remonte votre énergie, la défense chargée, qui inflige plus gros, et une troisième, pour l'instant secrète.",
                    "https://cdn.discordapp.com/attachments/935645629210820618/939253704429805578/tutorial1_defense_buttons.png",
                );
            }
            await this.turnDemon(message);
            if (!this.forfeit) {
                if (await this.client.hasMsg(message.channel, logs.id) !== false) await logs.edit({ embeds: [ new MessageEmbed({ color: this.client.color, fields: [ { name: "<:invisible:921131991712272384>", value: this.logs.join("\n") }] }).setFooter({ text: "Votre journal de combat sera enregistré !" })] });
                else logs = await message.channel.send({ embeds: [ new MessageEmbed({ color: this.client.color, description: this.logs.join("\n") }).setFooter({ text: "Votre journal de combat sera enregistré !" })] });
                this.played = true;
                this.role = "p1";
                this.round++;
                this.nextStep = "round";
            }
        }
    }

    async turn(message) {
        if (this.played === false) {
            let attack = null;

            const content = `<@${this.player.pUser.id}> c'est à votre tour de jouer.\n\n` + await this.displayInformations();

            const attackChoice = await this.client.interact(this.player.pUser, message.channel, content, "normal", require("../../commands/adventure/battle/assets/battle_buttons").attack(this.player.pDatas.breath.ressources.emoji, this.player.energy), btn => btn.user.id === this.player.pUser.id, 30000, true);
            if (attackChoice === "null") {
                attack = "fast";
                this.afks++;
            } else if (attackChoice) {
                attack = attackChoice.customId;
                if (attack === "forfeit") await this.forfeitFunction(message);
            }

            if (this.forfeit) return;
            if (attack === "forfeit") attack = "fast";

            this.attackToText(attack);
            if (this.nextStep === "round") this.logs.push("⎯⎯⎯⎯⎯⎯⎯⎯喧嘩⎯⎯⎯⎯⎯⎯⎯⎯\n");
            if (attack === "breath_style") this.breath_uses += 1;

            return attack;
        }
    }

    attackToText(attack) {
        const pBreath = this.player.pDatas.breath.ressources;
        const demonDefenses = this.demon.skills.defenses;
        const allAttacks = {
            "fast": "👊 Atq. rapide",
            "charged": "💥 Atq. puissante",
            "breath_style": `${pBreath.emoji} **${pBreath.name}** ||${pBreath.movements.length > 0 ? pBreath.movements[Math.floor(Math.random() * pBreath.movements.length)] : ""}||`,
        };

        this.logs.push(`\`${this.player.pUser.username} utilise\` ${allAttacks[attack]}, \`${this.demon.id.name} utilise\` ${demonDefenses[Math.floor(Math.random() * demonDefenses.length)]}`);
        const damageManaged = this.playerAttack(attack);

        let response = "<:invisible:921131991712272384> » ";

        if (damageManaged.dodged) {
            response += "Il esquive l'attaque !";
        } else {
            response += `\`${this.demon.id.name}\` -**${damageManaged.damage}** :heart:`;
            this.demon.life -= damageManaged.damage;
            if (damageManaged.limbChoosen !== null) {
                const limb = this.demon.body[damageManaged.limbChoosen];
                response += ` | » ${this.emojisPack2[damageManaged.limbChoosen][2 - limb]}` + `\n<:invisible:921131991712272384> » ${this.aptitudeLost(damageManaged.limbChoosen)}`;
            }
        }
        if (this.lastHeal === 3 && this.demon.energy > 5 && this.demon.stats.regen > 1 && this.demon.life < 100 - Math.ceil(this.demon.stats.regen * 3)) {
            response += `\n<:invisible:921131991712272384> » Le démon se régénère ! +**${this.demon.stats.regen * 3}** :heart:`;
            this.demon.life += Math.ceil(this.demon.stats.regen * 3);
            this.lastHeal = 0;
            this.demon.energy -= 6;
        } else {
            this.lastHeal++;
            if (this.demon.energy < this.demon.maxEnergy) this.demon.energy++;
        }

        this.logs.push(response, "");
    }

    playerAttack(attack) {
        const pBreath = this.player.pDatas.breath;
        const dBloodArt = this.demon.blood_art;

        const speedP = this.fixDatas(this.player.pDatas.speed * (((this.player.body.rightLeg + this.player.body.leftLeg) * 0.125) + 0.5));
        const speedD = this.fixDatas(this.demon.stats.speed * (((this.demon.body.rightLeg + this.demon.body.leftLeg) * 0.125) + 0.5));

        let damage = 0;
        let coeff = 1;
        let limbChoosen = null;
        let limbRendered = null;
        const speedCalc = this.fixDatas((speedD / speedP) * 10);
        const dodged = Math.floor(Math.random() * 100) <= speedCalc && speedCalc >= 0;

        if (!dodged) {
            const damageP1 = this.fixDatas(this.player.pDatas.strength * (((this.player.body.rightArm + this.player.body.leftArm) * 0.125) + 0.5));
            const collectionP2 = this.fixDatas(this.demon.stats.resistance * (((this.demon.body.rightArm + this.demon.body.leftArm + this.demon.body.rightLeg + this.demon.body.leftLeg) * 0.0625) + 0.5));

            damage = this.fixDatas(Number((10 * damageP1 / (collectionP2)).toFixed(0)));
            if (attack === "charged") coeff += 0.2;
            if (attack === "breath_style") coeff += (pBreath.affinity / 100);

            if (dBloodArt.enabled) coeff += ((dBloodArt.level * 5) / 10);

            if (attack === null) coeff = 0;

            damage = Math.floor(damage * this.fixDatas(coeff));

            const allLimbs = ["rightArm", "leftArm", "rightLeg", "leftLeg"].filter(limb => this.demon.body[limb] > 0);
            const chanceOfHit = Math.floor(Math.random() * 100);

            if (chanceOfHit <= (40 - (this.fixDatas((this.demon.stats.agility / this.player.pDatas.agility) * 10)))) {
                const limbsRenders = {
                    "rightArm": "<:rightArm:924225743997771806>",
                    "leftArm": "<:leftArm:924225733432332298>",
                    "rightLeg": "<:rightLeg:924225743091814411>",
                    "leftLeg": "<:leftLeg:924225733906284585>",
                };


                limbChoosen = allLimbs[Math.floor(Math.random() * allLimbs.length)];
                limbRendered = limbsRenders[limbChoosen];
                this.demon.body.hurt(limbChoosen);
            }
        }

        if (attack === "fast" && this.player.energy < this.player.maxEnergy) this.player.energy++;
        if (attack === "charged") this.player.energy -= 3;
        if (attack === "breath_style") this.player.energy -= 5;

        return { damage, dodged, limbChoosen, limbRendered };
    }

    async turnDemon(message) {
        if (this.played === false) {
            let defense = null;

            const content = `<@${this.player.pUser.id}> c'est à votre tour de jouer.\n\n` + await this.displayInformations();

            const defenseChoice = await this.client.interact(this.player.pUser, message.channel, content, "normal", require("../../commands/adventure/battle/assets/battle_buttons").defense(this.player.pDatas.breath.ressources.emoji, this.player.energy), btn => btn.user.id === this.player.pUser.id, 30000, "demon", this.demon);
            if (defenseChoice === "null") {
                defense = "fast";
                this.afks++;
            } else if (defenseChoice) {
                defense = defenseChoice.customId;
                if (defense === "forfeit") return await this.forfeitFunction(message);
            }

            if (this.forfeit) return;
            if (defense === "forfeit") defense = "fast";

            this.defenseToText(defense);
            if (this.nextStep === "round") this.logs.push("⎯⎯⎯⎯⎯⎯⎯⎯喧嘩⎯⎯⎯⎯⎯⎯⎯⎯\n");

            if (defense === "breath_style") this.breath_uses += 1;

            return defense;
        }
    }

    defenseToText(defense) {
        const pBreath = this.player.pDatas.breath.ressources;
        const demonAttacks = this.demon.blood_art.enabled ? this.demon.skills.blood_art : this.demon.skills.attacks;
        const allDefenses = {
            "fast": "✊ Déf. rapide",
            "charged": "🛡️ Déf. lourde",
            "breath_style": `${pBreath.emoji} **${pBreath.name}** ||${pBreath.movements.length > 0 ? pBreath.movements[Math.floor(Math.random() * pBreath.movements.length)] : ""}||`,
        };

        this.logs.push(`\`${this.demon.id.name} utilise\` ${demonAttacks[Math.floor(Math.random() * demonAttacks.length)]}, \`${this.player.pUser.username} utilise\` ${allDefenses[defense]}`);
        const damageManaged = this.playerDefend(defense);

        let response = "<:invisible:921131991712272384> » ";

        if (damageManaged.dodged) {
            response += "Il esquive l'attaque !";
        } else {
            response += `\`${this.player.pUser.username}\` -**${damageManaged.damage}** :heart:`;
            this.player.life -= damageManaged.damage;
            if (damageManaged.limbChoosen !== null) {
                const limb = this.player.body[damageManaged.limbChoosen];
                response += ` | » ${this.emojisPack2[damageManaged.limbChoosen][2 - limb]}` + `\n<:invisible:921131991712272384> » ${this.aptitudeLost(damageManaged.limbChoosen)}`;
            }
        }

        this.logs.push(response, "");
    }

    playerDefend(defense) {
        const pBreath = this.player.pDatas.breath;
        const dBloodArt = this.demon.blood_art;

        const speedP = this.fixDatas(this.player.pDatas.speed * (((this.player.body.rightLeg + this.player.body.leftLeg) * 0.125) + 0.5));
        const speedD = this.fixDatas(this.demon.stats.speed * (((this.demon.body.rightLeg + this.demon.body.leftLeg) * 0.125) + 0.5));

        let damage = 0;
        let coeff = 1;
        let limbChoosen = null;
        let limbRendered = null;
        const speedCalc = this.fixDatas((speedP / speedD) * 10);
        const dodged = Math.floor(Math.random() * 100) <= speedCalc && speedCalc >= 0;

        if (!dodged) {
            const damageP1 = this.fixDatas(this.demon.stats.strength * (((this.demon.body.rightArm + this.demon.body.leftArm) * 0.125) + 0.5));
            const collectionP2 = this.fixDatas(this.player.pDatas.resistance * (((this.player.body.rightArm + this.player.body.leftArm + this.player.body.rightLeg + this.player.body.leftLeg) * 0.0625) + 0.5));

            damage = this.fixDatas(Number((10 * damageP1 / (collectionP2)).toFixed(0)));

            if (dBloodArt.enabled) coeff += ((dBloodArt.level * 5) / 10);

            if (defense === "charged") coeff -= 0.2;
            if (defense === "breath_style") coeff -= (pBreath.affinity / 100);

            damage = Math.floor(damage * this.fixDatas(coeff));

            const allLimbs = ["rightArm", "leftArm", "rightLeg", "leftLeg"].filter(limb => this.player.body[limb] > 0);
            const chanceOfHit = Math.floor(Math.random() * 100);

            if (chanceOfHit <= (40 - (this.fixDatas((this.player.pDatas.agility / this.demon.stats.agility) * 10)))) {
                const limbsRenders = {
                    "rightArm": "Son bras droit <:rightArm:924225743997771806>",
                    "leftArm": "Son bras gauche <:leftArm:924225733432332298>",
                    "rightLeg": "Sa jambe droite <:rightLeg:924225743091814411>",
                    "leftLeg": "Sa jambe gauche <:leftLeg:924225733906284585>",
                };


                limbChoosen = allLimbs[Math.floor(Math.random() * allLimbs.length)];
                limbRendered = limbsRenders[limbChoosen];
                this.player.body.hurt(limbChoosen);
            }
        }

        if (defense === "fast" && this.player.energy < this.player.maxEnergy) this.player.energy++;
        if (defense === "charged") this.player.energy -= 3;
        if (defense === "breath_style") this.player.energy -= 5;

        return { damage, dodged, limbChoosen, limbRendered };
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
            p: {
                strength: `${this.fixDatas(this.player.pDatas.strength * (((this.player.body.rightArm + this.player.body.leftArm) * 0.125) + 0.5))}`,
                speed: `${this.fixDatas(this.player.pDatas.speed * (((this.player.body.rightLeg + this.player.body.leftLeg) * 0.125) + 0.5))}`,
                agility: `${this.fixDatas(this.player.pDatas.agility)}`,
                endurance: `${this.fixDatas(this.player.pDatas.endurance)}`,
                resistance: `${this.fixDatas(this.player.pDatas.resistance * (((this.player.body.rightArm + this.player.body.leftArm + this.player.body.rightLeg + this.player.body.leftLeg) * 0.0625) + 0.5))}`,
            },
            d: {
                strength: `${this.fixDatas(this.demon.stats.strength * (((this.demon.body.rightArm + this.demon.body.leftArm) * 0.125) + 0.5))}`,
                speed: `${this.fixDatas(this.demon.stats.speed * (((this.demon.body.rightLeg + this.demon.body.leftLeg) * 0.125) + 0.5))}`,
                agility: `${this.fixDatas(this.demon.stats.agility)}`,
                endurance: `${this.fixDatas(this.demon.stats.endurance)}`,
                resistance: `${this.fixDatas(this.demon.stats.resistance * (((this.demon.body.rightArm + this.demon.body.leftArm + this.demon.body.rightLeg + this.demon.body.leftLeg) * 0.0625) + 0.5))}`,
            },
        };

        const l = (str) => str.length;

        let informations = "";

        const addInfos = (p, pi, name) => {
            informations += `• ${name}\n${getProgress(p, "life")} | ❤️ ${p.life}/100\n${getProgress(p, "energy")} | ☄️ ${p.energy}/${p.maxEnergy}\n`;
            informations += `💪 \`${" ".repeat(6 - l(pi.strength))}x${pi.strength}\` ${this.emojisPack1[2][2 - p.body.rightArm]} ${this.emojisPack1[0][2 - p.body.leftArm]}\n`;
            informations += `⚡ \`${" ".repeat(6 - l(pi.speed))}x${pi.speed}\` ${this.emojisPack1[3][2 - p.body.rightLeg]} ${this.emojisPack1[1][2 - p.body.leftLeg]}\n`;
            informations += `🤸 \`${" ".repeat(6 - l(pi.agility))}x${pi.agility}\`\n`;
            informations += `⏲️ \`${" ".repeat(6 - l(pi.endurance))}x${pi.endurance}\`\n`;
            informations += `🛡️ \`${" ".repeat(6 - l(pi.resistance))}x${pi.resistance}\`\n`;
        };

        addInfos(this.player, i.p, `<@${this.player.pUser.id}>`);
        informations += "\n\n";
        addInfos(this.demon, i.d, `**${this.demon.id.name}**`);

        return informations;
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

    async forfeitFunction(msg) {
        const wantToForfeit = await this.client.interact(
            this.player.pUser,
            msg.channel,
            `<@${this.player.pUser.id}>, voulez-vous vraiment abandonner le combat ?`,
            "info",
            [new MessageActionRow()
                .addComponents(
                    new MessageButton().setCustomId("accept").setStyle("SUCCESS").setEmoji("✅"),
                    new MessageButton().setCustomId("deny").setStyle("DANGER").setEmoji("❌"),
                ),
            ],
            (i) => i.user.id === this.player.pUser.id,
            30000,
        );
        if (wantToForfeit.customId === "accept") {
            this.forfeit = true;

            await this.client.resp(this.player.pUser, msg.channel, "🏆 Le démon gagne ce combat, car son adversaire déclare forfait.", "normal");
            this.player.life = 0;
        }
    }

    async winDisplay(msg, logs) {
        await Stats.ensure(this.client, this.player.pUser.id);
        const winner = this.player.life <= 0 ? `**${this.demon.id.name}**` : `<@${this.player.pUser.id}>`;

        if (winner === `<@${this.player.pUser.id}>`) {
            await this.client.Stats.inc(this.player.pUser.id, "soloBattle.victories");
            await this.client.Players.math(this.player.pUser.id, "+", this.fixDatas(this.breath_uses / 2), "breath.affinity");
        }
        else {
            await this.client.Stats.inc(this.player.pUser.id, "soloBattle.loses");
            await this.client.Players.math(this.player.pUser.id, "-", this.fixDatas(this.breath_uses / 2), "breath.affinity");
        }

        const pDatas = await Players.get(this.client, this.player.pUser.id);
        if (pDatas.breath.affinity < 0) await this.client.Players.set(this.player.pUser.id, 0, "breath.affinity");
        if (pDatas.breath.affinity > 100) await this.client.Players.set(this.player.pUser.id, 100, "breath.affinity");

        await this.client.resp(this.player.pUser, msg.channel, `${winner} a gagné ce combat. GG !`, "normal");

        if (await this.client.hasMsg(msg.channel, logs.id) !== false) await logs.delete();
        return winner === `<@${this.player.pUser.id}>`;
    }
}

module.exports = DemonBattle;