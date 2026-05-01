const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setverifychannel")
        .setDescription("Set the channel where the verification panel will be sent")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Verification channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel("channel");
        const config = loadConfig();

        config.verifyChannelId = channel.id;
        saveConfig(config);

        await interaction.editReply({
            content: `✅ Verify channel set to ${channel}`
        });
    }
};