const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "guildCreate",
	once: false,
	async execute(guild, client) {
        const newGuildEmbed = new MessageEmbed()
            .setColor("#56ff28")
            .setTitle("Un nouveau serveur vient d'ajouter le bot !")
            .setDescription(`Nous sommes désormais **${client.guilds.cache.size}** serveurs !`);

        const channel = client.channels.cache.get("941444654925230170");
        await channel.send({ embeds: [newGuildEmbed] });

        newGuildEmbed.addField("Nombre de membres:", `-> ${guild.members.cache.size}`, true);
        newGuildEmbed.addField("Owner", `-> ${client.users.cache.get(guild.ownerId).tag}`, true);
        const channel2 = client.channels.cache.get("927285371891511398");
        await channel2.send({ embeds: [newGuildEmbed] });
	},
};