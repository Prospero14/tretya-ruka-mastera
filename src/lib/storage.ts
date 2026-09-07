import { createCyberpunkDemo, createDemoProject } from "./demo-data";
import { getCharacterFields, getLocationFields } from "./project-fields";
import {
  ensureCharacterFields,
  ensureLocationFields,
} from "./relations-analysis";
import {
  APP_DATA_VERSION,
  type AppData,
  type Project,
  type Relation,
} from "./types";

const STORAGE_KEY = "syuzhetnik.v3";

function migrateProject(raw: Project): Project {
  const project: Project = {
    ...raw,
    synopsis: raw.synopsis ?? "",
    customCharacterFields: raw.customCharacterFields || [],
    customLocationFields: raw.customLocationFields || [],
    schemaId: raw.schemaId || "noir",
    characters: raw.characters || [],
    locations: raw.locations || [],
    relations: raw.relations || [],
    exposition: raw.exposition || [],
  };

  const charKeys = getCharacterFields(project).map((field) => field.key);
  const locKeys = getLocationFields(project).map((field) => field.key);

  return {
    ...project,
    characters: project.characters.map((character) =>
      ensureCharacterFields(
        {
          ...character,
          fields: character.fields || {},
          refs: character.refs || [],
        },
        charKeys,
      ),
    ),
    locations: project.locations.map((location) =>
      ensureLocationFields(
        {
          ...location,
          fields: location.fields || {},
          refs: location.refs || [],
        },
        locKeys,
      ),
    ),
    relations: project.relations.map((relation: Relation) => ({
      ...relation,
      tension: relation.tension ?? 3,
      trust: relation.trust ?? 3,
    })),
  };
}

function seedData(): AppData {
  return {
    version: APP_DATA_VERSION,
    projects: [createDemoProject(), createCyberpunkDemo()],
    reminders: { shownAt: [] },
  };
}

export function loadAppData(): AppData {
  if (typeof window === "undefined") {
    return { version: APP_DATA_VERSION, projects: [], reminders: { shownAt: [] } };
  }

  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem("syuzhetnik.v2");
    if (!raw) {
      const seed = seedData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.projects?.length) {
      const seed = seedData();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return {
      version: APP_DATA_VERSION,
      projects: parsed.projects.map(migrateProject),
      reminders: parsed.reminders || { shownAt: [] },
    };
  } catch {
    return seedData();
  }
}

export function saveAppData(data: AppData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...data, version: APP_DATA_VERSION }),
  );
}

export function touchProject(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() };
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
