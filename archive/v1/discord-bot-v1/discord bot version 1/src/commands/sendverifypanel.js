const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} = require("discord.js");
const { loadConfig } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sendverifypanel")
        .setDescription("Send the verification panel to the configured verify channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const config = loadConfig();

        if (!config.verifyChannelId) {
            return interaction.editReply({
                content: "❌ Verify channel is not set."
            });
        }

        const channel = await interaction.client.channels.fetch(config.verifyChannelId).catch(() => null);

        if (!channel || !channel.isTextBased()) {
            return interaction.editReply({
                content: "❌ Could not find the configured verify channel."
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("📜 Welcome to KOVA")
            .setDescription("Before accessing the server you must read the rules.\n\nClick **Verify** to confirm that you agree.");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("verify_button")
                .setLabel("Verify")
                .setStyle(ButtonStyle.Success)
        );

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.editReply({
            content: `✅ Verification panel sent to ${channel}.`
        });
    }
};