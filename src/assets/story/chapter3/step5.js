/* eslint-disable brace-style */
const Step = require("../../../structures/classes/Step");
const Players = require("../../../structures/database/Players");
const { saveProgression } = require("../../../structures/database/Progress");

const id = 5;
const name = "Entraînons ta vitesse !";
const intrigue = "Vous continuez à vous améliorer, vous êtes désormais à votre deuxième entraînement.";

const exe = async (client, message, args) => {
    const s = new Step(client, message, args);
    const nar = require("../../narration/chapter3.json").step5;

    const pDatas = await Players.get(client, message.author.id);
    const teacher = pDatas.breath.ressources.teacher;
    const br = pDatas.breath.ressourceName;
    const d = require("../../narration/chapter3.json").step5.texts;

    await s.createDialogue(null, null, { title: "ENTRAÎNONS TA VITESSE, partie 1", content: [
        `> ${teacher.emoji} — ${d[0][br]}\n`,
    ] });

    await s.createDialogue(null, null, { "title": "ENTRAÎNONS TA VITESSE, partie 2", "content": [
        "> Lorsque vous êtes prêt, réagissez ci-dessous pour lancer l'entraînement de vitesse **1**/3. (*démarrage auto dans 60sec)*\n",
    ] });
    const r1 = await s.fastMiniGame();
    await client.resp(message.author, message.channel, `Votre exercice est terminé. Vous avez obtenu un score de **${r1.results.score}**, et vous obtenez le rang **${r1.results.classe[0]}** !`, "normal");

    await s.createDialogue(null, null, { "title": "ENTRAÎNONS TA VITESSE, partie 3", "content": [
        "> Lorsque vous êtes prêt, réagissez ci-dessous pour lancer l'entraînement de vitesse **2**/3. (*démarrage auto dans 60sec)*\n",
    ] });
    const r2 = await s.fastMiniGame();
    await client.resp(message.author, message.channel, `Votre exercice est terminé. Vous avez obtenu un score de **${r2.results.score}**, et vous obtenez le rang **${r2.results.classe[0]}** !`, "normal");

    await s.createDialogue(null, null, { "title": "ENTRAÎNONS TA VITESSE, partie 4", "content": [
        "> Lorsque vous êtes prêt, réagissez ci-dessous pour lancer l'entraînement de vitesse **3**/3. (*démarrage auto dans 60sec)*\n",
    ] });
    const r3 = await s.fastMiniGame();
    await client.resp(message.author, message.channel, `Votre exercice est terminé. Vous avez obtenu un score de **${r3.results.score}**, et vous obtenez le rang **${r3.results.classe[0]}** !`, "normal");

    await client.resp(message.author, message.channel, `Vous avez obtenu un score moyen de **${Math.ceil((r1.results.score + r2.results.score + r3.results.score) / 3)}**. Bien joué !`);

    await saveProgression(client, message.author.id, { global_: "QG des pourfendeurs", precise: "Camp d'entraînement" });
    return "done";
};

module.exports = { name, id, intrigue, exe };