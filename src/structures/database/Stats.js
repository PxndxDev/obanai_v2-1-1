// données par défaut des membres
const Model = {
    userId: "0",
    soloBattle: {
        victories: 0,
        loses: 0,
    },
    mpBattle: {
        victories: 0,
        loses: 0,
    },
    tournaments: {
        tdc: {
            played: 0,
            victories: 0,
        },
        pillars: {
            played: 0,
            victories: 0,
        },
    },
    badges: [],
};

// commande pour sécuriser les entrées de la base de données
const ensure = async (client, userId) => {
    client.Stats.ensure(userId, Model);
    client.Stats.set(userId, userId, "userId");
    const uDatas = client.Stats.get(userId);

    if (!uDatas.userId) client.Stats.set(userId, userId, "userId");
    return client.Stats.get(userId);
};

// renvoyer les données en passant par la méthode sécurisation
const get = async (client, userId) => {
    await ensure(client, userId);
    return client.Stats.get(userId);
};

// exporter le tout
module.exports = { Model, ensure, get };