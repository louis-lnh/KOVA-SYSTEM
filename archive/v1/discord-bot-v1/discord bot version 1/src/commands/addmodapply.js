const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig, removeUserFromAllApplyLevels } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addmodapply")
        .setDescription("Give a user mod access for the apply website")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to give mod access")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const user = interaction.options.getUser("user");
        const config = loadConfig();

        removeUserFromAllApplyLevels(config, user.id);
        config.applyAccess.mod.push(user.id);
        saveConfig(config);

        await interaction.editReply({
            content: `✅ ${user} now has **mod** apply access.`
        });
    }
};