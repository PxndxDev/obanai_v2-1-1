/* eslint-disable no-case-declarations */
/* eslint-disable brace-style */
const { MessageEmbed, Collection } = require("discord.js");
const Body = require("../../../structures/classes/Body");
const MultiplayerBattle = require("../../../structures/classes/MultiplayerBattle");
const Relationship = require("../../../structures/classes/Relationship");
const Weapon = require("../../../structures/classes/Weapon");
const Players = require("../../../structures/database/Players");

module.exports = {
    run: async (client, message, args) => {
        let p2 = null;
        const battleRelationship = new Relationship(client, message, args);
        const players = await battleRelationship.FindUser();

        // récupération du deuxième joueur
        if (players.comment === "not found") return await battleRelationship.NotFoundResponse();
        if (players.comment === "single") p2 = players.user;
        if (players.comment === "multiple") {
            p2 = await battleRelationship.MultipleAwaiting(players);
            if (!p2) p2 = message.author;
        }

        if (p2.id === message.author.id) return await client.resp(message.author, message.channel, "Il est impossible de se défier soi-même.", "error");

        // récupération des données des deux joueurs
        const player1Exists = await Players.has(client, message.author.id);
        const player2Exists = await Players.has(client, p2.id);

        if (!player1Exists) return await client.resp(message.author, message.content, "Vous n'avez pas encore commencé votre aventure.", "error");
        if (!player2Exists) return await client.resp(message.author, message.content, `**${p2.tag}** n'a pas encore commencé son aventure.`, "error");


        if (!client.requests.has("battle")) client.requests.set("battle", new Collection());

        // est-ce que le joueur a fini toutes ses précédentes requêtes
        if (client.commands.get("battle").infos.finishRequests.length > 0) {
            const requestsInUse = client.requests.filter(cmd => cmd.has(p2.id)).map(e => e.map(f => f)[0]);
            let canComplete = true;
            const toComplete = [];

            for (const req of client.commands.get("battle").infos.finishRequests) {
                if (requestsInUse.includes(req)) {
                    toComplete.push(req);
                    if (canComplete) canComplete = false;
                }
            }

            if (!canComplete) return await client.resp(message.author, message.channel, `<@${p2.id}> merci de répondre aux commandes précédentes: ${toComplete.map(e => `\`${e}\``).join("\n")}`, "error");
        }

        await client.requests.get("battle").set(p2.id, "battle");

        // récupération des données des deux joueurs
        let p1Datas = await Players.get(client, message.author.id);
        let p2Datas = await Players.get(client, p2.id);

        if (p1Datas.breath.ressourceName !== null) p1Datas = await (new Weapon(p1Datas.style).doDamages(p1Datas, p1Datas.breath.ressourceName));
        if (p2Datas.breath.ressourceName !== null) p2Datas = await (new Weapon(p2Datas.style).doDamages(p2Datas, p2Datas.breath.ressourceName));

        const battle = new MultiplayerBattle(client, {
            "player1": { "pDatas": p1Datas, "pUser": message.author, "life": 100, "body": new Body() },
            "player2": { "pDatas": p2Datas, "pUser": p2, "life": 100, "body": new Body() },
        });

        const response = await battle.battleRequest(message, args);
        if (!response) return client.requests.get("battle").delete(p2.id);

        let logs = await message.channel.send({ content: "||\u200B||" });
        while (battle.player1.life > 0 && battle.player2.life > 0 && !battle.forfeit && battle.player1.afks < 3 && battle.player2.afks < 3) {
            battle.played = false;
            switch (battle.role) {
                case "p1":
                    if (!battle.played) {
                        for (const log of battle.logs) battle.completeLogs.push(log);
                        battle.logs = [];
                        battle.logs.push(`\`\`\`» Round ${battle.round} !\`\`\``);
                        await battle.turn(message, battle.player1, battle.player2, logs);
                        if (!battle.forfeit) {
                            if (await client.hasMsg(message.channel, logs.id) !== false) await logs.edit({ embeds: [ new MessageEmbed({ color: client.color, fields: [ { name: "<:invisible:921131991712272384>", value: battle.logs.join("\n") }] }).setFooter({ text: "Votre journal de combat sera enregistré !" })] });
                            else logs = await message.channel.send({ embeds: [ new MessageEmbed({ color: client.color, description: battle.logs.join("\n") }).setFooter({ text: "Votre journal de combat sera enregistré !" })] });
                            battle.played = true;
                            battle.role = "p2";
                            battle.nextStep = "tour";
                        }
                    }
                break;
                case "p2":
                    if (!battle.played) {
                        await battle.turn(message, battle.player2, battle.player1, logs);
                        if (!battle.forfeit) {
                            if (await client.hasMsg(message.channel, logs.id) !== false) await logs.edit({ embeds: [ new MessageEmbed({ color: client.color, fields: [ { name: "<:invisible:921131991712272384>", value: battle.logs.join("\n") }] }).setFooter({ text: "Votre journal de combat sera enregistré !" })] });
                            else logs = await message.channel.send({ embeds: [ new MessageEmbed({ color: client.color, description: battle.logs.join("\n") }).setFooter({ text: "Votre journal de combat sera enregistré !" })] });
                            battle.played = true;
                            battle.role = "p1";
                            battle.round++;
                            battle.nextStep = "round";
                        }
                    }
                break;
                default: break;
            }
        }
        if (battle.player1.life <= 0 || battle.player2.life <= 0) {
            await battle.winDisplay(message, logs);
        } else if (battle.player1.afks >= 3 || battle.player2.afks >= 3) {
            await battle.afkDisplay(message, logs);
        }

        const file = await battle.giveReplay();
        await message.channel.send({ content: `Le combat entre **${message.author.username}** et **${p2.username}** est disponible ici :`, files: [file] });
        client.requests.get("battle").delete(p2.id);
    },

    infos: {
        name: "battle",
        aliases: ["battle", "btl"],
        category: "adventure",
        description: "Combattez l'adversaire de votre choix.",
        cooldown: 2,
        permissions: [],
        finishRequests: ["adventure", "battle", "chapter", "train"],
        adminsOnly: false,
    },
};