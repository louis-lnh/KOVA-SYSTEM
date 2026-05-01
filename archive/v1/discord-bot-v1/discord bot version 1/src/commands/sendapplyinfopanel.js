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
        .setName("sendapplyinfopanel")
        .setDescription("Send the apply info panel to the configured apply info channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const config = loadConfig();

        if (!config.applyInfoChannelId) {
            return interaction.editReply({
                content: "❌ Apply info channel is not set."
            });
        }

        const channel = await interaction.client.channels.fetch(config.applyInfoChannelId).catch(() => null);

        if (!channel || !channel.isTextBased()) {
            return interaction.editReply({
                content: "❌ Could not find the configured apply info channel."
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("📝 KOVA Apply Website")
            .setDescription("If you want to apply for anything related to KOVA, please use the apply website.\n\nClick the button below to open the landing page.");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Open Apply Website")
                .setStyle(ButtonStyle.Link)
                .setURL(config.applyWebsiteUrl)
        );

        await channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.editReply({
            content: `✅ Apply info panel sent to ${channel}.`
        });
    }
};