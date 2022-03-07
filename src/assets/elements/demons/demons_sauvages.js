const DemonCollector = require("./DemonCollector");

module.exports = new DemonCollector({
    // démons chapitre 1
    "Démon du Sanctuaire": {
        stats: {
            strength: 0.8,
            speed: 1,
            agility: 1,
            endurance: 1,
            resistance: 1,
            regen: 1,
        },
        id: {
            name: "Démon du Sanctuaire",
        },
        blood_art: {
            level: 0,
            enabled: false,
            exe: async () => null,
        },
        skills: {
            attacks: ["🤜 Attaque de front"],
            defenses: ["✋ Bouclier corporel"],
            blood_art: [],
        },
    },
    "Démon à la Langue": {
        stats: {
            strength: 0.8,
            speed: 1,
            agility: 1,
            endurance: 1,
            resistance: 1,
            regen: 1,
        },
        id: {
            name: "Démon à la Langue",
        },
        blood_art: {
            level: 0,
            enabled: false,
            exe: async () => null,
        },
        skills: {
            attacks: ["🤜 Attaque de front"],
            defenses: ["✋ Bouclier corporel"],
            blood_art: [],
        },
    },
    "Démon aux Yeux": {
        stats: {
            strength: 1,
            speed: 1.1,
            agility: 1,
            endurance: 1,
            resistance: 0.9,
            regen: 1,
        },
        id: {
            name: "Démon aux Yeux",
        },
        blood_art: {
            level: 0,
            enabled: false,
            exe: async () => null,
        },
        skills: {
            attacks: ["🤜 Attaque de front"],
            defenses: ["✋ Bouclier corporel"],
            blood_art: [],
        },
    },
    // démons chapitre 3
    "Démon aux Longs Membres": {
        stats: {
            strength: 1.6,
            speed: 1.3,
            agility: 1.5,
            endurance: 1,
            resistance: 1.5,
            regen: 1,
        },
        id: {
            name: "Démon aux Longs Membres",
        },
        blood_art: {
            level: 0,
            enabled: false,
            exe: async () => null,
        },
        skills: {
            attacks: ["🤜 Attaque rapide"],
            defenses: ["✋ Repli corporel"],
            blood_art: [],
        },
    },
    "Démon à Corne": {
        stats: {
            strength: 1.6,
            speed: 1.3,
            agility: 1.5,
            endurance: 1,
            resistance: 1.5,
            regen: 1,
        },
        id: {
            name: "Démon à Corne",
        },
        blood_art: {
            level: 0,
            enabled: false,
            exe: async () => null,
        },
        skills: {
            attacks: ["🤜 Coup de boules"],
            defenses: ["✋ Bouclier corporel"],
            blood_art: [],
        },
    },
    "Démon Supersonique": {
        stats: {
            strength: 1.6,
            speed: 1.3,
            agility: 1.5,
            endurance: 1,
            resistance: 1.5,
            regen: 1,
        },
        id: {
            name: "Démon Supersonique",
        },
        blood_art: {
            level: 0,
            enabled: false,
            exe: async () => null,
        },
        skills: {
            attacks: ["🤜 Attaque ultra-rapide"],
            defenses: ["✋ Mur du son"],
            blood_art: [],
        },
    },
    "Démon aux Poings de fer": {
        stats: {
            strength: 1.6,
            speed: 1.3,
            agility: 1.5,
            endurance: 1,
            resistance: 1.5,
            regen: 1,
        },
        id: {
            name: "Démon aux Poings de fer",
        },
        blood_art: {
            level: 0,
            enabled: false,
            exe: async () => null,
        },
        skills: {
            attacks: ["🤜 Déchainement de coups"],
            defenses: ["✋ Bouclier corporel"],
            blood_art: [],
        },
    },
    "Démon aux Sabres": {
        stats: {
            strength: 1.6,
            speed: 1.3,
            agility: 1.5,
            endurance: 1,
            resistance: 1.5,
            regen: 1,
        },
        id: {
            name: "Démon aux Sabres",
        },
        blood_art: {
            level: 0,
            enabled: false,
            exe: async () => null,
        },
        skills: {
            attacks: ["🤜 Coup de sabre"],
            defenses: ["✋ Bloquage"],
            blood_art: [],
        },
    },
    "Démon-Tigre": {
        stats: {
            strength: 1.6,
            speed: 1.3,
            agility: 1.5,
            endurance: 1,
            resistance: 1.5,
            regen: 1,
        },
        id: {
            name: "Démon-Tigre",
        },
        blood_art: {
            level: 0,
            enabled: false,
            exe: async () => null,
        },
        skills: {
            attacks: ["🤜 Griffes démoniaques"],
            defenses: ["✋ Parade"],
            blood_art: [],
        },
    },
    "Démon aux Pieds de Géant": {
        stats: {
            strength: 1.6,
            speed: 1.3,
            agility: 1.5,
            endurance: 1,
            resistance: 1.5,
            regen: 1,
        },
        id: {
            name: "Démon aux Pieds de Géant",
        },
        blood_art: {
            level: 0,
            enabled: false,
            exe: async () => null,
        },
        skills: {
            attacks: ["🤜 Écrasement"],
            defenses: ["✋ Coup protecteur"],
            blood_art: [],
        },
    },
});