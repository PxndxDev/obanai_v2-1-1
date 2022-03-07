const DemonCollector = require("./DemonCollector");

module.exports = new DemonCollector({
    "Kamanue": {
        stats: {
            strength: 1.2,
            speed: 0.8,
            agility: 1.1,
            endurance: 1.2,
            resistance: 1.2,
            regen: 1.5,
        },
        id: {
            name: "Kamanue, 12ème Lune Démoniaque",
            number: "6ème Lune Démoniaque Inférieure",
            face: "https://cdn.discordapp.com/attachments/935645629210820618/942141530288840744/kamanue_face.png",
            banner: "https://cdn.discordapp.com/attachments/935645629210820618/942431737865183243/kamanue_banner.png",
        },
        blood_art: {
            level: 1,
            enabled: false,
            description: "Kamanue est réputé pour son aura meurtrière et son talent au corps à corps pour arriver au bout de ses adversaires. Son pouvoir sanguinaire anéanti la défense de l'adversaire et lui permet de porter des coups destructeurs à bout portant, en détruisant petit à petit ses membres.",
            exe: async (battle) => {
                if (battle.player.pDatas.agility > 0.4) battle.player.pDatas.agility -= 0.05;
            },
        },
        skills: {
            attacks: ["💪 Attaque frontale"],
            defenses: ["👹 Parade démoniaque"],
            blood_art: ["💥 Pouvoir sanguinaire, Assommoir destructif", "💥 Pouvoir sanguinaire, Raclée mortelle"],
        },
    },
});