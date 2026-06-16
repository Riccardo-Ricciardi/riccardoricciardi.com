"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Globe,
  Loader2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  createBookingAction,
  fetchSlotsAction,
  listEventTypesAction,
  type BookingState,
} from "@/app/[locale]/contact/_actions/booking";
import type { CalEventType, CalSlot, CalSlots } from "@/utils/cal/client";
import { cn } from "@/utils/cn";
import {
  FieldShell,
  FieldInput,
  FieldTextarea,
} from "@/components/site/atoms/field";

interface BookingWidgetProps {
  locale: string;
  labels: BookingLabels;
}

export interface BookingLabels {
  description: string;
  loading: string;
  noSlots: string;
  noSlotsHint?: string;
  pickDay: string;
  pickSlot: string;
  pickEventType: string;
  weekdays: string[];
  monthFormat: "long";
  confirmTitle: string;
  confirmSubtitle: string;
  name: string;
  email: string;
  notes: string;
  notesPlaceholder: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  cancel: string;
  successTitle: string;
  successBodyTemplate: string;
  errorTitle: string;
  prevMonth: string;
  nextMonth: string;
  durationUnit: string;
  timezoneLabel: string;
}

function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Rome";
  } catch {
    return "Europe/Rome";
  }
}

export function BookingWidget(props: BookingWidgetProps) {
  const [ready, setReady] = useState<{ month: Date; tz: string } | null>(null);

  useEffect(() => {
    setReady({ month: startOfMonth(new Date()), tz: detectTimezone() });
  }, []);

  if (!ready) {
    return <BookingWidgetSkeleton labels={props.labels} />;
  }

  return (
    <BookingWidgetInner
      {...props}
      initialMonth={ready.month}
      initialTz={ready.tz}
    />
  );
}

interface BookingWidgetInnerProps extends BookingWidgetProps {
  initialMonth: Date;
  initialTz: string;
}

function BookingWidgetInner({
  locale,
  labels,
  initialMonth,
  initialTz,
}: BookingWidgetInnerProps) {
  const [viewMonth, setViewMonth] = useState<Date>(initialMonth);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalSlot | null>(null);
  const [slots, setSlots] = useState<CalSlots>({});
  const [eventLength, setEventLength] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timezone] = useState<string>(initialTz);
  const [, startTransition] = useTransition();
  const [bookingResult, setBookingResult] = useState<BookingState>(null);
  const [eventTypes, setEventTypes] = useState<CalEventType[]>([]);
  const [eventSlug, setEventSlug] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listEventTypesAction()
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setEventTypes(res.types);
          setEventSlug((prev) => prev ?? res.defaultSlug);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!eventSlug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    const start = startOfMonth(viewMonth).toISOString();
    const end = endOfMonth(viewMonth).toISOString();
    fetchSlotsAction({ start, end, timeZone: timezone, eventTypeSlug: eventSlug })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setSlots(res.slots);
          setEventLength(res.eventLength);
        } else {
          setError(res.error);
          setSlots({});
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("fetch_failed");
        setSlots({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [viewMonth, timezone, eventSlug]);

  const today = new Date();
  const monthLabel = useMemo(
    () =>
      viewMonth.toLocaleDateString(locale === "it" ? "it-IT" : "en-US", {
        year: "numeric",
        month: "long",
      }),
    [viewMonth, locale]
  );

  const grid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  const slotsForSelected = useMemo(() => {
    if (!selectedDate) return [];
    const list: CalSlot[] = [];
    for (const [iso, items] of Object.entries(slots)) {
      const d = new Date(iso);
      if (sameDay(d, selectedDate)) {
        for (const s of items) list.push(s);
      }
    }
    return list.sort((a, b) => a.start.localeCompare(b.start));
  }, [slots, selectedDate]);

  const hasAnySlots = useMemo(() => {
    return Object.values(slots).some((arr) => arr.length > 0);
  }, [slots]);

  const slotByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const items of Object.values(slots)) {
      for (const s of items) {
        const key = ymdLocal(new Date(s.start));
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
    return map;
  }, [slots]);

  useEffect(() => {
    if (selectedDate && slotsForSelected.length === 0) {
      const firstAvail = Array.from(slotByDay.keys()).reduce(
        (min, k) => (min === null || k < min ? k : min),
        null as string | null,
      );
      if (firstAvail) {
        const [y, m, d] = firstAvail.split("-").map(Number);
        setSelectedDate(new Date(y, m - 1, d));
      }
    }
  }, [selectedDate, slotsForSelected.length, slotByDay]);

  useEffect(() => {
    if (!selectedDate && slotByDay.size > 0) {
      const firstAvail = Array.from(slotByDay.keys()).reduce(
        (min, k) => (min === null || k < min ? k : min),
        null as string | null,
      );
      if (firstAvail) {
        const [y, m, d] = firstAvail.split("-").map(Number);
        setSelectedDate(new Date(y, m - 1, d));
      }
    }
  }, [slotByDay, selectedDate]);

  if (bookingResult && bookingResult.status === "ok" && selectedSlot) {
    return (
      <SuccessCard
        labels={labels}
        slot={selectedSlot}
        locale={locale}
        meetingUrl={bookingResult.meetingUrl}
        onReset={() => {
          setBookingResult(null);
          setSelectedSlot(null);
        }}
      />
    );
  }

  return (
    <div className="card-base card-flush rounded-surface overflow-hidden">
      <header className="flex flex-col gap-3 border-b border-dashed-soft p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-dashed-soft text-accent-blue">
            <Calendar className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-body-sm text-muted-foreground">
              {labels.description}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 self-start text-eyebrow md:self-auto">
          <Globe className="size-3" aria-hidden="true" />
          <span>{labels.timezoneLabel}</span>
          <span className="text-foreground">{timezone}</span>
        </div>
      </header>

      {eventTypes.length > 1 && (
        <div className="border-b border-dashed-soft px-6 py-4 md:px-8">
          <p className="mb-2 text-eyebrow">
            {labels.pickEventType}
          </p>
          <ul className="flex flex-wrap gap-2">
            {eventTypes.map((t) => {
              const active = t.slug === eventSlug;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setEventSlug(t.slug)}
                    aria-pressed={active}
                    aria-label={`${t.lengthInMinutes} ${labels.durationUnit} · ${t.title}`}
                    className={cn(
                      "pill-base pill-mono pill-interactive tabular-nums",
                      active && "pill-accent"
                    )}
                  >
                    {t.lengthInMinutes}
                    {labels.durationUnit}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:gap-8 md:p-8">
        <section aria-label={labels.pickDay}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label={labels.prevMonth}
              onClick={() => setViewMonth((m) => addMonths(m, -1))}
              disabled={
                viewMonth.getFullYear() === today.getFullYear() &&
                viewMonth.getMonth() === today.getMonth()
              }
              className="grid size-9 place-items-center rounded-md border border-dashed-soft text-muted-foreground transition-colors hover:border-accent-blue hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <p className="text-base font-semibold capitalize tracking-tight">
              {monthLabel}
            </p>
            <button
              type="button"
              aria-label={labels.nextMonth}
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="grid size-9 place-items-center rounded-md border border-dashed-soft text-muted-foreground transition-colors hover:border-accent-blue hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {labels.weekdays.map((w) => (
              <div
                key={w}
                className="text-eyebrow py-1"
              >
                {w}
              </div>
            ))}
            {grid.map((cell, idx) => {
              if (!cell) return <div key={idx} aria-hidden="true" />;
              const ymd = ymdLocal(cell);
              const count = slotByDay.get(ymd) ?? 0;
              const isPast =
                cell.getFullYear() < today.getFullYear() ||
                (cell.getFullYear() === today.getFullYear() &&
                  (cell.getMonth() < today.getMonth() ||
                    (cell.getMonth() === today.getMonth() &&
                      cell.getDate() < today.getDate())));
              const isSelected = selectedDate ? sameDay(cell, selectedDate) : false;
              const disabled = isPast || count === 0;
              const dayLabel = cell.toLocaleDateString(
                locale === "it" ? "it-IT" : "en-US",
                { weekday: "long", day: "numeric", month: "long" }
              );
              return (
                <button
                  key={cell.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedDate(cell)}
                  aria-label={dayLabel}
                  aria-pressed={isSelected}
                  className={cn(
                    "relative aspect-square min-h-11 rounded-md text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-0",
                    disabled
                      ? "cursor-not-allowed text-muted-foreground/40"
                      : isSelected
                        ? "bg-accent-blue text-white"
                        : "border border-dashed-soft hover:border-accent-blue hover:text-accent-blue"
                  )}
                >
                  <span className="tabular-nums" aria-hidden="true">{cell.getDate()}</span>
                  {count > 0 && !isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent-blue"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section
          aria-label={labels.pickSlot}
          aria-live="polite"
          aria-busy={loading}
          className="flex flex-col gap-3"
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-eyebrow">
              {selectedDate
                ? selectedDate.toLocaleDateString(
                    locale === "it" ? "it-IT" : "en-US",
                    { weekday: "long", day: "numeric", month: "long" }
                  )
                : labels.pickDay}
            </p>
            <span className="text-caption font-mono tabular-nums text-muted-foreground">
              {eventLength} {labels.durationUnit}
            </span>
          </div>

          {loading ? (
            <SlotsSkeleton />
          ) : error ? (
            <p className="rounded-md border border-rose-500/40 bg-rose-500/5 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
              {labels.errorTitle}
            </p>
          ) : !hasAnySlots ? (
            <div className="rounded-md border border-dashed-soft bg-background/40 px-3 py-6 text-center text-sm text-muted-foreground">
              <p>{labels.noSlots}</p>
              {labels.noSlotsHint && (
                <p className="text-caption mt-2 text-foreground/80">
                  {labels.noSlotsHint}
                </p>
              )}
            </div>
          ) : !selectedDate ? (
            <p className="rounded-md border border-dashed-soft bg-background/40 px-3 py-6 text-center text-sm text-muted-foreground">
              {labels.pickDay}
            </p>
          ) : slotsForSelected.length === 0 ? (
            <div className="rounded-md border border-dashed-soft bg-background/40 px-3 py-6 text-center text-sm text-muted-foreground">
              <p>{labels.noSlots}</p>
              {labels.noSlotsHint && (
                <p className="text-caption mt-2 text-foreground/80">
                  {labels.noSlotsHint}
                </p>
              )}
            </div>
          ) : (
            <ul className="grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3">
              {slotsForSelected.map((slot) => {
                const time = new Date(slot.start).toLocaleTimeString(
                  locale === "it" ? "it-IT" : "en-US",
                  { hour: "2-digit", minute: "2-digit" }
                );
                return (
                  <li key={slot.start}>
                    <button
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className="w-full min-h-11 rounded-md border border-dashed-soft bg-background py-2.5 font-mono text-sm tabular-nums transition-all hover:-translate-y-0.5 hover:border-accent-blue hover:text-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      {time}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {selectedSlot && (
        <ConfirmDialog
          slot={selectedSlot}
          locale={locale}
          timezone={timezone}
          labels={labels}
          eventTypeSlug={eventSlug ?? ""}
          onCancel={() => setSelectedSlot(null)}
          onResult={(res) => {
            startTransition(() => {
              setBookingResult(res);
              if (res && res.status === "ok") {
                toast.success(labels.successTitle);
              } else if (res && res.status === "error") {
                toast.error(res.formError ?? labels.errorTitle);
              }
            });
          }}
        />
      )}
    </div>
  );
}

function buildMonthGrid(month: Date): Array<Date | null> {
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const firstWeekday = (first.getDay() + 6) % 7;
  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function SlotsSkeleton() {
  return (
    <ul className="grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i}>
          <div className="h-11 animate-pulse rounded-md border border-dashed-soft bg-background/60" />
        </li>
      ))}
    </ul>
  );
}

function BookingWidgetSkeleton({ labels }: { labels: BookingLabels }) {
  return (
    <div className="card-base card-flush rounded-surface overflow-hidden">
      <header className="flex flex-col gap-3 border-b border-dashed-soft p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-dashed-soft text-accent-blue"
          >
            <Calendar className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-body-sm text-muted-foreground">
              {labels.description}
            </p>
          </div>
        </div>
      </header>
      <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_1fr] md:gap-8 md:p-8">
        <div
          aria-hidden="true"
          className="h-72 animate-pulse rounded-md border border-dashed-soft bg-background/60"
        />
        <SlotsSkeleton />
      </div>
    </div>
  );
}

function ConfirmDialog({
  slot,
  locale,
  timezone,
  labels,
  eventTypeSlug,
  onCancel,
  onResult,
}: {
  slot: CalSlot;
  locale: string;
  timezone: string;
  labels: BookingLabels;
  eventTypeSlug: string;
  onCancel: () => void;
  onResult: (res: BookingState) => void;
}) {
  const [state, formAction] = useActionState<BookingState, FormData>(
    createBookingAction,
    null
  );
  const handledRef = useRef<string>("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!state) return;
    const stamp = JSON.stringify(state);
    if (stamp === handledRef.current) return;
    handledRef.current = stamp;
    onResult(state);
    if (state.status === "error") {
      if (state.fieldErrors.name) nameRef.current?.focus();
      else if (state.fieldErrors.email) emailRef.current?.focus();
      else if (state.fieldErrors.notes) notesRef.current?.focus();
    }
  }, [state, onResult]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (dialog && !dialog.open) dialog.showModal();
    nameRef.current?.focus();
    return () => {
      if (dialog?.open) dialog.close();
      previouslyFocused?.focus?.();
    };
  }, []);

  const fieldErrors =
    state && state.status === "error" ? state.fieldErrors : {};
  const formError =
    state && state.status === "error" ? state.formError : undefined;

  const whenLabel = new Date(slot.start).toLocaleString(
    locale === "it" ? "it-IT" : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <dialog
      ref={dialogRef}
      aria-label={labels.confirmTitle}
      className="m-auto max-w-md bg-transparent p-0 backdrop:bg-background/70 backdrop:backdrop-blur"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <div className="w-full max-w-md card-base card-flush rounded-surface overflow-hidden">
        <header className="border-b border-dashed-soft p-5">
          <p className="text-eyebrow">
            {labels.confirmTitle}
          </p>
          <p className="mt-1.5 text-base font-medium tracking-tight">
            {whenLabel}
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            {timezone}
          </p>
        </header>
        <form
          action={formAction}
          className="flex flex-col gap-3 p-5"
          noValidate
        >
          <input type="hidden" name="start" value={slot.start} />
          <input type="hidden" name="timeZone" value={timezone} />
          <input type="hidden" name="locale" value={locale} />
          <input
            type="hidden"
            name="eventTypeSlug"
            value={eventTypeSlug}
          />

          <FieldShell id="b-name" label={labels.name} error={fieldErrors.name}>
            <FieldInput
              ref={nameRef}
              id="b-name"
              name="name"
              placeholder={labels.namePlaceholder}
              required
              autoComplete="name"
              maxLength={100}
              invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "b-name-error" : undefined}
            />
          </FieldShell>
          <FieldShell
            id="b-email"
            label={labels.email}
            error={fieldErrors.email}
          >
            <FieldInput
              ref={emailRef}
              id="b-email"
              name="email"
              type="email"
              placeholder={labels.emailPlaceholder}
              required
              autoComplete="email"
              maxLength={200}
              invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "b-email-error" : undefined}
            />
          </FieldShell>
          <FieldShell
            id="b-notes"
            label={labels.notes}
            error={fieldErrors.notes}
          >
            <FieldTextarea
              ref={notesRef}
              id="b-notes"
              name="notes"
              rows={3}
              maxLength={1000}
              placeholder={labels.notesPlaceholder}
              invalid={Boolean(fieldErrors.notes)}
              aria-describedby={fieldErrors.notes ? "b-notes-error" : undefined}
            />
          </FieldShell>

          {formError && (
            <p
              role="alert"
              className="rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-700 dark:text-rose-300"
            >
              {formError}
            </p>
          )}

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="btn-base btn-ghost"
            >
              {labels.cancel}
            </button>
            <SubmitBtn label={labels.submit} pendingLabel={labels.submitting} />
          </div>
        </form>
      </div>
    </dialog>
  );
}

function SubmitBtn({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="btn-base btn-primary"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Send className="size-4" aria-hidden="true" />
      )}
      {pending ? pendingLabel : label}
    </button>
  );
}

function SuccessCard({
  labels,
  slot,
  locale,
  meetingUrl,
  onReset,
}: {
  labels: BookingLabels;
  slot: CalSlot;
  locale: string;
  meetingUrl: string | null;
  onReset: () => void;
}) {
  const whenLabel = new Date(slot.start).toLocaleString(
    locale === "it" ? "it-IT" : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="card-base card-flush rounded-surface overflow-hidden">
      <div className="flex flex-col items-center gap-4 p-8 text-center md:p-12">
        <span className="grid size-12 place-items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
            {labels.successTitle}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {labels.successBodyTemplate.replace("{when}", whenLabel)}
          </p>
        </div>
        {meetingUrl && (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-accent-blue hover:underline"
          >
            {meetingUrl}
          </a>
        )}
        <button
          type="button"
          onClick={onReset}
          className="btn-base btn-sm btn-ghost mt-2"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {labels.cancel}
        </button>
      </div>
    </div>
  );
}
