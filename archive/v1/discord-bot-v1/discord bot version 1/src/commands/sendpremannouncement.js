const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags,
    EmbedBuilder
} = require("discord.js");
const { loadConfig, discordTimestamp } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sendpremannouncement")
        .setDescription("Send a manual premier result announcement")
        .addStringOption(option =>
            option
                .setName("team")
                .setDescription("Main or Academy")
                .setRequired(true)
                .addChoices(
                    { name: "Main", value: "Main" },
                    { name: "Academy", value: "Academy" }
                )
        )
        .addStringOption(option =>
            option
                .setName("opponent")
                .setDescription("Opponent team name")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("result")
                .setDescription("Match result")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("players")
                .setDescription("Players who played")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("stats")
                .setDescription("Player stats summary")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("map")
                .setDescription("Map")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("league")
                .setDescription("League (optional)")
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("standing")
                .setDescription("Standing (optional)")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const config = loadConfig();

        if (!config.premAnChannelId) {
            return interaction.editReply({
                content: "❌ Premier announcement channel is not set."
            });
        }

        const channel = await interaction.client.channels.fetch(config.premAnChannelId).catch(() => null);

        if (!channel || !channel.isTextBased()) {
            return interaction.editReply({
                content: "❌ Could not find the configured premier announcement channel."
            });
        }

        const team = interaction.options.getString("team");
        const opponent = interaction.options.getString("opponent");
        const result = interaction.options.getString("result");
        const players = interaction.options.getString("players");
        const stats = interaction.options.getString("stats");
        const map = interaction.options.getString("map");
        const league = interaction.options.getString("league");
        const standing = interaction.options.getString("standing");

        const lines = [
            `**Team:** ${team}`,
            `**Opponent:** ${opponent}`,
            `**Result:** ${result}`,
            `**Players:** ${players}`,
            `**Stats:** ${stats}`,
            `**Map:** ${map}`
        ];

        if (league) lines.push(`**League:** ${league}`);
        if (standing) lines.push(`**Standing:** ${standing}`);

        lines.push(`**Timestamp:** ${discordTimestamp(new Date(), "F")}`);

        const embed = new EmbedBuilder()
            .setTitle("🏆 Premier Match Result")
            .setDescription(lines.join("\n"));

        await channel.send({ embeds: [embed] });

        await interaction.editReply({
            content: `✅ Premier announcement sent to ${channel}.`
        });
    }
};