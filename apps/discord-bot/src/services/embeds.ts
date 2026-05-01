import { EmbedBuilder } from "discord.js";

const kovaColor = 0xf5f5f5;

export function createKovaEmbed(title: string, description?: string) {
  const embed = new EmbedBuilder().setColor(kovaColor).setTitle(title);

  if (description) {
    embed.setDescription(description);
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
