/* eslint-disable no-case-declarations */
/* eslint-disable brace-style */
const Players = require("../../../structures/database/Players");
const Stats = require("../../../structures/database/Stats");
const { MessageEmbed } = require("discord.js");
const Relationship = require("../../../structures/classes/Relationship");

module.exports = {
    run: async (client, message, args) => {
        let p2 = null;
        const battleRelationship = new Relationship(client, message, args);
        const players = await battleRelationship.FindUser();

        // récupération du deuxième joueur
        if (players.comment === "not found") p2 = message.author;
        if (players.comment === "single") p2 = players.user;
        if (players.comment === "multiple") {
            p2 = await battleRelationship.MultipleAwaiting(players);
            if (!p2) p2 = message.author;
        }

        const playerExists = await Players.has(client, p2.id);

        if (playerExists === false) return await client.resp(message.author, message.channel, (p2.id === message.author.id ? "Vous n'avez " : `<@${p2.id}> n'a `) + "pas commencé votre aventure sur Obanai.", "error");

        const sDatas = await Stats.get(client, p2.id);
        let description = `\`\`\`fix\nBatailles solo\`\`\`**${sDatas.soloBattle.victories}** victoires, **${sDatas.soloBattle.loses}** défaites.\n<:invisible:921131991712272384> → \`${(sDatas.soloBattle.victories * 100 / (sDatas.soloBattle.victories + sDatas.soloBattle.loses)).toFixed(1)}%\` de taux de victoire.`;

        description += `\n\`\`\`fix\nBatailles multijoueur\`\`\`**${sDatas.mpBattle.victories}** victoires, **${sDatas.mpBattle.loses}** défaites.\n<:invisible:921131991712272384> → \`${(sDatas.mpBattle.victories * 100 / (sDatas.mpBattle.victories + sDatas.mpBattle.loses)).toFixed(1)}%\` de taux de victoire.`;

        description += "\n```fix\nTournois```";

        description += "__Tournois des Champions__\n";
        description += `**${sDatas.tournaments.tdc.played}** participations, **${sDatas.tournaments.tdc.victories}** tournois gagnés.`;

        description += "\n\n__Tournois des Piliers__\n";
        description += `**${sDatas.tournaments.pillars.played}** participations, **${sDatas.tournaments.pillars.victories}** tournois gagnés.`;

        description += `\`\`\`fix\nBadges\`\`\`${sDatas.badges.length > 0 ? sDatas.badges.join(", ") : "*Aucun badge.*"}`;

        const stats = new MessageEmbed()
            .setColor(client.color)
            .setTitle(`📊 • Statistiques de combat de ${p2.username}`)
            .setDescription(description);

        await message.reply({ embeds: [stats] });
    },

    infos: {
        name: "stats",
        aliases: ["stats", "s"],
        category: "adventure",
        description: "Regardez vos statistiques de combat !",
        cooldown: 2,
        permissions: [],
        finishRequests: ["adventure", "battle", "chapter", "train"],
        adminsOnly: false,
    },
};