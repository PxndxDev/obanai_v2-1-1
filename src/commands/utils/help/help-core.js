/* eslint-disable brace-style */
const { MessageEmbed } = require("discord.js");
const Guilds = require("../../../structures/database/Guilds");

module.exports = {
    run: async (client, message, args) => {
		const gDatas = await Guilds.get(client, message.guild.id);
        const prefix = gDatas.prefix;

        if (!args.length) {
            const categories = client.commands.map(command => command.infos.category);
            const cats = {};
            for (const category of categories) {
                if (!Object.entries(cats).map(e => e[1]).includes(category)) cats[`${category}`] = [];
            }
            for (const command of client.commands) {
                cats[command[1].infos.category].push(command[1]);
            }

            const commands = new MessageEmbed()
                .setColor(client.color)
                .setAuthor({ "name": message.author.tag, "iconURL": message.author.displayAvatarURL({ "dynamic": true }) })
                .setDescription(`\`\`\`fix\nObanai\`\`\`\nHey, moi c'est **Obanai**. Je suis un bot qui te permet de jouer à une aventure Demon Slayer !\nMon préfixe par défaut est \`?\`, mais tu peux le modifier. Si tu as besoin de quoique ce soit, mentionne moi !\n\nSi tu cherches de l'aide, tu peux rejoindre le support [ici](https://discord.gg/8GDpnYvRrC).\nNous avons également un wiki [ici](https://pxndxdev.gitbook.io/obanai/).\n\`\`\`fix\nPanel de commandes\`\`\`\nCi dessous se trouvent toutes mes commandes. Tu peux faire \`${prefix}help [command]\` pour obtenir des précisions sur une commande.`);

            for (const category of Object.entries(cats).filter(cat => cat[0] !== "admin")) {
                commands.addField("→ " + category[0].substring(0, 1).toUpperCase() + category[0].substring(1), category[1].map(e => `\`${prefix}${e.infos.name}\``).join(", "));
            }

            return message.channel.send({ embeds: [ commands ] });
        } else if (client.commands.map(command => command.infos.name).includes(args[0])) {
            const cmd = client.commands.get(args[0]).infos;


            const command = new MessageEmbed()
                .setDescription(`\`\`\`fix\n${cmd.name.toUpperCase()} - ${cmd.category.toUpperCase()}\`\`\`\n${cmd.description}`)
                .setAuthor({ "name": message.author.tag, "iconURL": message.author.displayAvatarURL({ "dynamic": true }) })
                .addFields(
                    { name: "⏰ - Délais", value: `${cmd.cooldown} secondes` },
                    { name: "📝 - Permissions", value: `${cmd.permissions.length > 0 ? cmd.permissions.map(e => `\`${e}\``).join(", ") : "Aucune permission requise" }` },
                    { name: "⛔ - Privée ?", value: `${cmd.adminsOnly === true ? "Oui" : "Non"}` },
                    { name: "📌 - Aliases", value: `${cmd.aliases.filter(a => a !== cmd.name).length > 0 ? cmd.aliases.filter(a => a !== cmd.name).map(e => `\`${e}\``).join(", ") : "Aucun alias."}` },
                )
                .setColor(client.color);

            return message.channel.send({ embeds: [ command ] });
        } else {
            return await client.resp(message.author, message.channel, "Commande introuvable.", "error");
        }
    },

    infos: {
        name: "help",
        aliases: ["help"],
        category: "utils",
        description: "Regardez la liste des commandes.",
        cooldown: 5,
        permissions: [],
        finishRequests: [""],
        adminsOnly: false,
    },
};