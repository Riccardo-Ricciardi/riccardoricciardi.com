"use client";

import { usePathname } from "next/navigation";
import { flattenNav } from "@/components/admin/nav-config";

export function Topbar() {
  const pathname = usePathname();
  const flat = flattenNav();
  const current =
    pathname === "/admin"
      ? flat.find((i) => i.href === "/admin")
      : flat
          .filter((i) => i.href !== "/admin")
          .sort((a, b) => b.href.length - a.href.length)
          .find((i) => pathname.startsWith(i.href));

  return (
    <div
      role="banner"
      className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b admin-divider bg-background/85 px-4 backdrop-blur md:hidden"
    >
      <span className="grid h-7 w-7 place-items-center rounded-md bg-accent-blue text-[11px] font-bold text-white">
        R.
      </span>
      <div className="min-w-0 flex-1">
        <p className="admin-eyebrow">{current?.group ?? "Admin"}</p>
        <p className="truncate text-sm font-medium">
          {current?.label ?? "Dashboard"}
        </p>
      </div>
    </div>
  );
}
