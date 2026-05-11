import { logger } from "@/utils/logger";

const API_BASE = "https://api.cal.com/v2";

function getKey(): string | null {
  return process.env.CAL_API_KEY?.trim() || null;
}

export function isCalConfigured(): boolean {
  return getKey() !== null;
}

async function calFetch<T>(
  path: string,
  init?: RequestInit & { apiVersion?: string }
): Promise<T> {
  const key = getKey();
  if (!key) throw new Error("CAL_API_KEY not configured");

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "cal-api-version": init?.apiVersion ?? "2024-08-13",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logger.error("cal: api error", {
      path,
      status: res.status,
      body: text.slice(0, 300),
    });
    throw new Error(`Cal API ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export type CalEventType = {
  id: number;
  slug: string;
  title: string;
  lengthInMinutes: number;
  description: string | null;
};

type EventTypesResponse = {
  data: Array<{
    id: number;
    slug: string;
    title: string;
    lengthInMinutes?: number;
    length?: number;
    description?: string | null;
  }>;
};

let eventTypeCache: { username: string; types: CalEventType[]; ts: number } | null =
  null;
const EVENT_TYPES_TTL = 5 * 60 * 1000;

export async function getEventTypes(username: string): Promise<CalEventType[]> {
  if (
    eventTypeCache &&
    eventTypeCache.username === username &&
    Date.now() - eventTypeCache.ts < EVENT_TYPES_TTL
  ) {
    return eventTypeCache.types;
  }

  const json = await calFetch<EventTypesResponse>(
    `/event-types?username=${encodeURIComponent(username)}`,
    { apiVersion: "2024-06-14" }
  );
  const types: CalEventType[] = (json.data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    lengthInMinutes: r.lengthInMinutes ?? r.length ?? 30,
    description: r.description ?? null,
  }));
  eventTypeCache = { username, types, ts: Date.now() };
  return types;
}

export async function getEventTypeBySlug(
  username: string,
  slug: string
): Promise<CalEventType | null> {
  const types = await getEventTypes(username);
  return types.find((t) => t.slug === slug) ?? null;
}

export type CalSlot = { start: string; attendees?: number };
export type CalSlots = Record<string, CalSlot[]>;

type SlotsResponse = {
  data: CalSlots | { slots: CalSlots };
};

export async function getSlots(params: {
  username: string;
  eventTypeSlug: string;
  start: string;
  end: string;
  timeZone: string;
}): Promise<CalSlots> {
  const qs = new URLSearchParams({
    username: params.username,
    eventTypeSlug: params.eventTypeSlug,
    start: params.start,
    end: params.end,
    timeZone: params.timeZone,
  });
  const json = await calFetch<SlotsResponse>(`/slots?${qs.toString()}`, {
    apiVersion: "2024-09-04",
  });
  const data = json.data as CalSlots | { slots: CalSlots };
  if (data && typeof data === "object" && "slots" in data) {
    return (data as { slots: CalSlots }).slots ?? {};
  }
  return (data as CalSlots) ?? {};
}

export type CreateBookingInput = {
  start: string;
  eventTypeId: number;
  name: string;
  email: string;
  timeZone: string;
  notes?: string;
  language?: string;
};

export type BookingResult = {
  id: number | string;
  uid?: string;
  status?: string;
  meetingUrl?: string | null;
};

type BookingResponse = {
  data: {
    id?: number | string;
    uid?: string;
    status?: string;
    meetingUrl?: string | null;
    location?: string | null;
  };
};

export async function createBooking(
  input: CreateBookingInput
): Promise<BookingResult> {
  const body = {
    start: input.start,
    eventTypeId: input.eventTypeId,
    attendee: {
      name: input.name,
      email: input.email,
      timeZone: input.timeZone,
      language: input.language ?? "en",
    },
    bookingFieldsResponses: input.notes
      ? { notes: input.notes }
      : {},
    metadata: {},
  };

  const json = await calFetch<BookingResponse>("/bookings", {
    method: "POST",
    body: JSON.stringify(body),
    apiVersion: "2024-08-13",
  });

  const data = json.data ?? ({} as BookingResponse["data"]);
  return {
    id: data.id ?? "",
    uid: data.uid,
    status: data.status,
    meetingUrl: data.meetingUrl ?? data.location ?? null,
  };
}
