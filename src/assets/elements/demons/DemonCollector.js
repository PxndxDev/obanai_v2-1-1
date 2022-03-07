const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");

class DemonCollector {
    constructor(demons) {
        this.demons = demons;
    }

    array(index = "name" || "indice") {
        const allDemons = this.demons;
        let sorted = [];

        if (index === "name") { sorted = Object.entries(allDemons); }
        else if (index === "indice") {
            let i = 0;
            for (const demon in allDemons) {
                sorted.push([i, this.demons[demon]]);
                i++;
            }
        }

        return sorted;
    }

    random(index = "name" || "indice") {
        const listed = this.array(index);
        return listed[Math.floor(Math.random() * listed.length)];
    }

    get(name) {
        const allDemons = this.array("name");
        return allDemons.filter(d => d[1].id.name === name)[0];
    }

    async showInfos(demon, client, message, power) {
        const l = (str) => str.length;

        let informations = `**${demon.id.name}** — ${demon.id.number}\n\n`;

        informations += `💪 \`${" ".repeat(6 - l(demon.stats.strength))}x${demon.stats.strength}\`\n`;
        informations += `⚡ \`${" ".repeat(6 - l(demon.stats.speed))}x${demon.stats.speed}\`\n`;
        informations += `🤸 \`${" ".repeat(6 - l(demon.stats.agility))}x${demon.stats.agility}\`\n`;
        informations += `⏲️ \`${" ".repeat(6 - l(demon.stats.endurance))}x${demon.stats.endurance}\`\n`;
        informations += `🛡️ \`${" ".repeat(6 - l(demon.stats.resistance))}x${demon.stats.resistance}\`\n`;

        if (power === "blood_art") informations += `\`\`\`fix\nPouvoir sanguinaire\`\`\`${demon.blood_art.description}`;
        if (power === "rage") informations += `\`\`\`fix\nMode rage\`\`\`${demon.rage.description}`;

        const simple = new MessageEmbed()
            .setColor(client.color)
            .setImage(demon.id.banner)
            .setDescription(`${informations}`)
            .setThumbnail(demon.id.face);

        const msg = await message.channel.send({ embeds: [simple], components: [ new MessageActionRow().addComponents(new MessageButton({ style: "SUCCESS", emoji: "✅", customId: "checked" })) ] });
        const checked = await msg.awaitMessageComponent({ filter: (i) => i.user.id === message.author.id, time: 60000 }).catch(async () => { if (await client.hasMsg(msg.channel, msg.id) !== false) await msg.delete(); });

        if (checked && await client.hasMsg(msg.channel, msg.id) !== false) await msg.delete();

    }
}

module.exports = DemonCollector;