// données par défaut d'une guilde
const model = {
    guildId: false,
    prefix: "?",
};

// commande pour sécuriser les entrées de la base de données
const ensure = async (client, guildId) => {
    client.Guilds.ensure(guildId, model);
    const gDatas = client.Guilds.get(guildId);

    if (!gDatas.guildId) client.Guilds.set(guildId, guildId, "guildId");
    return client.Guilds.get(guildId);
};

// renvoyer les données en passant par la méthode sécurisation
const get = async (client, guildId) => {
    await ensure(client, guildId);
    return client.Guilds.get(guildId);
};

// exporter le tout
module.exports = { model, ensure, get };