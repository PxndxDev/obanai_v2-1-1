const DemonBattle = require("../../../structures/classes/DemonBattle");
const Players = require("../../../structures/database/Players");
const Step = require("../../../structures/classes/Step");
const demons_sauvages = require("../../elements/demons/demons_sauvages");
const Body = require("../../../structures/classes/Body");
const Weapon = require("../../../structures/classes/Weapon");
const Progress = require("../../../structures/database/Progress");
const { saveProgression } = require("../../../structures/database/Progress");

const name = "Un combat fracassant";
const id = 2;
const intrigue = "Alors que vous venez juste de prendre la route, voilà que vous avez de la visite..";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter1.json").step2;

    const pProgress = await Progress.get(client, message.author.id);
    const loc = pProgress.location.precise;

    let pDatas = await Players.get(client, message.author.id);
    let demon = demons_sauvages.random("name")[0];

    if (loc === "Chemin étroit") demon = demons_sauvages.get("Démon du Sanctuaire")[1];
    if (loc === "Clairière") demon = demons_sauvages.get("Démon à la Langue")[1];

    await s.createDialogue(null, null, { "title": "Un combat fracassant, partie 1", "content": nar.dialog1 });
    await s.createDialogue(null, null, { "title": "Un combat fracassant, partie 2", "content": nar.dialog2 });

    await s.displayInformation("Informations utiles !", "Durant le début de combat, des petites bulles informatives vont vous expliquer de A à Z comment vous aller vous battre.", null);

    if (pDatas.breath.ressourceName !== null) pDatas = await (new Weapon(pDatas.style).doDamages(pDatas, pDatas.breath.ressourceName));

    const battle = new DemonBattle(client, {
        "player": { "pDatas": pDatas, "pUser": message.author, "life": 100, "body": new Body() },
        "demon": { "stats": demon.stats, "id": demon.id, "life": 100, "body": new Body(), "blood_art": demon.blood_art, "skills": demon.skills },
        "tutorial": 1, "step": s,
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

    await saveProgression(client, message.author.id, { global_: "Mont Sagiri", precise: pProgress.location.precise });

    return returned;
};

module.exports = { name, id, intrigue, exe };