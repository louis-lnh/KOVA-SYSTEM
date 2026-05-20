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
  formatEmbedFieldValue,
  formatDiscordTimestamp,
  formatLabel,
} from "./embeds.js";
import {
  hasPostedApplicationNotification,
  markApplicationNotificationPosted,
  hasPostedWebsiteEventNotification,
  markWebsiteEventNotificationPosted,
  hasPostedTournamentAnnouncementNotification,
  markTournamentAnnouncementNotificationPosted,
} from "./application-notification-ledger.js";
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

type WebsiteEventNotificationPayload = {
  eventId: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  startsAt: string | null;
  endsAt: string | null;
  visible: boolean;
  highlight: boolean;
  archived: boolean;
  eventLabel: string | null;
  seasonTag: string | null;
  participationNote: string | null;
  createdAt: string;
};

type TournamentAnnouncementNotificationPayload = {
  tournamentId: string;
  slug: string;
  title: string;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  publicDetails: string | null;
  format: string | null;
  eventLabel: string | null;
  participationNote: string | null;
  registrationUrl: string | null;
  bracketUrl: string | null;
  streamUrl: string | null;
  prizePool: string | null;
  overrideMessage: string | null;
  createdAt: string;
};

export function startApplicationNotificationPolling(client: Client) {
  const run = async () => {
    await runNotificationTask("application notification polling", () =>
      postApplicationNotifications(client),
    );
    await runNotificationTask("website event notification polling", () =>
      postWebsiteEventNotifications(client),
    );
    await runNotificationTask("tournament announcement polling", () =>
      postTournamentAnnouncements(client),
    );
  };

  void run();
  const interval = setInterval(() => {
    void run();
  }, pollIntervalMs);

  client.once("shardDisconnect", () => {
    clearInterval(interval);
  });
}

async function runNotificationTask(label: string, task: () => Promise<void>) {
  try {
    await task();
  } catch (error) {
    console.error(`${label} failed:`, error);
  }
}

async function postTournamentAnnouncements(client: Client) {
  const channelId = getRuntimeConfig().tournamentAnnouncementsChannelId;

  if (!channelId) {
    return;
  }

  const channel = await resolveTextChannel(client, channelId);

  if (!channel) {
    return;
  }

  const pending = await getPendingNotifications("tournament.announcement");

  for (const item of pending.items) {
    const payload = item.payload as TournamentAnnouncementNotificationPayload;

    if (hasPostedTournamentAnnouncementNotification(item.id)) {
      await markNotificationSent(item.id);
      continue;
    }

    const manageUrl = new URL("/commands/tournaments", botEnv.KOVA_ADMIN_URL).toString();
    const description =
      payload.overrideMessage ??
      payload.publicDetails ??
      "A new tournament update is ready from the KOVA admin workflow.";

    const details = [
      payload.format ? `Format: ${payload.format}` : null,
      payload.eventLabel ? `Label: ${payload.eventLabel}` : null,
      payload.prizePool ? `Prize Pool: ${payload.prizePool}` : null,
      payload.participationNote ? `Note: ${payload.participationNote}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const embed = createKovaEmbed(payload.title, description)
      .addFields(
        {
          name: "Status",
          value: formatLabel(payload.status),
          inline: true,
        },
        {
          name: "Slug",
          value: payload.slug || "N/A",
          inline: true,
        },
        {
          name: "Starts",
          value: payload.startsAt ? formatDiscordTimestamp(payload.startsAt) : "Not set",
          inline: true,
        },
        {
          name: "Ends",
          value: payload.endsAt ? formatDiscordTimestamp(payload.endsAt) : "Not set",
          inline: true,
        },
        {
          name: "Registration",
          value: formatEmbedFieldValue(payload.registrationUrl),
          inline: false,
        },
        {
          name: "Bracket",
          value: formatEmbedFieldValue(payload.bracketUrl),
          inline: false,
        },
        {
          name: "Stream",
          value: formatEmbedFieldValue(payload.streamUrl),
          inline: false,
        },
        {
          name: "Details",
          value: formatEmbedFieldValue(details, "No extra details provided."),
          inline: false,
        },
        {
          name: "Manage Tournament",
          value: manageUrl,
          inline: false,
        },
      )
      .setFooter({ text: `Tournament ID: ${payload.tournamentId}` })
      .setTimestamp(new Date(payload.createdAt));

    const message = await channel.send({
      embeds: [embed],
    });

    markTournamentAnnouncementNotificationPosted({
      notificationId: item.id,
      tournamentId: payload.tournamentId,
      channelId: channel.id,
      messageId: message.id,
      postedAt: new Date().toISOString(),
    });

    await markNotificationSent(item.id);
  }
}

async function postApplicationNotifications(client: Client) {
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
    const applicationReviewUrl = new URL(
      `/applications/${payload.applicationId}`,
      botEnv.KOVA_ADMIN_URL,
    ).toString();

    if (hasPostedApplicationNotification(payload.applicationId)) {
      await markNotificationSent(item.id);
      continue;
    }

    const embed = createKovaEmbed(
      "New KOVA Application",
      "A new application has been submitted and is ready for review in the KOVA admin panel.",
    )
      .addFields(
        {
          name: "Title",
          value: formatEmbedFieldValue(payload.title, "Unknown"),
          inline: false,
        },
        {
          name: "Applicant",
          value: formatEmbedFieldValue(
            `${payload.applicantUsername} (${payload.applicantDiscordId})`,
          ),
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
          value: formatEmbedFieldValue(
            `Open the application review page: ${applicationReviewUrl}`,
          ),
          inline: false,
        },
        {
          name: "Review Link",
          value: formatEmbedFieldValue(applicationReviewUrl),
          inline: false,
        },
      )
      .setFooter({ text: `Application ID: ${payload.applicationId}` })
      .setTimestamp(new Date(payload.createdAt));

    const message = await channel.send({
      embeds: [embed],
    });

    markApplicationNotificationPosted({
      applicationId: payload.applicationId,
      notificationId: item.id,
      channelId: channel.id,
      messageId: message.id,
      postedAt: new Date().toISOString(),
    });

    await markNotificationSent(item.id);
  }
}

async function postWebsiteEventNotifications(client: Client) {
  const channelId = getRuntimeConfig().websiteEventsChannelId;

  if (!channelId) {
    return;
  }

  const channel = await resolveTextChannel(client, channelId);

  if (!channel) {
    return;
  }

  const pending = await getPendingNotifications("website.event_created");

  for (const item of pending.items) {
    const payload = item.payload as WebsiteEventNotificationPayload;
    const eventManagerUrl = new URL("/website/events", botEnv.KOVA_ADMIN_URL).toString();

    if (hasPostedWebsiteEventNotification(payload.eventId)) {
      await markNotificationSent(item.id);
      continue;
    }

    const embed = createKovaEmbed(
      payload.title ?? "New Website Event",
      payload.summary ?? "A new website event has been published by KOVA staff.",
    ).addFields(
      {
        name: "Category",
        value: formatLabel(payload.category ?? "manual"),
        inline: true,
      },
      {
        name: "Slug",
        value: payload.slug || "N/A",
        inline: true,
      },
      {
        name: "Highlight",
        value: payload.highlight ? "Yes" : "No",
        inline: true,
      },
      {
        name: "Starts",
        value: payload.startsAt ? formatDiscordTimestamp(payload.startsAt) : "Not set",
        inline: true,
      },
      {
        name: "Ends",
        value: payload.endsAt ? formatDiscordTimestamp(payload.endsAt) : "Not set",
        inline: true,
      },
      {
        name: "Visibility",
        value: payload.visible && !payload.archived ? "Visible" : "Hidden",
        inline: true,
      },
      {
        name: "Label",
        value: formatEmbedFieldValue(payload.eventLabel, "None"),
        inline: false,
      },
      {
        name: "Season Tag",
        value: formatEmbedFieldValue(payload.seasonTag, "None"),
        inline: false,
      },
      {
        name: "Participation Note",
        value: formatEmbedFieldValue(payload.participationNote, "None"),
        inline: false,
      },
      {
        name: "Manage Event",
        value: formatEmbedFieldValue(eventManagerUrl),
        inline: false,
      },
    )
    .setFooter({ text: `Website Event ID: ${payload.eventId}` })
    .setTimestamp(new Date(payload.createdAt));

    const message = await channel.send({
      embeds: [embed],
    });

    markWebsiteEventNotificationPosted({
      eventId: payload.eventId,
      notificationId: item.id,
      channelId: channel.id,
      messageId: message.id,
      postedAt: new Date().toISOString(),
    });

    await markNotificationSent(item.id);
  }
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
