import type { ChatInputCommandInteraction } from "discord.js";
import { getActorSession } from "../backend/api-client.js";
import { sendEphemeralResponse } from "./interaction-response.js";
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
    await sendEphemeralResponse(
      interaction,
      "The bot could not reach the KOVA backend. Make sure the backend API is running and the bot backend URL is correct.",
    );

    return false;
  }

  const actorLevel = session.actor.accessLevel as BotAccessLevel;

  if (accessOrder[actorLevel] >= accessOrder[requiredAccess]) {
    return true;
  }

  await sendEphemeralResponse(
    interaction,
    `You need \`${requiredAccess}\` access to use this command. Your current level is \`${actorLevel}\`.`,
  );

  return false;
}
