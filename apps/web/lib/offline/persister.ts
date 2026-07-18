import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import { del, get, set } from "idb-keyval";

export function createIdbPersister(key = "markme-rq"): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(key, client);
    },
    restoreClient: async () => {
      return (await get<PersistedClient>(key)) ?? undefined;
    },
    removeClient: async () => {
      await del(key);
    },
  };
}
