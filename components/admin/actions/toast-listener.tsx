"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

const OK_MAP: Record<string, string> = {
  saved: "Saved",
  created: "Created",
  deleted: "Deleted",
  updated: "Updated",
  uploaded: "Uploaded",
  cleared: "Cleared",
};

function ToastListenerInner() {
  const params = useSearchParams();
  const pathname = usePathname();
  const { get } = params;
  const lastKeyRef = useRef<string>("");

  useEffect(() => {
    const ok = get.call(params, "ok");
    const err = get.call(params, "error");
    if (!ok && !err) return;

    const key = `${pathname}::${ok ?? ""}::${err ?? ""}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    if (ok) {
      toast.success(OK_MAP[ok] ?? ok);
    }
    if (err) {
      toast.error(decodeURIComponent(err));
    }

    const next = new URLSearchParams(params.toString());
    next.delete("ok");
    next.delete("error");
    const search = next.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    window.history.replaceState(null, "", url);
  }, [params, pathname, get]);

  return null;
}

export function AdminToastListener() {
  return (
    <Suspense fallback={null}>
      <ToastListenerInner />
    </Suspense>
  );
}
