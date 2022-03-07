/* eslint-disable brace-style */
const Weapon = require("../../../structures/classes/Weapon");
const DemonBattle = require("../../../structures/classes/DemonBattle");
const Step = require("../../../structures/classes/Step");
const Body = require("../../../structures/classes/Body");
const { saveProgression } = require("../../../structures/database/Progress");
const Players = require("../../../structures/database/Players");
const lunes_inferieures = require("../../elements/demons/lunes_inferieures");

const id = 2;
const name = "12, le chiffre qui tue";
const intrigue = "Un adversaire colossale s'invite à la partie. Tout se joue maintenant !";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter2.json").step2;

    await s.createDialogue(null, null, { "title": "12, LE CHIFFRE QUI TUE, partie 1", "content": nar.dialog1 });

    await s.createDialogue(null, null, { "title": "12, LE CHIFFRE QUI TUE, partie 2", "content": nar.dialog2 });

    let pDatas = await Players.get(client, message.author.id);
    const demon = lunes_inferieures.get("Kamanue, 12ème Lune Démoniaque")[1];

    await lunes_inferieures.showInfos(demon, client, message, "blood_art");
    if (pDatas.breath.ressourceName !== null) pDatas = await (new Weapon(pDatas.style).doDamages(pDatas, pDatas.breath.ressourceName));

    const battle = new DemonBattle(client, {
        "player": { "pDatas": pDatas, "pUser": message.author, "life": 100, "body": new Body() },
        "demon": { "stats": demon.stats, "id": demon.id, "life": 100, "body": new Body(), "blood_art": demon.blood_art, "skills": demon.skills },
        "tutorial": 2, "step": s,
    });

    let lastTurn = "normal";

    let logs = await message.channel.send({ content: "||\u200B||" });
    while (battle.player.life > 0 && battle.demon.life > 0 && !battle.forfeit && battle.afks < 3) {
        battle.played = false;
        switch (battle.role) {
            case "p1":
                if (!battle.demon.blood_art.enabled && lastTurn === "normal" && battle.demon.life < 70) {
                    battle.demon.blood_art.enabled = true;
                    lastTurn = "blood_art";
                    await message.channel.send({ content: "**Kamanue** active son pouvoir sanguinaire !" });
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