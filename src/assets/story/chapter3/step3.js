/* eslint-disable no-console */
/* eslint-disable brace-style */
const { MessageEmbed, MessageActionRow, MessageButton, Message } = require("discord.js");
const Step = require("../../../structures/classes/Step");
const { saveProgression } = require("../../../structures/database/Progress");
const Players = require("../../../structures/database/Players");
const fs = require("fs");

const id = 3;
const name = "Un style de combat";
const intrigue = "Vous avez désormais un maître, mais une session d'entraînement intense commence.";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);

    const pDatas = await Players.get(client, message.author.id);

    // récupération des ressources
    const e = require("../../narration/chapter3.json").step3.emojis[pDatas.breath.ressourceName];
    const br = pDatas.breath.ressourceName;
    const teacher = require(`../../elements/breath_styles/${br}_style.json`).teacher.name;
    const d = require("../../narration/chapter3.json").step3.texts;

    await s.createDialogue(null, null, { title: "UN STYLE DE COMBAT, partie 1", content: [
        "> Après de longues minutes de marche, vous arrivez dans ce qui semble être un camp d'entraînement.\n",
        `> ${e} — ${d[0][br]}\n`,
        `> ${e} — Premièrement, on va devoir déterminer ton style de combat. Nous allons procéder à plusieurs tests d'arme si une simple épée de pourfendeur ne te convient pas.\n`,
        `> ${teacher} est parti cherché une panoplie d'arme, tandis que vous restez debout à attendre sans bouger que votre maître revienne. C'est après une dizaine de minutes que vous revoyez sa silhouette approcher.\n`,
    ] });

    await s.displayInformation("Les armes de pourfendeur", "Les pourfendeurs sont armés et parfois avec des armes plutôt originales. En effet, ces derniers peuvent prendre une arme plus adaptée au souffle qu'ils utilisent. C'est ce que vous allez faire maintenant ! **Pensez bien à regarder les avantages de chacune !**", "https://cdn.discordapp.com/attachments/935645629210820618/944957148373352468/img_giyu2.jpg");

    const allWeapons = fs.readdirSync("./src/assets/elements/weapons/").map(f => require(`../../elements/weapons/${f}`));
    let p = 0;
    let choosen = null;

    let panel = await message.channel.send({ embeds: [
        new MessageEmbed()
            .setColor(client.color)
            .setAuthor({ "name": message.author.tag, "iconURL": message.author.displayAvatarURL({ "dynamic": true }) })
            .setDescription(`\`\`\`fix\n${allWeapons[p].name}\`\`\`\n> ${allWeapons[p].description}\n\n__Passifs d'arme__\n${allWeapons[p].bonus}\n\n__Boost de souffle__\n${allWeapons[p].best_breath.bonus}\n**Souffles concernés :** ${allWeapons[p].best_breath.name.map(f => require(`../../elements/breath_styles/${f}_style.json`)).map(f => `\`${f.emoji} ${f.name}\``).join(", ")}`),
    ], components: [
        new MessageActionRow().addComponents(
            new MessageButton().setCustomId("next").setLabel("→").setStyle("PRIMARY"),
            new MessageButton().setCustomId("accept").setEmoji("✅").setLabel("Choisir").setStyle("SUCCESS"),
            ),
    ] });

    let btns = new MessageActionRow();

    while (choosen === null) {
        const clic = await panel.awaitMessageComponent({ filter: (i) => i.user.id === message.author.id, time: 60000 }).catch(async () => {
            if (await client.hasMsg(panel.channel, panel.id !== false)) await panel.delete();
            choosen = false;
        });

        if (clic) {
            try { await clic.deferUpdate(); }
            catch { console.log("error defer"); }

            if (clic.customId === "accept") {
                choosen = allWeapons[p];
                if (await client.hasMsg(panel.channel, panel.id !== false)) await panel.delete();
                await client.resp(message.author, message.channel, `Vous décidez d'utiliser l'arme **${choosen.name}** !`, "normal");

                client.Players.set(message.author.id, allWeapons[p].id, "style");
            } else if (clic.customId === "previous" || clic.customId === "next") {
                btns = new MessageActionRow();
                if (clic.customId === "previous") {
                    if (p > 0) p--;
                }
                if (clic.customId === "next") {
                    if (p < allWeapons.length - 1) p++;
                }

                if (p === 0) {
                    btns.addComponents(
                        new MessageButton().setCustomId("next").setLabel("→").setStyle("PRIMARY"),
                        new MessageButton().setCustomId("accept").setEmoji("✅").setLabel("Choisir").setStyle("SUCCESS"),
                    );
                } else if (p === allWeapons.length - 1) {
                    btns.addComponents(
                        new MessageButton().setCustomId("previous").setLabel("←").setStyle("PRIMARY"),
                        new MessageButton().setCustomId("accept").setEmoji("✅").setLabel("Choisir").setStyle("SUCCESS"),
                    );
                } else {
                    btns.addComponents(
                        new MessageButton().setCustomId("previous").setLabel("←").setStyle("PRIMARY"),
                        new MessageButton().setCustomId("next").setLabel("→").setStyle("PRIMARY"),
                        new MessageButton().setCustomId("accept").setEmoji("✅").setLabel("Choisir").setStyle("SUCCESS"),
                    );
                }

                panel = await panel.edit({ embeds: [
                    new MessageEmbed()
                    .setColor(client.color)
                    .setAuthor({ "name": message.author.tag, "iconURL": message.author.displayAvatarURL({ "dynamic": true }) })
                    .setDescription(`\`\`\`fix\n${allWeapons[p].name}\`\`\`\n> ${allWeapons[p].description}\n\n__Passifs d'arme__\n${allWeapons[p].bonus}\n\n__Boost de souffle__\n${allWeapons[p].best_breath.bonus}\n**Souffles concernés :** ${allWeapons[p].best_breath.name.map(f => require(`../../elements/breath_styles/${f}_style.json`)).map(f => `\`${f.emoji} ${f.name}\``).join(", ")}`),
                ], components: [btns] });
            }
        }
    }

    let returned = "done";

    if (choosen === false) {
        await client.resp(message.author, message.channel, "Il semblerait que vous soyez AFK. Vous reprendrez votre quête plus tard.", "afk");
        returned = "afk";
    }

    await saveProgression(client, message.author.id, { global_: "QG des pourfendeurs", precise: "Camp d'entraînement" });
    return returned;
};

module.exports = { name, id, intrigue, exe };