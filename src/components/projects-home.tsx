"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Dices, MapPinned, Plus, Trash2, Users } from "lucide-react";
import { useStore } from "@/components/store-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { PROJECT_SCHEMAS, getSchema } from "@/lib/schemas";

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export function ProjectsHome() {
  const { ready, projects, createProject, deleteProject } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [schemaId, setSchemaId] = useState("fantasy");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...projects].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [projects],
  );

  const deleteTarget = sorted.find((project) => project.id === deleteId);

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[var(--ink-muted)]">
        Загружаем кампании…
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pb-24 pt-8 sm:px-6">
      <header className="relative overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--panel)] px-5 py-8 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(194,59,34,0.18),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(15,118,110,0.16),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(19,41,75,0.05)_1px,transparent_1px)] [background-size:100%_28px]" />
        <div className="relative space-y-5">
          <div className="flex items-start justify-between gap-3">
            <p className="max-w-[14ch] font-[family-name:var(--font-display)] text-4xl leading-[0.95] tracking-tight text-[var(--ink)] sm:max-w-none sm:text-5xl">
              Третья рука мастера
            </p>
            <ThemeToggle />
          </div>
          <p className="max-w-md text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
            Запиши свои сюжетные повороты — пока они ещё горячие.
          </p>
          <Button
            size="lg"
            className="mt-1 bg-[var(--signal)] text-white hover:bg-[var(--signal-strong)]"
            onClick={() => setOpen(true)}
          >
            <Plus className="size-4" />
            Новый проект
          </Button>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ink-muted)]">
            Проекты
          </h2>
          <span className="text-xs text-[var(--ink-muted)]">{sorted.length}</span>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center">
            <p className="font-medium text-[var(--ink)]">Пока пусто</p>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Создайте проект или откройте демо.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sorted.map((project) => {
              const schema = getSchema(project.schemaId);
              return (
                <li key={project.id}>
                  <article className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] transition hover:border-[var(--ink)]/20">
                    <div className="flex items-stretch gap-1">
                      <Link
                        href={`/project/?id=${project.id}`}
                        className="min-w-0 flex-1 px-5 py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <h3 className="truncate font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
                              {project.title}
                            </h3>
                            <p className="line-clamp-2 text-sm text-[var(--ink-muted)]">
                              {project.logline || "Логлайн ещё не задан"}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-[var(--ink-muted)]">
                            {formatDate(project.updatedAt)}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--ink-muted)]">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--paper)] px-2 py-1 text-[var(--ink)]">
                            {schema.name}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Dices className="size-3.5" />
                            {project.format || "Формат"}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="size-3.5" />
                            {project.characters.length}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPinned className="size-3.5" />
                            {project.locations.length}
                          </span>
                        </div>
                      </Link>
                      <div className="flex items-center border-l border-[var(--line)] px-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-[var(--ink-muted)] hover:text-[var(--signal)]"
                          onClick={() => setDeleteId(project.id)}
                          aria-label={`Удалить проект ${project.title}`}
                        >
                          <Trash2 className="size-5" />
                        </Button>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новый проект</DialogTitle>
            <DialogDescription>
              Выберите шаблон мира — от него зависят поля персонажей и локаций.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="project-title">Название</Label>
              <Input
                id="project-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Например: Пилот второго сезона"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Шаблон мира</Label>
              <Select
                value={schemaId}
                onValueChange={(value) => {
                  if (!value) return;
                  setSchemaId(value);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_SCHEMAS.map((schema) => (
                    <SelectItem key={schema.id} value={schema.id}>
                      {schema.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-[var(--ink-muted)]">
                {getSchema(schemaId).description}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button
              className="bg-[var(--signal)] text-white hover:bg-[var(--signal-strong)]"
              onClick={() => {
                const project = createProject(title, schemaId);
                setTitle("");
                setOpen(false);
                window.location.href = `/project/?id=${project.id}`;
              }}
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteId)} onOpenChange={(next) => !next && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Удалить проект?</DialogTitle>
            <DialogDescription>
              «{deleteTarget?.title ?? "Проект"}» будет удалён вместе с персонажами, локациями и
              связями. Это нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Отмена
            </Button>
            <Button
              className="bg-[var(--signal)] text-white hover:bg-[var(--signal-strong)]"
              onClick={() => {
                if (deleteId) deleteProject(deleteId);
                setDeleteId(null);
              }}
            >
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
