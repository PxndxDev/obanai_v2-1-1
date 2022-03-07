module.exports = {
	name: "ready",
	once: true,
	async execute(client, error) {
        if (error.message !== undefined) client.channels.cache.get("927285371891511398").send({ content: `The client encounters an error.\n\`\`\`xml\n${error.stack}\`\`\`` });
	},
};