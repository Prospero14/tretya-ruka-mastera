import { createDemoProject } from "./demo-data";
import type { AppData, Project } from "./types";

const STORAGE_KEY = "syuzhetnik.v1";

export function loadAppData(): AppData {
  if (typeof window === "undefined") {
    return { projects: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed: AppData = { projects: [createDemoProject()] };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed.projects?.length) {
      const seed: AppData = { projects: [createDemoProject()] };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return { projects: [createDemoProject()] };
  }
}

export function saveAppData(data: AppData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function touchProject(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() };
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
