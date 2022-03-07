/* eslint-disable brace-style */
const Step = require("../../../structures/classes/Step");
const { saveProgression } = require("../../../structures/database/Progress");

const id = 1;
const name = "Un nouveau départ, partie 1";
const intrigue = "La sérénité du lieu vous inquiète, cela semble trop beau pour que tout se passe bien pour vous...";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter3.json").step1;

    await s.displayInformation("L'aventure commence", "À partir de maintenant, les chapitres deviendront plus denses et les combats plus serrés. Le scénario prendra des tournants décisifs. C'est à vous de jouer !", "https://cdn.discordapp.com/attachments/935645629210820618/943175180514115614/gif_giyu1.gif");

    await s.createDialogue(null, null, { title: "LE DÉBUT DE LA FIN, partie 1", content: nar.dialog1 });

    await s.createDialogue(null, null, { title: "LE DÉBUT DE LA FIN, partie 2", content: nar.dialog2 });

    await s.createDialogue(null, null, { title: "LE DÉBUT DE LA FIN, partie 3", content: nar.dialog3 });

    await saveProgression(client, message.author.id, { global_: "QG des pourfendeurs", precise: "Dans la cour" });
    return "done";
};

module.exports = { name, id, intrigue, exe };