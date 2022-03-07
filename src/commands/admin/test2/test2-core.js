/* eslint-disable brace-style */
const { MessageEmbed } = require("discord.js");
const Activities = require("../../../structures/database/Activities");

module.exports = {
    run: async (client, message, args) => {
        client.Players.forEach(p => {
            client.Players.set(p.userId, Number((p.strength).toFixed(2)), "strength");
            client.Players.set(p.userId, Number((p.speed).toFixed(2)), "speed");
            client.Players.set(p.userId, Number((p.agility).toFixed(2)), "agility");
            client.Players.set(p.userId, Number((p.endurance).toFixed(2)), "endurance");
            client.Players.set(p.userId, Number((p.resistance).toFixed(2)), "resistance");
        });
    },

    infos: {
        name: "test2",
        aliases: ["test2"],
        category: "admin",
        description: "This is private, uh.",
        cooldown: 0,
        permissions: [],
        finishRequests: [],
        adminsOnly: true,
    },
};