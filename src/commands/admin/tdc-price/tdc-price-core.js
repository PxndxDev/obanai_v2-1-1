/* eslint-disable no-case-declarations */
/* eslint-disable brace-style */
module.exports = {
    run: async (client, message, args) => {
        if (message.author.id !== "539842701592494111") return;
        const user = args[0];
        const yens = Number(args[1]);
        const xp = Number(args[2]);
        const newBadge = args[3];
        const winOrLose = args[4] ? Boolean(args[4]) : "not_given";

        client.Players.math(user, "+", yens, "black_yens");
        client.Players.math(user, "+", xp, "exp");
        client.Stats.push(user, newBadge, "badges");

        if (winOrLose !== "not_given") {
            client.Stats.inc(user, "tournaments.tdc.played");
            if (winOrLose === "true") client.Stats.inc(user, "tournaments.tdc.victories");
        }
    },

    infos: {
        name: "tdc-price",
        aliases: ["tdc-price"],
        category: "admin",
        description: "This is private, uh.",
        cooldown: 0,
        permissions: [],
        finishRequests: [],
        adminsOnly: true,
    },
};