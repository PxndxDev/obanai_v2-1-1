/* eslint-disable curly */
/* eslint-disable no-case-declarations */
/* eslint-disable brace-style */
const { MessageAttachment, MessageEmbed } = require("discord.js");
const Relationship = require("../../../structures/classes/Relationship");
const Canvas = require("canvas");

module.exports = {
    run: async (client, message, args) => {
        let p2 = null;
        const battleRelationship = new Relationship(client, message, args);
        const players = await battleRelationship.FindUser();

        // récupération du deuxième joueur
        if (players.comment === "not found") p2 = message.author;
        if (players.comment === "single") p2 = players.user;
        if (players.comment === "multiple") {
            p2 = await battleRelationship.MultipleAwaiting(players);
            if (!p2) p2 = message.author;
        }

        message.channel.sendTyping();

        const canvas = Canvas.createCanvas(512, 512);
        const ctx = canvas.getContext("2d");

        const sepia = () => {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const red = data[i], green = data[i + 1], blue = data[i + 2];

                data[i] = Math.min(Math.round(0.393 * red + 0.769 * green + 0.189 * blue), 255);
                data[i + 1] = Math.min(Math.round(0.349 * red + 0.686 * green + 0.168 * blue), 255);
                data[i + 2] = Math.min(Math.round(0.272 * red + 0.534 * green + 0.131 * blue), 255);
            }
            ctx.putImageData(imageData, 0, 0);
        };

        const saturate = () => {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const dA = imageData.data;

            const sv = 3;

            const luR = 0.3086 * 1.1;
            const luG = 0.6094;
            const luB = 0.0820;

            const az = (1 - sv) * luR + sv;
            const bz = (1 - sv) * luG;
            const cz = (1 - sv) * luB;
            const dz = (1 - sv) * luR;
            const ez = (1 - sv) * luG + sv;
            const fz = (1 - sv) * luB;
            const gz = (1 - sv) * luR;
            const hz = (1 - sv) * luG;
            const iz = (1 - sv) * luB + sv;

            for (let i = 0; i < dA.length; i += 4) {
                const red = dA[i];
                const green = dA[i + 1];
                const blue = dA[i + 2];

                const saturatedRed = (az * red + bz * green + cz * blue);
                const saturatedGreen = (dz * red + ez * green + fz * blue);
                const saturateddBlue = (gz * red + hz * green + iz * blue);

                dA[i] = saturatedRed;
                dA[i + 1] = saturatedGreen;
                dA[i + 2] = saturateddBlue;
            }

            ctx.putImageData(imageData, 0, 0);
        };

        // dessin du fond
        const background = await Canvas.loadImage("https://cdn.discordapp.com/attachments/935645629210820618/947862223806660678/coin.png");
        ctx.drawImage(background, 0, 0, 512, 512);

        const winner = [message.author, p2][Math.floor(Math.random() * [message.author, p2].length)];

        const ppToLoad = await Canvas.loadImage(winner.displayAvatarURL({ "dynamic": false, "format": "jpg" }));
        const rayon = 194;
        ctx.beginPath();
        ctx.arc(256, 256, rayon, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(ppToLoad, (512 - rayon * 2) / 2, (512 - rayon * 2) / 2, rayon * 2, rayon * 2);

        sepia();
        saturate();

        const attachment = new MessageAttachment(canvas.toBuffer(), "tossup.png");
        const tossup = new MessageEmbed()
            .setImage("attachment://tossup.png")
            .setColor("#2f3136")
            .setDescription(`<@${winner.id}> est tiré au sort !`);

        await message.reply({ embeds: [tossup], files: [attachment] });
    },

    infos: {
        name: "tossup",
        aliases: ["tossup", "kicékicomanç"],
        category: "adventure",
        description: "Pile ou face ?",
        cooldown: 5,
        permissions: [],
        finishRequests: [],
        adminsOnly: false,
    },
};