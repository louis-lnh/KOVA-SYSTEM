import { SlashCommandBuilder } from "discord.js";
import { decideVerification } from "../backend/api-client.js";
import { ensureManualVerificationApproval } from "../services/verification-service.js";
import type { BotCommand } from "../types.js";

export const approveVerifyCommand: BotCommand = {
  requiredAccess: "mod",
  data: new SlashCommandBuilder()
    .setName("approveverify")
    .setDescription("Approve a pending verification.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The Discord user to approve")
        .setRequired(true),
    )
    .toJSON(),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const guild = interaction.guild;
    const followUp = guild
      ? await ensureManualVerificationApproval(guild, user.id)
      : "Guild context was unavailable, so Discord-side role sync was skipped.";
    const result = await decideVerification({
      actorDiscordId: interaction.user.id,
      discordId: user.id,
      decision: "approve",
    });

    await interaction.reply({
      content: `Verification approved for <@${user.id}>. New status: \`${result.record.status}\`. ${followUp}`,
      ephemeral: true,
    });
  },
};
