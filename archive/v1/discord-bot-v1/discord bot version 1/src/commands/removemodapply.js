const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removemodapply")
        .setDescription("Remove mod apply access from a user")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to remove mod access from")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const user = interaction.options.getUser("user");
        const config = loadConfig();

        if (!config.applyAccess.mod.includes(user.id)) {
            return interaction.editReply({
                content: "ℹ️ User's access level is currently not **mod**."
            });
        }

        config.applyAccess.mod = config.applyAccess.mod.filter(id => id !== user.id);
        saveConfig(config);

        await interaction.editReply({
            content: `✅ Removed **mod** apply access from ${user}.`
        });
    }
};