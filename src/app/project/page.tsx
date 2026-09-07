"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProjectWorkspace } from "@/components/project-workspace";

function ProjectInner() {
  const params = useSearchParams();
  const id = params.get("id") || "";
  return <ProjectWorkspace projectId={id} />;
}

export default function ProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--ink-muted)]">
          Открываем проект…
        </div>
      }
    >
      <ProjectInner />
    </Suspense>
  );
}
