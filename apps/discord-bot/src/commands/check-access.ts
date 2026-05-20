import { SlashCommandBuilder } from "discord.js";
import { getAccessForDiscordId } from "../backend/api-client.js";
import { sendEphemeralResponse } from "../services/interaction-response.js";
import type { BotCommand } from "../types.js";

export const checkAccessCommand: BotCommand = {
  requiredAccess: "mod",
  data: new SlashCommandBuilder()
    .setName("checkaccess")
    .setDescription("Check the current KOVA panel access level for a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The Discord user")
        .setRequired(true),
    )
    .toJSON(),
  async execute(interaction) {
    const user = interaction.options.getUser("user", true);
    const result = await getAccessForDiscordId(user.id, interaction.user.id);

    await sendEphemeralResponse(
      interaction,
      `Access for <@${user.id}> is currently \`${result.level}\`.`,
    );
  },
};
