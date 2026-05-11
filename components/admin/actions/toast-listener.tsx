"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

const OK_MAP: Record<string, string> = {
  saved: "Saved",
  created: "Created",
  deleted: "Deleted",
  updated: "Updated",
  uploaded: "Uploaded",
  cleared: "Cleared",
};

export function AdminToastListener() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lastKeyRef = useRef<string>("");

  useEffect(() => {
    const ok = params.get("ok");
    const err = params.get("error");
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
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }, [params, router, pathname]);

  return null;
}
