/* eslint-disable brace-style */
const { MessageSelectMenu, MessageActionRow } = require("discord.js");

class Selection {
    constructor(client, message, args) {
        this.client = client;
        this.message = message;
        this.args;
    }

    async createChoice(options, minValues, maxValues, placeholder, embeds) {
        let toReturn = "global";
        const menu = new MessageSelectMenu()
            .setCustomId("selection_menu")
            .setPlaceholder(placeholder)
            .setOptions(options);

        if (minValues !== null) menu.setMinValues(minValues);
        if (maxValues !== null) menu.setMinValues(maxValues);

        const choiceMessage = await this.message.channel.send({ content: `<@${this.message.author.id}>`, embeds: embeds, components: [new MessageActionRow().addComponents(menu)] });

        const choice = await choiceMessage.awaitMessageComponent({ filter: (i) => i.user.id === this.message.author.id, time: 30000 }).catch(async () => {
            if (await this.client.hasMsg(choiceMessage.channel, choiceMessage.id) !== false) await choiceMessage.delete();
        });

        if (choice) {
            if (await this.client.hasMsg(choiceMessage.channel, choiceMessage.id) !== false) await choiceMessage.delete();
            toReturn = choice.values[0];
        }

        return toReturn;
    }
}

module.exports = Selection;