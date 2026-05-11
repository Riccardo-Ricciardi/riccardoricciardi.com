import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export function bounce(path: string, ok?: string, error?: string): never {
  const params = new URLSearchParams();
  if (ok) params.set("ok", ok);
  if (error) params.set("error", error);
  const search = params.toString();
  revalidatePath("/", "layout");
  redirect(search ? `${path}?${search}` : path);
}

export function bounceOk(path: string, ok: string = "saved"): never {
  return bounce(path, ok);
}

export function bounceError(path: string, error: string): never {
  return bounce(path, undefined, encodeURIComponent(error));
}

export function asInt(v: FormDataEntryValue | null): number {
  const n = Number(typeof v === "string" ? v : 0);
  return Number.isFinite(n) ? n : 0;
}

export function asStr(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

export function asBool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

export function asNullableStr(v: FormDataEntryValue | null): string | null {
  const s = asStr(v);
  return s.length === 0 ? null : s;
}
