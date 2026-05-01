const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setapplylog")
        .setDescription("Set the apply log channel")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Apply log channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel("channel");
        const config = loadConfig();

        config.applyLogChannelId = channel.id;
        saveConfig(config);

        await interaction.editReply({
            content: `✅ Apply log channel set to ${channel}`
        });
    }
};