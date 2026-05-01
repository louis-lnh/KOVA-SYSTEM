const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig, removeUserFromAllApplyLevels } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addfullaccapply")
        .setDescription("Give a user full access for the apply website")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to give full access")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const user = interaction.options.getUser("user");
        const config = loadConfig();

        removeUserFromAllApplyLevels(config, user.id);
        config.applyAccess.fullAccess.push(user.id);
        saveConfig(config);

        await interaction.editReply({
            content: `✅ ${user} now has **full access** apply permission.`
        });
    }
};