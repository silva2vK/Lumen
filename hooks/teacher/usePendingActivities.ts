
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../components/firebaseClient';
import type { Activity, PendingActivity } from '../../types';

export function usePendingActivities(userId: string | undefined) {
    return useQuery({
        queryKey: ['pendingActivities', userId],
        queryFn: async () => {
            if (!userId) return [];

            const qPending = query(
                collection(db, "activities"), 
                where("creatorId", "==", userId),
                where("status", "==", "Pendente")
            );
            
            const snapPending = await getDocs(qPending);
            
            const loadedPendingList: PendingActivity[] = [];
            
            snapPending.docs.forEach(d => {
                const data = d.data();
                // Ensure we trust the counter, but fallback to 0 if missing
                const pendingCount = data.pendingSubmissionCount || 0;
                
                // Only add if there are actual pending items
                if (pendingCount > 0) {
                    loadedPendingList.push({
                        id: d.id,
                        title: data.title,
                        className: data.className || 'Turma desconhecida',
                        classId: data.classId,
                        pendingCount
                    });
                }
            });

            return loadedPendingList;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes fresh
    });
}
