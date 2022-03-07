/* eslint-disable brace-style */
const { MessageEmbed } = require("discord.js");
const Activities = require("../../../structures/database/Activities");

module.exports = {
    run: async (client, message, args) => {
        await message.reply({ content: `Nombre de joueurs: \`${client.Players.array().length}\`\nNombre de serveurs: \`${client.guilds.cache.size}\`\nNombre d'utilisateurs: \`${client.users.cache.size}\`` });
    },

    infos: {
        name: "client-stats",
        aliases: ["cs"],
        category: "admin",
        description: "This is private, uh.",
        cooldown: 0,
        permissions: [],
        finishRequests: [],
        adminsOnly: true,
    },
};