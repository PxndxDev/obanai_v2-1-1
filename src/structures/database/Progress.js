// données par défaut des membres
const Model = {
    userId: "0",

    /* INFORMATIONS
        ----------------------- */
    chapter: 1,
    step: 1,
    killed: false,
    healed: Date.now(),

    location: {
        global: "Mont Sagiri",
        precise: "Pied de la Montagne",
    },
};

// commande pour sécuriser les entrées de la base de données
const ensure = async (client, userId) => {
    client.Progress.ensure(userId, Model);
    client.Progress.set(userId, userId, "userId");
    const uDatas = client.Progress.get(userId);

    if (!uDatas.userId) client.Progress.set(userId, userId, "userId");
    return client.Progress.get(userId);
};

// renvoyer les données en passant par la méthode sécurisation
const get = async (client, userId) => {
    await ensure(client, userId);
    return client.Progress.get(userId);
};

// sauvegarder les données de quête
const saveProgression = async (client, userId, newLocation) => {
    await ensure(client, userId);

    if (newLocation !== null) {
        client.Progress.set(userId, newLocation.global_, "location.global");
        client.Progress.set(userId, newLocation.precise, "location.precise");
    }
};

const updateLocation = async (client, userId, newLocation = Model.location) => {
    if (newLocation !== null) {
        client.Progress.set(userId, newLocation.global_, "location.global");
        client.Progress.set(userId, newLocation.precise, "location.precise");
    }
};

const updateProgression = async (client, userId) => {
    const pDatas = await get(client, userId);
    const actualChapter = require(`../../assets/story/chapter${pDatas.chapter}/chapter-infos.js`);

    if (pDatas.step === actualChapter.pages) {
        client.Progress.set(userId, 1, "step");
        client.Progress.set(userId, (pDatas.chapter + 1), "chapter");
    // eslint-disable-next-line brace-style
    } else {
        client.Progress.set(userId, (pDatas.step + 1), "step");
    }
};

const failMission = async (client, userId) => {
    await ensure(client, userId);
    client.Progress.set(userId, Date.now() + 7_200_000, "healed");
    client.Progress.set(userId, true, "killed");
};

// exporter le tout
module.exports = { Model, ensure, get, saveProgression, updateProgression, failMission, updateLocation };