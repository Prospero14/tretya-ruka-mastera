"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { CustomFieldsEditor } from "@/components/custom-fields-editor";
import { RefSearch } from "@/components/ref-search";
import { useStore } from "@/components/store-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { emptyFieldsFor } from "@/lib/relations-analysis";
import { getLocationFields } from "@/lib/project-fields";
import type { Location, Project, SchemaField } from "@/lib/types";

function blankLocation(id: string, fieldKeys: string[]): Location {
  return {
    id,
    name: "",
    type: "Интерьер",
    mood: "",
    description: "",
    exposition: "",
    fields: emptyFieldsFor(fieldKeys),
    refs: [],
  };
}

export function LocationsPanel({ project }: { project: Project }) {
  const { upsertLocation, removeLocation, newId } = useStore();
  const schemaFields = getLocationFields(project);
  const fieldKeys = schemaFields.map((field) => field.key);
  const [draft, setDraft] = useState<Location | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Локации
          </h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Настроение, доступ и свои поля мира.
          </p>
        </div>
        <Button
          className="bg-[var(--ink)] text-white hover:bg-[var(--ink)]/90"
          onClick={() => setDraft(blankLocation(newId("loc"), fieldKeys))}
        >
          <Plus className="size-4" />
          Добавить
        </Button>
      </div>

      <CustomFieldsEditor project={project} kind="location" />

      {project.locations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center">
          <p className="font-medium text-[var(--ink)]">Нет локаций</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Добавьте ключевые пространства истории.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {project.locations.map((location) => (
            <li
              key={location.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-[var(--ink)]">{location.name}</h3>
                    {location.type ? <Badge variant="secondary">{location.type}</Badge> : null}
                    {schemaFields
                      .filter((field) => field.highlight && location.fields?.[field.key])
                      .map((field) => (
                        <Badge key={field.key} variant="outline">
                          {location.fields[field.key]}
                        </Badge>
                      ))}
                  </div>
                  {location.mood ? (
                    <p className="text-sm text-[var(--ink-muted)]">{location.mood}</p>
                  ) : null}
                  {location.description ? (
                    <p className="text-sm leading-relaxed text-[var(--ink)]/80">
                      {location.description}
                    </p>
                  ) : null}
                  {location.exposition ? (
                    <p className="text-sm leading-relaxed">
                      <span className="font-medium text-[var(--ink)]">Экспозиция: </span>
                      <span className="text-[var(--ink-muted)]">{location.exposition}</span>
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() =>
                      setDraft({
                        ...location,
                        fields: { ...emptyFieldsFor(fieldKeys), ...location.fields },
                        refs: location.refs || [],
                      })
                    }
                    aria-label="Редактировать"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => removeLocation(project.id, location.id)}
                    aria-label="Удалить"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {draft && project.locations.some((item) => item.id === draft.id)
                ? "Редактировать локацию"
                : "Новая локация"}
            </DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Название</Label>
                <Input
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Тип</Label>
                <Input
                  value={draft.type}
                  onChange={(event) => setDraft({ ...draft, type: event.target.value })}
                />
              </div>
              {schemaFields.map((field) => (
                <SchemaFieldInput
                  key={field.key}
                  field={field}
                  value={draft.fields?.[field.key] || ""}
                  onChange={(value) =>
                    setDraft({
                      ...draft,
                      fields: { ...draft.fields, [field.key]: value },
                    })
                  }
                />
              ))}
              <div className="space-y-1.5">
                <Label>Настроение</Label>
                <Input
                  value={draft.mood}
                  onChange={(event) => setDraft({ ...draft, mood: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Описание</Label>
                <Textarea
                  value={draft.description}
                  onChange={(event) =>
                    setDraft({ ...draft, description: event.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Экспозиция места</Label>
                <Textarea
                  value={draft.exposition}
                  onChange={(event) =>
                    setDraft({ ...draft, exposition: event.target.value })
                  }
                  rows={3}
                />
              </div>
              <RefSearch
                seedQuery={`${draft.name || "tavern"} ${draft.mood || ""} rpg location reference`.trim()}
                refs={draft.refs || []}
                onChange={(refs) => setDraft({ ...draft, refs })}
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Отмена
            </Button>
            <Button
              className="bg-[var(--signal)] text-white hover:bg-[var(--signal-strong)]"
              disabled={!draft?.name.trim()}
              onClick={() => {
                if (!draft?.name.trim()) return;
                upsertLocation(project.id, {
                  ...draft,
                  name: draft.name.trim(),
                  fields: { ...emptyFieldsFor(fieldKeys), ...draft.fields },
                  refs: draft.refs || [],
                });
                setDraft(null);
              }}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SchemaFieldInput({
  field,
  value,
  onChange,
}: {
  field: SchemaField;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.type === "select" && field.options?.length) {
    return (
      <div className="space-y-1.5">
        <Label>{field.label}</Label>
        <Select
          value={value || undefined}
          onValueChange={(next) => {
            if (!next) return;
            onChange(next);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label>{field.label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
