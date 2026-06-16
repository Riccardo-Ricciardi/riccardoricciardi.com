import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Contact } from "@/components/site/contact/section";
import { ContactForm } from "@/components/site/contact/contact-form";
import { ContactPanels } from "@/components/site/contact/contact-panels";
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
import { getSiteIdentity } from "@/utils/identity/fetch";
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
  const [blocks, codes] = await Promise.all([
    getContentBlocks(locale),
    getLanguageCodes(),
  ]);
  const title = content(blocks, "contact_heading", "");
  const description = content(blocks, "contact_subtitle", "");
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
  const c = (slug: string, fallback = "") => content(blocks, slug, fallback);
  const weekdaysRaw = c("booking_weekdays");
  return {
    description: c("booking_description"),
    loading: c("booking_loading"),
    noSlots: c("booking_no_slots"),
    noSlotsHint: c("booking_no_slots_hint"),
    pickDay: c("booking_pick_day"),
    pickSlot: c("booking_pick_slot"),
    pickEventType: c("booking_pick_event"),
    weekdays: weekdaysRaw.split(",").map((s) => s.trim()),
    monthFormat: "long",
    confirmTitle: c("booking_confirm_title"),
    confirmSubtitle: c("booking_confirm_subtitle"),
    name: c("booking_name"),
    email: c("booking_email", "Email"),
    notes: c("booking_notes"),
    notesPlaceholder: c("booking_notes_placeholder"),
    namePlaceholder: c("booking_name_placeholder"),
    emailPlaceholder: c("booking_email_placeholder"),
    submit: c("booking_submit"),
    submitting: c("booking_submitting"),
    cancel: c("booking_cancel"),
    successTitle: c("booking_success_title"),
    successBodyTemplate: c("booking_success_body"),
    errorTitle: c("booking_error"),
    prevMonth: c("booking_prev_month"),
    nextMonth: c("booking_next_month"),
    durationUnit: c("booking_duration_unit", "min"),
    timezoneLabel: c("booking_timezone_label"),
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  if (!(await isKnownLocale(locale))) notFound();

  const [blocks, identity] = await Promise.all([
    getContentBlocks(locale),
    getSiteIdentity(),
  ]);
  const calEnabled = isCalConfigured() && getCalUsername().length > 0;

  const heading = content(blocks, "contact_heading", "");
  const subtitle = content(blocks, "contact_subtitle", "");
  const trust = content(blocks, "contact_trust", "");
  const formHeading = content(blocks, "contact_form_section_label", "");
  const formLabels = {
    name: content(blocks, "contact_form_name", ""),
    email: content(blocks, "contact_form_email", "Email"),
    message: content(blocks, "contact_form_message", ""),
    submit: content(blocks, "contact_form_submit", ""),
    sending: content(blocks, "contact_form_sending", ""),
    successTitle: content(blocks, "contact_form_success_title", ""),
    successBody: content(blocks, "contact_form_success_body", ""),
    namePlaceholder: content(blocks, "contact_form_name_placeholder", ""),
    emailPlaceholder: content(blocks, "contact_form_email_placeholder", ""),
    messagePlaceholder: content(blocks, "contact_form_message_placeholder", ""),
  };
  const writeTab = content(blocks, "contact_tab_write", "");
  const callTab = content(blocks, "contact_tab_call", "");
  const toggleLabel = content(blocks, "contact_toggle_label", "");

  return (
    <>
      <Contact
        heading={heading}
        subtitle={subtitle}
        trust={trust}
        email={identity.email}
      />

      {calEnabled ? (
        <section className="container-page pb-20 pt-10 md:pb-28 md:pt-12">
          <ContactPanels
            writeLabel={writeTab}
            callLabel={callTab}
            toggleLabel={toggleLabel}
            form={<ContactForm locale={locale} labels={formLabels} />}
            booking={
              <BookingWidget
                locale={locale}
                labels={bookingLabels(locale, blocks)}
              />
            }
          />
        </section>
      ) : (
        <section
          aria-labelledby="contact-form-heading"
          className="container-page pb-16 pt-10 md:pb-24 md:pt-12"
        >
          <h2 id="contact-form-heading" className="sr-only">
            {formHeading}
          </h2>
          <div className="mx-auto max-w-2xl">
            <ContactForm locale={locale} labels={formLabels} />
          </div>
        </section>
      )}
    </>
  );
}
