export type CharacterRole =
  | "protagonist"
  | "antagonist"
  | "supporting"
  | "minor";

export type RelationKind =
  | "ally"
  | "rival"
  | "family"
  | "romance"
  | "mentor"
  | "secret"
  | "debt"
  | "other";

export type FieldType = "text" | "select";

export interface SchemaField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  /** Show this value on map nodes / matrix */
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
  /** Genre-specific / custom values keyed by field key */
  fields: Record<string, string>;
  /** Visual / research reference links */
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
  /** Tension 1–5: how hard this bond presses the plot */
  tension: number;
  /** Trust 1–5 from source toward target */
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
  /** Short synopsis shown first in the project */
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
  /** ISO dates of shown reminders today */
  shownAt: string[];
  snoozedUntil?: string;
}

export interface AppData {
  projects: Project[];
  version: number;
  reminders?: ReminderState;
}

export const ROLE_LABELS: Record<CharacterRole, string> = {
  protagonist: "Протагонист",
  antagonist: "Антагонист",
  supporting: "Второй план",
  minor: "Эпизод",
};

export const RELATION_LABELS: Record<RelationKind, string> = {
  ally: "Союз",
  rival: "Соперничество",
  family: "Семья",
  romance: "Романтика",
  mentor: "Наставник",
  secret: "Тайна",
  debt: "Долг",
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
  other: "#475569",
};

export const APP_DATA_VERSION = 3;
