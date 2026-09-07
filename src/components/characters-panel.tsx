"use client";

import { useMemo, useState } from "react";
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
import { getCharacterFields } from "@/lib/project-fields";
import type { Character, CharacterRole, Project, SchemaField } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/types";

const COLORS = ["#0f766e", "#b91c1c", "#1d4ed8", "#a16207", "#be185d", "#475569"];

function blankCharacter(id: string, fieldKeys: string[]): Character {
  return {
    id,
    name: "",
    role: "supporting",
    archetype: "",
    goal: "",
    flaw: "",
    exposition: "",
    notes: "",
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    mapX: 120 + Math.random() * 280,
    mapY: 100 + Math.random() * 220,
    fields: emptyFieldsFor(fieldKeys),
    refs: [],
  };
}

export function CharactersPanel({ project }: { project: Project }) {
  const { upsertCharacter, removeCharacter, newId } = useStore();
  const schemaFields = getCharacterFields(project);
  const fieldKeys = schemaFields.map((field) => field.key);
  const [draft, setDraft] = useState<Character | null>(null);

  const sorted = useMemo(
    () =>
      [...project.characters].sort((a, b) => {
        const order: CharacterRole[] = [
          "protagonist",
          "antagonist",
          "supporting",
          "minor",
        ];
        return order.indexOf(a.role) - order.indexOf(b.role) || a.name.localeCompare(b.name, "ru");
      }),
    [project.characters],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Персонажи
          </h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Роль, цель, поля шаблона и свои параметры — в одной карточке.
          </p>
        </div>
        <Button
          className="bg-[var(--ink)] text-white hover:bg-[var(--ink)]/90"
          onClick={() => setDraft(blankCharacter(newId("char"), fieldKeys))}
        >
          <Plus className="size-4" />
          Добавить
        </Button>
      </div>

      <CustomFieldsEditor project={project} kind="character" />

      {sorted.length === 0 ? (
        <EmptyState label="Пока нет персонажей" hint="Добавьте протагониста — карта связей оживёт." />
      ) : (
        <ul className="space-y-3">
          {sorted.map((character) => (
            <li
              key={character.id}
              className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-1 size-3 shrink-0 rounded-full"
                  style={{ background: character.color }}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-[var(--ink)]">
                      {character.name}
                    </h3>
                    <Badge variant="secondary">{ROLE_LABELS[character.role]}</Badge>
                    {schemaFields
                      .filter((field) => field.highlight && character.fields?.[field.key])
                      .map((field) => (
                        <Badge key={field.key} variant="outline">
                          {character.fields[field.key]}
                        </Badge>
                      ))}
                  </div>
                  {character.archetype ? (
                    <p className="text-sm text-[var(--ink-muted)]">{character.archetype}</p>
                  ) : null}
                  {character.goal ? (
                    <p className="text-sm">
                      <span className="font-medium text-[var(--ink)]">Цель: </span>
                      <span className="text-[var(--ink-muted)]">{character.goal}</span>
                    </p>
                  ) : null}
                  {character.exposition ? (
                    <p className="text-sm leading-relaxed text-[var(--ink)]/80">
                      {character.exposition}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() =>
                      setDraft({
                        ...character,
                        fields: { ...emptyFieldsFor(fieldKeys), ...character.fields },
                        refs: character.refs || [],
                      })
                    }
                    aria-label="Редактировать"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => removeCharacter(project.id, character.id)}
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
              {draft && project.characters.some((item) => item.id === draft.id)
                ? "Редактировать персонажа"
                : "Новый персонаж"}
            </DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="grid gap-3">
              <Field label="Имя">
                <Input
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </Field>
              <Field label="Роль">
                <Select
                  value={draft.role}
                  onValueChange={(value) => {
                    if (!value) return;
                    setDraft({ ...draft, role: value as CharacterRole });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Архетип / функция">
                <Input
                  value={draft.archetype}
                  onChange={(event) => setDraft({ ...draft, archetype: event.target.value })}
                />
              </Field>
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
              <Field label="Цель">
                <Textarea
                  value={draft.goal}
                  onChange={(event) => setDraft({ ...draft, goal: event.target.value })}
                  rows={2}
                />
              </Field>
              <Field label="Изъян">
                <Textarea
                  value={draft.flaw}
                  onChange={(event) => setDraft({ ...draft, flaw: event.target.value })}
                  rows={2}
                />
              </Field>
              <Field label="Экспозиция">
                <Textarea
                  value={draft.exposition}
                  onChange={(event) =>
                    setDraft({ ...draft, exposition: event.target.value })
                  }
                  rows={3}
                />
              </Field>
              <Field label="Заметки">
                <Textarea
                  value={draft.notes}
                  onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                  rows={2}
                />
              </Field>
              <RefSearch
                seedQuery={`${draft.name || "character"} ${draft.archetype || ""} screen character reference`.trim()}
                refs={draft.refs || []}
                onChange={(refs) => setDraft({ ...draft, refs })}
              />
              <Field label="Цвет на карте">
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`size-7 rounded-full border-2 ${
                        draft.color === color ? "border-[var(--ink)]" : "border-transparent"
                      }`}
                      style={{ background: color }}
                      onClick={() => setDraft({ ...draft, color })}
                      aria-label={`Цвет ${color}`}
                    />
                  ))}
                </div>
              </Field>
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
                upsertCharacter(project.id, {
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
      <Field label={field.label}>
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
      </Field>
    );
  }

  return (
    <Field label={field.label}>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function EmptyState({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/50 px-5 py-10 text-center">
      <p className="font-medium text-[var(--ink)]">{label}</p>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">{hint}</p>
    </div>
  );
}
