import type {
  AccessLevel,
  VerificationStatus,
} from "./access.js";
import type {
  ApplicationCategory,
  ApplicationStatus,
  KnownApplicationSubtype,
} from "./applications.js";

export interface UserIdentity {
  id: string;
  discordId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  riotId: string | null;
  trackerUrl: string | null;
  currentRank: string | null;
  peakRank: string | null;
  mainAgents: string[];
  region: string | null;
  socialLinks: string[];
  updatedAt: string;
}

export interface ApplicationRecord {
  id: string;
  userId: string;
  category: ApplicationCategory;
  subtype: KnownApplicationSubtype;
  title: string;
  status: ApplicationStatus;
  archived: boolean;
  submission: Record<string, unknown>;
  internalNotes: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccessAssignment {
  userId: string;
  level: AccessLevel;
  assignedByUserId: string | null;
  assignedAt: string;
}

export interface VerificationRecord {
  userId: string | null;
  discordId: string;
  status: VerificationStatus;
  reviewReason: string | null;
  denyCount: number;
  verifiedAt: string | null;
  verifiedBy: "system" | "staff" | null;
  updatedAt: string;
}

export interface AuditLogRecord {
  id: string;
  actorUserId: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
