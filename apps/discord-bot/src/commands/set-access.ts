import { SlashCommandBuilder } from "discord.js";
import { assignAccess } from "../backend/api-client.js";
import type { BotCommand } from "../types.js";

export const setAccessCommand: BotCommand = {
  requiredAccess: "full",
  data: new SlashCommandBuilder()
    .setName("setaccess")
    .setDescription("Assign or remove KOVA panel access for a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The Discord user")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("level")
        .setDescription("The access level to assign")
        .setRequired(true)
        .addChoices(
          { name: "none", value: "none" },
          { name: "mod", value: "mod" },
          { name: "admin", value: "admin" },
          { name: "full", value: "full" },
        ),
    )
    .toJSON(),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const level = interaction.options.getString("level", true) as
      | "none"
      | "mod"
      | "admin"
      | "full";

    const result = await assignAccess({
      actorDiscordId: interaction.user.id,
      discordId: user.id,
      level,
    });

    await interaction.reply({
      content: `Access for <@${user.id}> set to \`${result.level}\`.`,
      ephemeral: true,
    });
  },
};
