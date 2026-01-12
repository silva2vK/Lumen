
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../components/supabaseClient';
import type { Activity, ActivitySubmission } from '../../types';
import { createNotification } from '../../utils/createNotification';
// import { recalculateStudentGradeSummary } from '../../utils/gradingUtils'; // TODO: Migrar para SQL View/Function

interface GradeMutationParams {
    studentId: string;
    grade: number;
    feedback: string;
    scores?: Record<string, number>;
}

export function useTeacherGrading(activityId: string | undefined, user: any) {
    const queryClient = useQueryClient();

    // 1. Fetch Activity Details
    const activityQuery = useQuery({
        queryKey: ['activity', activityId],
        queryFn: async () => {
            if (!activityId) throw new Error("No activity ID");
            
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('id', activityId)
                .single();

            if (error) throw error;
            return { 
                id: data.id, 
                ...data,
                // Maps snake_case to camelCase needed by UI
                visualSourceData: data.visual_source_data,
                conceptConnectionData: data.concept_connection_data,
                advanceOrganizerData: data.advance_organizer_data,
                progressiveTreeData: data.progressive_tree_data,
                integrativeData: data.integrative_data
            } as Activity;
        },
        enabled: !!activityId
    });

    // 2. Fetch Submissions (Supabase)
    const submissionsQuery = useQuery({
        queryKey: ['activitySubmissions', activityId],
        queryFn: async () => {
            if (!activityId) return [];
            
            const { data, error } = await supabase
                .from('activity_submissions')
                .select(`
                    *,
                    student:users!student_id (name, avatar_url, series)
                `)
                .eq('activity_id', activityId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            return data.map((sub: any) => ({
                studentId: sub.student_id,
                studentName: sub.student?.name || 'Aluno',
                studentAvatarUrl: sub.student?.avatar_url,
                submissionDate: sub.created_at,
                content: JSON.stringify(sub.content), // UI espera string
                status: sub.status,
                grade: sub.grade,
                feedback: sub.feedback,
                gradedAt: sub.graded_at
            } as ActivitySubmission));
        },
        enabled: !!activityId
    });

    // 3. Grade Mutation (Supabase)
    const gradeMutation = useMutation({
        mutationFn: async ({ studentId, grade, feedback }: GradeMutationParams) => {
            if (!activityId || !user) throw new Error("Context missing");
            
            const { error } = await supabase
                .from('activity_submissions')
                .update({
                    status: 'Corrigido',
                    grade: grade,
                    feedback: feedback,
                    graded_at: new Date().toISOString()
                })
                .eq('activity_id', activityId)
                .eq('student_id', studentId);

            if (error) throw error;

            // TODO: Award XP via Gamification (SQL Function or Edge Function preferred)
            
            // TODO: Notification via Realtime or Edge Function
            
            return { studentId, grade, feedback };
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['activitySubmissions', activityId], (old: ActivitySubmission[] | undefined) => {
                if (!old) return [];
                return old.map(s => s.studentId === data.studentId ? { ...s, ...data, status: 'Corrigido', gradedAt: new Date().toISOString() } : s);
            });
            // Update counts? 
            queryClient.invalidateQueries({ queryKey: ['pendingActivities'] });
        }
    });

    return {
        activity: activityQuery.data,
        submissions: submissionsQuery.data || [],
        answerKey: null, // TODO: Migrar lógica de Quiz Answer Key se necessário
        isLoading: activityQuery.isLoading || submissionsQuery.isLoading,
        gradeMutation
    };
}
