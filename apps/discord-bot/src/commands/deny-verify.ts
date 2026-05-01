import { SlashCommandBuilder } from "discord.js";
import { decideVerification } from "../backend/api-client.js";
import { ensureManualVerificationDenial } from "../services/verification-service.js";
import type { BotCommand } from "../types.js";

export const denyVerifyCommand: BotCommand = {
  requiredAccess: "mod",
  data: new SlashCommandBuilder()
    .setName("denyverify")
    .setDescription("Deny a pending verification.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The Discord user to deny")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for denying verification")
        .setRequired(true),
    )
    .toJSON(),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);

    const result = await decideVerification({
      actorDiscordId: interaction.user.id,
      discordId: user.id,
      decision: "deny",
      reason,
    });
    const guild = interaction.guild;
    const followUp = guild
      ? await ensureManualVerificationDenial(guild, user.id, result.effect, reason)
      : "Guild context was unavailable, so the Discord-side denial action was skipped.";

    await interaction.reply({
      content: `Verification denied for <@${user.id}>. New status: \`${result.record.status}\`. Effect: \`${result.effect}\`. ${followUp}`,
      ephemeral: true,
    });
  },
};
