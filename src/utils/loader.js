/* eslint-disable brace-style */
const fs = require("fs");
const { Collection } = require("discord.js");

module.exports.loadEvents = (client) => {
	const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));

	for (const file of eventFiles) {
		const event = require(`../events/${file}`);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args, client));
		} else {
			client.on(event.name, (...args) => event.execute(...args, client));
		}
	}
};

module.exports.loadCommands = (client) => {
	const commands = new Collection();
	const commandFolders = fs.readdirSync("./src/commands");

	commandFolders.forEach(folder => {
		const files = fs.readdirSync(`./src/commands/${folder}/`);

        for (const file of files) {
            const command = require(`../commands/${folder}/${file.replace(".js", "")}/${file.replace(".js", "")}-core.js`);

            commands.set(command.infos.name, command);
			console.log("command " + command.infos.name + " loaded");
        }
	});

    client.commands = commands;
};