/* eslint-disable brace-style */
/* eslint-disable no-lonely-if */
/* eslint-disable no-inline-comments */
/* eslint-disable no-trailing-spaces */

const convertDate = require("../../utils/convertDate");

// données par défaut des membres
const Model = {
    userId: "0",
    busy: false,
    since: null,
    end_date: null,

    activity: null,
    if_travel_datas: {
        arrivalGlobal: "",
        arrivalPrecise: "",
    },
    if_train_datas: {
        aptitude: "",
        sessions: [
            {
                id: 0, 
                date: null,
                scores: [],
            },
            {
                id: 1, 
                date: null,
                scores: [],
            },
            {
                id: 2, 
                date: null,
                scores: [],
            },
            {
                id: 3, 
                date: null,
                scores: [],
            },
        ],
    },
};

// commande pour sécuriser les entrées de la base de données
const ensure = async (client, userId) => {
    client.Activities.ensure(userId, Model);
    client.Activities.set(userId, userId, "userId");
    const uDatas = client.Activities.get(userId);

    if (!uDatas.userId) client.Activities.set(userId, userId, "userId");
    return client.Activities.get(userId);
};

// renvoyer les données en passant par la méthode sécurisation
const get = async (client, userId) => {
    await ensure(client, userId);
    return client.Activities.get(userId);
};

const isBusy = async (client, userId) => {
    const uDatas = await get(client, userId);
    return uDatas.busy;
};

const occupy = async (client, userId, duration, activity, train_datas = Model.if_train_datas.aptitude, travel_datas = Model.if_travel_datas) => {
    const uDatas = await get(client, userId);

    if (uDatas.busy) return;

    client.Activities.set(userId, true, "busy");
    client.Activities.set(userId, Date.now(), "since");
    client.Activities.set(userId, (Date.now() + duration * 60000), "end_date");
    client.Activities.set(userId, (Date.now() + duration * 60000), "end_date");
    client.Activities.set(userId, activity, "activity");

    if (activity === "travel") {
        client.Activities.set(userId, travel_datas.arrivalGlobal, "if_travel_datas.arrivalGlobal");
        client.Activities.set(userId, travel_datas.arrivalPrecise, "if_travel_datas.arrivalPrecise");
    } else if (activity === "train") {
        client.Activities.set(userId, train_datas, "if_train_datas.aptitude");
    }
};

const occupationToString = async (client, userId) => {
    let str = "";

    const uDatas = await get(client, userId);
    if (!uDatas.busy) {
        str = "L'utilisateur n'est pas occupé.";
    } else {
        if (uDatas.activity === "travel") {
            str = `L'utilisateur est en train de **voyager**. Il se dirige vers **${uDatas.if_travel_datas.arrivalGlobal}**, **${uDatas.if_travel_datas.arrivalPrecise}**. Son voyage prendra fin **${convertDate(uDatas.end_date - Date.now()).string}**`;
        } else if (uDatas.activity === "train") {
            const allActivities = {
                "speed": "sa **vitesse** ⚡",
                "strength": "sa **force** 💪",
                "agility": "son **agilité** 🤸",
                "endurance": "son **endurance** ⏲️",
                "resistance": "sa **resistance** 🛡️",
            };

            str = `L'utilisateur est en train de **s'entraîner**. Il travaille actuellement ${allActivities[uDatas.if_train_datas.aptitude]} ! Son entraînement prendra fin dans **${convertDate(uDatas.end_date - Date.now()).string}**`;
        }
    }

    return str;
};

const freeOfActivity = async (client, userId) => {
    await client.Activities.delete(userId);
};

// exporter le tout
module.exports = { Model, ensure, get, isBusy, occupy, occupationToString, freeOfActivity };