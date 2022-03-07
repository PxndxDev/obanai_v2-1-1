/* eslint-disable brace-style */
const { MessageEmbed } = require("discord.js");
const Activities = require("../../../structures/database/Activities");

module.exports = {
    run: async (client, message, args) => {
        client.Players.forEach(p => {
            const resistance = 1 + ((p.strength - 1) / 5) + ((p.agility - 1) / 5) + ((p.speed - 1) / 5) + ((p.endurance - 1) / 5);
            client.Players.set(p.userId, Number((resistance).toFixed(2)), "resistance");
        });
    },

    infos: {
        name: "test",
        aliases: ["test"],
        category: "admin",
        description: "This is private, uh.",
        cooldown: 0,
        permissions: [],
        finishRequests: [],
        adminsOnly: true,
    },
};