/* eslint-disable brace-style */
const { MessageEmbed } = require("discord.js");
const Guilds = require("../../../structures/database/Guilds");

module.exports = {
    run: async (client, message, args) => {
        const gDatas = await Guilds.get(client, message.guild.id);
        let newPrefix = args[0];

        if (!newPrefix) {
            return await client.resp(message.author, message.channel, `Aucun nouveau préfixe a été redéfini.\n\nPréfixe actuel: ${gDatas.prefix}`, "info");
        } else {
            newPrefix = newPrefix.slice(0, 5).replace(" ", "_");
            if (newPrefix == gDatas.prefix) return await client.resp(message.author, message.channel, ":x: Le nouveau préfixe est déjà celui défini.", "error");

            client.Guilds.set(message.guild.id, newPrefix, "prefix");
            return await client.resp(message.author, message.channel, "Le nouveau préfixe " + newPrefix + " est à présent celui utilisé sur ce serveur.", "accept");
        }
    },

    infos: {
        name: "prefix",
        aliases: ["prefix"],
        category: "utils",
        description: "Configurez le préfixe du serveur.",
        cooldown: 5,
        permissions: ["MANAGE_GUILD"],
        finishRequests: ["prefix"],
        adminsOnly: false,
    },
};