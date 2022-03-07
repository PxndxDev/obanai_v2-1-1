/* eslint-disable curly */
/* eslint-disable brace-style */
const { MessageEmbed } = require("discord.js");
const Step = require("../../../structures/classes/Step");
const { saveProgression } = require("../../../structures/database/Progress");

const id = 1;
const name = "L'éveil d'un pouvoir";
const intrigue = "Votre périple sur le mont Sagiri se termine. C'est parti pour une nouvelle page de l'histoire !";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter2.json").step1;

    await s.createDialogue(null, null, { "title": "L'ÉVEIL D'UN POUVOIR, partie 1", "content": nar.dialog1 });
    await s.createDialogue(null, null, { "title": "L'ÉVEIL D'UN POUVOIR, partie 2", "content": nar.dialog2 });
    const response = await s.createDialogue(null, null, { "title": "L'ÉVEIL D'UN POUVOIR, partie 3", "content": nar.dialog3 });

    const choice = await s.choice(response.embeds[0], response, [
        { label: "Mentir", emoji: "🤐", customId: "A", style: "SECONDARY", disabled: false },
        { label: "Dire la vérité", emoji: "😄", customId: "B", style: "SECONDARY", disabled: false },
    ]);

    let choiceSetence = "";
    let respToChoice = "";

    if (choice.choice.customId === "A") {
        choiceSetence = "> **Vous** — Je ne sais pas, je l'ai ramassé plus haut. Je ne savais pas qu'il vous appartenait.\n";
        respToChoice += "<:ozaki:942041320812347422> — Votre réponse me parait suspecte. Suivez-nous, vous allez être escorté pour décider de votre sort.\n";
    } else if (choice.choice.customId === "B") {
        choiceSetence = "**Vous** — Mon frère était pourfendeur et en est mort. J'ai décidé de reprendre le flambeau en prenant son sabre mais je ne sais pas m'en servir.\n";
        respToChoice += "<:ozaki:942041320812347422> — C'est... inattendu. Suivez-nous, vous allez être emmené quelque part afin de décider ce qu'on va faire de vous.\n";
    }

    if (await client.hasMsg(response.channel, response.id) !== false) await response.edit({ embeds: [
        new MessageEmbed().setColor(client.color).addField("L'ÉVEIL D'UN POUVOIR, partie 4", [
            "> Vous décidez alors de les suivre. Cependant, vous vous faites remarquer... Ils vous arrêtent et vous demande de partir, car l'endroit est habité par un démon très puissant. Vous décidez de les écouter. Néanmoins...\n",
            "> Ils vous demandent pourquoi vous avez un katana de pourfendeur sur vous.\n",
            "<:ozaki:942041320812347422> — Eh, deux minutes. Vous avez dans les mains quelque chose qui s'apparente être une lame du soleil, utilisée par les pourfendeurs de démons. D'ou ça sort ?\n",
            choiceSetence,
            respToChoice,
        ].join("\n")),
    ] });

    await saveProgression(client, message.author.id, { global_: "Mont Urasai", precise: "Pied du mont Urasai" });
    return "done";
};

module.exports = { name, id, intrigue, exe };