import {
  ChannelType,
  Client,
  type SendableChannels,
} from "discord.js";
import { botEnv } from "../config.js";
import {
  getPendingNotifications,
  markNotificationSent,
} from "../backend/api-client.js";
import {
  createKovaEmbed,
  formatDiscordTimestamp,
  formatLabel,
} from "./embeds.js";
import { getRuntimeConfig } from "./runtime-config.js";

const pollIntervalMs = 20_000;

type ApplicationNotificationPayload = {
  applicationId: string;
  title: string;
  category: string;
  subtype: string;
  applicantDiscordId: string;
  applicantUsername: string;
  createdAt: string;
};

export function startApplicationNotificationPolling(client: Client) {
  const run = async () => {
    try {
      const channelId = getRuntimeConfig().applicationReviewChannelId;

      if (!channelId) {
        return;
      }

      const channel = await resolveTextChannel(client, channelId);

      if (!channel) {
        return;
      }

      const pending = await getPendingNotifications("application.created");

      for (const item of pending.items) {
        const payload = item.payload as ApplicationNotificationPayload;
        const embed = createKovaEmbed(
          "New KOVA Application",
          "A new application has been submitted and is ready for review in the KOVA admin panel.",
        )
          .addFields(
            {
              name: "Title",
              value: payload.title ?? "Unknown",
              inline: false,
            },
            {
              name: "Applicant",
              value: `${payload.applicantUsername} (${payload.applicantDiscordId})`,
              inline: false,
            },
            {
              name: "Category",
              value: formatLabel(payload.category ?? "unknown"),
              inline: true,
            },
            {
              name: "Subtype",
              value: formatLabel(payload.subtype ?? "unknown"),
              inline: true,
            },
            {
              name: "Submitted",
              value: formatDiscordTimestamp(payload.createdAt),
              inline: false,
            },
            {
              name: "Next Step",
              value: "Open Application Management in the KOVA admin panel and review the submission.",
              inline: false,
            },
          )
          .setFooter({ text: `Application ID: ${payload.applicationId}` })
          .setTimestamp(new Date(payload.createdAt));

        await channel.send({
          embeds: [embed],
        });

        await markNotificationSent(item.id);
      }
    } catch (error) {
      console.error("Application notification polling failed:", error);
    }
  };

  void run();
  const interval = setInterval(() => {
    void run();
  }, pollIntervalMs);

  client.once("shardDisconnect", () => {
    clearInterval(interval);
  });
}

async function resolveTextChannel(client: Client, channelId: string) {
  const channel = await client.channels.fetch(channelId).catch(() => null);

  if (
    !channel ||
    (channel.type !== ChannelType.GuildText &&
      channel.type !== ChannelType.PublicThread &&
      channel.type !== ChannelType.PrivateThread &&
      channel.type !== ChannelType.AnnouncementThread)
  ) {
    return null;
  }

  if (!("send" in channel)) {
    return null;
  }

  return channel as SendableChannels;
}
