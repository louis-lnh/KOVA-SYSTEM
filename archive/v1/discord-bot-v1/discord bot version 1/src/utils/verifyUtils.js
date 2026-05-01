const { EmbedBuilder } = require("discord.js");
const {
    loadConfig,
    saveConfig,
    ensureVerificationRecord,
    discordTimestamp
} = require("./configUtils");

function getReviewReasonFromMember(member, config) {
    const minDays = config.minimumAccountAgeDays || 7;
    const accountAgeMs = Date.now() - member.user.createdTimestamp;
    const minAgeMs = minDays * 24 * 60 * 60 * 1000;

    if (member.user.bot) {
        return "Confirmed bot/app tried to verify.";
    }

    if (!config.memberRoleId) {
        return "Member role is not configured.";
    }

    if (accountAgeMs < minAgeMs) {
        return `Account is younger than ${minDays} days.`;
    }

    return null;
}

async function sendSuccessLog(guild, member, role) {
    const config = loadConfig();
    if (!config.successLogChannelId) return;

    const channel = await guild.channels.fetch(config.successLogChannelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
        .setTitle("✅ Verification successful")
        .setDescription([
            `**User:** ${member}`,
            `**User ID:** \`${member.id}\``,
            `**Role added:** ${role}`,
            `**Timestamp:** ${discordTimestamp(new Date(), "F")}`
        ].join("\n"));

    await channel.send({ embeds: [embed] }).catch(() => null);
}

async function sendReviewLog(guild, member, reason) {
    const config = loadConfig();
    if (!config.reviewLogChannelId) return;

    const channel = await guild.channels.fetch(config.reviewLogChannelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
        .setTitle("⚠️ Verification review required")
        .setDescription([
            `**User:** ${member}`,
            `**User ID:** \`${member.id}\``,
            `**Reason:** ${reason}`,
            `**Timestamp:** ${discordTimestamp(new Date(), "F")}`
        ].join("\n"));

    await channel.send({ embeds: [embed] }).catch(() => null);
}

function updateVerificationSnapshot(record, member) {
    record.discordUserId = member.id;
    record.username = member.user.username ?? null;
    record.globalName = member.user.globalName ?? null;
    record.avatarUrl = member.user.displayAvatarURL?.() ?? null;
    record.isBot = member.user.bot ?? false;
    record.accountCreatedAt = member.user.createdAt ? member.user.createdAt.toISOString() : null;
    record.guildJoinedAt = member.joinedAt ? member.joinedAt.toISOString() : null;
    record.lastVerificationAttemptAt = new Date().toISOString();
    record.updatedAt = new Date().toISOString();
}

function markReviewRequired(record, reason) {
    record.verified = false;
    record.verifyStatus = "review_required";
    record.reviewReason = reason;
    record.memberRoleGranted = false;
    record.updatedAt = new Date().toISOString();
}

function markVerified(record, verifiedBy = "system") {
    record.verified = true;
    record.verifiedAt = new Date().toISOString();
    record.verifyStatus = "verified";
    record.reviewReason = null;
    record.memberRoleGranted = true;
    record.verifiedBy = verifiedBy;
    record.updatedAt = new Date().toISOString();
}

function markBotBanned(record) {
    record.verified = false;
    record.verifyStatus = "bot_banned";
    record.reviewReason = "Confirmed bot/app tried to verify.";
    record.memberRoleGranted = false;
    record.updatedAt = new Date().toISOString();
}

async function processVerifyAttempt(interaction) {
    const config = loadConfig();

    if (!interaction.inGuild()) {
        return {
            ok: false,
            type: "error",
            message: "❌ This button can only be used inside the server."
        };
    }

    const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

    if (!member) {
        return {
            ok: false,
            type: "error",
            message: "❌ Could not find your member profile in this server."
        };
    }

    const record = ensureVerificationRecord(config, member.user);
    updateVerificationSnapshot(record, member);

    if (member.user.bot) {
        markBotBanned(record);
        saveConfig(config);

        await interaction.guild.members.ban(member.id, {
            reason: "Confirmed bot/app attempted verification."
        }).catch(() => null);

        return {
            ok: false,
            type: "bot_banned",
            message: "❌ Bots/apps cannot be verified."
        };
    }

    if (!config.memberRoleId) {
        markReviewRequired(record, "Member role is not configured.");
        saveConfig(config);
        await sendReviewLog(interaction.guild, member, "Member role is not configured.");

        return {
            ok: false,
            type: "review",
            message: "⚠️ Verification requires manual review."
        };
    }

    const memberRole = await interaction.guild.roles.fetch(config.memberRoleId).catch(() => null);

    if (!memberRole) {
        markReviewRequired(record, "Configured member role could not be found.");
        saveConfig(config);
        await sendReviewLog(interaction.guild, member, "Configured member role could not be found.");

        return {
            ok: false,
            type: "review",
            message: "⚠️ Verification requires manual review."
        };
    }

    if (record.verified || member.roles.cache.has(memberRole.id)) {
        markVerified(record, record.verifiedBy || "system");
        saveConfig(config);

        const redirectText = config.redirectChannelId
            ? ` Go to <#${config.redirectChannelId}>.`
            : "";

        return {
            ok: true,
            type: "already_verified",
            message: `✅ You are already verified.${redirectText}`
        };
    }

    const reviewReason = getReviewReasonFromMember(member, config);

    if (reviewReason) {
        markReviewRequired(record, reviewReason);
        saveConfig(config);
        await sendReviewLog(interaction.guild, member, reviewReason);

        return {
            ok: false,
            type: "review",
            message: "⚠️ Verification requires manual review."
        };
    }

    try {
        await member.roles.add(memberRole);

        markVerified(record, "system");
        saveConfig(config);
        await sendSuccessLog(interaction.guild, member, memberRole);

        const redirectText = config.redirectChannelId
            ? ` Go to <#${config.redirectChannelId}>.`
            : "";

        return {
            ok: true,
            type: "verified",
            message: `✅ Verification successful.${redirectText}`
        };
    } catch (error) {
        console.error("❌ Failed to add verification role:", error);

        markReviewRequired(record, "Role could not be added automatically.");
        saveConfig(config);
        await sendReviewLog(interaction.guild, member, "Role could not be added automatically.");

        return {
            ok: false,
            type: "review",
            message: "⚠️ Verification requires manual review."
        };
    }
}

module.exports = {
    processVerifyAttempt,
    sendSuccessLog,
    sendReviewLog,
    updateVerificationSnapshot,
    markReviewRequired,
    markVerified,
    markBotBanned
};