/* eslint-disable brace-style */
const Step = require("../../../structures/classes/Step");
const Progress = require("../../../structures/database/Progress");
const { saveProgression } = require("../../../structures/database/Progress");

const name = "La lumière au bout du tunnel !";
const id = 3;
const intrigue = "Le combat était très serré. Vous criez victoire, néanmoins, ce n'est pas encore gagné...";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter1.json").step3;

    const pProgress = await Progress.get(client, message.author.id);
    const loc = pProgress.location.precise;

    await s.createDialogue(null, null, { "title": "LA LUMIÈRE AU BOUT DU TUNNEL, partie 1", "content": nar.dialog1 });

    let dialog2 = [""];

    if (loc === "Chemin étroit") {
        dialog2 = nar.dialog2[0];
    } else if (loc === "Clairière") {
        dialog2 = nar.dialog2[1];
    }

    await s.createDialogue(null, null, { "title": "LA LUMIÈRE AU BOUT DU TUNNEL, partie 2", "content": dialog2 });

    await s.createDialogue(null, null, { "title": "LA LUMIÈRE AU BOUT DU TUNNEL, partie 3", "content": nar.dialog3 });


    await saveProgression(client, message.author.id, { global_: "Mont Sagiri", precise: pProgress.location.precise });
    return "done";
};

module.exports = { name, id, intrigue, exe };