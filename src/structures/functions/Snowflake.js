class Snowflake {
    constructor() {
        this.code = "";
        this.generate();
    }
    generate() {
        const allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let generated = "";

        while (generated.length < 4) {
            generated += allChars[(Math.floor(Math.random() * allChars.length))];
        }

        this.code = generated;
        return this.code;
    }
}

module.exports = Snowflake;