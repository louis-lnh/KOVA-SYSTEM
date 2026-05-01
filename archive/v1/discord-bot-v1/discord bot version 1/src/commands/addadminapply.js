const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig, removeUserFromAllApplyLevels } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addadminapply")
        .setDescription("Give a user admin access for the apply website")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to give admin access")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const user = interaction.options.getUser("user");
        const config = loadConfig();

        removeUserFromAllApplyLevels(config, user.id);
        config.applyAccess.admin.push(user.id);
        saveConfig(config);

        await interaction.editReply({
            content: `✅ ${user} now has **admin** apply access.`
        });
    }
};