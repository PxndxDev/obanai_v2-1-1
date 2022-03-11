module.exports = {
    name: "Les débuts d'un.e pourfendeur.se",
    id: 1,
    pages: require("fs").readdirSync("./src/assets/story/chapter1/").length - 1,
};