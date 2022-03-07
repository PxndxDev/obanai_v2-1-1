const Snowflake = require("../functions/Snowflake");
const Breath = require("../classes/Breath");
const xpCalc = require("../../commands/adventure/profil/tools/calcul-level");
const { MessageEmbed } = require("discord.js");

// données par défaut des membres
const Model = {
    userId: "0",
    started: false,
    since: Date.now(),

    /* INVENTAIRE
        ----------------------- */
    black_yens: 0,
    id: new Snowflake().generate(),
    exp: 0,
    elo: 0,

    /* ATTRIBUTS
        ----------------------- */
    // physique
    strength: 1,
    speed: 1,
    agility: 1,
    // long terme
    endurance: 1,
    resistance: 1,

    /* POURFENDEUR
        ----------------------- */
    breath: new Breath(null).generated(),
    rank: "Mizunoto",
    pillar: false,
    style: "katana",
};

// commande pour sécuriser les entrées de la base de données
const ensure = async (client, userId) => {
    client.Players.ensure(userId, Model);
    client.Players.set(userId, userId, "userId");
    const uDatas = client.Players.get(userId);

    if (!uDatas.userId) client.Players.set(userId, userId, "userId");
    return client.Players.get(userId);
};

// vérifier si un utilisateur existente
const has = async (client, userId) => {
    return await client.Players.has(userId);
};

// renvoyer les données en passant par la méthode sécurisation
const get = async (client, userId) => {
    await ensure(client, userId);
    return client.Players.get(userId);
};

// créer un nouveau joueur
const create = async (client, userId) => {
    await ensure(client, userId);
    await client.Players.set(userId, true, "started");
    await client.Players.set(userId, true, "started");

    return "successfully created";
};

// ajouter de l'exp
const addExp = async (client, userId, message, amount) => {
    const actualDatas = await get(client, userId);
    const actualExp = xpCalc(actualDatas.exp);
    const afterAmount = xpCalc(actualDatas.exp + amount);

    let phrase = `GG ! Vous remportez **${amount}** exp !`;
    const ggEmbed = new MessageEmbed()
        .setColor(client.color)
        .setAuthor({ "name": message.author.tag, "iconURL": message.author.displayAvatarURL({ "dynamic": true }) })
        .setThumbnail(message.author.displayAvatarURL({ animated: true }))
        .setTitle(":star: • Gain d'expérience");

    if (actualExp.level < afterAmount.level) phrase += `\n> Vous montez d'un niveau. Vous voilà désormais niveau **${afterAmount.level}**`;

    ggEmbed.addField("<:invisible:921131991712272384>", phrase);

    await message.channel.send({ embeds: [ggEmbed] });
    await client.Players.set(message.author.id, actualDatas.exp + amount, "exp");
};

// exporter le tout
module.exports = { Model, ensure, has, get, create, addExp };