const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setmatchchannel")
        .setDescription("Set the match announcement channel")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Match announcement channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel("channel");
        const config = loadConfig();

        config.matchChannelId = channel.id;
        saveConfig(config);

        await interaction.editReply({
            content: `✅ Match channel set to ${channel}`
        });
    }
};