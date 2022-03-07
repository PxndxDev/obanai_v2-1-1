/* eslint-disable brace-style */
const Step = require("../../../structures/classes/Step");
const { saveProgression } = require("../../../structures/database/Progress");
const Players = require("../../../structures/database/Players");

const id = 11;
const name = "Retour au QG !";
const intrigue = "Vous voilà au bout de cette épreuve. Il est temps de retourner s'entraîner et de partir en mission !";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);

    const pDatas = await Players.get(client, message.author.id);

    // récupération des ressources
    const e = require("../../narration/chapter4.json").step11.emojis[pDatas.breath.ressourceName];
    const br = pDatas.breath.ressourceName;
    const d = require("../../narration/chapter4.json").step11.texts;

    await s.createDialogue(null, null, { title: "UNE ÉTAPE OBLIGATOIRE, partie 1", content: [
        "> Votre épreuve s'est finie avec grand succès, et vous devez retrouver votre maître. Après de longues heures de marche, vous voilà enfin arrivé.\n",
        `> ${e} — ${d[0][br]}\n`,
    ] });

    await saveProgression(client, message.author.id, { global_: "QG des pourfendeurs", precise: "Camp d'entraînement" });

    return "done";
};

module.exports = { name, id, intrigue, exe };