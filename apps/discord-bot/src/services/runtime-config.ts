import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { botEnv } from "../config.js";

export type RuntimeConfigKey =
  | "applicationReviewChannelId"
  | "memberRoleId"
  | "reviewChannelId"
  | "successLogChannelId"
  | "verifyChannelId";

export interface RuntimeConfig {
  applicationReviewChannelId: string | null;
  memberRoleId: string | null;
  reviewChannelId: string | null;
  successLogChannelId: string | null;
  verifyChannelId: string | null;
}

const configPath = resolve(process.cwd(), ".runtime-config", "bot-config.json");

const defaultConfig: RuntimeConfig = {
  applicationReviewChannelId: botEnv.DEFAULT_APPLICATION_REVIEW_CHANNEL_ID,
  memberRoleId: botEnv.DEFAULT_MEMBER_ROLE_ID,
  reviewChannelId: botEnv.DEFAULT_REVIEW_CHANNEL_ID,
  successLogChannelId: botEnv.DEFAULT_SUCCESS_LOG_CHANNEL_ID,
  verifyChannelId: botEnv.DEFAULT_VERIFY_CHANNEL_ID,
};

export function getRuntimeConfig(): RuntimeConfig {
  if (!existsSync(configPath)) {
    return { ...defaultConfig };
  }

  try {
    const parsed = JSON.parse(readFileSync(configPath, "utf8")) as Partial<RuntimeConfig>;

    return {
      applicationReviewChannelId:
        parsed.applicationReviewChannelId ?? defaultConfig.applicationReviewChannelId,
      memberRoleId: parsed.memberRoleId ?? defaultConfig.memberRoleId,
      reviewChannelId: parsed.reviewChannelId ?? defaultConfig.reviewChannelId,
      successLogChannelId:
        parsed.successLogChannelId ?? defaultConfig.successLogChannelId,
      verifyChannelId: parsed.verifyChannelId ?? defaultConfig.verifyChannelId,
    };
  } catch {
    return { ...defaultConfig };
  }
}

export function updateRuntimeConfig(
  key: RuntimeConfigKey,
  value: string | null,
): RuntimeConfig {
  const nextConfig = {
    ...getRuntimeConfig(),
    [key]: value,
  } satisfies RuntimeConfig;

  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, JSON.stringify(nextConfig, null, 2));

  return nextConfig;
}

export function resetRuntimeConfig(key: RuntimeConfigKey): RuntimeConfig {
  return updateRuntimeConfig(key, defaultConfig[key]);
}

export function getRuntimeConfigPath() {
  return configPath;
}

export function normalizeDiscordSnowflake(value: string) {
  const match = value.match(/\d{15,}/);
  return match ? match[0] : value.trim() || null;
}
