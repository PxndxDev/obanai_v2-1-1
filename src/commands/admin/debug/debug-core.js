/* eslint-disable brace-style */
module.exports = {
    run: async (client, message, args) => {
        if (message.author.id !== "539842701592494111") return;

        const req = args[0];
        const user = args[1];

        client.requests.get(req).delete(user);
    },

    infos: {
        name: "change-db",
        aliases: ["change-db"],
        category: "admin",
        description: "This is private, uh.",
        cooldown: 0,
        permissions: [],
        finishRequests: [],
        adminsOnly: true,
    },
};