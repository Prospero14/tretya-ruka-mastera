export type CharacterRole = "pc" | "npc" | "villain" | "patron" | "minor";

export type RelationKind =
  | "ally"
  | "rival"
  | "family"
  | "romance"
  | "mentor"
  | "secret"
  | "debt"
  | "faction"
  | "other";

export type FieldType = "text" | "select";

export interface SchemaField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  /** Show this value on relationship nodes / matrix */
  highlight?: boolean;
  /** User-created field on this project */
  custom?: boolean;
}

export interface ProjectSchema {
  id: string;
  name: string;
  description: string;
  characterFields: SchemaField[];
  locationFields: SchemaField[];
}

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  archetype: string;
  goal: string;
  flaw: string;
  exposition: string;
  notes: string;
  color: string;
  mapX: number;
  mapY: number;
  fields: Record<string, string>;
  refs: string[];
}

export interface Location {
  id: string;
  name: string;
  type: string;
  mood: string;
  description: string;
  exposition: string;
  fields: Record<string, string>;
  refs: string[];
}

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  kind: RelationKind;
  label: string;
  fromPerspective: string;
  toPerspective: string;
  tension: number;
  trust: number;
}

export interface ExpositionNote {
  id: string;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  logline: string;
  synopsis: string;
  format: string;
  schemaId: string;
  customCharacterFields: SchemaField[];
  customLocationFields: SchemaField[];
  createdAt: string;
  updatedAt: string;
  characters: Character[];
  locations: Location[];
  relations: Relation[];
  exposition: ExpositionNote[];
}

export interface ReminderState {
  shownAt: string[];
  snoozedUntil?: string;
}

export interface AppData {
  projects: Project[];
  version: number;
  reminders?: ReminderState;
}

export const ROLE_LABELS: Record<CharacterRole, string> = {
  pc: "Игрок (PC)",
  npc: "NPC",
  villain: "Антагонист",
  patron: "Патрон / квестгивер",
  minor: "Эпизод",
};

export const RELATION_LABELS: Record<RelationKind, string> = {
  ally: "Союз",
  rival: "Вражда",
  family: "Семья / род",
  romance: "Романтика",
  mentor: "Наставник",
  secret: "Тайна",
  debt: "Долг / рычаг",
  faction: "Одна фракция",
  other: "Другое",
};

export const RELATION_COLORS: Record<RelationKind, string> = {
  ally: "#0f766e",
  rival: "#b91c1c",
  family: "#1d4ed8",
  romance: "#be185d",
  mentor: "#a16207",
  secret: "#6d28d9",
  debt: "#c2410c",
  faction: "#0e7490",
  other: "#475569",
};

export const APP_DATA_VERSION = 4;

/** Migrate legacy screenplay roles → RPG roles */
export function normalizeRole(role: string): CharacterRole {
  switch (role) {
    case "pc":
    case "npc":
    case "villain":
    case "patron":
    case "minor":
      return role;
    case "protagonist":
      return "pc";
    case "antagonist":
      return "villain";
    case "supporting":
      return "npc";
    default:
      return "npc";
  }
}

export function normalizeRelationKind(kind: string): RelationKind {
  if (kind in RELATION_LABELS) return kind as RelationKind;
  return "other";
}
