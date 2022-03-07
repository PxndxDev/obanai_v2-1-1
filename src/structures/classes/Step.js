/* eslint-disable no-lonely-if */
/* eslint-disable no-console */
/* eslint-disable brace-style */
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const delay = require("../../utils/delay");

const genererDialogBox = (client, author) => new MessageEmbed().setColor(client.color).setAuthor({ "name": author.tag, "iconURL": author.displayAvatarURL({ "dynamic": true }) });
const genererRow = () => new MessageActionRow().addComponents(new MessageButton().setCustomId("next").setStyle("PRIMARY").setEmoji("⏩"));
const around = (number) => Number((number / 10).toFixed(0)) * 10;

class Step {
    constructor(client, message, args) {
        this.client = client;
        this.message = message;
        this.args = args;
    }

    async simpleEmbed(title = "", texte = "", img) {
        const simple = new MessageEmbed()
            .setColor(this.client.color)
            .setImage(img)
            .setAuthor({ "name": this.message.author.tag, "iconURL": this.message.author.displayAvatarURL({ "dynamic": true }) })
            .setDescription(`**${title}**\n\n${texte.substring(0, 4000 - (title.length + 10))}`);

        const msg = await this.message.channel.send({ embeds: [simple] });
        return msg;
    }

    async createDialogue(embed = null, message = null, dialogue) {
        let mEmbed = embed;
        if (embed === null) mEmbed = genererDialogBox(this.client, this.message.author);
        let dialogBox = null;

        if (message === null) {
            dialogBox = await this.message.channel.send({ embeds: [mEmbed.setDescription(`\`\`\`fix\n${dialogue.title}\`\`\`\n${dialogue.content[0]}`)], components: [genererRow()] });
        } else {
            if (await this.client.hasMsg(message.channel, message.id) !== false) dialogBox = await message.edit({ embeds: [mEmbed.setDescription(`\`\`\`fix\n${dialogue.title}\`\`\`\n${dialogue.content[0]}`)], components: [genererRow()] });
            else message.channel.send({ embeds: [mEmbed.setDescription(`\`\`\`fix\n${dialogue.title}\`\`\`${dialogue.content[0]}`)], components: [genererRow()] });
        }

        let step = 0;
        let boucle = true;

        const actualiserDialogbox = async () => {
            const allDialog = [];
            for (let i = 0; i <= step;) {
                allDialog.push(dialogue.content[i]);
                i++;
            }
            if (await this.client.hasMsg(dialogBox.channel, dialogBox.id) !== false) dialogBox = await dialogBox.edit({ embeds: [genererDialogBox(this.client, this.message.author).setDescription(`\`\`\`fix\n${dialogue.title}\`\`\`\n${allDialog.join("\n")}`)], components: [genererRow()] });
            else dialogBox = await dialogBox.channel.send({ embeds: [genererDialogBox(this.client, this.message.author).setDescription(`\`\`\`fix\n${dialogue.title}\`\`\`\n${allDialog.join("\n")}`)], components: [genererRow()] });
        };


        while (step < dialogue.content.length && boucle) {
            actualiserDialogbox();
            const dialogListen = await dialogBox.awaitMessageComponent({ filter: (i) => i.customId === "next" && i.user.id === this.message.author.id, time: 60000 })
                .catch(() => {
                    boucle = false;
                });
            if (dialogListen) {
                try { await dialogListen.deferUpdate(); }
                catch { console.log("error defer"); }
                step++;
            }
        }

        if (await this.client.hasMsg(dialogBox.channel, dialogBox.id) !== false) dialogBox = await dialogBox.edit({ embeds: [genererDialogBox(this.client, this.message.author).setDescription(`\`\`\`fix\n${dialogue.title}\`\`\`\n${dialogue.content.join("\n")}`)], components: [] });
        else dialogBox = await dialogBox.channel.send({ embeds: [genererDialogBox(this.client, this.message.author).setDescription(`\`\`\`fix\n${dialogue.title}\`\`\`\n${dialogue.content.join("\n")}`)], components: [] });

        return dialogBox;
    }

    async displayInformation(title = "", texte = "", img) {
        let msg = await this.simpleEmbed(title, texte, img);
        if (await this.client.hasMsg(msg.channel, msg.id) !== false) msg = await msg.edit({ components: [ new MessageActionRow().addComponents(new MessageButton({ style: "SUCCESS", emoji: "✅", customId: "checked" })) ] });
        else msg = await msg.channel.send({ components: [ new MessageActionRow().addComponents(new MessageButton({ style: "SUCCESS", emoji: "✅", customId: "checked" })) ] });
        const checked = await msg.awaitMessageComponent({ filter: (i) => i.user.id === this.message.author.id, time: 60000 }).catch(async () => {
            if (await this.client.hasMsg(msg.channel, msg.id) !== false) await msg.delete();
        });

        if (checked && (await this.client.hasMsg(msg.channel, msg.id) !== false)) await msg.delete();
    }

    async choice(embed = null, message, choices) {
        let mEmbed = embed;
        if (embed === null) mEmbed = genererDialogBox(this.client, this.message.author);
        let choiceMessage = null;

        let choice = null;

        // label, customId, style, emoji, disabled
        const row = new MessageActionRow();
        const imax = choices.length <= 5 ? choices.length : 5;
        for (let i = 0; i < imax; i++) {
            const c = choices[i];
            row.addComponents(
                new MessageButton().setCustomId(c.customId).setDisabled(c.disabled).setEmoji(c.emoji).setLabel(c.label).setStyle(c.style),
            );
        }

        if (message === null) {
            choiceMessage = await this.message.channel.send({ content: `<@${this.message.author.id}>`, embeds: [mEmbed], components: [row] });
        } else {
            if (await this.client.hasMsg(message.channel, message.id) !== false) choiceMessage = await message.edit({ content: `<@${this.message.author.id}>`, embeds: [mEmbed], components: [row] });
            else choiceMessage = await message.channel.send({ content: `<@${this.message.author.id}>`, embeds: [mEmbed], components: [row] });
        }
        const userChoice = await choiceMessage.awaitMessageComponent({ filter: (i) => i.user.id === this.message.author.id, time: 60000 })
        .catch(() => {
            choice = choices[0];
        });

        if (userChoice) {
            try { await userChoice.deferUpdate(); }
            catch { console.log("error defer"); }
            choice = choices.filter(btn => btn.customId === userChoice.customId)[0];
        }

        if (await this.client.hasMsg(choiceMessage.channel, choiceMessage.id) !== false) await choiceMessage.edit({ content: `<@${this.message.author.id}>`, embeds: [mEmbed], components: [] });
        else await choiceMessage.channel.send({ content: `<@${this.message.author.id}>`, embeds: [mEmbed], components: [] });
        return { choice, choiceMessage };
    }

    async fastMiniGame(embed = null) {
        let mEmbed = embed;
        if (embed === null) mEmbed = genererDialogBox(this.client, this.message.author);

        mEmbed.setTitle("⚡ • Un défi de rapidité va apparaître !");
        const challengeMessage = await this.message.channel.send({ content: `<@${this.message.author.id}>`, embeds: [mEmbed], components: [] });

        await delay(Math.random() * 2 * 1000 + 1000);

        const allChallenges = [
            async function GoodButton(msg, t, em) {
                const genererBouttonsAleatoire = () => {
                    const row = new MessageActionRow();

                    for (let i = 0; i < 5; i++) {
                        row.addComponents(new MessageButton().setCustomId(`void_${i}`).setEmoji("<:invisible:921131991712272384>").setStyle("SECONDARY"));
                    }

                    row.components[Math.floor(Math.random() * 5)] = new MessageButton().setCustomId("target").setEmoji("🎯").setStyle("DANGER");

                    return row;
                };

                em.setDescription("**Clique** le plus rapidement sur la **cible** :dart: !");

                let msgChallenge = null;
                if (await t.client.hasMsg(msg.channel, msg.id) !== false) msgChallenge = await msg.edit({ embeds: [em], components: [genererBouttonsAleatoire()] });
                else msgChallenge = await msg.channel.send({ embeds: [em], components: [genererBouttonsAleatoire()] });

                let state = "lose";
                let missed = 0;
                let boucle = true;

                const date1 = Date.now();
                let date2 = null;

                while (Date.now() - date1 < 3000 && boucle) {
                    const response = await msgChallenge.awaitMessageComponent({
                        filter: (i) => i.user.id === t.message.author.id,
                        time: 3000 - (Date.now() - date1),
                    }).catch(async () => {
                        state = "time";
                        if (await t.client.hasMsg(msg.channel, msg.id) !== false) await msg.delete();
                    });

                    if (response) {
                        if (response.customId === "target") {
                            try { await response.deferUpdate(); }
                            catch { console.log("error defer"); }
                            state = "gg";
                            date2 = Date.now();
                            boucle = false;
                        } else if (response.customId.startsWith("void")) {
                            try { await response.deferUpdate(); }
                            catch { console.log("error defer"); }
                            missed++;
                        }
                    }
                }
                const difference = around(date2 - date1);
                let score = 2500 - (difference) + around(t.client.ws.ping) - (missed * 100) + 500;

                if (state === "time") score = 0;

                let classe = [null, null];
                if (score >= 0) classe = ["C", "🇨"];
                if (score > 1000) classe = ["B", "🇧"];
                if (score > 1500) classe = ["A", "🇦"];
                if (score > 2000) classe = ["S", "🇸"];

                return { score, classe, state };
            },
        ];

        const results = await allChallenges[Math.floor(Math.random() * allChallenges.length)](challengeMessage, this, mEmbed);
        return { results: results, msg: challengeMessage };
    }

    async strengthMiniGame(embed = null) {
        let mEmbed = embed;
        if (embed === null) mEmbed = genererDialogBox(this.client, this.message.author);

        mEmbed.setTitle("💪 • Un défi de force va apparaître !");
        const challengeMessage = await this.message.channel.send({ content: `<@${this.message.author.id}>`, embeds: [mEmbed], components: [] });

        await delay(Math.random() * 2 * 1000 + 1000);

        const allChallenges = [
            async function SelectSpam(msg, t, em) {
                const genererSelectMenu = (clics) => {
                    const btn = new MessageButton({ "customId": "clic", "emoji": "🎯", "style": "DANGER", "label": clics });

                    return btn;
                };

                em.setDescription("**Enchaîne** le plus de clique en 10sec :dart: !");

                let msgChallenge = null;
                if (await t.client.hasMsg(msg.channel, msg.id) !== false) msgChallenge = await msg.edit({ embeds: [em], components: [new MessageActionRow().addComponents(genererSelectMenu(0))] });
                else msgChallenge = await msg.channel.send({ embeds: [em], components: [new MessageActionRow().addComponents(genererSelectMenu(0))] });

                let state = "lose";

                const date1 = Date.now();
                let clics = 0;

                while (Date.now() - date1 < 10000) {
                    const time = 10000 - (Date.now() - date1);
                    const response = await msgChallenge.awaitMessageComponent({
                        filter: (i) => i.user.id === t.message.author.id,
                        time: time,
                    }).catch(async () => {
                        if (await t.client.hasMsg(msgChallenge.channel, msgChallenge.id) !== false) await msgChallenge.edit({ embeds: [em], components: [new MessageActionRow().addComponents(genererSelectMenu(clics))] });
                        else msgChallenge = await msgChallenge.channel.SEND({ embeds: [em], components: [new MessageActionRow().addComponents(genererSelectMenu(clics))] });
                    });

                    if (response) {
                        try { await response.deferUpdate(); }
                        catch { console.log("error defer"); }
                        clics += 1;
                        state = "gg";
                        if (await t.client.hasMsg(msgChallenge.channel, msgChallenge.id) !== false) await msgChallenge.edit({ embeds: [em], components: [new MessageActionRow().addComponents(genererSelectMenu(clics))] });
                        else msgChallenge = await msgChallenge.channel.send({ embeds: [em], components: [new MessageActionRow().addComponents(genererSelectMenu(clics))] });
                    }
                }
                let score = 200 * clics + around(t.client.ws.ping) + 500;

                if (clics === 0 || state === "lose") score = 0;

                let classe = [null, null];
                if (score >= 0) classe = ["C", "🇨"];
                if (score > 1000) classe = ["B", "🇧"];
                if (score > 1500) classe = ["A", "🇦"];
                if (score > 2000) classe = ["S", "🇸"];

                return { score, classe, state };
            },
        ];

        const results = await allChallenges[Math.floor(Math.random() * allChallenges.length)](challengeMessage, this, mEmbed);
        return { results: results, msg: challengeMessage };
    }

    async agilityMiniGame(embed = null) {
        let mEmbed = embed;
        if (embed === null) mEmbed = genererDialogBox(this.client, this.message.author);

        mEmbed.setTitle("🤸 • Un défi d'agilité va apparaître !");
        const challengeMessage = await this.message.channel.send({ content: `<@${this.message.author.id}>`, embeds: [mEmbed], components: [] });

        await delay(Math.random() * 2 * 1000 + 1000);

        const allChallenges = [
            async function GoodColor(msg, t, em) {
                const shuffle = (arr) => {
                    arr.sort(() => Math.random() - 0.5);

                    return arr;
                };
                const row = new MessageActionRow().addComponents(
                    new MessageButton({ customId: "red", style: "SECONDARY", emoji: "🟥" }),
                    new MessageButton({ customId: "blue", style: "SECONDARY", emoji: "🟦" }),
                    new MessageButton({ customId: "green", style: "SECONDARY", emoji: "🟩" }),
                    new MessageButton({ customId: "purple", style: "SECONDARY", emoji: "🟪" }),
                    new MessageButton({ customId: "yellow", style: "SECONDARY", emoji: "🟨" }),
                );
                const genererBouttonsAleatoire = (ROW) => {
                    ROW.components = shuffle(ROW.components);

                    return ROW;
                };

                const allColors = [
                    ["red", "Rouge 🟥"],
                    ["blue", "Bleu 🟦"],
                    ["green", "Vert 🟩"],
                    ["purple", "Violet 🟪"],
                    ["yellow", "Jaune 🟨"],
                ];

                const good = allColors[Math.floor(Math.random() * allColors.length)];

                em.setDescription(`**Clique** le plus rapidement sur le carré **${good[1]}** !`);

                let msgChallenge = null;
                if (await t.client.hasMsg(msg.channel, msg.id) !== false) msgChallenge = await msg.edit({ embeds: [em], components: [genererBouttonsAleatoire(row)] });
                else msgChallenge = await msg.channel.send({ embeds: [em], components: [genererBouttonsAleatoire(row)] });

                let state = "lose";
                let boucle = true;

                const date1 = Date.now();
                let rotation = -1;

                while (Date.now() - date1 < 9000 && boucle) {
                    rotation += 1;
                    const response = await msgChallenge.awaitMessageComponent({
                        filter: (i) => i.user.id === t.message.author.id,
                        time: 3000,
                    }).catch(async () => {
                        if (await t.client.hasMsg(msg.channel, msg.id) !== false) await msgChallenge.edit({ embeds: [em], components: [genererBouttonsAleatoire(row)] });
                        else msgChallenge = await msgChallenge.channel.send({ embeds: [em], components: [genererBouttonsAleatoire(row)] });
                    });

                    if (response) {
                        if (response.customId === good[0]) {
                            try { await response.deferUpdate(); }
                            catch { console.log("error defer"); }
                            state = "gg";
                            boucle = false;
                        } else {
                            try { await response.deferUpdate(); }
                            catch { console.log("error defer"); }
                            if (await t.client.hasMsg(msg.channel, msg.id) !== false) await msgChallenge.edit({ embeds: [em], components: [genererBouttonsAleatoire(row)] });
                            else msgChallenge = await msgChallenge.edit({ embeds: [em], components: [genererBouttonsAleatoire(row)] });
                        }
                    }
                }
                let score = 2000 - (rotation * 400) + 500;

                if (rotation === 4 || state === "lose") score = 0;

                let classe = [null, null];
                if (score >= 0) classe = ["C", "🇨"];
                if (score > 1000) classe = ["B", "🇧"];
                if (score > 1500) classe = ["A", "🇦"];
                if (score > 2000) classe = ["S", "🇸"];

                return { score, classe, state };
            },
        ];

        const results = await allChallenges[Math.floor(Math.random() * allChallenges.length)](challengeMessage, this, mEmbed);
        return { results: results, msg: challengeMessage };
    }

    async enduranceMiniGame(embed = null) {
        let mEmbed = embed;
        if (embed === null) mEmbed = genererDialogBox(this.client, this.message.author);

        mEmbed.setTitle("⏲️ • Un défi d'endurance va apparaître !");
        const challengeMessage = await this.message.channel.send({ content: `<@${this.message.author.id}>`, embeds: [mEmbed], components: [] });

        await delay(Math.random() * 2 * 1000 + 1000);

        const allChallenges = [
            async function ALotOfClicks(msg, t, em) {
                const genererSelectMenu = (clics) => {
                    const btn = new MessageButton({ "customId": "clic", "emoji": "🎯", "style": "DANGER", "label": clics });

                    return btn;
                };

                em.setDescription("**Effectue** 5 clics :dart: !");

                let msgChallenge = null;
                if (await t.client.hasMsg(msg.channel, msg.id) !== false) msgChallenge = await msg.edit({ embeds: [em], components: [new MessageActionRow().addComponents(genererSelectMenu(0))] });
                else msgChallenge = await msg.channel.send({ embeds: [em], components: [new MessageActionRow().addComponents(genererSelectMenu(0))] });


                let state = "lose";
                let clics = 0;
                const time1 = Date.now();
                let time2 = Date.now();

                while (clics < 5 && time2 - time1 < 20000) {
                    const time = 2500;
                    const response = await msgChallenge.awaitMessageComponent({
                        filter: (i) => i.user.id === t.message.author.id,
                        time: time,
                    }).catch(async () => {
                        if (await t.client.hasMsg(msg.channel, msg.id) !== false) await msgChallenge.edit({ embeds: [em], components: [new MessageActionRow().addComponents(genererSelectMenu(clics))] });
                        else msgChallenge = await msgChallenge.channel.send({ embeds: [em], components: [new MessageActionRow().addComponents(genererSelectMenu(clics))] });
                    });

                    if (response) {
                        time2 = Date.now();
                        try { await response.deferUpdate(); }
                        catch { console.log("prout"); }
                        clics += 1;
                        state = "gg";
                        if (await t.client.hasMsg(msg.channel, msg.id) !== false) await msgChallenge.edit({ embeds: [em], components: [new MessageActionRow().addComponents(genererSelectMenu(clics))] });
                        else msgChallenge = await msgChallenge.channel.send({ embeds: [em], components: [new MessageActionRow().addComponents(genererSelectMenu(clics))] });
                    }
                }
                let score = 400 * clics;
                if (time2 - time1 >= 20000) score = 0;

                if (clics === 0 || state === "lose") score = 0;

                let classe = [null, null];
                if (score >= 0) classe = ["C", "🇨"];
                if (score > 1000) classe = ["B", "🇧"];
                if (score > 1500) classe = ["A", "🇦"];
                if (score > 2000) classe = ["S", "🇸"];

                return { score, classe, state };
            },
        ];

        const results = await allChallenges[Math.floor(Math.random() * allChallenges.length)](challengeMessage, this, mEmbed);
        return { results: results, msg: challengeMessage };
    }
}

module.exports = Step;