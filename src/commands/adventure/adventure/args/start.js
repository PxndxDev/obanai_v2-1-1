/* eslint-disable brace-style */
/* eslint-disable no-multi-spaces */
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const Players = require("../../../../structures/database/Players");

module.exports = async (client, message, args) => {
    // préparation des composants
    const startingRow = new MessageActionRow()
        .addComponents(
            new MessageButton({ customId: "accept", label: "Commencer !", style: "DANGER", emoji: "❤️‍🔥" }),
            new MessageButton({ customId: "deny", label: "Non !", style: "SECONDARY", emoji: "❌" }),
        );

    const resp = await client.interact(
        message.author,
        message.channel,
        "```fix\nBienvenue !```\nHey, toi. Tu es sur le point de commencer ton aventure dans l'univers de Demon Slayer avec nous.",
        "normal",
        [startingRow],
        btn => btn.user.id === message.author.id,
        60000,
    );

    if (resp === null) {
        await client.resp(
            message.author,
            message.channel,
            "Il semblerait que tu sois absent. Ce n'est pas grave ! Reviens me voir quand tout est bon.",
            "afk",
        );
        return false;
    }
    if (resp.customId === "accept") {
        await client.resp(
            message.author,
            message.channel,
            "Bienvenue parmis nous ! Tu peux lire le prologue [ici](https://www.wattpad.com/1160662226-obanai-discord-bot-synopsis-prologue).",
            "accept",
        );
        return true;
    } else if (resp.customId === "deny") {
        await client.resp(
            message.author,
            message.channel,
            "Tu refuses, ce n'est pas un problème. Revient me voir quand tu seras prêt !",
            "error",
        );
        return false;
    }
};