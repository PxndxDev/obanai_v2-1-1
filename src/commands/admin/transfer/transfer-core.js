/* eslint-disable brace-style */
const Activities = require("../../../structures/database/Activities");
const Players = require("../../../structures/database/Players");
const Progress = require("../../../structures/database/Progress");
const Stats = require("../../../structures/database/Stats");

module.exports = {
    run: async (client, message, args) => {
        if (message.author.id !== "539842701592494111") return;

        const host = args[0];
        const transfer = args[1];

        const host_aDatas = await Activities.get(client, host);
        const host_pDatas = await Players.get(client, host);
        const host_prDatas = await Progress.get(client, host);
        const host_sDatas = await Stats.get(client, host);

        client.Activities.set(transfer, host_aDatas);
        client.Players.set(transfer, host_pDatas);
        client.Progress.set(transfer, host_prDatas);
        client.Stats.set(transfer, host_sDatas);

        client.Activities.set(transfer, transfer, "userId");
        client.Players.set(transfer, transfer, "userId");
        client.Progress.set(transfer, transfer, "userId");
        client.Stats.set(transfer, transfer, "userId");

        client.Activities.delete(host);
        client.Players.delete(host);
        client.Progress.delete(host);
        client.Stats.delete(host);
    },

    infos: {
        name: "transfer",
        aliases: ["transfer"],
        category: "admin",
        description: "This is private, uh.",
        cooldown: 0,
        permissions: [],
        finishRequests: [],
        adminsOnly: true,
    },
};