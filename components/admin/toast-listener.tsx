"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function AdminToastListener() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const ok = searchParams.get("ok");
    const error = searchParams.get("error");
    const key = `${pathname}?ok=${ok}&error=${error}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    if (ok) {
      toast.success(ok === "saved" ? "Saved" : ok);
    } else if (error) {
      toast.error(decodeURIComponent(error));
    }

    if (ok || error) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("ok");
      params.delete("error");
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  return null;
}
