type WebsiteContentResponse = {
  content: {
    section: string;
    data: Record<string, string>;
    updatedAt: string;
  } | null;
};

type WebsiteEvent = {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  startsAt: string | null;
  endsAt: string | null;
  visible: boolean;
  highlight: boolean;
  metadata: Record<string, string>;
};

type WebsiteEventsResponse = {
  items: WebsiteEvent[];
};

function getBackendUrl() {
  return process.env.NEXT_PUBLIC_KOVA_BACKEND_URL?.replace(/\/$/, "") ?? null;
}

export async function getWebsiteSection(
  section: "landing" | "about" | "team" | "members" | "events" | "legal",
) {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    return null;
  }

  try {
    const response = await fetch(`${backendUrl}/website/public/content/${section}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as WebsiteContentResponse;
    return data.content?.data ?? null;
  } catch {
    return null;
  }
}

export async function getWebsiteEvents() {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    return [];
  }

  try {
    const response = await fetch(`${backendUrl}/website/public/events`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as WebsiteEventsResponse;
    return data.items ?? [];
  } catch {
    return [];
  }
}
