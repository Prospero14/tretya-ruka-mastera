"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCharacterFields, getLocationFields, slugifyFieldKey } from "@/lib/project-fields";
import type { Project, SchemaField } from "@/lib/types";

export function CustomFieldsEditor({
  project,
  kind,
}: {
  project: Project;
  kind: "character" | "location";
}) {
  const { updateProject } = useStore();
  const [label, setLabel] = useState("");
  const fields =
    kind === "character" ? getCharacterFields(project) : getLocationFields(project);
  const custom =
    kind === "character"
      ? project.customCharacterFields || []
      : project.customLocationFields || [];

  function addField() {
    const trimmed = label.trim();
    if (!trimmed) return;
    const field: SchemaField = {
      key: slugifyFieldKey(trimmed),
      label: trimmed,
      type: "text",
      highlight: true,
      custom: true,
    };
    if (kind === "character") {
      updateProject({
        ...project,
        customCharacterFields: [...custom, field],
      });
    } else {
      updateProject({
        ...project,
        customLocationFields: [...custom, field],
      });
    }
    setLabel("");
  }

  function removeField(key: string) {
    if (kind === "character") {
      updateProject({
        ...project,
        customCharacterFields: custom.filter((field) => field.key !== key),
      });
    } else {
      updateProject({
        ...project,
        customLocationFields: custom.filter((field) => field.key !== key),
      });
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-4 py-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--ink)]">Свои поля</h3>
        <p className="text-xs text-[var(--ink-muted)]">
          Добавьте параметры сверх шаблона — они появятся у всех{" "}
          {kind === "character" ? "персонажей" : "локаций"} этого проекта.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <Label>Название поля</Label>
          <Input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={
              kind === "character" ? "Например: голос, травма, статус" : "Например: запах, эпоха"
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addField();
              }
            }}
          />
        </div>
        <Button
          className="mt-0 bg-[var(--ink)] text-white hover:bg-[var(--ink)]/90 sm:mt-6"
          onClick={addField}
          disabled={!label.trim()}
        >
          <Plus className="size-4" />
          Добавить поле
        </Button>
      </div>
      {custom.length ? (
        <ul className="space-y-1.5">
          {custom.map((field) => (
            <li
              key={field.key}
              className="flex items-center justify-between gap-2 rounded-lg bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <span>{field.label}</span>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => removeField(field.key)}
                aria-label="Удалить поле"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[var(--ink-muted)]">
          Пока только поля шаблона ({fields.filter((field) => !field.custom).length}).
        </p>
      )}
    </div>
  );
}
