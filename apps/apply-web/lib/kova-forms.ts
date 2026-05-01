export const applyCategories = [
  {
    id: "competitive",
    title: "Competitive",
    description:
      "Apply for KOVA rosters, Premier teams, and tournament opportunities.",
    subtypes: [
      {
        id: "main_team_or_academy",
        title: "Main Team / Academy",
        shortTitle: "Team Application",
        description:
          "Apply to join KOVA's main roster or academy structure.",
        status: "live",
      },
      {
        id: "premier",
        title: "Premier",
        shortTitle: "Premier Application",
        description:
          "Premier applications unlock once you are already accepted onto a KOVA team.",
        status: "locked",
      },
      {
        id: "tournament",
        title: "Tournament",
        shortTitle: "Tournament Join",
        description:
          "Register for tournament participation and event-based roster opportunities.",
        status: "live",
      },
    ],
  },
  {
    id: "staff",
    title: "Staff",
    description:
      "Operational and support roles that help KOVA run day to day.",
    subtypes: [
      {
        id: "moderator",
        title: "Moderator",
        shortTitle: "Moderator Application",
        description: "Moderation and community oversight for KOVA spaces.",
        status: "live",
      },
      {
        id: "coach",
        title: "Coach",
        shortTitle: "Coach Application",
        description: "Support competitive development and roster improvement.",
        status: "live",
      },
      {
        id: "team_manager",
        title: "Team Manager",
        shortTitle: "Team Manager Application",
        description: "Coordinate operations and logistics around active teams.",
        status: "live",
      },
    ],
  },
  {
    id: "community",
    title: "Community",
    description:
      "Community-facing roles that help members feel welcomed, informed, and involved.",
    subtypes: [
      {
        id: "community_support",
        title: "Community Support",
        shortTitle: "Community Support",
        description:
          "Welcome members, answer common questions, and help keep KOVA spaces active, helpful, and easy to navigate.",
        status: "live",
      },
      {
        id: "event_staff",
        title: "Event Staff / Helper",
        shortTitle: "Event Staff",
        description:
          "Support match days, community events, and hands-on event coordination when KOVA needs active help.",
        status: "live",
      },
      {
        id: "partnership_staff",
        title: "Partnership Staff",
        shortTitle: "Partnership Staff",
        description:
          "Help with outreach, partner communication, and relationship-building around the KOVA brand.",
        status: "live",
      },
    ],
  },
  {
    id: "creative",
    title: "Creative",
    description: "Creative and media-focused roles across the KOVA brand.",
    subtypes: [
      {
        id: "video_editor",
        title: "Video Editor",
        shortTitle: "Video Editor",
        description:
          "Edit KOVA content into sharp, watchable videos for announcements, recaps, and social content.",
        status: "live",
      },
      {
        id: "social_media",
        title: "Social Media",
        shortTitle: "Social Media",
        description:
          "Help shape KOVA's public presence through posting, planning, and audience-focused content support.",
        status: "live",
      },
    ],
  },
  {
    id: "partnerships",
    title: "Partnerships",
    description:
      "External partnership requests for teams, creators, communities, sponsors, and other collaboration ideas.",
    subtypes: [
      {
        id: "partnership_request",
        title: "Partnership Request",
        shortTitle: "Partnership Request",
        description:
          "Reach out if you want to explore a direct partnership, collaboration, or other official connection with KOVA.",
        status: "live",
      },
    ],
  },
] as const;

export type ApplyCategory = (typeof applyCategories)[number];
export type ApplySubtype = ApplyCategory["subtypes"][number];

export function getCategoryById(categoryId: string) {
  return applyCategories.find((category) => category.id === categoryId) ?? null;
}

export function getSubtypeById(categoryId: string, subtypeId: string) {
  const category = getCategoryById(categoryId);
  return category?.subtypes.find((subtype) => subtype.id === subtypeId) ?? null;
}

export function getSubtypePath(categoryId: string, subtypeId: string) {
  return `/forms/${categoryId}/${subtypeId}`;
}
