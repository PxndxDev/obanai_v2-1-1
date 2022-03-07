/* eslint-disable brace-style */
const { MessageEmbed } = require("discord.js");
const Activities = require("../../../structures/database/Activities");

module.exports = {
    run: async (client, message, args) => {
        if (message.author.id !== "539842701592494111") return;
        await message.channel.send({ content: "Le bot va se déconnecter." });
        console.log(`client destroyed by ${message.author.tag}`);
        client.destroy();
    },

    infos: {
        name: "destroy",
        aliases: ["destroy"],
        category: "admin",
        description: "This is private, uh.",
        cooldown: 0,
        permissions: [],
        finishRequests: [],
        adminsOnly: true,
    },
};