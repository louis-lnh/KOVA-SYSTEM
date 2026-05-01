import type { AccessLevel } from "./api";

export type AdminActionCategory = {
  id: string;
  title: string;
  description: string;
  minimumAccess: "mod" | "admin" | "full";
  status: "live" | "planned";
  href?: string;
};

export const adminActionCategories: AdminActionCategory[] = [
  {
    id: "applications",
    title: "Application Management",
    description: "Review, filter, and manage incoming applications.",
    minimumAccess: "mod",
    status: "live",
    href: "/applications",
  },
  {
    id: "verification",
    title: "Verification Review",
    description: "Handle verification edge cases and manual review decisions.",
    minimumAccess: "mod",
    status: "live",
    href: "/verifications",
  },
  {
    id: "operations",
    title: "Operations",
    description: "Higher-level team operations, logs, and internal workflows.",
    minimumAccess: "admin",
    status: "planned",
  },
  {
    id: "commands",
    title: "Command Center",
    description: "Manage announcement workflows, tournament setup, and command-side content.",
    minimumAccess: "admin",
    status: "live",
    href: "/commands",
  },
  {
    id: "website",
    title: "Main Website",
    description: "Prepare and manage the public KOVA website structure, copy, and event-facing content slices.",
    minimumAccess: "admin",
    status: "live",
    href: "/website",
  },
  {
    id: "access",
    title: "Access Control",
    description: "Assign and manage `mod`, `admin`, and `full` staff access.",
    minimumAccess: "full",
    status: "live",
    href: "/access",
  },
];

export const roleCapabilityMap: Array<{
  level: "mod" | "admin" | "full";
  title: string;
  capabilities: string[];
}> = [
  {
    level: "mod",
    title: "Moderation Access",
    capabilities: [
      "Review application queues",
      "Handle manual verification cases",
      "Use core review workflows",
    ],
  },
  {
    level: "admin",
    title: "Administrative Access",
    capabilities: [
      "Everything mod can do",
      "Manage broader operational tools",
      "Handle higher-level team workflows",
    ],
  },
  {
    level: "full",
    title: "Full System Access",
    capabilities: [
      "Everything admin can do",
      "Manage staff access levels",
      "Control protected internal system settings",
    ],
  },
];

export function hasRequiredAccess(
  current: AccessLevel,
  minimum: "mod" | "admin" | "full",
) {
  const levels = ["none", "mod", "admin", "full"];
  return levels.indexOf(current) >= levels.indexOf(minimum);
}
