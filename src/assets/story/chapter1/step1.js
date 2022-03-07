const { MessageEmbed } = require("discord.js");
const Step = require("../../../structures/classes/Step");
const { saveProgression } = require("../../../structures/database/Progress");

const id = 1;
const name = "Le départ";
const intrigue = "C'est le grand jour, vous voilà parti pour votre première aventure !";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter1.json").step1;

    await s.createDialogue(null, null, { "title": "LE DÉPART, partie 1", "content": nar.dialog1 });
    const questMsg2 = await s.createDialogue(null, null, { "title": "LE DÉPART, partie 2", "content": nar.dialog2 });

    const choice = await s.choice(questMsg2.embeds[0], questMsg2, [
        { label: "Chemin étroit", emoji: "🏔️", customId: "A", style: "SECONDARY", disabled: false },
        { label: "Clairière", emoji: "🏞️", customId: "B", style: "SECONDARY", disabled: false },
    ]);
    const allChoices = {
        "A": "🏔️ | Vous voilà parti en direction du **chemin étroit** qui escarpe la montagne, en direction des ruines. Faites attention à vous !",
        "B": "🏞️ | Vous voilà partie en direction de la **clairière**, illuminée par le soleil. Ses rayons magnifiques semblent danser. Faites attention à vous !",
    };
    const allImgs = {
        "A": "https://cdn.discordapp.com/attachments/935645629210820618/939112300021964850/mont_sagiri_A.png",
        "B": "https://cdn.discordapp.com/attachments/935645629210820618/939112300378464296/mont_sagiri_B.png",
    };
    await message.channel.send({ embeds: [
        new MessageEmbed({
            "color": client.color,
            "title": "LE DÉPART, partie 3",
            "description": allChoices[choice.choice.customId],
        }).setImage(allImgs[choice.choice.customId]),
    ] });

    await saveProgression(client, message.author.id, { global_: "Mont Sagiri", precise: choice.choice.label });
    return "done";
};

module.exports = { name, id, intrigue, exe };