import { SlashCommandBuilder } from "discord.js";
import type { BotCommand } from "../types.js";
import {
  getRuntimeConfig,
  getRuntimeConfigPath,
  normalizeDiscordSnowflake,
  resetRuntimeConfig,
  updateRuntimeConfig,
  type RuntimeConfigKey,
} from "../services/runtime-config.js";

const configChoiceMap = {
  application_review_channel: "applicationReviewChannelId",
  member_role: "memberRoleId",
  review_channel: "reviewChannelId",
  success_log_channel: "successLogChannelId",
  verify_channel: "verifyChannelId",
} as const satisfies Record<string, RuntimeConfigKey>;

type ConfigChoice = keyof typeof configChoiceMap;

export const botConfigCommand: BotCommand = {
  requiredAccess: "admin",
  data: new SlashCommandBuilder()
    .setName("botconfig")
    .setDescription("View or update KOVA bot runtime channel and role configuration.")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("What you want to do")
        .setRequired(true)
        .addChoices(
          { name: "view", value: "view" },
          { name: "set", value: "set" },
          { name: "reset", value: "reset" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("key")
        .setDescription("Which bot setting to inspect or change")
        .setRequired(false)
        .addChoices(
          { name: "application_review_channel", value: "application_review_channel" },
          { name: "member_role", value: "member_role" },
          { name: "review_channel", value: "review_channel" },
          { name: "success_log_channel", value: "success_log_channel" },
          { name: "verify_channel", value: "verify_channel" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("value")
        .setDescription("Channel ID, role ID, or mention to store")
        .setRequired(false),
    )
    .toJSON(),
  async execute(interaction) {
    const action = interaction.options.getString("action", true) as
      | "view"
      | "set"
      | "reset";
    const keyChoice = interaction.options.getString("key", false) as ConfigChoice | null;
    const rawValue = interaction.options.getString("value", false);

    if (action !== "view" && !keyChoice) {
      await interaction.reply({
        content: "A config key is required for `set` and `reset`.",
        ephemeral: true,
      });
      return;
    }

    if (action === "set" && !rawValue) {
      await interaction.reply({
        content: "A value is required when using `set`.",
        ephemeral: true,
      });
      return;
    }

    if (action === "view") {
      const config = getRuntimeConfig();
      const lines = Object.entries(configChoiceMap).map(([label, mappedKey]) => {
        const current = config[mappedKey];
        return `- \`${label}\`: ${current ? `\`${current}\`` : "`not set`"}`;
      });

      await interaction.reply({
        content: [
          "Current bot runtime config:",
          ...lines,
          `Storage: \`${getRuntimeConfigPath()}\``,
        ].join("\n"),
        ephemeral: true,
      });
      return;
    }

    const mappedKey = configChoiceMap[keyChoice!];

    if (action === "reset") {
      const nextConfig = resetRuntimeConfig(mappedKey);

      await interaction.reply({
        content: `Reset \`${keyChoice}\` to ${
          nextConfig[mappedKey] ? `\`${nextConfig[mappedKey]}\`` : "`not set`"
        }.`,
        ephemeral: true,
      });
      return;
    }

    const normalizedValue = normalizeDiscordSnowflake(rawValue!);

    if (!normalizedValue) {
      await interaction.reply({
        content: "The provided value could not be turned into a valid Discord ID.",
        ephemeral: true,
      });
      return;
    }

    updateRuntimeConfig(mappedKey, normalizedValue);

    await interaction.reply({
      content: `Updated \`${keyChoice}\` to \`${normalizedValue}\`.`,
      ephemeral: true,
    });
  },
};
