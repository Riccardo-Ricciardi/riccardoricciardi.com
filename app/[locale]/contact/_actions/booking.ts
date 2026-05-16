"use server";

import {
  createBooking,
  getEventTypeBySlug,
  getEventTypes,
  getSlots,
  isCalConfigured,
  type CalEventType,
  type CalSlots,
} from "@/utils/cal/client";
import { logger } from "@/utils/logger";
import { getCalEventSlug, getCalUsername } from "@/utils/env";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function username(): string {
  return getCalUsername().trim();
}

function defaultEventSlug(): string {
  return getCalEventSlug().trim() || "30min";
}

export type EventTypesResult =
  | { ok: true; types: CalEventType[]; defaultSlug: string }
  | { ok: false; error: string };

export async function listEventTypesAction(): Promise<EventTypesResult> {
  if (!isCalConfigured()) return { ok: false, error: "not_configured" };
  const user = username();
  if (!user) return { ok: false, error: "no_username" };

  try {
    const types = await getEventTypes(user);
    const visible = types.filter((t) => t.slug && t.lengthInMinutes > 0);
    const sorted = [...visible].sort(
      (a, b) => a.lengthInMinutes - b.lengthInMinutes
    );
    const fallback = defaultEventSlug();
    const defaultSlug =
      sorted.find((t) => t.slug === fallback)?.slug ??
      sorted[0]?.slug ??
      fallback;
    return { ok: true, types: sorted, defaultSlug };
  } catch (err) {
    logger.error("cal: event types fetch failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return { ok: false, error: "fetch_failed" };
  }
}

export type SlotsFetchResult =
  | { ok: true; slots: CalSlots; eventLength: number }
  | { ok: false; error: string };

export async function fetchSlotsAction(input: {
  start: string;
  end: string;
  timeZone: string;
  eventTypeSlug?: string;
}): Promise<SlotsFetchResult> {
  if (!isCalConfigured()) {
    return { ok: false, error: "not_configured" };
  }
  const user = username();
  if (!user) return { ok: false, error: "no_username" };

  try {
    const slug = input.eventTypeSlug?.trim() || defaultEventSlug();
    const [slots, type] = await Promise.all([
      getSlots({
        username: user,
        eventTypeSlug: slug,
        start: input.start,
        end: input.end,
        timeZone: input.timeZone,
      }),
      getEventTypeBySlug(user, slug),
    ]);
    return {
      ok: true,
      slots,
      eventLength: type?.lengthInMinutes ?? 30,
    };
  } catch (err) {
    logger.error("cal: slots fetch failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return { ok: false, error: "fetch_failed" };
  }
}

export type BookingState =
  | {
      ok: true;
      bookingId: number | string;
      meetingUrl: string | null;
    }
  | { ok: false; error: string }
  | null;

export async function createBookingAction(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  if (!isCalConfigured()) return { ok: false, error: "not_configured" };

  const user = username();
  if (!user) return { ok: false, error: "no_username" };

  const start = String(formData.get("start") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const timeZone =
    String(formData.get("timeZone") ?? "").trim() || "Europe/Rome";
  const notes = String(formData.get("notes") ?? "").trim();
  const locale = String(formData.get("locale") ?? "en").slice(0, 5);
  const slug =
    String(formData.get("eventTypeSlug") ?? "").trim() || defaultEventSlug();

  if (!start || !name || !email) {
    return { ok: false, error: "fields_required" };
  }
  if (name.length < 2 || name.length > 100) {
    return { ok: false, error: "name_invalid" };
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return { ok: false, error: "email_invalid" };
  }

  try {
    const type = await getEventTypeBySlug(user, slug);
    if (!type) return { ok: false, error: "event_not_found" };

    const result = await createBooking({
      start,
      eventTypeId: type.id,
      name,
      email,
      timeZone,
      notes: notes || undefined,
      language: locale === "it" ? "it" : "en",
    });

    return {
      ok: true,
      bookingId: result.id,
      meetingUrl: result.meetingUrl ?? null,
    };
  } catch (err) {
    logger.error("cal: booking failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return { ok: false, error: "booking_failed" };
  }
}
