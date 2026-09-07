"use client";

import { findProjectGaps } from "@/lib/gaps";
import { getSchema } from "@/lib/schemas";
import type { Project } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function OverviewPanel({
  project,
  onChange,
}: {
  project: Project;
  onChange: (project: Project) => void;
}) {
  const gaps = findProjectGaps(project);
  const schema = getSchema(project.schemaId);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          Обзор
        </h2>
        <p className="text-sm text-[var(--ink-muted)]">
          Сначала синопсис — что происходит в кампании / рассказе на один взгляд.
        </p>
      </div>

      <section className="space-y-2 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4 sm:px-5">
        <Label className="text-[11px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Краткий синопсис
        </Label>
        <Textarea
          value={project.synopsis}
          onChange={(event) => onChange({ ...project, synopsis: event.target.value })}
          rows={7}
          placeholder="Что происходит, кто в центре, чем держит стол — 5–10 предложений для мастера."
          className="min-h-40 resize-y border-0 bg-[var(--paper)]/60 text-base leading-relaxed shadow-none focus-visible:ring-1"
        />
        {!project.synopsis.trim() ? (
          <p className="text-xs text-[var(--signal)]">
            Слот обязательный для работы: без синопсиса проект считается недописанным.
          </p>
        ) : (
          <p className="text-xs text-[var(--ink-muted)]">
            Шаблон мира: {schema.name}. Персонажей: {project.characters.length}, локаций:{" "}
            {project.locations.length}, связей: {project.relations.length}.
          </p>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Дыры сюжета
        </h3>
        {gaps.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-4 py-6 text-sm text-[var(--ink-muted)]">
            По чек-листу всё закрыто. Можно углублять карту и экспозицию.
          </p>
        ) : (
          <ul className="space-y-2">
            {gaps.map((gap) => (
              <li
                key={gap.id}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  gap.severity === "high"
                    ? "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)]"
                }`}
              >
                {gap.label}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
