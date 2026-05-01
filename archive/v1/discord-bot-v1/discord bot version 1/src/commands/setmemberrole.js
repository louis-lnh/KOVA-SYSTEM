const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig } = require("../utils/configUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setmemberrole")
        .setDescription("Set the member role given after verification")
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Role to give after verification")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const role = interaction.options.getRole("role");
        const config = loadConfig();

        config.memberRoleId = role.id;
        saveConfig(config);

        await interaction.editReply({
            content: `✅ Member role set to ${role}`
        });
    }
};