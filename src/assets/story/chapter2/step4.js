/* eslint-disable brace-style */
const Step = require("../../../structures/classes/Step");
const { saveProgression } = require("../../../structures/database/Progress");

const name = "Plus que 11 !";
const id = 4;
const intrigue = "C'est quoi, une Lune Démoniaque ?";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter2.json").step4;

    await s.createDialogue(null, null, { "title": "PLUS QUE 11 !, partie 1", "content": nar.dialog1 });

    await s.createDialogue(null, null, { "title": "PLUS QUE 11 !, partie 2", "content": nar.dialog2 });


    await saveProgression(client, message.author.id, { global_: "Endroit inconnu", precise: "Devant un bâtiment suspect" });
    return "done";
};

module.exports = { name, id, intrigue, exe };