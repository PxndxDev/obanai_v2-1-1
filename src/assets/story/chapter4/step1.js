/* eslint-disable brace-style */
const Step = require("../../../structures/classes/Step");
const { saveProgression } = require("../../../structures/database/Progress");

const id = 1;
const name = "Une étape obligatoire";
const intrigue = "Vous allez commencer votre épreuve décisive : celle qui dira si vous êtes apte à rejoindre l'armée des pourfendeurs !";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter4.json").step1;

    await s.createDialogue(null, null, { title: "UNE ÉTAPE OBLIGATOIRE, partie 1", content: nar.dialog1 });

    await saveProgression(client, message.author.id, { global_: "Mont Fujikasane", precise: "Forêt étrange" });

    return "done";
};

module.exports = { name, id, intrigue, exe };