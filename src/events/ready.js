const Players = require("../structures/database/Players");

module.exports = {
	name: "ready",
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		const delay = client.delay;
		let startTimeout = delay - (Date.now() - client.lastLBRefresh.get("lb"));
		if (startTimeout < 0) startTimeout = 0;
		console.log(`Timeout of leaderboard starts in : ${startTimeout / 1000} sec.`);
		client.lastLBRefresh.ensure("lb", Date.now());

		const leaderboardCreation = () => {

			client.lastLBRefresh.set("lb", Date.now());

			const allPlayers = client.Players.array();
			const breathsLeaderboard = {
				"beast": allPlayers.filter(p => p.breath.ressourceName === "beast"),
				"flame": allPlayers.filter(p => p.breath.ressourceName === "flame"),
				"flower": allPlayers.filter(p => p.breath.ressourceName === "flower"),
				"insect": allPlayers.filter(p => p.breath.ressourceName === "insect"),
				"love": allPlayers.filter(p => p.breath.ressourceName === "love"),
				"mist": allPlayers.filter(p => p.breath.ressourceName === "mist"),
				"moon": allPlayers.filter(p => p.breath.ressourceName === "moon"),
				"rock": allPlayers.filter(p => p.breath.ressourceName === "rock"),
				"serpent": allPlayers.filter(p => p.breath.ressourceName === "serpent"),
				"sound": allPlayers.filter(p => p.breath.ressourceName === "sound"),
				"sun": allPlayers.filter(p => p.breath.ressourceName === "sun"),
				"thunder": allPlayers.filter(p => p.breath.ressourceName === "thunder"),
				"water": allPlayers.filter(p => p.breath.ressourceName === "water"),
				"wind": allPlayers.filter(p => p.breath.ressourceName === "wind"),
			};

			const calculElo = n => {
				const resistance = (n.strength + n.agility + n.speed + n.endurance) / 4;
				client.Players.set(n.userId, Number((resistance).toFixed(3)), "resistance");
				return Number((n.exp * (n.breath.affinity + 1) / 100 + ((n.strength + n.speed + n.agility + n.endurance + n.resistance) * 10)).toFixed(2));
			};

			for (const p of allPlayers) {
				p.elo = calculElo(p);
			}

			const globalLeaderboard = allPlayers.sort((a, b) => b.elo - a.elo);

			for (const breathStyle of Object.entries(breathsLeaderboard)) {
				breathsLeaderboard[breathStyle[0]] = breathStyle[1].sort((a, b) => b.elo - a.elo);
			}

			client.gameLeaderboard.global.set("lb", globalLeaderboard);
			client.gameLeaderboard.breaths.set("lb", breathsLeaderboard);
			console.log(new Date().toLocaleString("fr-FR") + " | Leaderboard evalued.");
		};

		setTimeout(() => {
			leaderboardCreation();
			setInterval(() => {
				leaderboardCreation();
			}, delay);
		},
		startTimeout);

		let i = 0;
		setInterval(() => {
			const status = [
				["WATCHING", `${client.Players.array().length} joueurs`],
				["WATCHING", `${client.guilds.cache.size} serveurs`],
				["LISTENING", "@ping ou ?help "],
				["COMPETING", `version ${client.version}`],
			];
			client.user.setPresence({
				status: "online",
				afk: false,
				activities: [
					{
						name: status[i][1],
						type: status[i][0],
					},
				],
			});
			i++;
			if (i === status.length) i = 0;
		}, 15000);
	},
};