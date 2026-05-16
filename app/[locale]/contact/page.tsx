import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Contact } from "@/components/site/contact/section";
import { ContactForm } from "@/components/site/contact/contact-form";
import {
  BookingWidget,
  type BookingLabels,
} from "@/components/site/contact/booking-widget";
import { APP_CONFIG } from "@/utils/config/app";
import {
  getLanguageCodes,
  isKnownLocale,
} from "@/utils/i18n/languages";
import { content, getContentBlocks } from "@/utils/content/fetch";
import { isCalConfigured } from "@/utils/cal/client";
import { getCalUsername } from "@/utils/env";

export const dynamic = "force-static";
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const codes = await getLanguageCodes();
  return codes.map((code) => ({ locale: code }));
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const blocks = await getContentBlocks(locale);
  const codes = await getLanguageCodes();
  const title = content(blocks, "contact_heading", "Contact");
  const description = content(
    blocks,
    "contact_subtitle",
    "Got a project? Let's talk."
  );
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: Object.fromEntries(
        codes.map((l) => [l, `${APP_CONFIG.siteUrl}/${l}/contact`])
      ),
    },
  };
}

function bookingLabels(
  locale: string,
  blocks: Map<string, string>
): BookingLabels {
  const isIt = locale === "it";
  const c = (slug: string, fallback: string) => content(blocks, slug, fallback);
  const weekdaysRaw = c(
    "booking_weekdays",
    isIt
      ? "Lun,Mar,Mer,Gio,Ven,Sab,Dom"
      : "Mon,Tue,Wed,Thu,Fri,Sat,Sun"
  );
  return {
    heading: c("booking_heading", isIt ? "Prenota una chiamata" : "Book a call"),
    description: c(
      "booking_description",
      isIt
        ? "30 minuti in video, gratuiti. Scegli giorno e ora che ti vanno."
        : "30-minute video call, free. Pick the day and time that works."
    ),
    loading: c("booking_loading", isIt ? "Carico gli slot…" : "Loading slots…"),
    noSlots: c(
      "booking_no_slots",
      isIt
        ? "Nessuno slot disponibile in questo giorno."
        : "No slots available on this day."
    ),
    noSlotsHint: c(
      "booking_no_slots_hint",
      isIt
        ? "Non vedi orari disponibili? Scrivimi direttamente qui sopra."
        : "Don't see a time that works? Send me a message above instead."
    ),
    pickDay: c("booking_pick_day", isIt ? "Scegli un giorno" : "Pick a day"),
    pickSlot: c("booking_pick_slot", isIt ? "Scegli un orario" : "Pick a time"),
    pickEventType: c(
      "booking_pick_event",
      isIt ? "Tipo di chiamata" : "Call type"
    ),
    weekdays: weekdaysRaw.split(",").map((s) => s.trim()),
    monthFormat: "long",
    confirmTitle: c(
      "booking_confirm_title",
      isIt ? "Conferma prenotazione" : "Confirm booking"
    ),
    confirmSubtitle: c(
      "booking_confirm_subtitle",
      isIt
        ? "Inserisci i tuoi dati e prenoto subito."
        : "Enter your details and I'll book the slot."
    ),
    name: c("booking_name", isIt ? "Nome" : "Name"),
    email: c("booking_email", "Email"),
    notes: c("booking_notes", isIt ? "Note" : "Notes"),
    notesPlaceholder: c(
      "booking_notes_placeholder",
      isIt ? "Cosa vorresti discutere?" : "What would you like to discuss?"
    ),
    namePlaceholder: c(
      "booking_name_placeholder",
      isIt ? "Come ti chiami?" : "Your name"
    ),
    emailPlaceholder: c(
      "booking_email_placeholder",
      isIt ? "tua@email.com" : "you@email.com"
    ),
    submit: c("booking_submit", isIt ? "Conferma" : "Confirm"),
    submitting: c("booking_submitting", isIt ? "Prenoto…" : "Booking…"),
    cancel: c("booking_cancel", isIt ? "Annulla" : "Cancel"),
    successTitle: c(
      "booking_success_title",
      isIt ? "Prenotazione confermata" : "Booking confirmed"
    ),
    successBodyTemplate: c(
      "booking_success_body",
      isIt
        ? "Ti aspetto {when}. Riceverai un'email di conferma a breve."
        : "See you {when}. A confirmation email is on its way."
    ),
    errorTitle: c(
      "booking_error",
      isIt
        ? "Qualcosa è andato storto, riprova."
        : "Something went wrong, please try again."
    ),
    prevMonth: c(
      "booking_prev_month",
      isIt ? "Mese precedente" : "Previous month"
    ),
    nextMonth: c("booking_next_month", isIt ? "Mese successivo" : "Next month"),
    durationUnit: c("booking_duration_unit", "min"),
    timezoneLabel: c("booking_timezone_label", isIt ? "Fuso" : "TZ"),
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) notFound();

  const isIt = locale === "it";
  const blocks = await getContentBlocks(locale);
  const calEnabled = isCalConfigured() && getCalUsername().length > 0;

  const heading = content(blocks, "contact_heading", "Got a project? Let's talk.");
  const eyebrow = content(blocks, "contact_eyebrow", "/contact");
  const subtitle = content(
    blocks,
    "contact_subtitle",
    "Tell me what you're building or what problem you're trying to solve. I usually reply within 24 hours, weekdays."
  );
  const trust = content(
    blocks,
    "contact_trust",
    "Reply within 24h · Treated with confidence"
  );
  const formHeading = content(
    blocks,
    "contact_form_section_label",
    isIt ? "Modulo di contatto" : "Contact form"
  );
  const formLabels = {
    name: content(blocks, "contact_form_name", isIt ? "Nome" : "Name"),
    email: content(blocks, "contact_form_email", "Email"),
    message: content(
      blocks,
      "contact_form_message",
      isIt ? "Messaggio" : "Message"
    ),
    submit: content(
      blocks,
      "contact_form_submit",
      isIt ? "Invia messaggio" : "Send message"
    ),
    sending: content(blocks, "contact_form_sending", isIt ? "Invio…" : "Sending…"),
    successTitle: content(
      blocks,
      "contact_form_success_title",
      isIt ? "Messaggio inviato" : "Message sent"
    ),
    successBody: content(
      blocks,
      "contact_form_success_body",
      isIt
        ? "Ti risponderò appena possibile."
        : "I'll get back to you as soon as possible."
    ),
    namePlaceholder: content(
      blocks,
      "contact_form_name_placeholder",
      isIt ? "Come ti chiami?" : "Your name"
    ),
    emailPlaceholder: content(
      blocks,
      "contact_form_email_placeholder",
      isIt ? "tua@email.com" : "you@email.com"
    ),
    messagePlaceholder: content(
      blocks,
      "contact_form_message_placeholder",
      isIt
        ? "Raccontami il progetto o l'idea…"
        : "Tell me about your project or idea…"
    ),
  };
  const bookingSectionLabel = content(
    blocks,
    "booking_section_label",
    isIt ? "Prenota una chiamata" : "Book a call"
  );
  const bookingAlternativeEyebrow = content(
    blocks,
    "booking_alternative_eyebrow",
    isIt ? "Alternativa" : "Alternative"
  );
  const bookingAlternativeTitle = content(
    blocks,
    "booking_alternative_title",
    isIt
      ? "Preferisci scegliere un orario?"
      : "Prefer to pick a time slot?"
  );

  return (
    <>
      <Contact
        heading={heading}
        eyebrow={eyebrow}
        subtitle={subtitle}
        trust={trust}
      />

      <section
        aria-labelledby="contact-form-heading"
        className={
          "container-page pb-16 pt-10 md:pt-12 " +
          (calEnabled ? "section-divider-b md:pb-20" : "md:pb-24")
        }
      >
        <h2 id="contact-form-heading" className="sr-only">
          {formHeading}
        </h2>
        <div className="mx-auto max-w-2xl">
          <ContactForm locale={locale} labels={formLabels} />
        </div>
      </section>

      {calEnabled && (
        <section
          aria-label={bookingSectionLabel}
          className="container-page pb-20 pt-10 md:pb-28 md:pt-12"
        >
          <div className="mx-auto max-w-2xl">
            <details className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="card-base card-interactive flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors">
                <span className="flex flex-col gap-0.5">
                  <span className="text-eyebrow">{bookingAlternativeEyebrow}</span>
                  <span className="text-h4 text-left">
                    {bookingAlternativeTitle}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-pill border border-dashed-soft text-accent-blue transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="mt-4">
                <BookingWidget
                  locale={locale}
                  labels={bookingLabels(locale, blocks)}
                />
              </div>
            </details>
          </div>
        </section>
      )}
    </>
  );
}
