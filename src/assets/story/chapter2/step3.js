/* eslint-disable curly */
/* eslint-disable brace-style */
const Step = require("../../../structures/classes/Step");
const { MessageEmbed } = require("discord.js");
const { saveProgression } = require("../../../structures/database/Progress");

const name = "En route vers le QG !";
const id = 3;
const intrigue = "C'est quoi, un pourfendeur ?";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter2.json").step3;

    const response = await s.createDialogue(null, null, { "title": "EN ROUTE VERS LE QG !, partie 1", "content": nar.dialog1 });

    const choice = await s.choice(response.embeds[0], response, [
        { label: "Mentir", emoji: "🤐", customId: "A", style: "SECONDARY", disabled: false },
        { label: "Dire la vérité", emoji: "😄", customId: "B", style: "SECONDARY", disabled: false },
    ]);

    let choiceSetence = "";
    let respToChoice = "";
    if (choice.choice.customId === "A") {
        choiceSetence = "> **Vous** — Je suis un pourfendeur de haut rang, c'était une blague ! Je suis... euh.. un Maître !\n",
        respToChoice += "<:ozaki:942041320812347422> — Vous mentez, usurpateur ! Je veuille à ce qu'on l'emmène avec nous au QG des pourfendeurs, nous en profiterons pour traiter son cas lors de mon rapport.\n";
    } else if (choice.choice.customId === "B") {
        choiceSetence = "> **Vous** — Comme je vous l'ai dit, je ne suis pas pourfendeur. Si je me retrouve ici à combattre cette chose, c'est juste à cause d'un concours de circonstances..\n";
        respToChoice += "<:ozaki:942041320812347422> — C'est très étrange, vous paraissez fort. Votre cas est suspect. Je suggère à ce qu'on l'emmène avec nous au QG des pourfendeurs.\n";
    }

    if (await client.hasMsg(response.channel, response.id) !== false) await response.edit({ embeds: [
        new MessageEmbed().setColor(client.color).addField("L'ÉVEIL D'UN POUVOIR, partie 2", [
            "> Le cadavre du démon gît sur le sol, tandis que son corps commence à se détruire à petit feu.\n",
            "> <:kamanue:942377117948190800> — Vous n'avez pas le droit ! Non, vous ne pouvez pas gagner !\n",
            "> Kamanue essaie de se débattre, d'espérer et de penser qu'il a encore une chance. Finalement, sa tête finit elle-aussi par disparaitre. Cependant, ce n'en est pas fini de vous.\n",
            "> <:ozaki:942041320812347422> — Qui es-tu ? Tu es un pourfendeur ? De quel rang ? Réponds-moi honnêtement cette fois.\n",
            choiceSetence,
            respToChoice,
        ].join("\n")),
    ] });


    await saveProgression(client, message.author.id, { global_: "Mont Urasai", precise: "Santier principal" });
    return "done";
};

module.exports = { name, id, intrigue, exe };