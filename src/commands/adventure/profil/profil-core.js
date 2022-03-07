/* eslint-disable curly */
/* eslint-disable no-case-declarations */
/* eslint-disable brace-style */
const Players = require("../../../structures/database/Players");
const Progress = require("../../../structures/database/Progress");
const Canvas = require("canvas");
const StackBlur = require("stackblur-canvas");
const { MessageAttachment, MessageEmbed } = require("discord.js");
const xpCalc = require("./tools/calcul-level");
const rankCalc = require("./tools/calcul-rank");
const Relationship = require("../../../structures/classes/Relationship");
const Weapon = require("../../../structures/classes/Weapon");

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

        const playerExists = await Players.has(client, p2.id);

        if (playerExists === false) return await client.resp(message.author, message.channel, (p2.id === message.author.id ? "Vous n'avez " : `<@${p2.id}> n'a `) + "pas commencé l'aventure sur Obanai.", "error");
        const imgToLoad = "https://cdn.discordapp.com/attachments/852912841102196786/945362127990968390/img_rengoku2.png";

        message.channel.sendTyping();
        const pDatas = await Players.get(client, p2.id);
        const prDatas = await Progress.get(client, p2.id);
        // création des polices et du canvas
        Canvas.registerFont("./src/assets/misc/anime_ace/animeace2_reg.otf", { family: "anime_regular" });
        Canvas.registerFont("./src/assets/misc/anime_ace/animeace2_bld.otf", { family: "anime_bold" });
        Canvas.registerFont("./src/assets/misc/anime_ace/animeace2_ital.otf", { family: "anime_italic" });

        Canvas.registerFont("./src/assets/misc/titillium_web/TitilliumWeb-Bold.ttf", { family: "normal_bold" });
        Canvas.registerFont("./src/assets/misc/titillium_web/TitilliumWeb-Italic.ttf", { family: "normal_italic" });
        Canvas.registerFont("./src/assets/misc/titillium_web/TitilliumWeb-BoldItalic.ttf", { family: "normal_bolditalic" });
        const canvas = Canvas.createCanvas(470, 400);
        const ctx = canvas.getContext("2d");

        // dessin du fond
        const background = await Canvas.loadImage(imgToLoad);
        ctx.drawImage(background, 0, -300, 470, 1400);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3);";
        ctx.fillRect(8, 8, canvas.width - 16, canvas.height - 16);
        ctx.fillStyle = "rgba(0, 0, 0, 0.4);";
        ctx.fillRect(15, 15, canvas.width - 30, canvas.height - 30);
        StackBlur.canvasRGBA(canvas, 10, 10, canvas.width - 20, canvas.height - 20, 5);
        StackBlur.canvasRGBA(canvas, 0, 0, canvas.width, canvas.height, 5);

        // application de la photo de profil
        ctx.fillStyle = "rgba(0, 0, 0, 0.2);";
        ctx.fillRect(18, 18, 104, 134);
        const avatar = await Canvas.loadImage(p2.displayAvatarURL({ dynamic: false, format: "jpg" }));
        ctx.drawImage(avatar, 20, 20, 100, 100);

        // affichage des yens
        ctx.fillStyle = "rgba(0, 0, 0, 0.4);";
        ctx.fillRect(18, 122, 104, 30);
        ctx.fillStyle = "white";
        ctx.font = "15px normal_bold";
        ctx.textAlign = "right";
        ctx.fillText(`¥ ${pDatas.black_yens}`, 115, 145);

        // affichage du level
        const xpDatas = xpCalc(pDatas.exp);
        ctx.font = "20px normal_bold";
        ctx.textAlign = "left";
        ctx.fillText("Niveau", 125, 38);
        ctx.fillStyle = "#fe6161";
        const textPadding = 125 + ctx.measureText("Niveau ").width;
        ctx.font = "30px normal_bold";
        ctx.fillText(`${xpDatas.level}`, textPadding, 38);
        ctx.fillStyle = "rgba(0, 0, 0, 0.6);";
        ctx.fillRect(125, 40, 320, 40);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9);";
        ctx.fillRect(127, 42, xpDatas.progression.percent * 316 / 100, 36);
        ctx.fillStyle = "#fe6161";
        ctx.textAlign = "center";
        ctx.font = "20px normal_bold";
        ctx.fillText(`${xpDatas.progression.exp[0]}/${xpDatas.progression.exp[1]}`, (125 + 320 / 2), 75);

        // affichage du rank du joueur
        const rankDatas = rankCalc(client, pDatas);
        ctx.fillStyle = "rgba(0, 0, 0, 0.6);";
        ctx.fillRect(18, 154, 104, 78);
        ctx.fillStyle = "#fe6161";
        ctx.font = "15px normal_bold";
        ctx.textAlign = "center";
        ctx.fillText("RANG GLOBAL", 70, 170);
        ctx.fillText("RANG SOUFFLE", 70, 205);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9);";
        ctx.font = "16px normal_bold";
        ctx.textAlign = "center";
        ctx.fillText(rankDatas.globalRank, 70, 188);
        ctx.fillText(rankDatas.playerRank, 70, 224);

        // affichage de la boite principale
        ctx.fillStyle = "rgba(0, 0, 0, 0.6);";
        ctx.fillRect(125, 83, 320, 149);

        // contenu de la boite principale
        ctx.textAlign = "left";
        ctx.fillStyle = "white";
        ctx.font = "18px normal_bold";
        const ySpace = 28;
        let y = 1;
        [
            ["Force: ", `${pDatas.strength}`],
            ["Rapidité: ", `${pDatas.speed}`],
            ["Agilité: ", `${pDatas.agility}`],
            ["Endurance: ", `${pDatas.endurance}`],
            ["Résistance: ", `${pDatas.resistance}`],
        ].forEach(attribute => {
            const text = attribute[0];
            const value = attribute[1];

            ctx.fillStyle = "white";
            ctx.fillText(text, 135, 79 + y * ySpace);
            const textLength = ctx.measureText(text).width;
            ctx.fillStyle = "#fe6161";
            ctx.fillText(value, 135 + textLength, 79 + y * ySpace);

            y++;
        });
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(284, 88, 2, 139);

        // attributs
        ctx.fillStyle = "#fe6161";
        ctx.font = "20px normal_bold";
        ctx.textAlign = "center";
        ctx.fillText("SOUFFLE", 365, 105);
        ctx.fillText("RANG", 365, 195);
        ctx.fillStyle = "white";
        ctx.font = "17px normal_bold";
        ctx.textAlign = "center";
        ctx.fillText(`${pDatas.breath.ressources.name}`, 365, 130);
        ctx.fillText(`Affinité: ${pDatas.breath.affinity}%`, 365, 160);
        ctx.fillText(`${pDatas.rank}`, 365, 215);

        // creation de la seconde boîte
        const w = new Weapon(pDatas.style);
        const bonus = await w.boost(pDatas.breath.ressourceName);
        ctx.fillStyle = "rgba(0, 0, 0, 0.6);";
        ctx.fillRect(18, 235, 427, 140);
        if (prDatas.chapter < 3) {
            const lock = await Canvas.loadImage("https://cdn.discordapp.com/attachments/935645629210820618/947234875851825192/lock.png");
            ctx.drawImage(lock, canvas.width / 2 - 30, 245, 60, 60);
            ctx.fillStyle = "#fe6161";
            ctx.font = "20px normal_bold";
            ctx.textAlign = "center";
            ctx.fillText("CHAPITRE 3 POUR DÉVERROUILLER", canvas.width / 2, 330);
        } else {
            ctx.fillStyle = "#fe6161";
            ctx.font = "20px normal_bold";
            ctx.textAlign = "center";
            ctx.fillText("BONUS D'ARME", canvas.width / 2, 260);
            ctx.textAlign = "left";
            ctx.font = "15px normal_bold";
            y = 1;
            const ySpace2 = 20;
            [
                ["Force: ", `+${bonus.bonus.strength}`],
                ["Rapidité: ", `+${bonus.bonus.speed}`],
                ["Agilité: ", `+${bonus.bonus.agility}`],
                ["Endurance: ", `+${bonus.bonus.endurance}`],
                ["Résistance: ", `+${bonus.bonus.resistance}`],
            ].forEach(attribute => {
                const text = attribute[0];
                const value = attribute[1];

                ctx.fillStyle = "white";
                ctx.fillText(text, 25, 260 + y * ySpace2);
                const textLength = ctx.measureText(text).width;
                ctx.fillStyle = "#fe6161";
                ctx.fillText(value, 25 + textLength, 260 + y * ySpace2);

                y++;
            });
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(canvas.width / 3 + 20, 270, 2, 90);
            ctx.font = "18px normal_bold";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(`${require(`../../../assets/elements/weapons/${pDatas.style}.json`).name}`, 2 * canvas.width / 3, 286);
            ctx.fillStyle = "#fe6161";
            ctx.font = "20px normal_bold";
            ctx.fillText("BOOST SOUFFLE", 2 * canvas.width / 3, 320);
            ctx.font = "17px normal_bold";
            ctx.fillStyle = "white";
            if (bonus.breath.name === "Aucune aptitude") ctx.fillText(`${bonus.breath.name}`, 2 * canvas.width / 3, 345);
            else {
                const textLength = ctx.measureText(String(bonus.breath.name) + ":").width;
                const textLength2 = ctx.measureText("+" + String(bonus.breath.affinity)).width;

                ctx.fillStyle = "white";
                ctx.fillText(String(bonus.breath.name) + ":", 2 * canvas.width / 3 - (textLength / 2), 345);
                ctx.fillStyle = "#fe6161";
                ctx.fillText("+" + String(bonus.breath.affinity), 2 * canvas.width / 3 + (textLength2 / 2) + 5, 345);
            }
        }

        const attachment = new MessageAttachment(canvas.toBuffer(), "profil.png");
        const profilEmbed = new MessageEmbed()
            .setImage("attachment://profil.png")
            .setColor("#2f3136")
            .setFooter({ text: "À rejoint l'aventure le" })
            .setTimestamp(pDatas.since);

        if (Math.floor(Math.random() * 100) <= 2) profilEmbed.setAuthor({ "iconURL": "https://cdn.discordapp.com/attachments/935645629210820618/943557474680705084/Muichiro_Tokito.jpg", "name": "Qu'est-ce que je fous là moi ?" });

        await message.reply({ embeds: [profilEmbed], files: [attachment] });
    },

    infos: {
        name: "profil",
        aliases: ["profil", "p"],
        category: "adventure",
        description: "Regardez votre profil !",
        cooldown: 2,
        permissions: [],
        finishRequests: ["adventure", "battle", "chapter", "train"],
        adminsOnly: false,
    },
};