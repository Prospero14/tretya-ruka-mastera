import { createCyberpunkDemo, createDemoProject } from "./demo-data";
import { getSchema } from "./schemas";
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

const STORAGE_KEY = "syuzhetnik.v2";

function migrateProject(raw: Project): Project {
  const schema = getSchema(raw.schemaId || "noir");
  const charKeys = schema.characterFields.map((field) => field.key);
  const locKeys = schema.locationFields.map((field) => field.key);

  return {
    ...raw,
    schemaId: schema.id,
    characters: (raw.characters || []).map((character) =>
      ensureCharacterFields(
        {
          ...character,
          fields: character.fields || {},
        },
        charKeys,
      ),
    ),
    locations: (raw.locations || []).map((location) =>
      ensureLocationFields(
        {
          ...location,
          fields: location.fields || {},
        },
        locKeys,
      ),
    ),
    relations: (raw.relations || []).map((relation: Relation) => ({
      ...relation,
      tension: relation.tension ?? 3,
      trust: relation.trust ?? 3,
    })),
    exposition: raw.exposition || [],
  };
}

function seedData(): AppData {
  return {
    version: APP_DATA_VERSION,
    projects: [createDemoProject(), createCyberpunkDemo()],
  };
}

export function loadAppData(): AppData {
  if (typeof window === "undefined") {
    return { version: APP_DATA_VERSION, projects: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
