/* eslint-disable brace-style */
/* eslint-disable no-lonely-if */
const { MessageEmbed } = require("discord.js");

class Relationship {
    constructor(client, message, args) {
        this.client = client;
        this.message = message;
        this.args = args;
    }

    async FindUser() {
        let find = {
            comment: "not found",
            user: false,
        };
        if (this.message.mentions.users.first()) {
            find = { comment: "single", user : this.message.mentions.users.first() };
        } else {
            if (this.args.length) {
                const member = this.message.guild.members.cache.get(this.args[0]);
                if (member) {
                    find = { comment: "single", user : member.user };
                } else {
                    const pseudonyme = this.message.guild.members.cache.filter(m => m.user.bot === false).filter(m => m.user.tag.toLowerCase().includes(this.args.join(" ").toLowerCase()) || m.nickname?.toLowerCase().includes(this.args.join(" ").toLowerCase()));
                    if (pseudonyme.size === 0) {
                        find = { comment: "not found", user: false };
                    } else if (pseudonyme.size === 1) {
                        find = { comment: "single", user: pseudonyme.first().user };
                    } else if (pseudonyme.size > 1) {
                        find = { comment: "multiple", user: pseudonyme.map(e => e.user).sort((a, b) => a.username.length - b.username.length) };
                    }
                }
            }
        }

        return find;
    }

    async NotFoundResponse() {
        await this.client.resp(this.message.author, this.message.channel, "Aucun utilisateur n'a été trouvé, veuillez réessayer.", "error");
    }

    async MultipleAwaiting(tryToFind = { comment: "", user: false }) {
        const awaiting = {};
        let i = 1;
        tryToFind.user.forEach(user => {
            awaiting[`${user.id}`] = { _: i, user: user, pseudo: `${user.tag.split("*").join("")
                .split(this.args.join("").toLowerCase()).join(`**${this.args.join("").toLowerCase()}**`)
                .split(this.args.join("").toUpperCase()).join(`**${this.args.join("").toUpperCase()}**`)
            }` };
            i++;
        });

        const checkMsg = async (msg) => {
            return Object.entries(awaiting).map(e => e[1]._).includes(Number(msg));
        };

        let content = "";

        content += (Object.entries(awaiting).map(e => `\`${e[1]._}.\` ${e[1].pseudo}`).join("\n"));

        const amsg = await this.client.amsg(this.message.author, this.message.channel, content, "info", async (msg) => msg.author.id === this.message.author.id && await checkMsg(msg.content), 30000, 1);

        if (amsg.first()) {
            const toReturn = Object.entries(awaiting)[Object.entries(awaiting).map(e => e[1]._).indexOf(Number(amsg.first().content))];
            return toReturn[1].user;
        }

        return false;
    }
}

module.exports = Relationship;