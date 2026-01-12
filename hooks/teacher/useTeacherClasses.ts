
import { useCallback, useEffect } from 'react';
import { supabase } from '../../components/supabaseClient'; // Mudança aqui
import type { TeacherClass, AttendanceSession, Turno, User, Activity, ClassSummary, AttendanceStatus, ClassNotice } from '../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useTeacherClasses(user: User | null, addToast: (msg: string, type: any) => void) {
    const queryClient = useQueryClient();

    // --- 1. QUERY: Classes List (Migrado para Supabase) ---
    const { data: allClasses = [], isLoading: isLoadingClasses, refetch } = useQuery({
        queryKey: ['teacherClasses', user?.id],
        queryFn: async () => {
            if (!user) return [];
            
            // Busca turmas onde o usuário é o professor
            const { data: classesData, error } = await supabase
                .from('classes')
                .select(`
                    *,
                    class_enrollments ( count ),
                    class_notices ( * )
                `)
                .eq('teacher_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Erro ao buscar turmas:", error);
                throw error;
            }

            // Mapeia estrutura SQL para a Interface TypeScript existente
            const classes: TeacherClass[] = classesData.map((c: any) => {
                // Formata avisos
                const notices: ClassNotice[] = (c.class_notices || []).map((n: any) => ({
                    id: n.id,
                    text: n.text,
                    author: user.name, // O autor é sempre o professor nesta query
                    authorId: n.author_id,
                    timestamp: n.created_at
                })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                return {
                    id: c.id,
                    name: c.name,
                    code: c.code,
                    coverImageUrl: c.cover_image_url,
                    teacherId: c.teacher_id,
                    teachers: [c.teacher_id], // Compatibilidade com estrutura antiga
                    studentCount: c.class_enrollments?.[0]?.count || 0,
                    students: [], // Carregaremos alunos sob demanda para performance
                    notices: notices,
                    noticeCount: notices.length,
                    modules: [],
                    activities: [], 
                    isFullyLoaded: false, 
                    isSummaryOnly: false,
                    isArchived: c.is_archived || false,
                    subjects: { [c.teacher_id]: 'Regente' },
                    teacherNames: { [c.teacher_id]: user.name }
                } as TeacherClass;
            });

            return classes;
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 mins
    });

    const teacherClasses = allClasses.filter(c => !c.isArchived);
    const archivedClasses = allClasses.filter(c => c.isArchived);

    // --- 3. MUTATIONS (Migrado para Supabase) ---

    const createClassMutation = useMutation({
        mutationFn: async ({ name, coverImageUrl }: { name: string, coverImageUrl?: string }) => {
            if (!user) throw new Error("User not authenticated");
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            const { data, error } = await supabase
                .from('classes')
                .insert([
                    { 
                        name, 
                        teacher_id: user.id,
                        code,
                        cover_image_url: coverImageUrl,
                        is_archived: false
                    }
                ])
                .select()
                .single();

            if (error) throw error;
            return { success: true, id: data.id };
        },
        onSuccess: () => {
            addToast("Turma criada com sucesso!", "success");
            queryClient.invalidateQueries({ queryKey: ['teacherClasses'] });
        },
        onError: (err: any) => {
            console.error(err);
            addToast(`Erro ao criar turma: ${err.message}`, "error");
        }
    });

    const archiveClassMutation = useMutation({
        mutationFn: async (classId: string) => {
            const { error } = await supabase
                .from('classes')
                .update({ is_archived: true })
                .eq('id', classId);
            if (error) throw error;
        },
        onSuccess: () => {
            addToast("Turma arquivada!", "success");
            queryClient.invalidateQueries({ queryKey: ['teacherClasses'] });
        },
        onError: () => addToast("Erro ao arquivar.", "error")
    });

    const leaveClassMutation = useMutation({
        mutationFn: async (classId: string) => {
            // Em SQL, "sair" geralmente significa remover co-docência ou deletar a turma se for o dono
            // Implementação simplificada: apenas avisa que não é possível ainda
            throw new Error("Funcionalidade em migração.");
        },
        onSuccess: () => {
            // Nop
        },
        onError: () => addToast("Ação indisponível durante migração.", "info")
    });

    // --- 4. CLASS DETAILS (On-Demand) ---
    // Busca alunos e atividades quando entra na turma
    const fetchClassDetails = useCallback(async (classId: string) => {
        if (!user) return;
        try {
            // 1. Buscar Alunos
            const { data: enrollmentData } = await supabase
                .from('class_enrollments')
                .select(`
                    student_id,
                    users:student_id ( id, name, avatar_url, series )
                `)
                .eq('class_id', classId);

            const students = enrollmentData?.map((e: any) => ({
                id: e.users.id,
                name: e.users.name,
                avatarUrl: e.users.avatar_url,
                series: e.users.series,
                status: 'active'
            })) || [];

            // 2. Buscar Atividades (Ainda vamos criar a tabela activities, por enquanto retorna vazio ou mock)
            // TODO: Migrar tabela activities na próxima etapa
            const activities: Activity[] = []; 

            // 3. Buscar Chamadas (Attendance) - TODO: Migrar attendance_sessions
            // Por enquanto, mantemos vazio para não quebrar
            const sessions: AttendanceSession[] = [];

            // Atualiza cache local
            queryClient.setQueryData(['teacherClasses', user.id], (old: TeacherClass[] | undefined) => {
                if (!old) return old;
                return old.map(c => {
                    if (c.id === classId) {
                        return { 
                            ...c, 
                            students,
                            studentCount: students.length, // Atualiza contagem real
                            activities, 
                            isFullyLoaded: true 
                        };
                    }
                    return c;
                });
            });
            
            queryClient.setQueryData(['classSessions', classId], sessions);

        } catch (error) {
            console.error("Erro ao carregar detalhes da turma:", error);
        }
    }, [user, queryClient]);

    const getSessionsForClass = (classId: string) => {
        return queryClient.getQueryData<AttendanceSession[]>(['classSessions', classId]) || [];
    };

    const attendanceSessionsByClass = allClasses.reduce((acc, cls) => {
        acc[cls.id] = getSessionsForClass(cls.id);
        return acc;
    }, {} as Record<string, AttendanceSession[]>);


    // --- Attendance Logic (Placeholder) ---
    const createSessionMutation = useMutation({
        mutationFn: async ({ classId, date, turno, horario }: any) => {
            // TODO: Migrar para Tabela attendance_sessions
            return { id: 'temp', classId, date }; 
        },
        onSuccess: (newSession, variables) => {
            addToast("Chamada criada! (Dados não persistidos na migração)", "info");
        }
    });

    const updateAttendanceStatus = async (sessionId: string, recordId: string, status: AttendanceStatus) => {
        console.log("Update status pendente de migração");
    };

    const setTeacherClasses = useCallback((updater: any) => {
        queryClient.setQueryData(['teacherClasses', user?.id], (oldData: TeacherClass[] | undefined) => {
            if (!oldData) return [];
            return typeof updater === 'function' ? updater(oldData) : updater;
        });
    }, [queryClient, user?.id]);

    return {
        teacherClasses,
        archivedClasses,
        attendanceSessionsByClass,
        isLoadingClasses,
        isSubmittingClass: createClassMutation.isPending || archiveClassMutation.isPending,
        fetchTeacherClasses: async (force?: boolean) => { if (force) refetch(); },
        fetchClassDetails,
        handleCreateClass: (name: string, coverImageUrl?: string) => createClassMutation.mutateAsync({ name, coverImageUrl }),
        handleArchiveClass: archiveClassMutation.mutateAsync,
        handleLeaveClass: leaveClassMutation.mutateAsync,
        handleCreateAttendanceSession: (id: string, d: string, t: Turno, h: number) => createSessionMutation.mutateAsync({ classId: id, date: d, turno: t, horario: h }),
        handleUpdateAttendanceStatus: updateAttendanceStatus,
        setTeacherClasses
    };
}
