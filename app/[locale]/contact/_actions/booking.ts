"use server";

import { z } from "zod";
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

export type BookingFieldKey = "name" | "email" | "notes";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = z.object({
  start: z.string().min(1, "start_required"),
  name: z
    .string()
    .trim()
    .min(2, "name_too_short")
    .max(100, "name_too_long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(200, "email_too_long")
    .regex(EMAIL_RE, "invalid_email"),
  notes: z.string().trim().max(1000, "notes_too_long").optional(),
  timeZone: z.string().min(1).default("Europe/Rome"),
  locale: z.string().max(5).default("en"),
  eventTypeSlug: z.string().min(1, "event_required"),
});

function localizedBookingError(locale: string, key: string): string {
  const map: Record<string, Record<string, string>> = {
    en: {
      not_configured: "Bookings aren't available right now.",
      no_username: "Bookings aren't available right now.",
      event_not_found: "That meeting type isn't available.",
      booking_failed: "Couldn't book that slot. Please pick another time.",
      start_required: "Please pick a time slot.",
      event_required: "Please pick a meeting type.",
      name_too_short: "Please enter your name (at least 2 characters).",
      name_too_long: "Name is too long.",
      invalid_email: "Please enter a valid email.",
      email_too_long: "Email is too long.",
      notes_too_long: "Notes are too long (max 1000 characters).",
      fields_required: "Please fill in all the required fields.",
    },
    it: {
      not_configured: "Le prenotazioni non sono disponibili al momento.",
      no_username: "Le prenotazioni non sono disponibili al momento.",
      event_not_found: "Questo tipo di chiamata non è disponibile.",
      booking_failed: "Non riesco a prenotare questo orario. Scegline un altro.",
      start_required: "Scegli un orario.",
      event_required: "Scegli il tipo di chiamata.",
      name_too_short: "Inserisci il tuo nome (almeno 2 caratteri).",
      name_too_long: "Nome troppo lungo.",
      invalid_email: "Email non valida.",
      email_too_long: "Email troppo lunga.",
      notes_too_long: "Note troppo lunghe (max 1000 caratteri).",
      fields_required: "Compila tutti i campi richiesti.",
    },
  };
  return map[locale]?.[key] ?? map.en[key] ?? key;
}

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
      status: "ok";
      bookingId: number | string;
      meetingUrl: string | null;
    }
  | {
      status: "error";
      formError?: string;
      fieldErrors: Partial<Record<BookingFieldKey, string>>;
    }
  | null;

export async function createBookingAction(
  _prev: BookingState,
  formData: FormData
): Promise<BookingState> {
  const rawLocale = String(formData.get("locale") ?? "en").slice(0, 5);
  const t = (k: string) => localizedBookingError(rawLocale, k);

  if (!isCalConfigured()) {
    return {
      status: "error",
      formError: t("not_configured"),
      fieldErrors: {},
    };
  }

  const user = username();
  if (!user) {
    return {
      status: "error",
      formError: t("no_username"),
      fieldErrors: {},
    };
  }

  const parsed = bookingSchema.safeParse({
    start: String(formData.get("start") ?? "").trim(),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    timeZone: String(formData.get("timeZone") ?? "Europe/Rome").trim(),
    locale: rawLocale,
    eventTypeSlug:
      String(formData.get("eventTypeSlug") ?? "").trim() ||
      defaultEventSlug(),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const fieldErrors: Partial<Record<BookingFieldKey, string>> = {};
    const fields: BookingFieldKey[] = ["name", "email", "notes"];
    for (const field of fields) {
      const first = flat.fieldErrors[field]?.[0];
      if (first) fieldErrors[field] = t(first);
    }
    const startErr = flat.fieldErrors.start?.[0];
    const eventErr = flat.fieldErrors.eventTypeSlug?.[0];
    const formError = startErr
      ? t(startErr)
      : eventErr
        ? t(eventErr)
        : Object.keys(fieldErrors).length === 0
          ? t("fields_required")
          : undefined;
    return { status: "error", formError, fieldErrors };
  }

  const { start, name, email, notes, timeZone, locale, eventTypeSlug } =
    parsed.data;

  try {
    const type = await getEventTypeBySlug(user, eventTypeSlug);
    if (!type) {
      return {
        status: "error",
        formError: t("event_not_found"),
        fieldErrors: {},
      };
    }

    const result = await createBooking({
      start,
      eventTypeId: type.id,
      name,
      email,
      timeZone,
      notes: notes && notes.length > 0 ? notes : undefined,
      language: locale === "it" ? "it" : "en",
    });

    return {
      status: "ok",
      bookingId: result.id,
      meetingUrl: result.meetingUrl ?? null,
    };
  } catch (err) {
    logger.error("cal: booking failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return {
      status: "error",
      formError: t("booking_failed"),
      fieldErrors: {},
    };
  }
}
