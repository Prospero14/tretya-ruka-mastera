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
import type { ExpositionNote, Project } from "@/lib/types";

function blankNote(id: string): ExpositionNote {
  return {
    id,
    title: "",
    body: "",
    tags: [],
    updatedAt: new Date().toISOString(),
  };
}

export function ExpositionPanel({ project }: { project: Project }) {
  const { upsertExposition, removeExposition, newId } = useStore();
  const [draft, setDraft] = useState<ExpositionNote | null>(null);
  const [tagsText, setTagsText] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Экспозиция
          </h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Правила мира, тон, бэкстори и всё, что зритель должен понять без лекции.
          </p>
        </div>
        <Button
          className="bg-[var(--ink)] text-white hover:bg-[var(--ink)]/90"
          onClick={() => {
            const note = blankNote(newId("exp"));
            setDraft(note);
            setTagsText("");
          }}
        >
          <Plus className="size-4" />
          Заметка
        </Button>
      </div>

      {project.exposition.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center">
          <p className="font-medium text-[var(--ink)]">Экспозиция пуста</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Зафиксируйте правила мира и тон первого акта.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {project.exposition.map((note) => (
            <li
              key={note.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="text-base font-semibold text-[var(--ink)]">{note.title}</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]/85">
                    {note.body}
                  </p>
                  {note.tags.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => {
                      setDraft(note);
                      setTagsText(note.tags.join(", "));
                    }}
                    aria-label="Редактировать"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => removeExposition(project.id, note.id)}
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
              {draft && project.exposition.some((item) => item.id === draft.id)
                ? "Редактировать заметку"
                : "Новая экспозиция"}
            </DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Заголовок</Label>
                <Input
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Текст</Label>
                <Textarea
                  value={draft.body}
                  onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                  rows={6}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Теги через запятую</Label>
                <Input
                  value={tagsText}
                  onChange={(event) => setTagsText(event.target.value)}
                  placeholder="мир, тон, акт 1"
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
              disabled={!draft?.title.trim() || !draft.body.trim()}
              onClick={() => {
                if (!draft) return;
                upsertExposition(project.id, {
                  ...draft,
                  title: draft.title.trim(),
                  body: draft.body.trim(),
                  tags: tagsText
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                  updatedAt: new Date().toISOString(),
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
