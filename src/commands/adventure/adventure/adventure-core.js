/* eslint-disable curly */
/* eslint-disable brace-style */
const start = require("./args/start");
const Players = require("../../../structures/database/Players");

module.exports = {
    run: async (client, message, args) => {
        // récupération des données

        if (args.join(" ") === "start") {
            const playerExists = await Players.has(client, message.author.id);
            if (playerExists === true) return await client.resp(message.author, message.channel, "Vous avez déjà commencé votre aventure.", "error");

            if (await start(client, message, args)) await Players.create(client, message.author.id);

        } else return await client.resp(
            message.author,
            message.channel,
            "```fix\nGérez votre aventure !```\n**adventure start** - permet de commencer votre aventure.",
            "normal",
        );
    },

    infos: {
        name: "adventure",
        aliases: ["adventure", "adv"],
        category: "adventure",
        description: "Gérez votre aventure avec cette commande.",
        cooldown: 2,
        permissions: [],
        finishRequests: require("fs").readdirSync("./src/commands/adventure/").map(file => file.replace(".js", "")),
        adminsOnly: false,
    },
};