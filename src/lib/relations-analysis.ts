import type { Character, Location, Project, Relation } from "./types";

/** Shared highlighted field values → affinity; opposing factions → friction. */
export function sharedFactors(
  a: Character,
  b: Character,
  highlightKeys: string[],
): { shared: string[]; conflicting: string[] } {
  const shared: string[] = [];
  const conflicting: string[] = [];

  for (const key of highlightKeys) {
    const left = (a.fields[key] || "").trim();
    const right = (b.fields[key] || "").trim();
    if (!left || !right) continue;
    if (left.toLowerCase() === right.toLowerCase()) {
      shared.push(`${key}:${left}`);
    } else {
      conflicting.push(`${key}:${left}≠${right}`);
    }
  }

  if (a.role === "protagonist" && b.role === "antagonist") {
    conflicting.push("роли:протагонист↔антагонист");
  }
  if (a.role === "antagonist" && b.role === "protagonist") {
    conflicting.push("роли:антагонист↔протагонист");
  }

  return { shared, conflicting };
}

export function relationPressure(relation: Relation): number {
  const kindWeight: Record<Relation["kind"], number> = {
    rival: 4,
    secret: 5,
    debt: 4,
    romance: 3,
    mentor: 2,
    family: 3,
    ally: 1,
    other: 2,
  };
  return Math.min(
    10,
    kindWeight[relation.kind] + relation.tension + (5 - relation.trust),
  );
}

export function findRelation(
  relations: Relation[],
  aId: string,
  bId: string,
): Relation | undefined {
  return relations.find(
    (item) =>
      (item.sourceId === aId && item.targetId === bId) ||
      (item.sourceId === bId && item.targetId === aId),
  );
}

export function pairInsight(
  project: Project,
  a: Character,
  b: Character,
  highlightKeys: string[],
) {
  const relation = findRelation(project.relations, a.id, b.id);
  const factors = sharedFactors(a, b, highlightKeys);
  const pressure = relation ? relationPressure(relation) : factors.conflicting.length * 2;

  return {
    relation,
    ...factors,
    pressure,
    summary: buildSummary(a, b, relation, factors, pressure),
  };
}

function buildSummary(
  a: Character,
  b: Character,
  relation: Relation | undefined,
  factors: { shared: string[]; conflicting: string[] },
  pressure: number,
): string {
  const parts: string[] = [];
  if (relation) {
    parts.push(
      `${a.name} → ${b.name}: ${relation.label || relation.kind}, напряжение ${relation.tension}/5, доверие ${relation.trust}/5.`,
    );
    if (relation.fromPerspective || relation.toPerspective) {
      parts.push(
        `Взгляды: «${relation.fromPerspective || "—"}» / «${relation.toPerspective || "—"}».`,
      );
    }
  } else {
    parts.push(`Прямой связи между ${a.name} и ${b.name} ещё нет.`);
  }
  if (factors.shared.length) {
    parts.push(`Общее: ${factors.shared.map(prettyFactor).join(", ")}.`);
  }
  if (factors.conflicting.length) {
    parts.push(`Разлом: ${factors.conflicting.map(prettyFactor).join(", ")}.`);
  }
  parts.push(`Давление пары: ${pressure}/10.`);
  return parts.join(" ");
}

function prettyFactor(raw: string) {
  const [key, value] = raw.split(":");
  return value ? `${labelKey(key)} ${value}` : raw;
}

function labelKey(key: string) {
  const map: Record<string, string> = {
    faction: "фракция",
    corp: "корп",
    class: "класс",
    race: "раса",
    affiliation: "принадлежность",
    order: "орден",
    district: "район",
    realm: "область",
    роли: "роли",
  };
  return map[key] || key;
}

export function emptyFieldsFor(keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((key) => [key, ""]));
}

export function ensureCharacterFields(
  character: Character,
  keys: string[],
): Character {
  const fields = { ...emptyFieldsFor(keys), ...character.fields };
  return { ...character, fields, refs: character.refs || [] };
}

export function ensureLocationFields(location: Location, keys: string[]): Location {
  const fields = { ...emptyFieldsFor(keys), ...location.fields };
  return { ...location, fields, refs: location.refs || [] };
}
