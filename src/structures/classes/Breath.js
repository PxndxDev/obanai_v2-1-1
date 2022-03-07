class Breath {
    constructor(ressourceName) {
        this.ressources = {
            "name": "Aucun souffle",
            "teacher": {
                "name": "Aucun formateur",
                "img": null,
                "emoji": null,
                "replique": "Vous n'avez pas de souffle.",
            },
            "japaneseName": null,
            "emoji": null,
            "movements": [],
        };
        this.ressourceName = ressourceName;
        if (ressourceName !== null) this.ressources = require(`../../assets/elements/breath_styles/${ressourceName}_style.json`);
        this.affinity = 0;
    }

    generated() {
        return this;
    }
}

module.exports = Breath;