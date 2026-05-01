const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setredirectchannel")
        .setDescription("Set the redirect channel shown after verification")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Channel users should go to after verification")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel("channel");
        const config = loadConfig();

        config.redirectChannelId = channel.id;
        saveConfig(config);

        await interaction.editReply({
            content: `✅ Redirect channel set to ${channel}`
        });
    }
};