const { MessageEmbed } = require("discord.js");

const setup = async client => {

    client.resp = async (author, channel, content, style) => {
        let color = client.color;
        if (style === "accept") color = "#32f11f";
        if (style === "error") color = "#ff2929";
        if (style === "info") color = "#1f58f1";
        if (style === "afk") color = "#ffaf33";

        let emoji = "";
        if (style === "accept") emoji = "✅";
        if (style === "error") emoji = "❌";
        if (style === "info") emoji = "ℹ️";
        if (style === "afk") emoji = "⏰";

        const resp = new MessageEmbed()
            .setColor(color)
            .setDescription(`${emoji} ${content}`)
            .setTimestamp()
            .setAuthor({ "name": author.tag, "iconURL": author.displayAvatarURL({ "dynamic": true }) });

        return await channel.send({ embeds: [resp] });
    };

    client.send = async (author, channel, content, style) => {
        let color = client.color;
        if (style === "accept") color = "#32f11f";
        if (style === "error") color = "#ff2929";
        if (style === "info") color = "#1f58f1";
        if (style === "afk") color = "#ffaf33";

        const resp = new MessageEmbed()
            .setColor(color)
            .setDescription(`${content}`)
            .setTimestamp()
            .setAuthor({ "name": author.tag, "iconURL": author.displayAvatarURL({ "dynamic": true }) });

        return await channel.send({ embeds: [resp] });
    };

    client.hasMsg = async (channel, msgId) => {
        try {
            return await channel.messages.fetch(msgId);
        }
        catch {
            return false;
        }
    };

    client.interact = async (author, channel, content, style, row, filter, time, battle, demon) => {
        let toReturn = "null";
        let color = client.color;
        if (style === "accept") color = "#32f11f";
        if (style === "error") color = "#ff2929";
        if (style === "info") color = "#1f58f1";
        if (style === "afk") color = "#ffaf33";

        const resp = new MessageEmbed()
            .setColor(color)
            .setDescription(content)
            .setTimestamp()
            .setAuthor({ "name": author.tag, "iconURL": author.displayAvatarURL({ "dynamic": true }) });

        if (battle === true) resp.setThumbnail(author.displayAvatarURL({ "dynamic": true }));
        if (battle === "demon") if (demon.id.face) resp.setThumbnail(demon.id.face);

        const msg = await channel.send({ embeds: [resp], components: row });
        const choice = await msg.awaitMessageComponent({ filter: filter, time: time })
        .catch(async () => {
            if (await client.hasMsg(channel, msg.id) !== false) await msg.delete();
        });

        if (choice) {
            if (await client.hasMsg(channel, msg.id) !== false) await msg.delete();
            toReturn = choice;
        }

        return toReturn;
    };

    client.amsg = async (author, channel, content, style, filter, time, max) => {
        let toReturn = "null";
        let color = client.color;
        if (style === "accept") color = "#32f11f";
        if (style === "error") color = "#ff2929";
        if (style === "info") color = "#1f58f1";
        if (style === "afk") color = "#ffaf33";

        const resp = new MessageEmbed()
            .setColor(color)
            .setDescription(content)
            .setTimestamp()
            .setAuthor({ "name": author.tag, "iconURL": author.displayAvatarURL({ "dynamic": true }) });

        const msg = await channel.send({ embeds: [resp] });
        const allmsgs = await msg.channel.awaitMessages({ filter: filter, time: time, max: max })
        .catch(async () => {
            if (await client.hasMsg(channel, msg.id) !== false) await msg.delete();
        });

        if (allmsgs) {
            if (await client.hasMsg(channel, msg.id) !== false) await msg.delete();
            toReturn = allmsgs;
        }
        return toReturn;
    };
};

module.exports = setup;