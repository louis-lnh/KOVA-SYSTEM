const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { loadConfig, saveConfig, ensureVerificationRecord } = require("../utils/configUtils");
const { sendSuccessLog, updateVerificationSnapshot, markVerified } = require("../utils/verifyUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("approveverify")
        .setDescription("Approve a verification that is currently in review")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to approve")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const user = interaction.options.getUser("user");
        const config = loadConfig();

        if (!config.memberRoleId) {
            return interaction.editReply({
                content: "❌ Member role is not configured."
            });
        }

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.editReply({
                content: "❌ User is not in the server."
            });
        }

        const memberRole = await interaction.guild.roles.fetch(config.memberRoleId).catch(() => null);
        if (!memberRole) {
            return interaction.editReply({
                content: "❌ Configured member role could not be found."
            });
        }

        const record = ensureVerificationRecord(config, user);
        updateVerificationSnapshot(record, member);

        if (record.verifyStatus !== "review_required") {
            return interaction.editReply({
                content: "ℹ️ This user is not currently in **review_required**."
            });
        }

        await member.roles.add(memberRole);

        markVerified(record, interaction.user.id);
        saveConfig(config);

        await sendSuccessLog(interaction.guild, member, memberRole);

        await interaction.editReply({
            content: `✅ Approved verification for ${member}.`
        });
    }
};