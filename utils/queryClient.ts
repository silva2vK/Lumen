
import { QueryClient } from '@tanstack/react-query';
import { createIDBPersister } from './queryPersister';

// Setup React Query Client with Persistence
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0, // Always check for fresh data (Stale-While-Revalidate)
            gcTime: 1000 * 60 * 60 * 24, // Keep data in garbage collection for 24 hours for offline usage
            retry: 1,
            refetchOnWindowFocus: true, // Refetch when returning to the app
            networkMode: 'offlineFirst',
        },
    },
});

export const persister = createIDBPersister();
