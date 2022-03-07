module.exports = {
    name: "Est-ce la fin ?",
    id: 3,
    pages: require("fs").readdirSync("./src/assets/story/chapter3/").length - 1,
};