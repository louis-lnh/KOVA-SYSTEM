import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface BackendEnv {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  HOST: string;
  DATABASE_URL: string;
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_BOT_TOKEN: string;
  SESSION_SECRET: string;
  INTERNAL_API_TOKEN: string;
}

export interface BotEnv {
  NODE_ENV: "development" | "test" | "production";
  DISCORD_BOT_TOKEN: string;
  DISCORD_APPLICATION_ID: string;
  DISCORD_GUILD_ID: string;
  KOVA_BACKEND_URL: string;
  KOVA_APPLY_URL: string;
  INTERNAL_API_TOKEN: string;
  DEFAULT_APPLICATION_REVIEW_CHANNEL_ID: string | null;
  DEFAULT_MEMBER_ROLE_ID: string | null;
  DEFAULT_REVIEW_CHANNEL_ID: string | null;
  DEFAULT_SUCCESS_LOG_CHANNEL_ID: string | null;
  DEFAULT_VERIFY_CHANNEL_ID: string | null;
}

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function stripWrappingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnvFileIntoProcess(filename: string, source: NodeJS.ProcessEnv) {
  const envPath = resolve(process.cwd(), filename);

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();

    if (!key || source[key] !== undefined) {
      continue;
    }

    source[key] = stripWrappingQuotes(rawValue);
  }
}

export function loadBackendEnv(source: NodeJS.ProcessEnv = process.env): BackendEnv {
  loadEnvFileIntoProcess(".env", source);
  const nodeEnv = (source.NODE_ENV ?? "development") as BackendEnv["NODE_ENV"];

  return {
    NODE_ENV: nodeEnv,
    PORT: Number(source.PORT ?? 3001),
    HOST: source.HOST ?? "0.0.0.0",
    DATABASE_URL: required("DATABASE_URL", source.DATABASE_URL),
    DISCORD_CLIENT_ID: required("DISCORD_CLIENT_ID", source.DISCORD_CLIENT_ID),
    DISCORD_CLIENT_SECRET: required(
      "DISCORD_CLIENT_SECRET",
      source.DISCORD_CLIENT_SECRET,
    ),
    DISCORD_BOT_TOKEN: required("DISCORD_BOT_TOKEN", source.DISCORD_BOT_TOKEN),
    SESSION_SECRET: required("SESSION_SECRET", source.SESSION_SECRET),
    INTERNAL_API_TOKEN: required("INTERNAL_API_TOKEN", source.INTERNAL_API_TOKEN),
  };
}

export function loadBotEnv(source: NodeJS.ProcessEnv = process.env): BotEnv {
  loadEnvFileIntoProcess(".env", source);
  const nodeEnv = (source.NODE_ENV ?? "development") as BotEnv["NODE_ENV"];

  return {
    NODE_ENV: nodeEnv,
    DISCORD_BOT_TOKEN: required("DISCORD_BOT_TOKEN", source.DISCORD_BOT_TOKEN),
    DISCORD_APPLICATION_ID: required(
      "DISCORD_APPLICATION_ID",
      source.DISCORD_APPLICATION_ID,
    ),
    DISCORD_GUILD_ID: required("DISCORD_GUILD_ID", source.DISCORD_GUILD_ID),
    KOVA_BACKEND_URL: required("KOVA_BACKEND_URL", source.KOVA_BACKEND_URL),
    KOVA_APPLY_URL: source.KOVA_APPLY_URL ?? "https://kova-esports-apply.com",
    INTERNAL_API_TOKEN: required("INTERNAL_API_TOKEN", source.INTERNAL_API_TOKEN),
    DEFAULT_APPLICATION_REVIEW_CHANNEL_ID:
      source.DEFAULT_APPLICATION_REVIEW_CHANNEL_ID ?? null,
    DEFAULT_MEMBER_ROLE_ID: source.DEFAULT_MEMBER_ROLE_ID ?? null,
    DEFAULT_REVIEW_CHANNEL_ID: source.DEFAULT_REVIEW_CHANNEL_ID ?? null,
    DEFAULT_SUCCESS_LOG_CHANNEL_ID: source.DEFAULT_SUCCESS_LOG_CHANNEL_ID ?? null,
    DEFAULT_VERIFY_CHANNEL_ID: source.DEFAULT_VERIFY_CHANNEL_ID ?? null,
  };
}
