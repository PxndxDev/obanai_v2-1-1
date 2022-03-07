/* eslint-disable brace-style */
module.exports = {
    run: async (client, message, args) => {
        if (message.author.id !== "539842701592494111") return;

        const db = args[0];
        const last = args[1];
        const new_ = args[2];
        const key = args[3];
        const delete_ = args[4];

        if (client[db] === undefined) return message.channel.send("cannot ready property of \"db\".");

        client[db].forEach(entry => {
            client[db].set(entry[key], entry[last], `${new_}`);
            if (delete_ === "true") client[db].delete(entry[key], `${last}`);
        });
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