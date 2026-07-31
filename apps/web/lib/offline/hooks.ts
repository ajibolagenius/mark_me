"use client";

import { useCallback, useEffect, useState } from "react";
import { getOutbox } from "./storage";
import { isOffline } from "./outbox";
import type { OutboxEntry } from "./types";

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}

export function useOutboxEntries(): OutboxEntry[] {
  const [entries, setEntries] = useState<OutboxEntry[]>([]);

  const refresh = useCallback(async () => {
    setEntries(await getOutbox());
  }, []);

  useEffect(() => {
    void refresh();
    const onOutbox = () => void refresh();
    window.addEventListener("markme:outbox", onOutbox);
    window.addEventListener("online", onOutbox);
    window.addEventListener("focus", onOutbox);
    return () => {
      window.removeEventListener("markme:outbox", onOutbox);
      window.removeEventListener("online", onOutbox);
      window.removeEventListener("focus", onOutbox);
    };
  }, [refresh]);

  return entries;
}

export function useOutboxCount(): number {
  return useOutboxEntries().length;
}

export function useOutboxFailedCount(): number {
  return useOutboxEntries().filter((e) => e.status === "failed").length;
}

export function notifyOutboxChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("markme:outbox"));
  }
}

export { isOffline };
