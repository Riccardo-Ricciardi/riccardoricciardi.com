import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Briefcase,
  Contact,
  FileText,
  FileWarning,
  Globe,
  Home,
  Image as ImageIcon,
  Inbox,
  Languages,
  Menu,
  Paintbrush,
  Sparkles,
  User,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: Activity },
      { href: "/admin/messages", label: "Messages", icon: Inbox },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/skills", label: "Skills", icon: Sparkles },
      { href: "/admin/projects", label: "Projects", icon: Briefcase },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/identity", label: "Identity", icon: User },
      { href: "/admin/about", label: "About", icon: FileText },
      { href: "/admin/contact", label: "Contact", icon: Contact },
      { href: "/admin/navbar", label: "Navbar", icon: Menu },
      { href: "/admin/content", label: "Content", icon: FileText },
      { href: "/admin/not-found", label: "404 strings", icon: FileWarning },
    ],
  },
  {
    label: "Assets",
    items: [{ href: "/admin/media", label: "Media", icon: ImageIcon }],
  },
  {
    label: "System",
    items: [
      { href: "/admin/theme", label: "Theme", icon: Paintbrush },
      { href: "/admin/languages", label: "Languages", icon: Languages },
    ],
  },
];

export const MOBILE_TABS: AdminNavItem[] = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/projects", label: "Projects", icon: Briefcase },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
];

export type AdminNavFlat = AdminNavItem & { group: string };

export function flattenNav(): AdminNavFlat[] {
  return ADMIN_NAV.flatMap((g) =>
    g.items.map((i) => ({ ...i, group: g.label }))
  );
}
