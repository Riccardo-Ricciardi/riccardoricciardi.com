"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import {
  submitContactMessageAction,
  type ContactFormState,
} from "@/app/[locale]/contact/_actions/submit";

interface ContactFormProps {
  locale: string;
  labels: {
    title: string;
    description: string;
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

export function ContactForm({ locale, labels }: ContactFormProps) {
  const [state, formAction] = useActionState<ContactFormState, FormData>(
    submitContactMessageAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);
  const handledRef = useRef<number>(0);

  useEffect(() => {
    if (!state) return;
    const stamp =
      "ok" in state ? state.messageId : `err:${(state as { error: string }).error}`;
    if (typeof stamp === "string" && stamp === String(handledRef.current)) return;
    if (typeof stamp === "number" && stamp === handledRef.current) return;
    handledRef.current = typeof stamp === "number" ? stamp : Date.now();

    if ("ok" in state) {
      toast.success(labels.successTitle, { description: labels.successBody });
      formRef.current?.reset();
    } else if ("error" in state) {
      toast.error(state.error);
    }
  }, [state, labels.successTitle, labels.successBody]);

  return (
    <div className="rounded-2xl border border-dashed border-dashed-soft bg-card p-6 md:p-8">
      <header className="mb-6">
        <h3 className="text-xl font-semibold tracking-tight md:text-2xl">
          {labels.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {labels.description}
        </p>
      </header>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
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
          <Field
            id="contact-name"
            name="name"
            label={labels.name}
            placeholder={labels.namePlaceholder}
            required
            autoComplete="name"
            maxLength={100}
          />
          <Field
            id="contact-email"
            name="email"
            type="email"
            label={labels.email}
            placeholder={labels.emailPlaceholder}
            required
            autoComplete="email"
            maxLength={200}
          />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {labels.message}
          </span>
          <textarea
            name="message"
            required
            rows={5}
            maxLength={2000}
            placeholder={labels.messagePlaceholder}
            className="min-h-32 w-full resize-y rounded-lg border border-dashed border-dashed-soft bg-background px-3 py-2.5 text-sm leading-relaxed focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue-soft"
          />
        </label>

        <div className="flex items-center justify-end pt-1">
          <SubmitBtn label={labels.submit} pendingLabel={labels.sending} />
        </div>
      </form>
    </div>
  );
}

function Field({
  id,
  name,
  type = "text",
  label,
  placeholder,
  required,
  autoComplete,
  maxLength,
}: {
  id: string;
  name: string;
  type?: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-dashed border-dashed-soft bg-background px-3 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue-soft"
      />
    </label>
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
      className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent-blue px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--accent-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue-soft disabled:cursor-not-allowed disabled:opacity-60"
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
