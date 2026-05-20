import { EmbedBuilder } from "discord.js";

const kovaColor = 0xf5f5f5;
const discordEmbedFieldLimit = 1024;
const discordEmbedDescriptionLimit = 4096;

export function createKovaEmbed(title: string, description?: string) {
  const embed = new EmbedBuilder().setColor(kovaColor).setTitle(title);

  if (description) {
    embed.setDescription(truncateDiscordText(description, discordEmbedDescriptionLimit));
  }

  return embed;
}

export function formatDiscordTimestamp(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const unix = Math.floor(date.getTime() / 1000);

  return `<t:${unix}:f>`;
}

export function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

export function formatEmbedFieldValue(value: string | null | undefined, fallback = "Not set") {
  const normalized = value?.trim() || fallback;
  return truncateDiscordText(normalized, discordEmbedFieldLimit);
}

function truncateDiscordText(value: string, limit: number) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, Math.max(limit - 3, 0))}...`;
}
