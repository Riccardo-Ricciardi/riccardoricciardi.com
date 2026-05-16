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

function bookingLabels(locale: string): BookingLabels {
  const isIt = locale === "it";
  return isIt
    ? {
        heading: "Prenota una chiamata",
        description:
          "30 minuti in video, gratuiti. Scegli giorno e ora che ti vanno.",
        loading: "Carico gli slot…",
        noSlots: "Nessuno slot disponibile in questo giorno.",
        noSlotsHint:
          "Non vedi orari disponibili? Scrivimi direttamente qui sopra.",
        pickDay: "Scegli un giorno",
        pickSlot: "Scegli un orario",
        pickEventType: "Tipo di chiamata",
        weekdays: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
        monthFormat: "long",
        confirmTitle: "Conferma prenotazione",
        confirmSubtitle: "Inserisci i tuoi dati e prenoto subito.",
        name: "Nome",
        email: "Email",
        notes: "Note",
        notesPlaceholder: "Cosa vorresti discutere?",
        namePlaceholder: "Come ti chiami?",
        emailPlaceholder: "tua@email.com",
        submit: "Conferma",
        submitting: "Prenoto…",
        cancel: "Annulla",
        successTitle: "Prenotazione confermata",
        successBodyTemplate:
          "Ti aspetto {when}. Riceverai un'email di conferma a breve.",
        errorTitle: "Qualcosa è andato storto, riprova.",
        prevMonth: "Mese precedente",
        nextMonth: "Mese successivo",
        durationUnit: "min",
        timezoneLabel: "Fuso",
      }
    : {
        heading: "Book a call",
        description: "30-minute video call, free. Pick the day and time that works.",
        loading: "Loading slots…",
        noSlots: "No slots available on this day.",
        noSlotsHint:
          "Don't see a time that works? Send me a message above instead.",
        pickDay: "Pick a day",
        pickSlot: "Pick a time",
        pickEventType: "Call type",
        weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        monthFormat: "long",
        confirmTitle: "Confirm booking",
        confirmSubtitle: "Enter your details and I'll book the slot.",
        name: "Name",
        email: "Email",
        notes: "Notes",
        notesPlaceholder: "What would you like to discuss?",
        namePlaceholder: "Your name",
        emailPlaceholder: "you@email.com",
        submit: "Confirm",
        submitting: "Booking…",
        cancel: "Cancel",
        successTitle: "Booking confirmed",
        successBodyTemplate:
          "See you {when}. A confirmation email is on its way.",
        errorTitle: "Something went wrong, please try again.",
        prevMonth: "Previous month",
        nextMonth: "Next month",
        durationUnit: "min",
        timezoneLabel: "TZ",
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
  const formLabels = isIt
    ? {
        name: "Nome",
        email: "Email",
        message: "Messaggio",
        submit: "Invia messaggio",
        sending: "Invio…",
        successTitle: "Messaggio inviato",
        successBody: "Ti risponderò appena possibile.",
        namePlaceholder: "Come ti chiami?",
        emailPlaceholder: "tua@email.com",
        messagePlaceholder: "Raccontami il progetto o l'idea…",
      }
    : {
        name: "Name",
        email: "Email",
        message: "Message",
        submit: "Send message",
        sending: "Sending…",
        successTitle: "Message sent",
        successBody: "I'll get back to you as soon as possible.",
        namePlaceholder: "Your name",
        emailPlaceholder: "you@email.com",
        messagePlaceholder: "Tell me about your project or idea…",
      };

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
          {isIt ? "Modulo di contatto" : "Contact form"}
        </h2>
        <div className="mx-auto max-w-2xl">
          <ContactForm locale={locale} labels={formLabels} />
        </div>
      </section>

      {calEnabled && (
        <section
          aria-label={isIt ? "Prenota una chiamata" : "Book a call"}
          className="container-page pb-20 pt-10 md:pb-28 md:pt-12"
        >
          <div className="mx-auto max-w-2xl">
            <details className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="card-base card-interactive flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors">
                <span className="flex flex-col gap-0.5">
                  <span className="text-eyebrow">
                    {isIt ? "Alternativa" : "Alternative"}
                  </span>
                  <span className="text-h4 text-left">
                    {isIt
                      ? "Preferisci scegliere un orario?"
                      : "Prefer to pick a time slot?"}
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
                <BookingWidget locale={locale} labels={bookingLabels(locale)} />
              </div>
            </details>
          </div>
        </section>
      )}
    </>
  );
}
