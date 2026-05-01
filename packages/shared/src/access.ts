export const accessLevels = ["none", "mod", "admin", "full"] as const;

export type AccessLevel = (typeof accessLevels)[number];

export const verificationStatuses = [
  "verified",
  "review_required",
  "denied_once",
  "denied_twice",
  "banned",
  "bot_banned",
] as const;

export type VerificationStatus = (typeof verificationStatuses)[number];

