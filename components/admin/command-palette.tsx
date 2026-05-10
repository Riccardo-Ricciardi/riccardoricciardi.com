"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface SkillItem {
  id: number;
  name: string;
}
interface ProjectItem {
  id: string;
  repo: string;
  name: string | null;
}
interface NavbarItem {
  slug: string;
  value: string;
}
interface ContentItem {
  slug: string;
}
interface LanguageItem {
  code: string;
  name: string;
}

interface Props {
  skills: SkillItem[];
  projects: ProjectItem[];
  navbarSlugs: NavbarItem[];
  contentSlugs: ContentItem[];
  languages: LanguageItem[];
}

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Content", href: "/admin/content" },
  { label: "Navbar", href: "/admin/navbar" },
  { label: "Skills", href: "/admin/skills" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Theme", href: "/admin/theme" },
  { label: "Languages", href: "/admin/languages" },
  { label: "404 strings", href: "/admin/not-found" },
];

export function CommandPalette({
  skills,
  projects,
  navbarSlugs,
  contentSlugs,
  languages,
}: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/40 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-dashed border-dashed-soft bg-popover shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput
            placeholder="Search skills, projects, navbar, content…"
            autoFocus
          />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {NAV.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`nav ${item.label}`}
                  onSelect={() => go(item.href)}
                >
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {skills.length > 0 && (
              <CommandGroup heading="Skills">
                {skills.map((s) => (
                  <CommandItem
                    key={`skill-${s.id}`}
                    value={`skill ${s.name}`}
                    onSelect={() => go(`/admin/skills/${s.id}`)}
                  >
                    {s.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {projects.length > 0 && (
              <CommandGroup heading="Projects">
                {projects.map((p) => (
                  <CommandItem
                    key={`proj-${p.id}`}
                    value={`project ${p.repo} ${p.name ?? ""}`}
                    onSelect={() => go(`/admin/projects/${p.id}`)}
                  >
                    <span className="font-mono text-xs">{p.repo}</span>
                    {p.name && (
                      <span className="ml-2 truncate text-muted-foreground">
                        {p.name}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {navbarSlugs.length > 0 && (
              <CommandGroup heading="Navbar">
                {navbarSlugs.map((n) => (
                  <CommandItem
                    key={`navbar-${n.slug || "home"}`}
                    value={`navbar ${n.slug} ${n.value}`}
                    onSelect={() => go("/admin/navbar")}
                  >
                    <span className="font-mono text-xs">
                      {n.slug || "(home)"}
                    </span>
                    <span className="ml-2 truncate text-muted-foreground">
                      {n.value}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {contentSlugs.length > 0 && (
              <CommandGroup heading="Content">
                {contentSlugs.map((c) => (
                  <CommandItem
                    key={`content-${c.slug}`}
                    value={`content ${c.slug}`}
                    onSelect={() => go("/admin/content")}
                  >
                    <span className="font-mono text-xs">{c.slug}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {languages.length > 0 && (
              <CommandGroup heading="Languages">
                {languages.map((l) => (
                  <CommandItem
                    key={`lang-${l.code}`}
                    value={`language ${l.code} ${l.name}`}
                    onSelect={() => go("/admin/languages")}
                  >
                    <span className="font-mono text-xs">{l.code}</span>
                    <span className="ml-2 text-muted-foreground">{l.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        <div className="border-t border-dashed border-dashed-soft px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <kbd className="rounded border border-dashed border-dashed-soft px-1">
            ↑↓
          </kbd>{" "}
          navigate ·{" "}
          <kbd className="rounded border border-dashed border-dashed-soft px-1">
            ↵
          </kbd>{" "}
          open ·{" "}
          <kbd className="rounded border border-dashed border-dashed-soft px-1">
            esc
          </kbd>{" "}
          close
        </div>
      </div>
    </div>
  );
}
