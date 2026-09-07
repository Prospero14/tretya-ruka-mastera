"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { findAllGaps, shouldShowReminder } from "@/lib/gaps";
import { APP_DATA_VERSION } from "@/lib/types";

export function ReminderPopup() {
  const { ready, projects, reminders, markReminderShown, snoozeReminders } = useStore();
  const [open, setOpen] = useState(false);

  const gaps = useMemo(
    () => findAllGaps({ version: APP_DATA_VERSION, projects }),
    [projects],
  );
  const topGaps = gaps.slice(0, 4);

  useEffect(() => {
    if (!ready || gaps.length === 0) return;
    const timer = window.setTimeout(() => {
      if (shouldShowReminder(reminders.shownAt, new Date(), reminders.snoozedUntil)) {
        setOpen(true);
        markReminderShown();
      }
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [gaps.length, markReminderShown, ready, reminders.shownAt, reminders.snoozedUntil]);

  if (!topGaps.length) return null;

  const primary = topGaps[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Недописанные сюжеты</DialogTitle>
          <DialogDescription>
            Короткое напоминание — в проектах остались дыры. Можно закрыть и вернуться позже.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {topGaps.map((gap) => (
            <li
              key={gap.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <p className="font-medium text-[var(--ink)]">{gap.projectTitle}</p>
              <p className="text-[var(--ink-muted)]">{gap.label}</p>
            </li>
          ))}
        </ul>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => {
              snoozeReminders(6);
              setOpen(false);
            }}
          >
            Не сегодня
          </Button>
          <Button
            className="bg-[var(--signal)] text-white hover:bg-[var(--signal-strong)]"
            onClick={() => {
              setOpen(false);
              window.location.href = `/project/?id=${primary.projectId}`;
            }}
          >
            Открыть «{primary.projectTitle}»
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
