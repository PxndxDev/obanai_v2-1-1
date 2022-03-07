const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    attack: (breathEmoji, energy) => {
        return [
            // row d'attaque physique'
            new MessageActionRow().addComponents(
                new MessageButton({
                    customId: "fast",
                    style: "SECONDARY",
                    emoji: "👊",
                    disabled: false,
                }),
                new MessageButton({
                    customId: "charged",
                    style: "SECONDARY",
                    emoji: "💥",
                    disabled: energy < 3,
                }),
                new MessageButton({
                    customId: "breath_style",
                    style: breathEmoji === null ? "DANGER" : "SECONDARY",
                    emoji: breathEmoji === null ? "🚫" : breathEmoji,
                    disabled: breathEmoji === null || energy < 5,
                }),
            ),
            new MessageActionRow().addComponents(
                new MessageButton({
                    label: "Abandonner",
                    customId: "forfeit",
                    style: "DANGER",
                    emoji: "🏳",
                    disabled: false,
                }),
            ),
        ];
    },
    defense: (breathEmoji, energy) => {
        return [
            // row d'attaque physique'
            new MessageActionRow().addComponents(
                new MessageButton({
                    customId: "fast",
                    style: "SECONDARY",
                    emoji: "✊",
                    disabled: false,
                }),
                new MessageButton({
                    customId: "charged",
                    style: "SECONDARY",
                    emoji: "🛡️",
                    disabled: energy < 3,
                }),
                new MessageButton({
                    customId: "breath_style",
                    style: breathEmoji === null ? "DANGER" : "SECONDARY",
                    emoji: breathEmoji === null ? "🚫" : breathEmoji,
                    disabled: breathEmoji === null || energy < 5,
                }),
            ),
            new MessageActionRow().addComponents(
                new MessageButton({
                    label: "Abandonner",
                    customId: "forfeit",
                    style: "DANGER",
                    emoji: "🏳",
                    disabled: false,
                }),
            ),
        ];
    },
};