/* eslint-disable brace-style */
const { admins } = require("../config.json");
const { Collection, MessageEmbed, Permissions } = require("discord.js");
const Guilds = require("../structures/database/Guilds");

module.exports = {
	name: "messageCreate",
	once: false,
	async execute(message, client) {
		if (message.author.bot) return;

		// fonction qui gère l'exécution d'une commande
		const exeCommand = async (prfx) => {
			const args = message.content.split("").splice(prfx.length).join("").split(/ +/);
			const commandName = args.shift();

			// si la commande existe
			if (client.commands.has(commandName) || client.commands.find(cmd => cmd.infos.aliases && cmd.infos.aliases.includes(commandName))) {
				const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.infos.aliases && cmd.infos.aliases.includes(commandName));

				// si la commande n'est pas une commande d'administration
				if (command.infos.category !== "admin") {

					// vérification du cooldown
					if (!client.cooldowns.has(command.infos.name)) client.cooldowns.set(command.infos.name, new Collection());

					const timeNow = Date.now();
					const tStamps = client.cooldowns.get(command.infos.name);
					const cdAmount = (command.infos.cooldown || 5) * 1000;
					if (tStamps.has(message.author.id)) {
						const cdExpirationTime = tStamps.get(message.author.id) + cdAmount;

						if (timeNow < cdExpirationTime) {
							const timeLeft = (cdExpirationTime - timeNow) / 1000;

							await client.resp(message.author, message.channel, `Merci d'attendre \`${timeLeft.toFixed(0)}\` secondes avant de refaire la commande \`${command.infos.name}\`.`, "afk");
							if (await client.hasMsg(message.channel, message.id) !== false) message.delete();
							return;
						}
					}
					tStamps.set(message.author.id, timeNow);
					setTimeout(() => tStamps.delete(message.author.id), cdAmount);

					// cooldown par serveurs
					if (!client.guilds_cooldowns.has(command.infos.name)) client.guilds_cooldowns.set(command.infos.name, new Collection());

					const gtStamps = client.guilds_cooldowns.get(command.infos.name);
					const gcdAmount = 1000;
					if (gtStamps.has(message.guild.id)) {
						const gcdExpirationTime = gtStamps.get(message.guild.id) + gcdAmount;

						if (timeNow < gcdExpirationTime) {
							const timeLeft = (gcdExpirationTime - timeNow) / 1000;

							await client.resp(message.author, message.channel, `<@${message.author.id}>, Merci d'attendre \`${timeLeft.toFixed(0)}\` secondes avant de refaire la commande \`${command.infos.name}\` car un membre de ce serveur l'a faite récemment.`, "error");
							if (await client.hasMsg(message.channel, message.id) !== false) message.delete();
							return;
						}
					}
					tStamps.set(message.guild.id, timeNow);
					setTimeout(() => tStamps.delete(message.guild.id), gcdAmount);
				}

				// si c'est commande admin et que gugus pas admin alors ouste
				if (command.infos.adminsOnly && (
					!admins.includes(message.author.id)
					&&
					message.guild.id !== "904837845519306844"
					)
					) return;

				// vérification des permissions
				const userPermissions = message.member.permissions.toArray();
				if (command.infos.permissions.length > 0) {
					let can = true;
					for (const permission of command.infos.permissions) {
						if (!userPermissions.includes(permission)) can = false;
					}

					if (!can) return client.resp(message.author, message.channel, "Vous n'avez pas les permissions requises pour faire cette commande.", "error");
				}

				if (!client.requests.has(command.infos.name)) client.requests.set(command.infos.name, new Collection());

				client.Maintenance.ensure("enabled", false);
				if (client.Maintenance.get("enabled") && !admins.includes(message.author.id)) return client.resp(message.author, message.channel, "Le bot est actuellement en maintenance.", "error");

				// est-ce que le joueur a fini toutes ses précédentes requêtes
				if (command.infos.finishRequests.length > 0) {
					const requestsInUse = client.requests.filter(cmd => cmd.has(message.author.id)).map(e => e.map(f => f)[0]);
					let canComplete = true;
					const toComplete = [];

					for (const req of command.infos.finishRequests) {
						if (requestsInUse.includes(req)) {
							toComplete.push(req);
							if (canComplete) canComplete = false;
						}
					}

					if (!canComplete) return await client.resp(message.author, message.channel, `Ohoh, pour effectuer cette commande, merci de finir de répondre aux commandes suivantes:\n${toComplete.map(e => `\`${e}\``).join("\n")}`, "error");
				}

				const clientPermissions = "412317248576";
				const missing = [];

				for (const perm of new Permissions(clientPermissions).toArray()) {
					if (!message.guild.me.permissions.has(perm)) missing.push(perm);
				}

				if (missing.length > 0) return await client.resp(message.author, message.channel, "<:Obanai_Iguro:943193206852550769> Le bot n'a pas les permissions nécessaires à son fonctionnement. Vérifiez qu'il aie :```" + new Permissions(clientPermissions).toArray().map(e => `${missing.includes(e) ? "❌" : "✅" } ${e}`).join("\n") + "```", "error");

				// exécution de la commande
				client.requests.get(command.infos.name).set(message.author.id, command.infos.name);
				try {
					await command.run(client, message, args);
				} catch (err) {
					console.log(err.stack);
					await client.resp(message.author, message.channel, "<:Obanai_Iguro:943193206852550769> Il semblerait qu'une erreur soit survenue lors de l'exécution de cette commmande. Veuillez contacter le support : https://discord.gg/vfWhhsFv8r\nNotre équipe a été avertie du problème.", "error");
				}
				client.requests.get(command.infos.name).delete(message.author.id);
			}
		};

		let prefix = client.prefix;
		const gDatas = await Guilds.get(client, message.guild.id);
		if (gDatas.prefix) prefix = gDatas.prefix;

		// différents contextes d'execution
		if (message.content.startsWith(prefix)) {
			try { await exeCommand(prefix); }
			catch (err) { console.log(err.stack); }
		} else if (message.content.startsWith(`<@!${client.user.id}> `)) {
			try { await exeCommand(`<@!${client.user.id}> `); }
			catch (err) { console.log(err.stack); }
		} else if (message.content === `<@!${client.user.id}>` || message.content === `<@!${client.user.id}> `) {
			const datas = new MessageEmbed()
				.setColor(client.color)
				.setTitle(`Configuration pour ${message.guild.name}`)
				.setDescription(`Si vous cherchez de l'aide, n'hésitez pas à faire la commande \`${gDatas.prefix}help\` !`)
				.addField("Préfixe", `> ${gDatas.prefix}`);

			return message.reply({ embeds: [datas] });
		} else if (message.content.toLowerCase() === "ne mettez pas votre tête dans une friteuse") {
			if (await client.hasMsg(message.channel, message.id) !== false) await message.reply("https://cdn.discordapp.com/attachments/945052700683403356/947914195633049610/Picsart_22-02-28_18-52-28-985.jpg");
			else await message.channel.send(`<@${message.author.id}> https://cdn.discordapp.com/attachments/945052700683403356/947914195633049610/Picsart_22-02-28_18-52-28-985.jpg`);

			["🥚", "<:Kagaya:943195270114603078>"].forEach(async r => {
				if (await client.hasMsg(message.channel, message.id) !== false) await message.react(r);
			});
		}
	},
};