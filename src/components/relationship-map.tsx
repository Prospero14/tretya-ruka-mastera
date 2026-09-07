"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/components/store-provider";
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
import type { Project, Relation, RelationKind } from "@/lib/types";
import { RELATION_COLORS, RELATION_LABELS, ROLE_LABELS } from "@/lib/types";

function blankRelation(
  id: string,
  sourceId: string,
  targetId: string,
): Relation {
  return {
    id,
    sourceId,
    targetId,
    kind: "other",
    label: "",
    fromPerspective: "",
    toPerspective: "",
  };
}

export function RelationshipMap({ project }: { project: Project }) {
  const { upsertCharacter, upsertRelation, removeRelation, newId } = useStore();
  const [draft, setDraft] = useState<Relation | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const initialNodes = useMemo<Node[]>(
    () =>
      project.characters.map((character) => ({
        id: character.id,
        position: { x: character.mapX, y: character.mapY },
        data: {
          label: (
            <div className="min-w-[110px] px-1 py-0.5 text-center">
              <div className="text-[11px] font-semibold leading-tight">{character.name}</div>
              <div className="text-[10px] opacity-70">{ROLE_LABELS[character.role]}</div>
            </div>
          ),
        },
        style: {
          borderRadius: 14,
          border: `2px solid ${character.color}`,
          background: "#fffdf8",
          color: "#13294b",
          fontSize: 12,
          padding: 4,
          boxShadow: "0 8px 20px rgba(19,41,75,0.08)",
        },
      })),
    [project.characters],
  );

  const initialEdges = useMemo<Edge[]>(
    () =>
      project.relations.map((relation) => ({
        id: relation.id,
        source: relation.sourceId,
        target: relation.targetId,
        label: relation.label || RELATION_LABELS[relation.kind],
        animated: relation.kind === "secret",
        style: { stroke: RELATION_COLORS[relation.kind], strokeWidth: 2 },
        labelStyle: { fill: "#13294b", fontSize: 10, fontWeight: 600 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: RELATION_COLORS[relation.kind],
        },
      })),
    [project.relations],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onNodeDragStop = useCallback(
    (_event: unknown, node: Node) => {
      const character = project.characters.find((item) => item.id === node.id);
      if (!character) return;
      upsertCharacter(project.id, {
        ...character,
        mapX: node.position.x,
        mapY: node.position.y,
      });
    },
    [project.characters, project.id, upsertCharacter],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) return;
      setDraft(blankRelation(newId("rel"), connection.source, connection.target));
    },
    [newId],
  );

  const selectedRelation = project.relations.find((item) => item.id === selectedEdgeId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Карта связей
          </h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Тяните узлы. Соединяйте персонажей линией — откроется карточка отношения.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={project.characters.length < 2}
          onClick={() => {
            const [a, b] = project.characters;
            if (!a || !b) return;
            setDraft(blankRelation(newId("rel"), a.id, b.id));
          }}
        >
          <Plus className="size-4" />
          Связь
        </Button>
      </div>

      {project.characters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/50 px-5 py-10 text-center">
          <p className="font-medium text-[var(--ink)]">Некого связывать</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Сначала добавьте хотя бы двух персонажей.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[#f4f7fb]">
          <div className="h-[420px] w-full sm:h-[520px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStop={onNodeDragStop}
              onEdgeClick={(_event, edge) => setSelectedEdgeId(edge.id)}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={18} size={1} color="#cbd5e1" />
              <MiniMap pannable zoomable />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
          Список связей
        </h3>
        {project.relations.length === 0 ? (
          <p className="text-sm text-[var(--ink-muted)]">Связей пока нет.</p>
        ) : (
          <ul className="space-y-2">
            {project.relations.map((relation) => {
              const source = project.characters.find((item) => item.id === relation.sourceId);
              const target = project.characters.find((item) => item.id === relation.targetId);
              return (
                <li
                  key={relation.id}
                  className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-white/70 px-3 py-3"
                >
                  <Link2
                    className="mt-0.5 size-4 shrink-0"
                    style={{ color: RELATION_COLORS[relation.kind] }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--ink)]">
                      {source?.name ?? "?"} → {target?.name ?? "?"}
                    </p>
                    <p className="text-xs text-[var(--ink-muted)]">
                      {RELATION_LABELS[relation.kind]}
                      {relation.label ? ` · ${relation.label}` : ""}
                    </p>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setDraft(relation)}
                    aria-label="Редактировать связь"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => removeRelation(project.id, relation.id)}
                    aria-label="Удалить связь"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedRelation ? (
        <div className="rounded-xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm">
          <p className="font-medium text-[var(--ink)]">Выбрана связь на карте</p>
          <p className="mt-1 text-[var(--ink-muted)]">
            {selectedRelation.label || RELATION_LABELS[selectedRelation.kind]}
          </p>
          <Button
            className="mt-2"
            size="sm"
            variant="outline"
            onClick={() => setDraft(selectedRelation)}
          >
            Открыть
          </Button>
        </div>
      ) : null}

      <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {draft && project.relations.some((item) => item.id === draft.id)
                ? "Редактировать связь"
                : "Новая связь"}
            </DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>От кого</Label>
                  <Select
                    value={draft.sourceId}
                    onValueChange={(value) => {
                      if (!value) return;
                      setDraft({ ...draft, sourceId: value });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {project.characters.map((character) => (
                        <SelectItem key={character.id} value={character.id}>
                          {character.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>К кому</Label>
                  <Select
                    value={draft.targetId}
                    onValueChange={(value) => {
                      if (!value) return;
                      setDraft({ ...draft, targetId: value });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {project.characters.map((character) => (
                        <SelectItem key={character.id} value={character.id}>
                          {character.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Тип</Label>
                <Select
                  value={draft.kind}
                  onValueChange={(value) => {
                    if (!value) return;
                    setDraft({ ...draft, kind: value as RelationKind });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RELATION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Подпись на карте</Label>
                <Input
                  value={draft.label}
                  onChange={(event) => setDraft({ ...draft, label: event.target.value })}
                  placeholder="Например: ложное доверие"
                />
              </div>
              <div className="space-y-1.5">
                <Label>С точки зрения первого</Label>
                <Textarea
                  value={draft.fromPerspective}
                  onChange={(event) =>
                    setDraft({ ...draft, fromPerspective: event.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>С точки зрения второго</Label>
                <Textarea
                  value={draft.toPerspective}
                  onChange={(event) =>
                    setDraft({ ...draft, toPerspective: event.target.value })
                  }
                  rows={2}
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
              disabled={!draft || draft.sourceId === draft.targetId}
              onClick={() => {
                if (!draft || draft.sourceId === draft.targetId) return;
                upsertRelation(project.id, draft);
                setDraft(null);
                setSelectedEdgeId(draft.id);
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
