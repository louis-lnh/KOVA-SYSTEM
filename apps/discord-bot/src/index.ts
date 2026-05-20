import {
  ButtonInteraction,
  Client,
  ChatInputCommandInteraction,
  Collection,
  GatewayIntentBits,
  MessageFlags,
} from "discord.js";
import { botEnv } from "./config.js";
import { commands } from "./commands/index.js";
import { deployCommands } from "./deploy-commands.js";
import { startApplicationNotificationPolling } from "./services/application-notifications.js";
import { ensureCommandAccess } from "./services/command-access.js";
import { sendEphemeralResponse } from "./services/interaction-response.js";
import { processVerification } from "./services/verification-service.js";
import type { BotCommand } from "./types.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const commandMap = new Collection<string, BotCommand>();
for (const command of commands) {
  commandMap.set(command.data.name, command);
}

client.once("ready", async () => {
  console.log(`KOVA bot logged in as ${client.user?.tag ?? "unknown-user"}`);
  try {
    await deployCommands();
  } catch (error) {
    console.error("Discord command deployment failed:", error);
  }
  startApplicationNotificationPolling(client);
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isButton() && interaction.customId === "verify_button") {
      if (!interaction.inGuild()) {
        await interaction.reply({
          content: "This button can only be used inside the server.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const guild = interaction.guild;

      if (!guild) {
        await interaction.reply({
          content: "Guild context could not be resolved.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const member = await guild.members
        .fetch(interaction.user.id)
        .catch(() => null);

      if (!member) {
        await interaction.reply({
          content: "Could not find your member profile in this server.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const result = await processVerification(member);
      const redirectText = result.redirectChannelId
        ? ` Go to <#${result.redirectChannelId}>.`
        : "";

      const contentMap: Record<typeof result.outcome, string> = {
        already_verified: `You are already verified.${redirectText}`,
        verified: `Verification successful.${redirectText}`,
        review_required: "Verification requires manual review.",
        bot_banned: "Bots/apps cannot be verified.",
      };

      await sendEphemeralResponse(interaction, contentMap[result.outcome]);
      return;
    }

    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = commandMap.get(interaction.commandName);

    if (!command) {
      await sendEphemeralResponse(interaction, "Command not found.");
      return;
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (command.requiredAccess) {
      const hasAccess = await ensureCommandAccess(interaction, command.requiredAccess);

      if (!hasAccess) {
        return;
      }
    }

    await command.execute(interaction, client);
  } catch (error) {
    console.error("Discord interaction error:", error);
    const isBackendConnectivityIssue =
      error instanceof Error &&
      (error.message.includes("fetch failed") ||
        error.message.includes("Backend request failed"));
    const discordErrorCode =
      typeof error === "object" &&
      error &&
      "code" in error &&
      typeof error.code === "number"
        ? error.code
        : null;

    if (discordErrorCode === 10062 || discordErrorCode === 40060) {
      console.warn(
        "Ignoring expired or already-acknowledged interaction.",
        discordErrorCode,
      );
      return;
    }

    if (!interaction.isRepliable()) {
      return;
    }

    await sendEphemeralResponse(
      interaction as ChatInputCommandInteraction | ButtonInteraction,
      isBackendConnectivityIssue
        ? "The bot could not reach the KOVA backend. Check that the backend is running and the bot backend URL is correct."
        : "Something went wrong while executing that command.",
    );
  }
});

void client.login(botEnv.DISCORD_BOT_TOKEN);
