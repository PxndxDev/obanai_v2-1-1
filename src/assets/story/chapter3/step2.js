/* eslint-disable no-console */
/* eslint-disable brace-style */
const { MessageEmbed, MessageActionRow, MessageButton, Message } = require("discord.js");
const Step = require("../../../structures/classes/Step");
const { saveProgression } = require("../../../structures/database/Progress");
const fs = require("fs");
const Breath = require("../../../structures/classes/Breath");

const id = 2;
const name = "Un maître";
const intrigue = "Vous voilà bien rapproché de votre but final. Mais pour combien de temps ?";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter3.json").step2;

    await s.createDialogue(null, null, { title: "LE DÉBUT DE LA FIN, partie 1", content: nar.dialog1 });

    await s.displayInformation("Choix du souffle", "Les pourfendeurs utilisent des souffles pour parfaire leur maitrise de l'épée. L'heure est venue de choisir le votre ! Faites glisser les pannels de droite à gauche, et sélectionnez celui qui vous conviendra.", "https://cdn.discordapp.com/attachments/935645629210820618/943556861746118666/Styles_de_Souffle.jpg");

    const allBreaths = fs.readdirSync("./src/assets/elements/breath_styles/").map(f => require(`../../elements/breath_styles/${f}`)).filter(f => f.name !== "Souffle de la Lune");
    let p = 0;
    let choosen = null;

    let panel = await message.channel.send({ embeds: [
        new MessageEmbed()
            .setColor(client.color)
            .setAuthor({ "name": message.author.tag, "iconURL": message.author.displayAvatarURL({ "dynamic": true }) })
            .setThumbnail(allBreaths[p].teacher.img)
            .setDescription(`\`\`\`fix\n${allBreaths[p].emoji} • ${allBreaths[p].name}\`\`\`\n${allBreaths[p].teacher.emoji} — ${allBreaths[p].teacher.replique}\n\n> **${allBreaths[p].movements.length}** mouvements`)
            .setFooter({ "text": `Formateur: ${allBreaths[p].teacher.name}` }),
    ], components: [
        new MessageActionRow().addComponents(
            new MessageButton().setCustomId("next").setEmoji(allBreaths[1].emoji).setLabel("→").setStyle("PRIMARY"),
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
                choosen = allBreaths[p];
                if (await client.hasMsg(panel.channel, panel.id !== false)) await panel.delete();
                await client.resp(message.author, message.channel, `Vous voilà désormais détenteur du **${choosen.name}** ${choosen.emoji} !`, "normal");
                const breathFile = fs.readdirSync("./src/assets/elements/breath_styles/").filter(file => require(`../../elements/breath_styles/${file}`).name === choosen.name);
                client.Players.set(message.author.id, new Breath(breathFile[0].split(".")[0].split("_")[0]).generated(), "breath");
            } else if (clic.customId === "previous" || clic.customId === "next") {
                btns = new MessageActionRow();
                if (clic.customId === "previous") {
                    if (p > 0) p--;
                }
                if (clic.customId === "next") {
                    if (p < allBreaths.length - 1) p++;
                }

                if (p === 0) {
                    btns.addComponents(
                        new MessageButton().setCustomId("next").setEmoji(allBreaths[1].emoji).setLabel("→").setStyle("PRIMARY"),
                        new MessageButton().setCustomId("accept").setEmoji("✅").setLabel("Choisir").setStyle("SUCCESS"),
                    );
                } else if (p === allBreaths.length - 1) {
                    btns.addComponents(
                        new MessageButton().setCustomId("previous").setEmoji(allBreaths[allBreaths.length - 2].emoji).setLabel("←").setStyle("PRIMARY"),
                        new MessageButton().setCustomId("accept").setEmoji("✅").setLabel("Choisir").setStyle("SUCCESS"),
                    );
                } else {
                    btns.addComponents(
                        new MessageButton().setCustomId("previous").setEmoji(allBreaths[p - 1].emoji).setLabel("←").setStyle("PRIMARY"),
                        new MessageButton().setCustomId("next").setEmoji(allBreaths[p + 1].emoji).setLabel("→").setStyle("PRIMARY"),
                        new MessageButton().setCustomId("accept").setEmoji("✅").setLabel("Choisir").setStyle("SUCCESS"),
                    );
                }

                panel = await panel.edit({ embeds: [
                    new MessageEmbed()
                        .setColor(client.color)
                        .setAuthor({ "name": message.author.tag, "iconURL": message.author.displayAvatarURL({ "dynamic": true }) })
                        .setThumbnail(allBreaths[p].teacher.img)
                        .setDescription(`\`\`\`fix\n${allBreaths[p].emoji} • ${allBreaths[p].name}\`\`\`\n${allBreaths[p].teacher.emoji} — ${allBreaths[p].teacher.replique}\n\n> **${allBreaths[p].movements.length}** mouvements`)
                        .setFooter({ "text": `Formateur: ${allBreaths[p].teacher.name}` }),
                ], components: [btns] });
            }
        }
    }

    let returned = "done";

    if (choosen === false) {
        await client.resp(message.author, message.channel, "Il semblerait que vous soyez AFK. Vous reprendrez votre quête plus tard.", "afk");
        returned = "afk";
    }

    await saveProgression(client, message.author.id, { global_: "QG des pourfendeurs", precise: "Dans la cour" });
    return returned;
};

module.exports = { name, id, intrigue, exe };