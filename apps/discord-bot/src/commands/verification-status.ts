import { SlashCommandBuilder } from "discord.js";
import { getVerificationRecord } from "../backend/api-client.js";
import { createKovaEmbed, formatLabel } from "../services/embeds.js";
import type { BotCommand } from "../types.js";

export const verificationStatusCommand: BotCommand = {
  requiredAccess: "mod",
  data: new SlashCommandBuilder()
    .setName("verificationstatus")
    .setDescription("Check the current KOVA verification state for a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The Discord user")
        .setRequired(true),
    )
    .toJSON(),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const result = await getVerificationRecord(user.id, interaction.user.id);

    if (!result.record) {
      await interaction.reply({
        content: `No verification record exists yet for <@${user.id}>.`,
        ephemeral: true,
      });
      return;
    }

    const embed = createKovaEmbed(
      "Verification Status",
      `Current verification details for ${user.tag}.`,
    ).addFields(
      {
        name: "Status",
        value: formatLabel(result.record.status),
        inline: true,
      },
      {
        name: "Deny Count",
        value: String(result.record.denyCount ?? 0),
        inline: true,
      },
      {
        name: "Reason",
        value: result.record.reviewReason ?? "None",
        inline: false,
      },
    );

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
