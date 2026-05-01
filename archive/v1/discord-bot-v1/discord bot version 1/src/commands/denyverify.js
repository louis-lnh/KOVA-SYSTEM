const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require("discord.js");
const { loadConfig, saveConfig, ensureVerificationRecord, discordTimestamp } = require("../utils/configUtils");
const { updateVerificationSnapshot } = require("../utils/verifyUtils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("denyverify")
        .setDescription("Deny a verification that is currently in review")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to deny")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for denying verification")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");
        const config = loadConfig();

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            return interaction.editReply({
                content: "❌ User is not in the server."
            });
        }

        const record = ensureVerificationRecord(config, user);
        updateVerificationSnapshot(record, member);

        if (record.verifyStatus !== "review_required") {
            return interaction.editReply({
                content: "ℹ️ This user is not currently in **review_required**."
            });
        }

        record.denyCount = (record.denyCount || 0) + 1;
        record.reviewReason = reason;
        record.updatedAt = new Date().toISOString();

        let actionText;

        if (record.denyCount >= 2) {
            record.verifyStatus = "denied_twice";
            saveConfig(config);

            await interaction.guild.members.ban(user.id, {
                reason: `Second verification denial: ${reason}`
            }).catch(() => null);

            actionText = `${member} was denied for the second time and has been banned.`;
        } else {
            record.verifyStatus = "denied_once";
            saveConfig(config);

            await member.kick(`First verification denial: ${reason}`).catch(() => null);

            actionText = `${member} was denied and kicked from the server.`;
        }

        if (config.reviewLogChannelId) {
            const logChannel = await interaction.guild.channels.fetch(config.reviewLogChannelId).catch(() => null);
            if (logChannel && logChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle("⚠️ Verification review required")
                    .setDescription([
                        `**User:** ${member}`,
                        `**User ID:** \`${member.id}\``,
                        `**Reason:** ${reason}`,
                        `**Timestamp:** ${discordTimestamp(new Date(), "F")}`
                    ].join("\n"));

                await logChannel.send({ embeds: [embed] }).catch(() => null);
            }
        }

        await interaction.editReply({
            content: `✅ ${actionText}`
        });
    }
};