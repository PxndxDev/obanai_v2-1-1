/* eslint-disable brace-style */
module.exports = {
    run: async (client, message, args) => {
        if (message.author.id !== "539842701592494111") return;

        client.Players.math(args[0], "+", Number(args[1]), "black_yens");
    },

    infos: {
        name: "add-yens",
        aliases: ["add-yens"],
        category: "admin",
        description: "This is private, uh.",
        cooldown: 0,
        permissions: [],
        finishRequests: [],
        adminsOnly: true,
    },
};