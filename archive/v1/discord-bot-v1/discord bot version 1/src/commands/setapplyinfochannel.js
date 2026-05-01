const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setapplyinfochannel")
        .setDescription("Set the channel where the apply info panel will be sent")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("Apply info channel")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel("channel");
        const config = loadConfig();

        config.applyInfoChannelId = channel.id;
        saveConfig(config);

        await interaction.editReply({
            content: `✅ Apply info channel set to ${channel}`
        });
    }
};