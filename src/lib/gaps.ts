import type { AppData, Project } from "./types";

export interface GapItem {
  id: string;
  projectId: string;
  projectTitle: string;
  label: string;
  severity: "high" | "medium";
}

export function findProjectGaps(project: Project): GapItem[] {
  const gaps: GapItem[] = [];
  const push = (label: string, severity: GapItem["severity"] = "medium") => {
    gaps.push({
      id: `${project.id}:${label}`,
      projectId: project.id,
      projectTitle: project.title,
      label,
      severity,
    });
  };

  if (!project.synopsis?.trim()) {
    push("Нет краткого синопсиса", "high");
  }
  if (!project.logline?.trim()) {
    push("Нет логлайна", "medium");
  }
  if (project.characters.length === 0) {
    push("Нет персонажей", "high");
  } else {
    const thin = project.characters.filter(
      (character) => !character.goal.trim() || !character.exposition.trim(),
    );
    if (thin.length) {
      push(`У ${thin.length} персонаж(ей) не заполнены цель/экспозиция`, "medium");
    }
  }
  if (project.locations.length === 0) {
    push("Нет локаций", "medium");
  }
  if (project.characters.length >= 2 && project.relations.length === 0) {
    push("Карта связей пустая", "high");
  }
  if (project.exposition.length === 0) {
    push("Нет заметок экспозиции", "medium");
  }

  return gaps;
}

export function findAllGaps(data: AppData): GapItem[] {
  return data.projects.flatMap(findProjectGaps);
}

/** Show at most 2 reminders per calendar day, at least ~8h apart unless first. */
export function shouldShowReminder(
  shownAt: string[],
  now = new Date(),
  snoozedUntil?: string,
): boolean {
  if (snoozedUntil && new Date(snoozedUntil).getTime() > now.getTime()) {
    return false;
  }
  const day = now.toISOString().slice(0, 10);
  const today = shownAt.filter((iso) => iso.startsWith(day));
  if (today.length >= 2) return false;
  if (today.length === 0) return true;
  const last = new Date(today[today.length - 1]).getTime();
  return now.getTime() - last >= 8 * 60 * 60 * 1000;
}
