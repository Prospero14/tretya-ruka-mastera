"use client";

import { useState } from "react";
import { ExternalLink, ImageIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { googleImagesUrl } from "@/lib/project-fields";

export function RefSearch({
  seedQuery,
  refs,
  onChange,
}: {
  seedQuery: string;
  refs: string[];
  onChange: (refs: string[]) => void;
}) {
  const [query, setQuery] = useState(seedQuery);
  const [link, setLink] = useState("");

  return (
    <div className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--paper)]/50 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
        <ImageIcon className="size-4" />
        Рефы (Google Картинки)
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Запрос: персонаж, локация, атмосфера…"
        />
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={() => {
            window.open(googleImagesUrl(query || seedQuery), "_blank", "noopener,noreferrer");
          }}
        >
          <ExternalLink className="size-4" />
          Искать
        </Button>
      </div>
      <p className="text-xs text-[var(--ink-muted)]">
        Откроется Google Images. Скопируйте ссылку на понравившееся изображение и сохраните ниже.
      </p>
      <div className="space-y-1.5">
        <Label>Добавить ссылку на реф</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="https://…"
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={!link.trim()}
            onClick={() => {
              const next = link.trim();
              if (!next || refs.includes(next)) return;
              onChange([...refs, next]);
              setLink("");
            }}
          >
            <Plus className="size-4" />
            Сохранить
          </Button>
        </div>
      </div>
      {refs.length ? (
        <ul className="space-y-1.5">
          {refs.map((ref) => (
            <li
              key={ref}
              className="flex items-center gap-2 rounded-lg bg-white/80 px-2 py-1.5 text-xs"
            >
              <a
                href={ref}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate text-[var(--ink)] underline-offset-2 hover:underline"
              >
                {ref}
              </a>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => onChange(refs.filter((item) => item !== ref))}
                aria-label="Удалить реф"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[var(--ink-muted)]">Пока нет сохранённых рефов.</p>
      )}
    </div>
  );
}
