import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Contact } from "@/components/site/contact/section";
import { ContactForm } from "@/components/site/contact/contact-form";
import {
  BookingWidget,
  type BookingLabels,
} from "@/components/site/contact/booking-widget";
import {
  APP_CONFIG,
  isSupportedLanguage,
  type SupportedLanguage,
} from "@/utils/config/app";
import { content, getContentBlocks } from "@/utils/content/fetch";
import { isCalConfigured } from "@/utils/cal/client";

export const dynamic = "force-static";
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return APP_CONFIG.languages.map((locale) => ({ locale }));
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isIt = locale === "it";
  const title = isIt ? "Contatti" : "Contact";
  return {
    title,
    description: isIt
      ? "Parliamone — email, social, o scrivimi direttamente."
      : "Let's talk — email, socials, or write to me directly.",
    alternates: {
      canonical: `/${locale}/contact`,
      languages: Object.fromEntries(
        APP_CONFIG.languages.map((l) => [l, `${APP_CONFIG.siteUrl}/${l}/contact`])
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
        pickDay: "Scegli un giorno",
        pickSlot: "Scegli un orario",
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
        pickDay: "Pick a day",
        pickSlot: "Pick a time",
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
  if (!isSupportedLanguage(locale)) notFound();

  const isIt = locale === "it";
  const blocks = await getContentBlocks(locale as SupportedLanguage);
  const calEnabled =
    isCalConfigured() && !!process.env.NEXT_PUBLIC_CAL_USERNAME;

  const heading = content(blocks, "contact_heading", isIt ? "Parliamone" : "Let's talk");
  const eyebrow = content(blocks, "contact_eyebrow", "/contact");
  const subtitle = content(
    blocks,
    "contact_subtitle",
    isIt
      ? "Email è il modo più veloce, oppure scrivimi qui sotto."
      : "Email is fastest, or write to me below."
  );
  const emailLabel = content(
    blocks,
    "contact_email_label",
    isIt ? "Scrivimi" : "Email me"
  );

  const formLabels = isIt
    ? {
        title: "Scrivimi un messaggio",
        description: "Compila i campi qui sotto. Ti rispondo di solito entro 24 ore.",
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
        title: "Send me a message",
        description: "Fill in the fields below. I usually reply within 24 hours.",
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
        emailLabel={emailLabel}
        locale={locale}
      />
      <section
        aria-labelledby="contact-form-heading"
        className="container-page pb-12 md:pb-16"
      >
        <div className="mx-auto max-w-2xl">
          <ContactForm locale={locale} labels={formLabels} />
        </div>
      </section>

      {calEnabled && (
        <section
          aria-label={isIt ? "Prenota una chiamata" : "Book a call"}
          className="container-page section-divider-b pb-20 md:pb-28"
        >
          <div className="mx-auto max-w-4xl">
            <BookingWidget locale={locale} labels={bookingLabels(locale)} />
          </div>
        </section>
      )}
    </>
  );
}
