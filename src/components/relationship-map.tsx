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
import { Grid3X3, Link2, Pencil, Plus, Share2, Trash2 } from "lucide-react";
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
import { pairInsight, relationPressure } from "@/lib/relations-analysis";
import { getCharacterFields } from "@/lib/project-fields";
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
    tension: 3,
    trust: 3,
  };
}

type ViewMode = "map" | "matrix";

export function RelationshipMap({ project }: { project: Project }) {
  const { upsertCharacter, upsertRelation, removeRelation, newId } = useStore();
  const schemaFields = getCharacterFields(project);
  const highlightKeys = schemaFields
    .filter((field) => field.highlight)
    .map((field) => field.key);

  const [view, setView] = useState<ViewMode>("map");
  const [draft, setDraft] = useState<Relation | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [matrixPair, setMatrixPair] = useState<{ a: string; b: string } | null>(null);

  const initialNodes = useMemo<Node[]>(
    () =>
      project.characters.map((character) => {
        const badges = highlightKeys
          .map((key) => character.fields?.[key])
          .filter(Boolean)
          .slice(0, 2);
        return {
          id: character.id,
          position: { x: character.mapX, y: character.mapY },
          data: {
            label: (
              <div className="min-w-[120px] px-1 py-0.5 text-center">
                <div className="text-[11px] font-semibold leading-tight">{character.name}</div>
                <div className="text-[10px] opacity-70">{ROLE_LABELS[character.role]}</div>
                {badges.length ? (
                  <div className="mt-0.5 text-[9px] leading-tight opacity-80">
                    {badges.join(" · ")}
                  </div>
                ) : null}
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
        };
      }),
    [highlightKeys, project.characters],
  );

  const initialEdges = useMemo<Edge[]>(
    () =>
      project.relations.map((relation) => {
        const pressure = relationPressure(relation);
        return {
          id: relation.id,
          source: relation.sourceId,
          target: relation.targetId,
          label: `${relation.label || RELATION_LABELS[relation.kind]} · ${pressure}/10`,
          animated: relation.kind === "secret" || pressure >= 8,
          style: {
            stroke: RELATION_COLORS[relation.kind],
            strokeWidth: 1.5 + pressure / 4,
          },
          labelStyle: { fill: "#13294b", fontSize: 10, fontWeight: 600 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: RELATION_COLORS[relation.kind],
          },
        };
      }),
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

  const matrixInsight = useMemo(() => {
    if (!matrixPair) return null;
    const a = project.characters.find((item) => item.id === matrixPair.a);
    const b = project.characters.find((item) => item.id === matrixPair.b);
    if (!a || !b) return null;
    return { a, b, ...pairInsight(project, a, b, highlightKeys) };
  }, [highlightKeys, matrixPair, project]);

  const selectedInsight = useMemo(() => {
    if (!selectedRelation) return null;
    const a = project.characters.find((item) => item.id === selectedRelation.sourceId);
    const b = project.characters.find((item) => item.id === selectedRelation.targetId);
    if (!a || !b) return null;
    return pairInsight(project, a, b, highlightKeys);
  }, [highlightKeys, project, selectedRelation]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Карта связей
          </h2>
          <p className="text-sm text-[var(--ink-muted)]">
            Граф + матрица давления: тип связи, доверие, напряжение и совпадения полей шаблона.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-xl border border-[var(--line)] bg-white/70 p-1">
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs ${
                view === "map" ? "bg-[var(--ink)] text-white" : "text-[var(--ink-muted)]"
              }`}
              onClick={() => setView("map")}
            >
              <Share2 className="size-3.5" />
              Граф
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs ${
                view === "matrix" ? "bg-[var(--ink)] text-white" : "text-[var(--ink-muted)]"
              }`}
              onClick={() => setView("matrix")}
            >
              <Grid3X3 className="size-3.5" />
              Матрица
            </button>
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
      </div>

      {project.characters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/50 px-5 py-10 text-center">
          <p className="font-medium text-[var(--ink)]">Некого связывать</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Сначала добавьте хотя бы двух персонажей.
          </p>
        </div>
      ) : view === "map" ? (
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
      ) : (
        <RelationMatrix
          project={project}
          highlightKeys={highlightKeys}
          onSelectPair={(a, b) => setMatrixPair({ a, b })}
        />
      )}

      {selectedInsight && selectedRelation ? (
        <InsightCard
          title="Выбрана связь на графе"
          body={selectedInsight.summary}
          onEdit={() => setDraft(selectedRelation)}
        />
      ) : null}

      {matrixInsight ? (
        <InsightCard
          title={`${matrixInsight.a.name} ↔ ${matrixInsight.b.name}`}
          body={matrixInsight.summary}
          onEdit={
            matrixInsight.relation
              ? () => setDraft(matrixInsight.relation!)
              : () =>
                  setDraft(
                    blankRelation(newId("rel"), matrixInsight.a.id, matrixInsight.b.id),
                  )
          }
        />
      ) : null}

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
              const pressure = relationPressure(relation);
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
                      {` · давление ${pressure}/10`}
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
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Напряжение (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={draft.tension}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        tension: clampScore(Number(event.target.value)),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Доверие (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={draft.trust}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        trust: clampScore(Number(event.target.value)),
                      })
                    }
                  />
                </div>
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

function clampScore(value: number) {
  if (Number.isNaN(value)) return 3;
  return Math.min(5, Math.max(1, Math.round(value)));
}

function InsightCard({
  title,
  body,
  onEdit,
}: {
  title: string;
  body: string;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white/80 px-4 py-3 text-sm">
      <p className="font-medium text-[var(--ink)]">{title}</p>
      <p className="mt-1 leading-relaxed text-[var(--ink-muted)]">{body}</p>
      <Button className="mt-2" size="sm" variant="outline" onClick={onEdit}>
        Открыть связь
      </Button>
    </div>
  );
}

function RelationMatrix({
  project,
  highlightKeys,
  onSelectPair,
}: {
  project: Project;
  highlightKeys: string[];
  onSelectPair: (a: string, b: string) => void;
}) {
  const chars = project.characters;

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white/80">
      <table className="min-w-full border-collapse text-left text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-[#f7fafc] p-2 font-semibold text-[var(--ink)]">
              Кто → кого
            </th>
            {chars.map((character) => (
              <th key={character.id} className="max-w-[88px] p-2 font-medium text-[var(--ink)]">
                <span className="line-clamp-2">{character.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chars.map((row) => (
            <tr key={row.id} className="border-t border-[var(--line)]">
              <th className="sticky left-0 bg-[#f7fafc] p-2 font-medium text-[var(--ink)]">
                {row.name}
              </th>
              {chars.map((col) => {
                if (row.id === col.id) {
                  return (
                    <td key={col.id} className="bg-[var(--paper)]/60 p-2 text-center text-[var(--ink-muted)]">
                      —
                    </td>
                  );
                }
                const insight = pairInsight(project, row, col, highlightKeys);
                const pressure = insight.pressure;
                const tone =
                  pressure >= 8
                    ? "bg-[#fee2e2] text-[#991b1b]"
                    : pressure >= 5
                      ? "bg-[#ffedd5] text-[#9a3412]"
                      : pressure > 0
                        ? "bg-[#ecfdf5] text-[#065f46]"
                        : "bg-white text-[var(--ink-muted)]";
                return (
                  <td key={col.id} className="p-1">
                    <button
                      type="button"
                      className={`flex min-h-14 w-full flex-col items-start justify-center rounded-lg px-2 py-1 text-left ${tone}`}
                      onClick={() => onSelectPair(row.id, col.id)}
                    >
                      <span className="font-semibold">{pressure}/10</span>
                      <span className="line-clamp-2 text-[10px] leading-tight">
                        {insight.relation
                          ? insight.relation.label || RELATION_LABELS[insight.relation.kind]
                          : insight.conflicting[0]
                            ? "разлом"
                            : insight.shared[0]
                              ? "общее"
                              : "нет связи"}
                      </span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
