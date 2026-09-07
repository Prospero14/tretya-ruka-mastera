import { getSchema } from "./schemas";
import type { Project, SchemaField } from "./types";

export function getCharacterFields(project: Project): SchemaField[] {
  const base = getSchema(project.schemaId).characterFields;
  const custom = project.customCharacterFields || [];
  const seen = new Set(base.map((field) => field.key));
  return [...base, ...custom.filter((field) => !seen.has(field.key))];
}

export function getLocationFields(project: Project): SchemaField[] {
  const base = getSchema(project.schemaId).locationFields;
  const custom = project.customLocationFields || [];
  const seen = new Set(base.map((field) => field.key));
  return [...base, ...custom.filter((field) => !seen.has(field.key))];
}

export function slugifyFieldKey(label: string) {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return `custom_${base || "field"}_${Math.random().toString(36).slice(2, 6)}`;
}

export function googleImagesUrl(query: string) {
  const q = query.trim();
  if (!q) return "https://www.google.com/search?tbm=isch&q=reference";
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}`;
}
