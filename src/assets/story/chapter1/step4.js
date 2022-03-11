/* eslint-disable brace-style */
const Step = require("../../../structures/classes/Step");
const Progress = require("../../../structures/database/Progress");
const { saveProgression } = require("../../../structures/database/Progress");

const name = "Presque rétablit !";
const id = 4;
const intrigue = "Un peu d'entrainement avant de repartir, ça ne fait pas de mal !";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter1.json").step4;

    const pProgress = await Progress.get(client, message.author.id);
    const loc = pProgress.location.precise;

    let dialog1 = [""];

    if (loc === "Chemin étroit") {
        dialog1 = nar.dialog1[0];
    } else if (loc === "Clairière") {
        dialog1 = nar.dialog1[1];
    }

    await s.createDialogue(null, null, { "title": "PRESQUE RÉTABLI, partie 1", "content": dialog1 });

    const results = [];

    if (loc === "Chemin étroit") {
        await s.createDialogue(null, null, { "title": "PRESQUE RÉTABLI, partie 2", "content": nar.dialog2[0] });

        const r1 = await s.enduranceMiniGame();
        await client.resp(message.author, message.channel, `Votre exercice est terminé. Vous avez obtenu un score de **${r1.results.score}**, et vous obtenez le rang **${r1.results.classe[0]}** !`, "normal");

        await s.createDialogue(null, null, { "title": "PRESQUE RÉTABLI, partie 3", "content": nar.dialog2[1] });
        const r2 = await s.agilityMiniGame();
        await client.resp(message.author, message.channel, `Votre exercice est terminé. Vous avez obtenu un score de **${r2.results.score}**, et vous obtenez le rang **${r2.results.classe[0]}** !`, "normal");

        results.push(r1, r2);
    } else if (loc === "Clairière") {
        await s.createDialogue(null, null, { "title": "PRESQUE RÉTABLI, partie 2", "content": nar.dialog2[2] });
        const r1 = await s.strengthMiniGame();
        await client.resp(message.author, message.channel, `Votre exercice est terminé. Vous avez obtenu un score de **${r1.results.score}**, et vous obtenez le rang **${r1.results.classe[0]}** !`, "normal");


        await s.createDialogue(null, null, { "title": "PRESQUE RÉTABLI, partie 3", "content": nar.dialog[3] });
        const r2 = await s.fastMiniGame();
        await client.resp(message.author, message.channel, `Votre exercice est terminé. Vous avez obtenu un score de **${r2.results.score}**, et vous obtenez le rang **${r2.results.classe[0]}** !`, "normal");

        results.push(r1, r2);
    }

    await s.createDialogue(null, null, { "title": "PRESQUE RÉTABLI, partie 4", "content": [
        "> Vous voilà tout essouflé. Votre entraînement vous a permis d'améliorer légèrement vos capacités.\n\n*(Vos capacités n'ont pas augmentées, les entraînements des chapitres sont à but narratifs)*\n",
        `> Vous avez effectué de très bon scores. Votre score moyen est de **${Number(((results[0].results.score + results[1].results.score) / 2).toFixed(0))}**, c'est très appréciable pour un début !`,
    ] });

    await s.createDialogue(null, null, { "title": "PRESQUE RÉTABLI, partie 5", "content": nar.dialog3 });


    await saveProgression(client, message.author.id, { global_: "Mont Sagiri", precise: pProgress.location.precise });
    return "done";
};

module.exports = { name, id, intrigue, exe };