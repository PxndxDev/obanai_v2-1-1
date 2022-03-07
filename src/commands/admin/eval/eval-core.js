/* eslint-disable brace-style */
const { MessageEmbed } = require("discord.js");

module.exports = {
    run: async (client, message, args) => {
        if (message.author.id !== "539842701592494111") return;

        const clean = text => {
            if (typeof text === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else return text;
        };

        const response = new MessageEmbed()
            .setColor(client.color)
            .addField("🔎 Evaled", `\`\`\`xl\n${args.join(" ").substring(0, 1000)}\`\`\``)
            .setTimestamp();

        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

            const cleanEvaled = clean(evaled);
            if (cleanEvaled === "undefined") {
                response.addField("❓ Terminal", "```cs\n# Nothing happens here...```");
            } else {
                response.addField("✅ Terminal", `\`\`\`xl\n${cleanEvaled.substring(0, 1000)}\`\`\``);
            }
        } catch (err) {
            const cleanErr = clean(err.message);
            response.addField("❌ Terminal (error)", `\`\`\`xl\n${cleanErr.substring(0, 1000)}\`\`\``);
        }

        message.channel.send({ embeds: [response] });
    },

    infos: {
        name: "eval",
        aliases: ["eval"],
        category: "admin",
        description: "This is private, uh.",
        cooldown: 0,
        permissions: [],
        finishRequests: [],
        adminsOnly: true,
    },
};