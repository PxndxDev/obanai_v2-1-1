/* eslint-disable brace-style */
const Weapon = require("../../../structures/classes/Weapon");
const DemonBattle = require("../../../structures/classes/DemonBattle");
const Step = require("../../../structures/classes/Step");
const Body = require("../../../structures/classes/Body");
const { saveProgression } = require("../../../structures/database/Progress");
const Players = require("../../../structures/database/Players");
const demons_boss = require("../../elements/demons/demons_boss");

const id = 10;
const name = "La mort en face";
const intrigue = "c'est sans doute une illusion... Vous regardez la mort droit dans les yeux...";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter4.json").step10;

    await s.createDialogue(null, null, { title: "LA MORT EN FACE, partie 1", content: nar.dialog1 });

    let pDatas = await Players.get(client, message.author.id);
    const demon = demons_boss.get("Démon aux mains")[1];

    await demons_boss.showInfos(demon, client, message, "rage");
    if (pDatas.breath.ressourceName !== null) pDatas = await (new Weapon(pDatas.style).doDamages(pDatas, pDatas.breath.ressourceName));

    const battle = new DemonBattle(client, {
        "player": { "pDatas": pDatas, "pUser": message.author, "life": 100, "body": new Body() },
        "demon": { "stats": demon.stats, "id": demon.id, "life": 100, "body": new Body(), "blood_art": demon.rage, "skills": demon.skills },
        "tutorial": 2, "step": s,
    });

    let lastTurn = "normal";

    let logs = await message.channel.send({ content: "||\u200B||" });
    while (battle.player.life > 0 && battle.demon.life > 0 && !battle.forfeit && battle.afks < 3) {
        battle.played = false;
        switch (battle.role) {
            case "p1":
                console.log(battle.demon.blood_art);
                if (!battle.demon.blood_art.enabled && lastTurn === "normal" && battle.demon.life < 75) {
                    battle.demon.blood_art.enabled = true;
                    lastTurn = "rage";
                    await message.channel.send({ content: "**Démon aux mains** s'enrage !" });
                } else { lastTurn = "normal"; }
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

    await saveProgression(client, message.author.id, { global_: "Mont Urasai", precise: "Forêt étrange" });

    return returned;
};

module.exports = { name, id, intrigue, exe };