module.exports = {
    name: "La Sélection finale",
    id: 4,
    pages: require("fs").readdirSync("./src/assets/story/chapter4/").length - 1,
};