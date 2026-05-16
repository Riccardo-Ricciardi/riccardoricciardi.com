"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import {
  FieldShell,
  FieldInput,
  FieldTextarea,
} from "@/components/site/atoms/field";
import {
  submitContactMessageAction,
  type ContactFieldKey,
  type ContactFormState,
} from "@/app/[locale]/contact/_actions/submit";

interface ContactFormProps {
  locale: string;
  labels: {
    title?: string;
    description?: string;
    name: string;
    email: string;
    message: string;
    submit: string;
    sending: string;
    successTitle: string;
    successBody: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
  };
}

const FIELD_ORDER: ContactFieldKey[] = ["name", "email", "message"];

export function ContactForm({ locale, labels }: ContactFormProps) {
  const [state, formAction] = useActionState<ContactFormState, FormData>(
    submitContactMessageAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const handledRef = useRef<string>("");

  useEffect(() => {
    if (!state) return;
    const stamp = JSON.stringify(state);
    if (stamp === handledRef.current) return;
    handledRef.current = stamp;

    if (state.status === "ok") {
      toast.success(labels.successTitle, { description: labels.successBody });
      formRef.current?.reset();
      return;
    }

    if (state.status === "error") {
      if (state.formError) {
        toast.error(state.formError);
      }
      const firstInvalid = FIELD_ORDER.find((f) => state.fieldErrors[f]);
      if (firstInvalid === "name") nameRef.current?.focus();
      else if (firstInvalid === "email") emailRef.current?.focus();
      else if (firstInvalid === "message") messageRef.current?.focus();
    }
  }, [state, labels.successTitle, labels.successBody]);

  const fieldErrors =
    state && state.status === "error" ? state.fieldErrors : {};

  return (
    <div className="card-base card-pad-lg rounded-surface">
      {(labels.title || labels.description) && (
        <header className="mb-6">
          {labels.title && <h3 className="text-h3">{labels.title}</h3>}
          {labels.description && (
            <p className="text-body-sm mt-1.5 text-muted-foreground">
              {labels.description}
            </p>
          )}
        </header>
      )}

      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-5"
        noValidate
      >
        <input type="hidden" name="locale" value={locale} />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldShell
            id="contact-name"
            label={labels.name}
            error={fieldErrors.name}
          >
            <FieldInput
              ref={nameRef}
              id="contact-name"
              name="name"
              required
              autoComplete="name"
              maxLength={100}
              placeholder={labels.namePlaceholder}
              invalid={Boolean(fieldErrors.name)}
              aria-describedby={
                fieldErrors.name ? "contact-name-error" : undefined
              }
            />
          </FieldShell>
          <FieldShell
            id="contact-email"
            label={labels.email}
            error={fieldErrors.email}
          >
            <FieldInput
              ref={emailRef}
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              maxLength={200}
              placeholder={labels.emailPlaceholder}
              invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? "contact-email-error" : undefined
              }
            />
          </FieldShell>
        </div>

        <FieldShell
          id="contact-message"
          label={labels.message}
          error={fieldErrors.message}
        >
          <FieldTextarea
            ref={messageRef}
            id="contact-message"
            name="message"
            required
            rows={5}
            maxLength={2000}
            placeholder={labels.messagePlaceholder}
            invalid={Boolean(fieldErrors.message)}
            aria-describedby={
              fieldErrors.message ? "contact-message-error" : undefined
            }
          />
        </FieldShell>

        <div className="flex flex-col items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
          <SubmitBtn label={labels.submit} pendingLabel={labels.sending} />
        </div>
      </form>
    </div>
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
      className="btn-base btn-primary w-full sm:w-auto"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Send className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? pendingLabel : label}
    </button>
  );
}
