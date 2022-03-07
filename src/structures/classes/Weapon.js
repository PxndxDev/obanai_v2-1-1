class Weapon {
    constructor(weapon) {
        this.weapon = weapon;
        this.wpr = require(`../../assets/elements/weapons/${this.weapon}.json`);
    }

    async doDamages(datas, breath) {
        const ud = datas;

        for (const b of this.wpr.boost) {
            ud[b[0]] += b[1];
        }

        const breathBonus = this.wpr.best_breath.name;
        if (breathBonus.includes(breath)) ud[this.wpr.best_breath.boost[0]] += this.wpr.best_breath.boost[1];

        return ud;
    }

    async boost(breath) {
        const ud = {
            "bonus": {
                "strength": 0,
                "speed": 0,
                "agility": 0,
                "endurance": 0,
                "resistance": 0,
            },
            "breath": {
                "affinity": 0,
                "name": "Aucune aptitude",
            },
        };
        const breathBonus = this.wpr.best_breath.name;

        // ["Force", "Vitesse", "Agilité", "Endurance"]
        // ["strength", "speed", "agility", "endurance"]

        for (const b of this.wpr.boost) {
            ud.bonus[b[0]] += b[1];
        }

        if (breathBonus.includes(breath)) {
            ud.breath.affinity += this.wpr.best_breath.boost[1];
            ud.breath.name = ["Force", "Vitesse", "Agilité", "Endurance", "Resistance"][["strength", "speed", "agility", "endurance", "resistance"].indexOf(this.wpr.best_breath.boost[0])];
        }

        return ud;
    }
}

module.exports = Weapon;