"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createEmptyProject } from "@/lib/demo-data";
import { loadAppData, saveAppData, touchProject, uid } from "@/lib/storage";
import type {
  AppData,
  Character,
  ExpositionNote,
  Location,
  Project,
  Relation,
} from "@/lib/types";
import { APP_DATA_VERSION } from "@/lib/types";

interface StoreValue {
  ready: boolean;
  projects: Project[];
  createProject: (title: string, schemaId?: string) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
  upsertCharacter: (projectId: string, character: Character) => void;
  removeCharacter: (projectId: string, characterId: string) => void;
  upsertLocation: (projectId: string, location: Location) => void;
  removeLocation: (projectId: string, locationId: string) => void;
  upsertRelation: (projectId: string, relation: Relation) => void;
  removeRelation: (projectId: string, relationId: string) => void;
  upsertExposition: (projectId: string, note: ExpositionNote) => void;
  removeExposition: (projectId: string, noteId: string) => void;
  newId: typeof uid;
}

const StoreContext = createContext<StoreValue | null>(null);

function mutateProject(
  data: AppData,
  projectId: string,
  mutate: (project: Project) => Project,
): AppData {
  return {
    ...data,
    projects: data.projects.map((project) =>
      project.id === projectId ? touchProject(mutate(project)) : project,
    ),
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({
    version: APP_DATA_VERSION,
    projects: [],
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadAppData());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveAppData(data);
  }, [data, ready]);

  const createProject = useCallback((title: string, schemaId = "blank") => {
    const project = createEmptyProject(title.trim() || "Новый проект", schemaId);
    setData((prev) => ({ ...prev, projects: [project, ...prev.projects] }));
    return project;
  }, []);

  const updateProject = useCallback((project: Project) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === project.id ? touchProject(project) : item,
      ),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== id),
    }));
  }, []);

  const getProject = useCallback(
    (id: string) => data.projects.find((project) => project.id === id),
    [data.projects],
  );

  const upsertCharacter = useCallback(
    (projectId: string, character: Character) => {
      setData((prev) =>
        mutateProject(prev, projectId, (project) => {
          const exists = project.characters.some((item) => item.id === character.id);
          return {
            ...project,
            characters: exists
              ? project.characters.map((item) =>
                  item.id === character.id ? character : item,
                )
              : [...project.characters, character],
          };
        }),
      );
    },
    [],
  );

  const removeCharacter = useCallback((projectId: string, characterId: string) => {
    setData((prev) =>
      mutateProject(prev, projectId, (project) => ({
        ...project,
        characters: project.characters.filter((item) => item.id !== characterId),
        relations: project.relations.filter(
          (item) => item.sourceId !== characterId && item.targetId !== characterId,
        ),
      })),
    );
  }, []);

  const upsertLocation = useCallback((projectId: string, location: Location) => {
    setData((prev) =>
      mutateProject(prev, projectId, (project) => {
        const exists = project.locations.some((item) => item.id === location.id);
        return {
          ...project,
          locations: exists
            ? project.locations.map((item) =>
                item.id === location.id ? location : item,
              )
            : [...project.locations, location],
        };
      }),
    );
  }, []);

  const removeLocation = useCallback((projectId: string, locationId: string) => {
    setData((prev) =>
      mutateProject(prev, projectId, (project) => ({
        ...project,
        locations: project.locations.filter((item) => item.id !== locationId),
      })),
    );
  }, []);

  const upsertRelation = useCallback((projectId: string, relation: Relation) => {
    setData((prev) =>
      mutateProject(prev, projectId, (project) => {
        const exists = project.relations.some((item) => item.id === relation.id);
        return {
          ...project,
          relations: exists
            ? project.relations.map((item) =>
                item.id === relation.id ? relation : item,
              )
            : [...project.relations, relation],
        };
      }),
    );
  }, []);

  const removeRelation = useCallback((projectId: string, relationId: string) => {
    setData((prev) =>
      mutateProject(prev, projectId, (project) => ({
        ...project,
        relations: project.relations.filter((item) => item.id !== relationId),
      })),
    );
  }, []);

  const upsertExposition = useCallback(
    (projectId: string, note: ExpositionNote) => {
      setData((prev) =>
        mutateProject(prev, projectId, (project) => {
          const exists = project.exposition.some((item) => item.id === note.id);
          return {
            ...project,
            exposition: exists
              ? project.exposition.map((item) => (item.id === note.id ? note : item))
              : [note, ...project.exposition],
          };
        }),
      );
    },
    [],
  );

  const removeExposition = useCallback((projectId: string, noteId: string) => {
    setData((prev) =>
      mutateProject(prev, projectId, (project) => ({
        ...project,
        exposition: project.exposition.filter((item) => item.id !== noteId),
      })),
    );
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      projects: data.projects,
      createProject,
      updateProject,
      deleteProject,
      getProject,
      upsertCharacter,
      removeCharacter,
      upsertLocation,
      removeLocation,
      upsertRelation,
      removeRelation,
      upsertExposition,
      removeExposition,
      newId: uid,
    }),
    [
      ready,
      data.projects,
      createProject,
      updateProject,
      deleteProject,
      getProject,
      upsertCharacter,
      removeCharacter,
      upsertLocation,
      removeLocation,
      upsertRelation,
      removeRelation,
      upsertExposition,
      removeExposition,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
