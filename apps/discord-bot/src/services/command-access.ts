import type { ChatInputCommandInteraction } from "discord.js";
import { getActorSession } from "../backend/api-client.js";
import type { BotAccessLevel } from "../types.js";

const accessOrder: Record<BotAccessLevel, number> = {
  none: 0,
  mod: 1,
  admin: 2,
  full: 3,
};

export async function ensureCommandAccess(
  interaction: ChatInputCommandInteraction,
  requiredAccess: Exclude<BotAccessLevel, "none">,
) {
  let session;

  try {
    session = await getActorSession(interaction.user.id);
  } catch {
    await interaction.reply({
      content:
        "The bot could not reach the KOVA backend. Make sure the backend API is running and the bot backend URL is correct.",
      ephemeral: true,
    });

    return false;
  }

  const actorLevel = session.actor.accessLevel as BotAccessLevel;

  if (accessOrder[actorLevel] >= accessOrder[requiredAccess]) {
    return true;
  }

  await interaction.reply({
    content: `You need \`${requiredAccess}\` access to use this command. Your current level is \`${actorLevel}\`.`,
    ephemeral: true,
  });

  return false;
}
