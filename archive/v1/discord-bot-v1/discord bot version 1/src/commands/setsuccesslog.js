const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setsuccesslog")
        .setDescription("Set the verification success log channel")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Success log channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel("channel");
        const config = loadConfig();

        config.successLogChannelId = channel.id;
        saveConfig(config);

        await interaction.editReply({
            content: `✅ Success log channel set to ${channel}`
        });
    }
};