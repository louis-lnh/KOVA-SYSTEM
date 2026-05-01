const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setreviewlog")
        .setDescription("Set the review log channel")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Review log channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel("channel");
        const config = loadConfig();

        config.reviewLogChannelId = channel.id;
        saveConfig(config);

        await interaction.editReply({
            content: `✅ Review log channel set to ${channel}`
        });
    }
};