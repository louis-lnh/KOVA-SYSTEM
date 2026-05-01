const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setpremanchannel")
        .setDescription("Set the premier announcement channel")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Premier announcement channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel("channel");
        const config = loadConfig();

        config.premAnChannelId = channel.id;
        saveConfig(config);

        await interaction.editReply({
            content: `✅ Premier announcement channel set to ${channel}`
        });
    }
};