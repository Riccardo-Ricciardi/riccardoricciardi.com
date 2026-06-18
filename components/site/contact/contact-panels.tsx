"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

type Panel = "write" | "call";

interface ContactPanelsProps {
  writeLabel: string;
  callLabel: string;
  toggleLabel: string;
  form: React.ReactNode;
  booking: React.ReactNode;
}

export function ContactPanels({
  writeLabel,
  callLabel,
  toggleLabel,
  form,
  booking,
}: ContactPanelsProps) {
  const [active, setActive] = useState<Panel>("write");

  return (
    <div className="mx-auto w-full max-w-2xl lg:max-w-none">
      <div role="group" aria-label={toggleLabel} className="flex gap-3 lg:hidden">
        <button
          type="button"
          aria-pressed={active === "write"}
          aria-controls="contact-panel-write"
          onClick={() => setActive("write")}
          className={cn(
            "btn-base btn-ghost flex-1",
            active === "write" && "border-accent-blue text-signal"
          )}
        >
          {writeLabel}
        </button>
        <button
          type="button"
          aria-pressed={active === "call"}
          aria-controls="contact-panel-call"
          onClick={() => setActive("call")}
          className={cn(
            "btn-base btn-ghost flex-1",
            active === "call" && "border-accent-blue text-signal"
          )}
        >
          {callLabel}
        </button>
      </div>

      <div className="mt-6 grid items-start gap-12 lg:mt-0 lg:grid-cols-2 lg:gap-12">
        <section
          id="contact-panel-write"
          aria-label={writeLabel}
          className={cn(active !== "write" && "hidden", "lg:block")}
        >
          <h2 className="text-h3 mb-6 hidden lg:block">{writeLabel}</h2>
          {form}
        </section>
        <section
          id="contact-panel-call"
          aria-label={callLabel}
          className={cn(active !== "call" && "hidden", "lg:block")}
        >
          <h2 className="text-h3 mb-6 hidden lg:block">{callLabel}</h2>
          {booking}
        </section>
      </div>
    </div>
  );
}
