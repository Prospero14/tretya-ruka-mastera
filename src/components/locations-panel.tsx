"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import type { Location, Project } from "@/lib/types";

function blankLocation(id: string): Location {
  return {
    id,
    name: "",
    type: "Интерьер",
    mood: "",
    description: "",
    exposition: "",
  };
}

export function LocationsPanel({ project }: { project: Project }) {
  const { upsertLocation, removeLocation, newId } = useStore();
  const [draft, setDraft] = useState<Location | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Локации
          </h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Места как персонажи: настроение, функция, что они объясняют зрителю.
          </p>
        </div>
        <Button
          className="bg-[var(--ink)] text-white hover:bg-[var(--ink)]/90"
          onClick={() => setDraft(blankLocation(newId("loc")))}
        >
          <Plus className="size-4" />
          Добавить
        </Button>
      </div>

      {project.locations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/50 px-5 py-10 text-center">
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
              className="rounded-2xl border border-[var(--line)] bg-white/75 px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-[var(--ink)]">{location.name}</h3>
                    {location.type ? <Badge variant="secondary">{location.type}</Badge> : null}
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
                    onClick={() => setDraft(location)}
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
                  placeholder="Интерьер / Экстерьер / Переход"
                />
              </div>
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
                upsertLocation(project.id, { ...draft, name: draft.name.trim() });
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
