/* eslint-disable curly */
/* eslint-disable no-lonely-if */
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const Progress = require("../../../structures/database/Progress");
const Players = require("../../../structures/database/Players");
const Step = require("../../../structures/classes/Step");
const Activities = require("../../../structures/database/Activities");
const train_table = require("../../../assets/tables/train.json");
const convertDate = require("../../../utils/convertDate");

/* eslint-disable brace-style */
module.exports = {
    run: async (client, message, args) => {
        const playerExists = await Players.has(client, message.author.id);

        if (playerExists === false) return message.reply({ content: "Vous n'avez pas commencé votre aventure sur Obanai." });

        const pDatas = await Players.get(client, message.author.id);
        const aDatas = await Activities.get(client, message.author.id);
        const p2Datas = await Progress.get(client, message.author.id);
        const busy = await Activities.isBusy(client, message.author.id);

        if (busy) {
            if (aDatas.end_date > Date.now()) {
                const action = args[0] ? args[0].toLowerCase() : "a";
                if (aDatas.activity === "train" && action === "game") {
                    const allSessions = aDatas.if_train_datas.sessions;
                    const filter = (sess) => {
                        let toReturn = false;
                        if (sess.date === null) toReturn = true;
                        else {
                            if (sess.date > Date.now()) {
                                if (sess.scores.length < 10) toReturn = true;
                            }
                        }

                        return toReturn;
                    };

                    let activeSession = allSessions.filter(s => filter(s));
                    if (activeSession.length > 0) activeSession = activeSession[0];
                    else activeSession = [];

                    if (activeSession.length === 0) return await client.resp(message.author, message.channel, "Vous avez rempli toutes vos sessions actives. Pour avoir plus d'informations, faire `train infos`.", "error");
                    if (activeSession.id > 0) {
                        const lastSession = allSessions.filter(s => s.id === activeSession.id - 1)[0];
                        if (lastSession.date > Date.now() && lastSession.scores.length >= 10) {
                            return await client.resp(message.author, message.channel, "Vous avez rempli toutes vos sessions actives. Pour avoir plus d'informations, faire `train infos`.", "error");
                        }
                    }
                    if (activeSession.date === null) activeSession.date = Date.now() + 1_800_000;
                    const s = new Step(client, message, args);
                    const inWorking = aDatas.if_train_datas.aptitude;

                    let score = null;
                    let results = null;
                    switch (inWorking) {
                        case "strength":
                            results = await s.strengthMiniGame();
                        break;
                        case "speed":
                            results = await s.fastMiniGame();
                        break;
                        case "agility":
                            results = await s.agilityMiniGame();
                        break;
                        case "endurance":
                            results = await s.enduranceMiniGame();
                        break;
                        default: console.log("Entraînement inconnu: ");
                    }

                    score = results.results;
                    if (score.score > 3000) score.score = 3000;

                    await client.resp(message.author, message.channel, `Votre exercice est terminé. Vous avez obtenu un score de **${score.score}**, et vous obtenez le rang **${score.classe[0]}** !`, "accept");

                    activeSession.scores.push(score);
                    allSessions[activeSession.id] = activeSession;
                    await client.Activities.set(message.author.id, allSessions, "if_train_datas.sessions");

                } else if (aDatas.activity === "train" && action === "infos") {
                    let affichage = "";

                    for (const session of aDatas.if_train_datas.sessions) {
                        affichage += `\`\`\`fix\nSession ${session.id + 1}\`\`\``;
                        if (session.date === null) {
                            affichage += "*La session n'a pas encore été commencée.*";
                            if (session.id > 0) {
                                const lastSession = aDatas.if_train_datas.sessions.filter(s => s.id === session.id - 1)[0];
                                if (lastSession.date !== null && lastSession.date > Date.now() && lastSession.scores.length >= 10) {
                                    affichage += `\n_La session est disponible dans **${convertDate(lastSession.date - Date.now()).string}**._`;
                                }
                            }
                        }
                        else {
                            if (session.date > Date.now()) {
                                if (session.scores.length < 10) {
                                    affichage += `🔓 • _Session ouverte pendant encore **${aDatas.end_date - Date.now() > session.date - Date.now() ? convertDate(session.date - Date.now()).string : convertDate(aDatas.end_date - Date.now()).string}**._`;
                                } else {
                                    affichage += "🔒 • _Session fermée, tous vos entraînements sont utilisés._";
                                }
                                affichage += `\nScores actuels: \`${session.scores.length}/10\`\n${session.scores.map(e => `**${e.score}**`).join(" / ")}`;
                            } else {
                                affichage += "🔒 • _Session fermée, le temps est écoulé._";
                                affichage += `\nScores actuels: \`${session.scores.length}/10\`\n${session.scores.map(e => `**${e.score}**`).join(" / ")}`;
                            }
                        }
                    }

                    await client.resp(message.author, message.channel, affichage, "normal");
                } else { return message.reply({ content: await Activities.occupationToString(client, message.author.id) }); }
            } else {
                if (aDatas.activity === "train") {
                    let scores = 0;
                    let coeff = 0;
                    for (const s of aDatas.if_train_datas.sessions) {
                        for (const score of s.scores) scores += score.score;
                        coeff += s.scores.length;
                    }
                    let scoreMoyen = Number(((((scores / coeff) / 10) * coeff) / 10).toFixed(0));
                    if (coeff === 0) scoreMoyen = 0;
                    if (scoreMoyen > 0) await Players.addExp(client, message.author.id, message, scoreMoyen);
                    await client.resp(message.author, message.channel, `Votre entraînement est terminé, votre **${
                        ["Force", "Vitesse", "Agilité", "Endurance"][
                            ["strength", "speed", "agility", "endurance"].indexOf(aDatas.if_train_datas.aptitude.toLowerCase())
                        ]}** est désormais à \`x${(pDatas[aDatas.if_train_datas.aptitude.toLowerCase()] + 0.05).toFixed(2)}\`.`, "normal");
                    await Activities.freeOfActivity(client, message.author.id);
                    await client.Players.set(message.author.id, Number((pDatas[aDatas.if_train_datas.aptitude] + 0.05).toFixed(2)), aDatas.if_train_datas.aptitude);
                }
            }
        } else {
            const aptitude = args[0] ? args[0].toLowerCase() : "a";


            if (["strength", "speed", "agility", "endurance"].includes(aptitude.toLowerCase())) {

                const levelLimit = train_table[p2Datas.chapter];

                if (pDatas[aptitude] >= levelLimit) return await client.resp(message.author, message.channel, `Vous avez atteint le niveau max pour cette aptitude: \`x${levelLimit}\`. Pour augmenter votre limite max, passez aux arcs suivants du mode histoire !`, "error");

                const toUp = ["Force", "Vitesse", "Agilité", "Endurance"][["strength", "speed", "agility", "endurance"].indexOf(aptitude.toLowerCase())];
                const wantToUpgrade = await client.interact(message.author, message.channel, 
                    `Vous êtes sur le point d'augmenter votre **${toUp}**.\n\n💥 • Entraînement\n\nPendant votre entraînement, vous pouvez effectuer une série d'exercice avec la commande \`?train game\`, et en fonction du score obtenu vous pouvez augmenter votre exp gagné en fin d'entraînement !\n\n\`${pDatas[aptitude]}\` <:increase:939489492870520864> \`${Number((pDatas[aptitude] + 0.05).toFixed(2))}\``,
                    "normal",
                    [
                        new MessageActionRow()
                            .addComponents(
                                new MessageButton().setCustomId("accept").setStyle("SUCCESS").setEmoji("✅"),
                                new MessageButton().setCustomId("deny").setStyle("DANGER").setEmoji("❌"),
                            ),
                    ],
                    (i) => i.user.id === message.author.id,
                    60000,
                );

                if (wantToUpgrade === "null") {
                    await client.resp(message.author, message.channel, "Il semblerait que vous n'ayez pas répondu.", "afk");
                } else if (wantToUpgrade.customId === "accept") {
                    await Activities.occupy(client, message.author.id, 120, "train", aptitude.toLowerCase());
                    await client.resp(message.author, message.channel, "Vous lancez votre entraînement, à dans 2h !", "accept");
                } else if (wantToUpgrade.customId === "deny") {
                    await client.resp(message.author, message.channel, "Vous refusez de lancer votre entraînement.", "error");
                }


            } else if (aptitude === "game") {
                await client.resp(message.author, message.channel, "Vous devez vous entraîner pour lancer des mini-jeux.", "error");

            } else if (aptitude === "infos") {
                await client.resp(message.author, message.channel, "Vous devez vous entraîner pour voir vos informations de session.", "error");
            } else if (args[0] === "de" && args[1] === "l'infini") {
                if (await client.hasMsg(message.channel, message.id) !== false) await message.reply("https://cdn.discordapp.com/attachments/945052700683403356/947933440538468352/unknown.png");
                else await message.channel.send(`<@${message.author.id}> https://cdn.discordapp.com/attachments/945052700683403356/947933440538468352/unknown.png`);

                ["🥚", "🚅"].forEach(async r => {
                    if (await client.hasMsg(message.channel, message.id) !== false) await message.react(r);
                });
            } else { await client.resp(message.author, message.channel, `\`\`\`fix\nGérer vos entraînements\`\`\`*\`\`\`Aptitudes :\`\`\`*\n${
                ["strength", "speed", "agility", "endurance"].map(e =>
                        "**train " + e + "** - " + [
                            `Force: \`${pDatas.strength}\` <:increase:939489492870520864> \`${Number((pDatas.strength + 0.05).toFixed(2))}\``,
                            `Vitesse: \`${pDatas.speed}\` <:increase:939489492870520864> \`${Number((pDatas.speed + 0.05).toFixed(2))}\``,
                            `Agilité: \`${pDatas.agility}\` <:increase:939489492870520864> \`${Number((pDatas.agility + 0.05).toFixed(2))}\``,
                            `Endurance: \`${pDatas.endurance}\` <:increase:939489492870520864> \`${Number((pDatas.endurance + 0.05).toFixed(2))}\``,
                        ][
                            ["strength", "speed", "agility", "endurance"].indexOf(e)
                        ]).join("\n")
                }\nℹ️ *La résistance découle de l'ensemble de vos autres aptitudes. Aucun entraînement possible, pour l'améliorer, il suffit de s'entraîner pour le reste.*\n\n*\`\`\`Exercices :\`\`\`*\n**train game** - permet d'effectuer des exercices pour gagner de l'exp à la fin de votre entraînement.\n**train infos** - permet de voir où vous en êtes dans vos sessions d'entrainements.`, "normal");
            }
        }
    },

    infos: {
        name: "train",
        aliases: ["train"],
        category: "adventure",
        description: "Commencez un entraînement pour améliorer vos aptitudes de combat !",
        cooldown: 2,
        permissions: [],
        finishRequests: ["adventure", "battle", "chapter", "train"],
        adminsOnly: false,
    },
};