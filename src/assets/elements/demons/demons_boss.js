const DemonCollector = require("./DemonCollector");

module.exports = new DemonCollector({
    "Démon aux mains": {
        stats: {
            strength: 1.4,
            speed: 1.6,
            agility: 1.3,
            endurance: 2,
            resistance: 1.5,
            regen: 1.7,
        },
        id: {
            name: "Démon aux mains",
            number: "Boss de chapitre",
            face: "https://cdn.discordapp.com/attachments/935645629210820618/947553207251517440/demon_aux_mains_face.png",
            banner: "https://cdn.discordapp.com/attachments/935645629210820618/947553206915960832/demon_aux_mains_banner.jpg",
        },
        rage: {
            level: 1,
            enabled: false,
            description: "Lorsque le démon s'enrage, sa force est presque doublée et son corps devient aussi résistant que du métal. Cependant, sa vitesse en est vraiment impactée..",
            exe: async (battle) => {
                if (battle.player.pDatas.strength > 1.6) battle.player.pDatas.strength -= 0.1;
                if (battle.player.pDatas.resistance > 1.4) battle.player.pDatas.resistance -= 0.1;
                if (battle.player.pDatas.speed < 2.2) battle.player.pDatas.speed += 0.1;
            },
        },
        skills: {
            attacks: ["💪 Attaque frontale"],
            defenses: ["👹 Parade démoniaque"],
            blood_art: ["💥 Coup enragé", "💥 Raclette mortadelle"],
        },
    },
});