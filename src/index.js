// importer les modules importants
const { Client, Collection } = require("discord.js");
const { token } = require("../token.json");
const { loadEvents, loadCommands } = require("./utils/loader");
const Enmap = require("enmap");
const setup = require("./utils/setup");

process.on("unhandledRejection", error => {
	console.error("Unhandled promise rejection:", error);
});

// créer le client et ses variables
const client = new Client({
    intents: 515,
});
client.cooldowns = new Collection();
client.guilds_cooldowns = new Collection();
client.requests = new Collection();

client.prefix = "?";
client.color = "#efa700";
client.delay = 7200000;

(async () => await setup(client))();

client.Maintenance = new Enmap({
    name: "Maintenance",
    fetchAll: true,
});
client.Guilds = new Enmap({
    name: "Guilds",
    fetchAll: true,
});
client.Players = new Enmap({
    name: "Players",
    fetchAll: true,
});
client.Progress = new Enmap({
    name: "Progress",
    fetchAll: true,
});
client.Activities = new Enmap({
    name: "Activities",
    fetchAll: true,
});
client.Stats = new Enmap({
    name: "Stats",
    fetchAll: true,
});
client.lastLBRefresh = new Enmap({
    name: "lastLBRefresh",
    fetchAll: true,
});
client.gameLeaderboard = {
    global: new Enmap({
        name: "global",
        fetchAll: true,
    }),
    breaths: new Enmap({
        name: "breaths",
        fetchAll: true,
    }),
};
client.version = "2.1.1";

// charger les commandes et les événements
loadEvents(client);
loadCommands(client);

// connexion du client
client.login(token);