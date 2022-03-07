/* eslint-disable no-lonely-if */
/* eslint-disable brace-style */
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const fs = require("fs");

const Players = require("../../../structures/database/Players");
const Progress = require("../../../structures/database/Progress");
const convertDate = require("../../../utils/convertDate");
const Activities = require("../../../structures/database/Activities");

module.exports = {
    run: async (client, message, args) => {
        if (!(await Players.has(client, message.author.id))) return await client.resp(message.author, message.channel, "Vous n'avez pas commencé votre aventure sur Obanai.", "error");

        const progress = await Progress.get(client, message.author.id);

        if (progress.killed) {
            if (progress.healed > Date.now()) {
                const readyDate = convertDate(progress.healed - Date.now());
                const waitEmbed = new MessageEmbed()
                    .setColor(client.color)
                    .setImage("https://cdn.discordapp.com/attachments/935645629210820618/939264548156883074/healing.jpg")
                    .setTitle(`<:obanai_stare:939263628450877480> • Votre dernière mission a échoué. Vous serez sur pieds, prêt à reprendre votre route dans: **${readyDate.string}**`);
                return await message.reply({ embeds: [waitEmbed] });
            }
        }

        const busy = await Activities.isBusy(client, message.author.id);

        if (busy) {
            return await client.resp(message.author, message.channel, await Activities.occupationToString(client, message.author.id) + "\n\n*Pensez à récupérer vos récompenses en faisant la commande associée à l'activité.*", "error");
        }

        const chapterExist = fs.existsSync(`./src/assets/story/chapter${progress.chapter}`) && fs.existsSync(`./src/assets/story/chapter${progress.chapter}/chapter-infos.js`);
        let chapterDatas = null;
        if (chapterExist) chapterDatas = require(`../../../assets/story/chapter${progress.chapter}/chapter-infos.js`);

        if (chapterDatas !== null) {
            if (chapterDatas.pages > 0) {
                if (!fs.existsSync(`./src/assets/story/chapter${progress.chapter}/step${progress.step}.js`)) return await client.resp(message.author, message.channel, "Vous êtes allé loin dans le mode campagne ! La suite est en écriture.", "error");
                const page = require(`../../../assets/story/chapter${progress.chapter}/step${progress.step}.js`);
                const questPage = await client.interact(
                    message.author,
                    message.channel,
                    `📖 • **Quête actuelle**\n\n${chapterDatas.id >= 3 ? "**```fix\n⚠️ LES ÉLÉMENTS DE LA SUITE DU SCÉNARIO PEUVENT CONTENIR DES SPOILS. CONTINUEZ A VOS RISQUES ET PÉRILS !```**" : ""}\`\`\`fix\nChapitre ${chapterDatas.id}, ${chapterDatas.name}\`\`\`\nPage: **${page.id}**/${chapterDatas.pages}\n\n> **${page.name}** — ${page.intrigue}`,
                    "normal",
                    [
                        new MessageActionRow()
                            .addComponents(
                                new MessageButton().setCustomId("accept").setStyle("SUCCESS").setEmoji("✅").setLabel("Lancer la quête"),
                                new MessageButton().setCustomId("deny").setStyle("DANGER").setEmoji("❌").setLabel("Refuser"),
                            ),
                    ],
                    (i) => i.user.id === message.author.id,
                    30000,
                );

                if (questPage === "null" || questPage.customId === "deny") {
                    await client.resp(message.author, message.channel, "Vous ne lancez pas votre aventure.", "error");
                } else if (questPage.customId === "accept") {
                    const executed = await page.exe(client, message, args);

                    if (executed === "done") {
                        const ggEmbed = new MessageEmbed()
                            .setColor(client.color)
                            .setTitle(":tada: • Félicitations, vous passez à l'étape suivante.");

                        let phrase = "";
                        if (progress.step === chapterDatas.pages) {
                            const nextChapterExist = fs.existsSync(`./src/assets/story/chapter${progress.chapter + 1}`) && fs.existsSync(`./src/assets/story/chapter${progress.chapter + 1}/chapter-infos.js`);
                            let nextChapterDatas = null;
                            if (nextChapterExist) nextChapterDatas = require(`../../../assets/story/chapter${progress.chapter + 1}/chapter-infos.js`);

                            if (nextChapterDatas !== null) {
                                if (nextChapterDatas.pages > 0) {
                                    const nextPage = require(`../../../assets/story/chapter${progress.chapter + 1}/step1.js`);
                                    phrase = `Vous passez au chapitre suivant:\n**${progress.chapter + 1}**, **${nextChapterDatas.name}**, étape **1**, **${nextPage.name}**\n\n> *${nextPage.intrigue}*`;
                                }
                            }
                        } else if (fs.existsSync(`./src/assets/story/chapter${progress.chapter}/step${progress.step + 1}.js`)) {
                            const nextPage = require(`../../../assets/story/chapter${progress.chapter}/step${progress.step + 1}.js`);
                            phrase = `Vous passez à l'étape suivante:\nÉtape **${nextPage.id}**, **${nextPage.name}**\n\n> *${nextPage.intrigue}*`;
                        }

                        ggEmbed.setDescription(phrase);
                        await Progress.updateProgression(client, message.author.id);
                        await message.channel.send({ embeds: [ggEmbed.setAuthor({ "name": message.author.tag, "iconURL": message.author.displayAvatarURL({ "dynamic": true }) })] });
                    } else {
                        if (executed === "lose") {
                            const loseEmbed = new MessageEmbed()
                                .setColor(client.color)
                                .setImage("https://cdn.discordapp.com/attachments/935645629210820618/939264306283958292/kakushi_save.jpg")
                                .setTitle("<:obanai_stare:939263628450877480> • Vous avez échoué votre combat, l'équipe des Kakushi vous ont ramené(e) avant qu'il ne soit trop tard. Tâchez de vous soigner.");
                            await message.channel.send({ embeds: [loseEmbed.setAuthor({ "name": message.author.tag, "iconURL": message.author.displayAvatarURL({ "dynamic": true }) })] });

                            await Progress.failMission(client, message.author.id);
                        } else if (executed === "afk") {
                            const afkEmbed = new MessageEmbed()
                                .setColor(client.color)
                                .setImage("https://cdn.discordapp.com/attachments/935645629210820618/943822568241102869/bien_commmencer.jpg")
                                .setTitle("<:Tanjiro_Kamado:943193208144429077> • Vous êtes absents. Revenez me voir lorsque vous serez prêts à faire votre quête.");
                            await message.channel.send({ embeds: [afkEmbed.setAuthor({ "name": message.author.tag, "iconURL": message.author.displayAvatarURL({ "dynamic": true }) })] });
                        }
                    }
                }
            }
        } else {
            return await client.resp(message.author, message.channel, "Vous êtes allé loin dans le mode campagne ! La suite est en écriture.", "error");
        }
    },

    infos: {
        name: "chapter",
        aliases: ["chapter", "chap"],
        category: "adventure",
        description: "Jouez au mode histoire du bot.",
        cooldown: 10,
        permissions: [],
        finishRequests: ["adventure", "battle", "chapter", "train"],
        adminsOnly: false,
    },
};