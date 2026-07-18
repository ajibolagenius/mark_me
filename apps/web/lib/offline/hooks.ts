"use client";

import { useCallback, useEffect, useState } from "react";
import { getOutbox } from "./storage";
import { isOffline } from "./outbox";

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

export function useOutboxCount(): number {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const entries = await getOutbox();
    setCount(entries.length);
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

  return count;
}

export function notifyOutboxChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("markme:outbox"));
  }
}

export { isOffline };
