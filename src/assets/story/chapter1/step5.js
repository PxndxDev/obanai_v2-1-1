const DemonBattle = require("../../../structures/classes/DemonBattle");
const Players = require("../../../structures/database/Players");
const Step = require("../../../structures/classes/Step");
const demons_sauvages = require("../../elements/demons/demons_sauvages");
const Body = require("../../../structures/classes/Body");
const Weapon = require("../../../structures/classes/Weapon");
const { saveProgression } = require("../../../structures/database/Progress");

const name = "Le combat final";
const id = 5;
const intrigue = "Vous arrivez enfin de l'autre côté du mont Sagiri, tandis que...";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter1.json").step5;

    let pDatas = await Players.get(client, message.author.id);
    const demon = demons_sauvages.get("Démon aux Yeux")[1];

    await s.createDialogue(null, null, { title: "LE COMBAT FINAL, partie 1", content: nar.dialog1 });

    if (pDatas.breath.ressourceName !== null) pDatas = await (new Weapon(pDatas.style).doDamages(pDatas, pDatas.breath.ressourceName));

    const battle = new DemonBattle(client, {
        "player": { "pDatas": pDatas, "pUser": message.author, "life": 100, "body": new Body() },
        "demon": { "stats": demon.stats, "id": demon.id, "life": 100, "body": new Body(), "blood_art": demon.blood_art, "skills": demon.skills },
        "tutorial": 0, "step": s,
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

    await saveProgression(client, message.author.id, { global_: "Mont Sagiri", precise: "Croisement de fin de région" });

    return returned;
};

module.exports = { name, id, intrigue, exe };