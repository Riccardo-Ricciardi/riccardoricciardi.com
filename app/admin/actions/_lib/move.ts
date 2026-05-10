import { createAdminClient } from "@/utils/supabase/admin";

export function parseMove(
  formData: FormData
): { id: string; direction: "up" | "down" } | null {
  const move = String(formData.get("move") ?? "");
  if (move) {
    const colon = move.lastIndexOf(":");
    if (colon > 0) {
      const id = move.slice(0, colon);
      const dir = move.slice(colon + 1);
      if (dir === "up" || dir === "down") return { id, direction: dir };
    }
  }
  for (const k of formData.keys()) {
    const m = k.match(/^move:(.+):(up|down)$/);
    if (m) return { id: m[1], direction: m[2] as "up" | "down" };
  }
  const id = formData.get("id");
  const dir = formData.get("direction");
  if (id && (dir === "up" || dir === "down")) {
    return { id: String(id), direction: dir };
  }
  return null;
}

export async function swapPositions<
  T extends { id: number | string; position: number | null },
>(
  table: "skills" | "projects",
  rows: T[],
  currentId: T["id"],
  direction: "up" | "down"
) {
  const supabase = createAdminClient();
  const sorted = [...rows].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );
  const idx = sorted.findIndex((r) => r.id === currentId);
  if (idx === -1) return;
  const targetIdx = direction === "up" ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= sorted.length) return;
  const a = sorted[idx];
  const b = sorted[targetIdx];
  await supabase.from(table).update({ position: targetIdx }).eq("id", a.id);
  await supabase.from(table).update({ position: idx }).eq("id", b.id);
  for (let i = 0; i < sorted.length; i++) {
    if (i === idx || i === targetIdx) continue;
    if ((sorted[i].position ?? 0) !== i) {
      await supabase.from(table).update({ position: i }).eq("id", sorted[i].id);
    }
  }
}
