"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpenText,
  Map as MapIcon,
  MapPinned,
  Users,
} from "lucide-react";
import { CharactersPanel } from "@/components/characters-panel";
import { ExpositionPanel } from "@/components/exposition-panel";
import { LocationsPanel } from "@/components/locations-panel";
import { RelationshipMap } from "@/components/relationship-map";
import { useStore } from "@/components/store-provider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/lib/types";

type Tab = "characters" | "locations" | "map" | "exposition";

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "characters", label: "Персонажи", icon: Users },
  { id: "locations", label: "Локации", icon: MapPinned },
  { id: "map", label: "Карта", icon: MapIcon },
  { id: "exposition", label: "Экспозиция", icon: BookOpenText },
];

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const { ready, getProject, updateProject } = useStore();
  const [tab, setTab] = useState<Tab>("characters");
  const project = getProject(projectId);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--ink-muted)]">
        Открываем проект…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Проект не найден
        </p>
        <p className="text-sm text-[var(--ink-muted)]">
          Возможно, данные очистили в браузере.
        </p>
        <Link
          href="/"
          className="inline-flex h-8 items-center rounded-lg border border-[var(--line)] bg-white px-3 text-sm hover:bg-[var(--muted)]"
        >
          К проектам
        </Link>
      </div>
    );
  }

  return <Workspace project={project} tab={tab} setTab={setTab} updateProject={updateProject} />;
}

function Workspace({
  project,
  tab,
  setTab,
  updateProject,
}: {
  project: Project;
  tab: Tab;
  setTab: (tab: Tab) => void;
  updateProject: (project: Project) => void;
}) {
  const counts = useMemo(
    () => ({
      characters: project.characters.length,
      locations: project.locations.length,
      map: project.relations.length,
      exposition: project.exposition.length,
    }),
    [project],
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 pb-28 pt-5 sm:px-6">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="-ml-2 inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-sm text-[var(--ink-muted)] hover:bg-white/70 hover:text-[var(--ink)]"
        >
          <ArrowLeft className="size-4" />
          Проекты
        </Link>
      </div>

      <header className="space-y-3 rounded-[1.5rem] border border-[var(--line)] bg-[var(--panel)] px-4 py-5 sm:px-6">
        <Input
          value={project.title}
          onChange={(event) => updateProject({ ...project, title: event.target.value })}
          className="h-auto border-0 bg-transparent px-0 font-[family-name:var(--font-display)] text-3xl shadow-none focus-visible:ring-0 sm:text-4xl"
        />
        <Textarea
          value={project.logline}
          onChange={(event) => updateProject({ ...project, logline: event.target.value })}
          placeholder="Логлайн в одном-двух предложениях"
          rows={2}
          className="resize-none border-0 bg-transparent px-0 text-sm text-[var(--ink-muted)] shadow-none focus-visible:ring-0"
        />
        <Input
          value={project.format}
          onChange={(event) => updateProject({ ...project, format: event.target.value })}
          placeholder="Формат: полный метр, сериал, пилот…"
          className="h-8 max-w-sm border-0 bg-transparent px-0 text-xs uppercase tracking-[0.14em] text-[var(--ink-muted)] shadow-none focus-visible:ring-0"
        />
      </header>

      <nav className="sticky top-0 z-20 -mx-4 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--paper)_88%,white)]/90 px-2 backdrop-blur sm:-mx-0 sm:rounded-2xl sm:border sm:px-2">
        <ul className="grid grid-cols-4 gap-1 py-2">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <li key={item.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] transition sm:flex-row sm:justify-center sm:gap-1.5 sm:px-2 sm:text-sm ${
                    active
                      ? "bg-[var(--ink)] text-white"
                      : "text-[var(--ink-muted)] hover:bg-white/70 hover:text-[var(--ink)]"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  <span
                    className={`rounded-md px-1 text-[10px] sm:text-[11px] ${
                      active ? "bg-white/20" : "bg-[var(--line)] text-[var(--ink)]"
                    }`}
                  >
                    {counts[item.id]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-h-[50vh]">
        {tab === "characters" ? <CharactersPanel project={project} /> : null}
        {tab === "locations" ? <LocationsPanel project={project} /> : null}
        {tab === "map" ? <RelationshipMap project={project} /> : null}
        {tab === "exposition" ? <ExpositionPanel project={project} /> : null}
      </div>
    </div>
  );
}
