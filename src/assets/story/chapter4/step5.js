/* eslint-disable brace-style */
const Step = require("../../../structures/classes/Step");
const { saveProgression } = require("../../../structures/database/Progress");
const Players = require("../../../structures/database/Players");
const demons_sauvages = require("../../elements/demons/demons_sauvages");
const Weapon = require("../../../structures/classes/Weapon");
const DemonBattle = require("../../../structures/classes/DemonBattle");
const Body = require("../../../structures/classes/Body");

const id = 5;
const name = "4 jours de survie";
const intrigue = "Cela fait 4 jours que vous survivez, vous ne comptez même plus le nombre de démons que vous avez vaincu...";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter4.json").step5;

    await s.createDialogue(null, null, { title: "4 JOURS DE SURVIE, partie 1", content: nar.dialog1 });

    let pDatas = await Players.get(client, message.author.id);
    const demon = demons_sauvages.get("Démon aux Poings de fer")[1];

    if (pDatas.breath.ressourceName !== null) pDatas = await (new Weapon(pDatas.style).doDamages(pDatas, pDatas.breath.ressourceName));

    const battle = new DemonBattle(client, {
        "player": { "pDatas": pDatas, "pUser": message.author, "life": 100, "body": new Body() },
        "demon": { "stats": demon.stats, "id": demon.id, "life": 100, "body": new Body(), "blood_art": demon.blood_art, "skills": demon.skills },
        "tutorial": 2, "step": s,
    });

    let logs = await message.channel.send({ content: "||\u200B||" });
    while (battle.player.life > 0 && battle.demon.life > 0 && !battle.forfeit && battle.afks < 3) {
        battle.played = false;
        switch (battle.role) {
            case "p1":
                await battle.caseP1(message, logs);
            break;
            case "p2":
                await battle.caseP2(message, logs);
            break;
            default: break;
        }
    }
    let hasWon = false;
    if (battle.player.life <= 0 || battle.demon.life <= 0) {
        hasWon = await battle.winDisplay(message, logs);
    // eslint-disable-next-line brace-style
    } else if (battle.afks >= 3) {
        battle.player.life = 0;
        hasWon = await battle.winDisplay(message, logs);
    }

    const returned = ["lose", "done"][[false, true].indexOf(hasWon)];

    await saveProgression(client, message.author.id, { global_: "Mont Fujikasane", precise: "Forêt étrange" });

    return returned;
};

module.exports = { name, id, intrigue, exe };