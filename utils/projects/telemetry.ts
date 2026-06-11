import type { Project } from "@/utils/projects/fetch";

export function telemetryParts(project: Project): {
  stateLabel: string;
  segments: string[];
} {
  const parts = (project.telemetry ?? "").split(" · ").filter(Boolean);
  if (parts.length === 0) {
    return { stateLabel: project.status ?? "shipped", segments: [] };
  }
  return { stateLabel: parts[0], segments: parts.slice(1) };
}
