import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type PostedApplicationNotification = {
  applicationId: string;
  notificationId: string;
  channelId: string;
  messageId: string;
  postedAt: string;
};

type PostedWebsiteEventNotification = {
  eventId: string;
  notificationId: string;
  channelId: string;
  messageId: string;
  postedAt: string;
};

type PostedTournamentAnnouncementNotification = {
  notificationId: string;
  tournamentId: string;
  channelId: string;
  messageId: string;
  postedAt: string;
};

type LedgerFile = {
  applications: Record<string, PostedApplicationNotification>;
  websiteEvents: Record<string, PostedWebsiteEventNotification>;
  tournamentAnnouncements: Record<string, PostedTournamentAnnouncementNotification>;
};

const ledgerPath = resolve(
  process.cwd(),
  ".runtime-config",
  "application-notification-ledger.json",
);

function readLedger(): LedgerFile {
  if (!existsSync(ledgerPath)) {
    return {
      applications: {},
      websiteEvents: {},
      tournamentAnnouncements: {},
    };
  }

  try {
    const parsed = JSON.parse(readFileSync(ledgerPath, "utf8")) as Partial<LedgerFile>;
    return {
      applications: parsed.applications ?? {},
      websiteEvents: parsed.websiteEvents ?? {},
      tournamentAnnouncements: parsed.tournamentAnnouncements ?? {},
    };
  } catch {
    return {
      applications: {},
      websiteEvents: {},
      tournamentAnnouncements: {},
    };
  }
}

function writeLedger(ledger: LedgerFile) {
  mkdirSync(dirname(ledgerPath), { recursive: true });
  writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
}

export function hasPostedApplicationNotification(applicationId: string) {
  const ledger = readLedger();
  return Boolean(ledger.applications[applicationId]);
}

export function markApplicationNotificationPosted(input: PostedApplicationNotification) {
  const ledger = readLedger();
  ledger.applications[input.applicationId] = input;
  writeLedger(ledger);
}

export function getApplicationNotificationLedgerPath() {
  return ledgerPath;
}

export function hasPostedWebsiteEventNotification(eventId: string) {
  const ledger = readLedger();
  return Boolean(ledger.websiteEvents[eventId]);
}

export function markWebsiteEventNotificationPosted(input: PostedWebsiteEventNotification) {
  const ledger = readLedger();
  ledger.websiteEvents[input.eventId] = input;
  writeLedger(ledger);
}

export function hasPostedTournamentAnnouncementNotification(notificationId: string) {
  const ledger = readLedger();
  return Boolean(ledger.tournamentAnnouncements[notificationId]);
}

export function markTournamentAnnouncementNotificationPosted(
  input: PostedTournamentAnnouncementNotification,
) {
  const ledger = readLedger();
  ledger.tournamentAnnouncements[input.notificationId] = input;
  writeLedger(ledger);
}
