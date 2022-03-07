/* eslint-disable no-shadow */
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const xpCalc = require("../profil/tools/calcul-level");
const Players = require("../../../structures/database/Players");
const Selection = require("../../../structures/classes/Selection");
const convertDate = require("../../../utils/convertDate");

/* eslint-disable brace-style */
module.exports = {
    run: async (client, message, args) => {
        const pExist = await Players.has(client, message.author.id);

        if (!pExist) return await client.resp(message.author, message.channel, "Vous n'avez pas commencé votre aventure sur Obanai.", "error");
        const pDatas = await Players.get(client, message.author.id);

        const options = [
            { "label": "Classement global", "value": "global", "description": "Regardez le classement général.", "emoji": "🌐" },
        ];

        if (pDatas.breath.ressourceName !== null) options.push({ "label": "Classement souffle", "value": "breath", "description": "Regardez le classement de votre souffle.", "emoji": pDatas.breath.ressources.emoji });

        const type = await new Selection(client, message, args).createChoice(options, null, null, "Quel leaderborad voulez-vous ?", []);

        let leaderboard = new MessageEmbed()
            .setTitle(type === "breath" ? `${pDatas.breath.ressources.emoji} » Classement` : ":trophy: » Classement")
            .setDescription("Page 1")
            .setColor(client.color)
            .setFooter({ text: `Prochaine actualisation dans ${convertDate((client.lastLBRefresh.get("lb") + client.delay) - Date.now()).string}` });

        if (!client.gameLeaderboard.global.has("lb") || client.gameLeaderboard.global.get("lb").map(e => e).length === 0) return await client.resp(message.author, message.channel, "Ce classement est actuellement vide.", "error");

        // créer le livre du leaderboard
        const pages = {};
        let lb = client.gameLeaderboard.global.get("lb").map(e => e);
        if (type === "breath") lb = client.gameLeaderboard.breaths.get("lb")[pDatas.breath.ressourceName].map(e => e);

        let page = 1;
        let i = 0;
        const j = lb.length;

        while (i < j) {
            if (!pages[page]) pages[page] = [];
            if (pages[page].length >= 5) {
                page++;
            } else {
                const p = lb[i];
                pages[page].push(p);
                i++;
            }
        }

        if (j === 0) return await client.resp(message.author, message.channel, "Ce classement est actuellement vide.", "error");

        const userPage = Object.entries(pages).filter(e => e[1].map(u => u.userId).includes(pDatas.userId)).length > 0 ? Object.entries(pages).filter(e => e[1].map(u => u.userId).includes(pDatas.userId))[0][0] : "Non enregistré.";
        leaderboard.setDescription(`Page 1 — Vous êtes à la page **${userPage}**`);

        // trouver le top 5 et l'enregistrer
        let field = "";
        let pos = 1;
        for (const pl of pages["1"]) {
            if (pos <= 5) field += `${pl.userId === message.author.id ? "📌" : ""} **\`${pos}.\`** ${client.users.cache.get(pl.userId) === undefined ? `<@${pl.userId}>` : `**${client.users.cache.get(pl.userId).username}**`} | **${pl.elo}** <:elo:921136729996554280>\n<:invisible:921131991712272384> ➥ Niv. ${xpCalc(pl.exp).level}, ${pl.breath.ressources.emoji ?? ""} **${pl.breath.ressources.name}**\n`;
            pos++;
        }
        leaderboard.addField("\u200B", field.length > 1 ? field.substring(0, 1024) : "\u200B");

        // creation du menu de navigation
        let btns = new MessageActionRow().addComponents(
            new MessageButton().setCustomId("previous").setStyle("SECONDARY").setEmoji("⬅️").setDisabled(true),
            new MessageButton().setCustomId("stop").setStyle("SECONDARY").setEmoji("🟥").setDisabled(false),
            new MessageButton().setCustomId("next").setStyle("SECONDARY").setEmoji("➡️").setDisabled(false),
            new MessageButton().setCustomId("search").setStyle("SECONDARY").setEmoji("🔎").setDisabled(false),
        );
        let lbResp = await message.reply({ embeds: [ leaderboard ], components: [btns] });
        let reacting = true;
        let p = 1;
        while (reacting) {
            const switchPages = await lbResp.awaitMessageComponent({ filter: (i) => i.user.id === message.author.id, time: 15000 })
            .catch(async () => {
                if (await client.hasMsg(lbResp.channel, lbResp.id) !== false) lbResp = await lbResp.edit({ components: [] });
                else lbResp = await lbResp.channel.send({ embeds: [leaderboard], components: [] });
                reacting = false;
            });

            if (!reacting) return;

            if (switchPages) {
                try { await switchPages.deferUpdate(); }
                catch { console.log("prout"); }
                if (switchPages.customId === "previous" || switchPages.customId === "next") {
                    if (switchPages.customId === "previous" && p > 1) {
                        p--;
                    } else if (switchPages.customId === "next" && p < page) {
                        p++;
                    }

                    leaderboard = new MessageEmbed()
                        .setTitle(type === "breath" ? `${pDatas.breath.ressources.emoji} » Classement` : ":trophy: » Classement")
                        .setColor(client.color)
                        .setDescription(`Page ${p} — Vous êtes à la page **${userPage}**`)
                        .setFooter({ text: `Prochaine actualisation dans ${convertDate((client.lastLBRefresh.get("lb") + client.delay) - Date.now()).string}` });


                    // trouver le top 5 et l'enregistrer
                    field = "";
                    pos = ((p - 1) * 5) + 1;
                    for (const pl of pages[String(p)]) {
                        if (pos <= ((p - 1) * 5) + 6) field += `${pl.userId === message.author.id ? "📌" : ""} **\`${pos}.\`** ${client.users.cache.get(pl.userId) === undefined ? `<@${pl.userId}>` : `**${client.users.cache.get(pl.userId).username}**`} | **${pl.elo}** <:elo:921136729996554280>\n<:invisible:921131991712272384> ➥ Niv. ${xpCalc(pl.exp).level}, ${pl.breath.ressources.emoji ?? ""} **${pl.breath.ressources.name}**\n`;
                        pos++;
                    }
                    leaderboard.addField("\u200B", field.length > 1 ? field.substring(0, 1024) : "\u200B");

                    btns = new MessageActionRow().addComponents(
                        new MessageButton().setCustomId("previous").setStyle("SECONDARY").setEmoji("⬅️").setDisabled(p === 1),
                        new MessageButton().setCustomId("stop").setStyle("SECONDARY").setEmoji("🟥").setDisabled(false),
                        new MessageButton().setCustomId("next").setStyle("SECONDARY").setEmoji("➡️").setDisabled(p === page),
                        new MessageButton().setCustomId("search").setStyle("SECONDARY").setEmoji("🔎").setDisabled(false),
                    );
                    if (await client.hasMsg(lbResp.channel, lbResp.id) !== false) lbResp = await lbResp.edit({ embeds: [ leaderboard ], components: [btns] });
                    else lbResp = await lbResp.channel.send({ embeds: [ leaderboard ], components: [btns] });
                } else if (switchPages.customId === "stop") {leaderboard = new MessageEmbed()
                    .setTitle(type === "breath" ? `${pDatas.breath.ressources.emoji} » Classement` : ":trophy: » Classement")
                    .setColor(client.color)
                    .setDescription(`Page ${p} — Vous êtes à la page **${userPage}**`)
                    .setFooter({ text: `Prochaine actualisation dans ${convertDate((client.lastLBRefresh.get("lb") + client.delay) - Date.now()).string}` });


                    // trouver le top 5 et l'enregistrer
                    field = "";
                    pos = ((p - 1) * 5) + 1;
                    for (const pl of pages[String(p)]) {
                        if (pos <= ((p - 1) * 5) + 6) field += `${pl.userId === message.author.id ? "📌" : ""} **\`${pos}.\`** ${client.users.cache.get(pl.userId) === undefined ? `<@${pl.userId}>` : `**${client.users.cache.get(pl.userId).username}**`} | **${pl.elo}** <:elo:921136729996554280>\n<:invisible:921131991712272384> ➥ Niv. ${xpCalc(pl.exp).level}, ${pl.breath.ressources.emoji ?? ""} **${pl.breath.ressources.name}**\n`;
                        pos++;
                    }
                    leaderboard.addField("\u200B", field.length > 1 ? field.substring(0, 1024) : "\u200B");
                    if (await client.hasMsg(lbResp.channel, lbResp.id) !== false) lbResp = await lbResp.edit({ embeds: [ leaderboard ], components: [] });
                    else lbResp = await lbResp.channel.send({ embeds: [ leaderboard ], components: [] });
                    reacting = false;
                } else if (switchPages.customId === "search") {
                    const pageToShow = await client.amsg(message.author, message.channel, "Quelle page voulez-vous voir ?", "info", (m) => m.author.id === message.author.id, 20000);
                    if (pageToShow.first()) {
                        const p2 = Number(pageToShow.first().content);
                        if (isNaN(p)) {
                            return await client.resp(message.author, message.content, "Votre réponse n'est pas un nombre.", "error");
                        }

                        if (p2 < 1 || p2 > Object.entries(pages).length) return await client.resp(message.author, message.channel, "Votre nombre doit être un nombre de page valide.", "error");

                        if (await client.hasMsg(pageToShow.first().channel, pageToShow.first().id) !== false) await pageToShow.first().delete();

                        p = p2;

                        leaderboard = new MessageEmbed()
                            .setTitle(type === "breath" ? `${pDatas.breath.ressources.emoji} » Classement` : ":trophy: » Classement")
                            .setColor(client.color)
                            .setDescription(`Page ${p2}`)
                            .setFooter({ text: `Prochaine actualisation dans ${convertDate((client.lastLBRefresh.get("lb") + client.delay) - Date.now()).string}` });


                        // trouver le top 5 et l'enregistrer
                        field = "";
                        pos = ((p2 - 1) * 5) + 1;
                        for (const pl of pages[String(p)]) {
                            if (pos <= ((p2 - 1) * 5) + 6) field += `${pl.userId === message.author.id ? "📌" : ""} **\`${pos}.\`** ${client.users.cache.get(pl.userId) === undefined ? `<@${pl.userId}>` : `**${client.users.cache.get(pl.userId).username}**`} | **${pl.elo}** <:elo:921136729996554280>\n<:invisible:921131991712272384> ➥ Niv. ${xpCalc(pl.exp).level}, ${pl.breath.ressources.emoji ?? ""} **${pl.breath.ressources.name}**\n`;
                            pos++;
                        }
                        leaderboard.addField("\u200B", field.length > 1 ? field.substring(0, 1024) : "\u200B");

                        btns = new MessageActionRow().addComponents(
                            new MessageButton().setCustomId("previous").setStyle("SECONDARY").setEmoji("⬅️").setDisabled(p === 1),
                            new MessageButton().setCustomId("stop").setStyle("SECONDARY").setEmoji("🟥").setDisabled(false),
                            new MessageButton().setCustomId("next").setStyle("SECONDARY").setEmoji("➡️").setDisabled(p === page),
                            new MessageButton().setCustomId("search").setStyle("SECONDARY").setEmoji("🔎").setDisabled(false),
                        );

                        if (await client.hasMsg(lbResp.channel, lbResp.id) !== false) lbResp = await lbResp.edit({ embeds: [ leaderboard ], components: [btns] });
                        else lbResp = await lbResp.channel.send({ embeds: [ leaderboard ], components: [btns] });
                    }
                }
            }
        }
    },

    infos: {
        name: "leaderboard",
        aliases: ["leaderboard", "lb"],
        category: "adventure",
        description: "Regardez le leaderboard du bot.",
        cooldown: 2,
        permissions: [],
        finishRequests: ["adventure", "battle", "chapter", "train"],
        adminsOnly: false,
    },
};