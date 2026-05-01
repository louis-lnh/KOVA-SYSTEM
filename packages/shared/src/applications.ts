export const applicationCategories = [
  "competitive",
  "staff",
  "community",
  "creative",
  "partnerships",
] as const;

export type ApplicationCategory = (typeof applicationCategories)[number];

export const competitiveApplicationSubtypes = [
  "main_team_or_academy",
  "premier",
  "tournament",
] as const;

export type CompetitiveApplicationSubtype =
  (typeof competitiveApplicationSubtypes)[number];

export type KnownApplicationSubtype =
  | CompetitiveApplicationSubtype
  | "moderator"
  | "coach"
  | "team_manager"
  | "community_support"
  | "event_staff"
  | "partnership_staff"
  | "video_editor"
  | "social_media"
  | "partnership_request";

export type ApplicationStatus = "pending" | "accepted" | "rejected";
