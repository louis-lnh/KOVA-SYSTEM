import {
  ChannelType,
  type Guild,
  type GuildMember,
  type User,
  type TextChannel,
} from "discord.js";
import { botEnv } from "../config.js";
import {
  getVerificationRecordInternal,
  upsertVerificationRecord,
} from "../backend/api-client.js";
import {
  createKovaEmbed,
  formatDiscordTimestamp,
} from "./embeds.js";
import { getRuntimeConfig } from "./runtime-config.js";

const MINIMUM_ACCOUNT_AGE_DAYS = 7;

export interface VerificationFlowResult {
  outcome: "already_verified" | "verified" | "review_required" | "bot_banned";
  status: string;
  reviewReason: string | null;
  redirectChannelId: string | null;
}

export async function processVerification(member: GuildMember) {
  const existing = await getVerificationRecordInternal(member.user.id);
  const runtimeConfig = getRuntimeConfig();
  const redirectChannelId = runtimeConfig.verifyChannelId;

  if (member.user.bot) {
    await upsertVerificationRecord({
      discordId: member.user.id,
      status: "bot_banned",
      reviewReason: "Confirmed bot/app tried to verify.",
      verifiedBy: null,
    });

    await member.ban({
      reason: "Confirmed bot/app attempted verification.",
    });

    return {
      outcome: "bot_banned",
      status: "bot_banned",
      reviewReason: "Confirmed bot/app tried to verify.",
      redirectChannelId,
    } satisfies VerificationFlowResult;
  }

  if (runtimeConfig.memberRoleId && member.roles.cache.has(runtimeConfig.memberRoleId)) {
    await upsertVerificationRecord({
      discordId: member.user.id,
      status: "verified",
      reviewReason: null,
      verifiedBy: "system",
    });

    return {
      outcome: "already_verified",
      status: "verified",
      reviewReason: null,
      redirectChannelId,
    } satisfies VerificationFlowResult;
  }

  if (existing.record?.status === "verified") {
    const syncResult = await tryEnsureMemberRole(member);

    if (typeof syncResult === "object" && syncResult.kind === "synced") {
      await sendSuccessLog(member.guild, member, syncResult.roleName);

      return {
        outcome: "already_verified",
        status: existing.record.status,
        reviewReason: existing.record.reviewReason,
        redirectChannelId,
      } satisfies VerificationFlowResult;
    }

    if (typeof syncResult === "string") {
      await upsertVerificationRecord({
        discordId: member.user.id,
        status: "review_required",
        reviewReason: syncResult,
        verifiedBy: null,
      });

      await sendReviewLog(member.guild, member, syncResult);

      return {
        outcome: "review_required",
        status: "review_required",
        reviewReason: syncResult,
        redirectChannelId,
      } satisfies VerificationFlowResult;
    }

    return {
      outcome: "already_verified",
      status: existing.record.status,
      reviewReason: existing.record.reviewReason,
      redirectChannelId,
    } satisfies VerificationFlowResult;
  }

  if (
    existing.record?.status === "review_required" ||
    existing.record?.status === "denied_once"
  ) {
    const reason =
      existing.record.reviewReason ??
      "Your verification already requires manual review by the KOVA staff team.";

    return {
      outcome: "review_required",
      status: existing.record.status,
      reviewReason: reason,
      redirectChannelId,
    } satisfies VerificationFlowResult;
  }

  if (
    existing.record?.status === "denied_twice" ||
    existing.record?.status === "banned" ||
    existing.record?.status === "bot_banned"
  ) {
    try {
      await member.ban({
        reason: "User attempted to verify after a permanent verification denial.",
      });
    } catch {
      // Ignore moderation failures here and rely on the stored backend status.
    }

    return {
      outcome: "review_required",
      status: existing.record.status,
      reviewReason:
        existing.record.reviewReason ??
        "Your verification is permanently blocked. Contact KOVA staff if you think this is a mistake.",
      redirectChannelId,
    } satisfies VerificationFlowResult;
  }

  const memberRoleId = runtimeConfig.memberRoleId;

  if (!memberRoleId) {
    const reason = "Member role is not configured.";
    await setReviewRequired(member, reason);
    await sendReviewLog(member.guild, member, reason);

    return {
      outcome: "review_required",
      status: "review_required",
      reviewReason: reason,
      redirectChannelId,
    } satisfies VerificationFlowResult;
  }

  const role = await member.guild.roles.fetch(memberRoleId).catch(() => null);

  if (!role) {
    const reason = "Configured member role could not be found.";
    await setReviewRequired(member, reason);
    await sendReviewLog(member.guild, member, reason);

    return {
      outcome: "review_required",
      status: "review_required",
      reviewReason: reason,
      redirectChannelId,
    } satisfies VerificationFlowResult;
  }

  const accountAgeMs = Date.now() - member.user.createdTimestamp;
  const minAgeMs = MINIMUM_ACCOUNT_AGE_DAYS * 24 * 60 * 60 * 1000;

  if (accountAgeMs < minAgeMs) {
    const reason = `Account is younger than ${MINIMUM_ACCOUNT_AGE_DAYS} days.`;
    await setReviewRequired(member, reason);
    await sendReviewLog(member.guild, member, reason);

    return {
      outcome: "review_required",
      status: "review_required",
      reviewReason: reason,
      redirectChannelId,
    } satisfies VerificationFlowResult;
  }

  try {
    await member.roles.add(role);

    await upsertVerificationRecord({
      discordId: member.user.id,
      status: "verified",
      reviewReason: null,
      verifiedBy: "system",
    });

    await sendSuccessLog(member.guild, member, role.name);

    return {
      outcome: "verified",
      status: "verified",
      reviewReason: null,
      redirectChannelId,
    } satisfies VerificationFlowResult;
  } catch (error) {
    const reason = formatRoleAddFailureReason(error);
    await setReviewRequired(member, reason);
    await sendReviewLog(member.guild, member, reason);

    return {
      outcome: "review_required",
      status: "review_required",
      reviewReason: reason,
      redirectChannelId,
    } satisfies VerificationFlowResult;
  }
}

async function setReviewRequired(member: GuildMember, reason: string) {
  await upsertVerificationRecord({
    discordId: member.user.id,
    status: "review_required",
    reviewReason: reason,
    verifiedBy: null,
  });
}

export async function ensureManualVerificationApproval(guild: Guild, discordId: string) {
  const member = await guild.members.fetch(discordId).catch(() => null);

  if (!member) {
    return "User is not currently in the server, so no Discord role was added.";
  }

  const syncResult = await tryEnsureMemberRole(member);

  if (syncResult === "already_had_role") {
    return "User already had the configured member role.";
  }

  if (typeof syncResult === "object" && syncResult.kind === "synced") {
    await sendSuccessLog(guild, member, syncResult.roleName);
    return `Discord member role \`${syncResult.roleName}\` has been synced.`;
  }

  throw new Error(typeof syncResult === "string" ? syncResult : "Unknown role sync result.");
}

export async function ensureManualVerificationDenial(
  guild: Guild,
  discordId: string,
  effect: string,
  reason: string,
) {
  const member = await guild.members.fetch(discordId).catch(() => null);

  if (!member) {
    return "User is not currently in the server, so no Discord moderation action was needed.";
  }

  if (effect === "ban") {
    await member.ban({
      reason,
    });

    return "User has been banned from the server.";
  }

  await member.kick(reason).catch(() => null);

  return "User has been kicked from the server.";
}

export async function sendReviewLog(guild: Guild, member: GuildMember, reason: string) {
  const channel = await resolveGuildTextChannel(guild, getRuntimeConfig().reviewChannelId);

  if (!channel) {
    return;
  }

  const embed = createKovaEmbed(
    "Verification Review Required",
    "A member could not be verified automatically and needs staff review.",
  )
    .addFields(
      { name: "User", value: `${member.user.tag} (${member.user.id})` },
      { name: "Reason", value: reason },
      { name: "Timestamp", value: formatDiscordTimestamp(new Date()) },
    );

  await channel.send({
    embeds: [embed],
  });
}

async function sendSuccessLog(guild: Guild, member: GuildMember | User, roleName: string) {
  const channel = await resolveGuildTextChannel(
    guild,
    getRuntimeConfig().successLogChannelId,
  );

  if (!channel) {
    return;
  }

  const embed = createKovaEmbed(
    "Verification Success",
    "A member has been verified and synced successfully.",
  )
    .addFields(
      {
        name: "User",
        value:
          "user" in member
            ? `${member.user.tag} (${member.user.id})`
            : `${member.tag} (${member.id})`,
      },
      { name: "Role Added", value: roleName },
      { name: "Timestamp", value: formatDiscordTimestamp(new Date()) },
    );

  await channel.send({
    embeds: [embed],
  });
}

async function resolveGuildTextChannel(guild: Guild, channelId: string | null) {
  if (!channelId) {
    return null;
  }

  const channel = await guild.channels.fetch(channelId).catch(() => null);

  if (!channel || channel.type !== ChannelType.GuildText) {
    return null;
  }

  return channel as TextChannel;
}

async function tryEnsureMemberRole(member: GuildMember): Promise<
  | "already_had_role"
  | { roleName: string; kind: "synced" }
  | string
> {
  const memberRoleId = getRuntimeConfig().memberRoleId;

  if (!memberRoleId) {
    return "Member role is not configured.";
  }

  if (member.roles.cache.has(memberRoleId)) {
    return "already_had_role";
  }

  const role = await member.guild.roles.fetch(memberRoleId).catch(() => null);

  if (!role) {
    return "Configured member role could not be found.";
  }

  try {
    await member.roles.add(role);
    return { roleName: role.name, kind: "synced" };
  } catch (error) {
    return formatRoleAddFailureReason(error);
  }
}

function formatRoleAddFailureReason(error: unknown) {
  const message =
    error instanceof Error && error.message.trim()
      ? error.message.trim()
      : "Unknown Discord API error.";

  if (/missing permissions/i.test(message)) {
    return "Role could not be added automatically. Discord reported missing permissions. Check that the bot has Manage Roles and that its highest role is above the member role.";
  }

  if (/unknown role/i.test(message)) {
    return "Role could not be added automatically. Discord could not find the configured member role.";
  }

  return `Role could not be added automatically. Discord reported: ${message}`;
}
