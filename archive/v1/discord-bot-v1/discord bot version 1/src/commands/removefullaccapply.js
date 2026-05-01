const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removefullaccapply")
        .setDescription("Remove full access apply permission from a user")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to remove full access from")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const user = interaction.options.getUser("user");
        const config = loadConfig();

        if (!config.applyAccess.fullAccess.includes(user.id)) {
            return interaction.editReply({
                content: "ℹ️ User's access level is currently not **full access**."
            });
        }

        config.applyAccess.fullAccess = config.applyAccess.fullAccess.filter(id => id !== user.id);
        saveConfig(config);

        await interaction.editReply({
            content: `✅ Removed **full access** apply permission from ${user}.`
        });
    }
};