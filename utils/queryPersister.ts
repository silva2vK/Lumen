
import { get, set, del } from 'idb-keyval';
import { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

/**
 * Creates an IndexedDB persister for React Query using idb-keyval.
 * This saves the query cache to the browser's IndexedDB, allowing for offline persistence.
 */
export const createIDBPersister = (idbValidKey: string = "reactQuery"): Persister => {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        await set(idbValidKey, client);
      } catch (error) {
        console.error('Failed to persist query client:', error);
      }
    },
    restoreClient: async () => {
      try {
        return await get<PersistedClient>(idbValidKey);
      } catch (error) {
        console.error('Failed to restore query client:', error);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await del(idbValidKey);
      } catch (error) {
        console.error('Failed to remove query client:', error);
      }
    },
  };
};
