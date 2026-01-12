
import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '../components/supabaseClient';
import { useToast } from '../contexts/ToastContext';
import type { Module, Quiz, Activity, TeacherClass, User, ActivitySubmission } from '../types';
// import { processGamificationEvent } from '../utils/gamificationEngine'; // TODO: Migrar GamificationEngine
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { createNotification } from '../utils/createNotification'; // TODO: Migrar Notifications
import { SearchEngine } from '../utils/search';

export function useStudentContent(user: User | null) {
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    
    // UI State
    const [searchedModules, setSearchedModules] = useState<Module[]>([]);
    const [searchedQuizzes, setSearchedQuizzes] = useState<Quiz[]>([]);
    const [isSearchingQuizzes, setIsSearchingQuizzes] = useState(false);
    const [isSearchingModules, setIsSearchingModules] = useState(false);
    const [moduleFilters, setModuleFilters] = useState({ queryText: '', serie: 'all', materia: 'all', status: 'all', scope: 'my_modules' as 'my_modules' | 'public' });

    const isStudent = user?.role === 'aluno';

    // --- 1. QUERY: Minhas Turmas ---
    const { data: rawStudentClasses, isLoading: isLoadingClasses } = useQuery({
        queryKey: ['studentClasses', user?.id],
        queryFn: async () => {
            if (!user) return [];
            
            // Join classes via tabela de matriculas
            const { data, error } = await supabase
                .from('class_enrollments')
                .select(`
                    class:classes (
                        id, name, code, cover_image_url, teacher_id
                    )
                `)
                .eq('student_id', user.id);

            if (error) throw error;

            return data.map((item: any) => ({
                id: item.class.id,
                name: item.class.name,
                code: item.class.code,
                coverImageUrl: item.class.cover_image_url,
                teacherId: item.class.teacher_id,
                // Campos calculados/placeholders
                studentCount: 0,
                students: [],
                activities: [],
                modules: []
            } as TeacherClass));
        },
        enabled: isStudent && !!user,
    });
    const studentClasses = useMemo(() => rawStudentClasses || [], [rawStudentClasses]);

    // --- 2. QUERY: Progresso nos Módulos ---
    const { data: rawInProgressModules, isLoading: isLoadingProgress } = useQuery({
        queryKey: ['studentModulesProgress', user?.id],
        queryFn: async () => {
            if (!user) return [];
            
            const { data, error } = await supabase
                .from('student_module_progress')
                .select(`
                    progress, status,
                    module:modules (*)
                `)
                .eq('student_id', user.id);

            if (error) throw error;

            return data.map((item: any) => ({
                id: item.module.id,
                ...item.module, // Spread module metadata
                coverImageUrl: item.module.cover_image_url,
                progress: item.progress
            } as Module));
        },
        enabled: isStudent && !!user,
    });
    const inProgressModules = useMemo(() => rawInProgressModules || [], [rawInProgressModules]);

    // --- 3. QUERY: Todos os Módulos (Biblioteca) ---
    const { data: allAvailableModules = [] } = useQuery({
        queryKey: ['allStudentModules', user?.id],
        queryFn: async () => {
            // Busca módulos públicos
            const { data, error } = await supabase
                .from('modules')
                .select('*')
                .eq('status', 'Ativo')
                .eq('visibility', 'public');

            if (error) throw error;

            return data.map((d: any) => ({
                id: d.id,
                ...d,
                coverImageUrl: d.cover_image_url
            } as Module));
        },
        enabled: isStudent && !!user,
        staleTime: 1000 * 60 * 30 
    });

    // Initialize Search Engine
    const searchEngine = useMemo(() => {
        return new SearchEngine<Module>(allAvailableModules, ['title', 'description', 'materia', 'series']);
    }, [allAvailableModules]);

    // --- 4. QUERY: Submissões do Aluno ---
    const { data: rawUserSubmissions, isLoading: isLoadingSubmissions } = useQuery({
        queryKey: ['studentSubmissions', user?.id],
        queryFn: async () => {
            if (!user) return {};
            
            const { data, error } = await supabase
                .from('activity_submissions')
                .select('*')
                .eq('student_id', user.id);

            if (error) throw error;

            const subsMap: Record<string, ActivitySubmission> = {};
            data.forEach((sub: any) => {
                subsMap[sub.activity_id] = {
                    studentId: sub.student_id,
                    studentName: user.name,
                    submissionDate: sub.created_at,
                    content: JSON.stringify(sub.content), // Normaliza para string JSON se necessário
                    status: sub.status,
                    grade: sub.grade,
                    feedback: sub.feedback
                };
            });
            return subsMap;
        },
        enabled: isStudent && !!user,
    });
    const userSubmissions = useMemo(() => rawUserSubmissions || {}, [rawUserSubmissions]);

    // --- MUTATIONS ---

    const submitActivityMutation = useMutation({
        mutationFn: async ({ activityId, content }: { activityId: string, content: string }) => {
            if (!user) throw new Error("Auth required");

            const payload = {
                activity_id: activityId,
                student_id: user.id,
                content: JSON.parse(content), // Supabase armazena JSONB nativo
                status: 'Aguardando correção',
                created_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('activity_submissions')
                .upsert(payload, { onConflict: 'activity_id,student_id' });

            if (error) throw error;
            
            return { success: true };
        },
        onSuccess: () => {
            addToast("Respostas enviadas! Aguarde a correção.", "success");
            queryClient.invalidateQueries({ queryKey: ['studentSubmissions'] });
        },
        onError: (error: any) => addToast("Erro ao enviar: " + error.message, "error")
    });

    // --- Handlers ---

    const handleActivitySubmit = async (activityId: string, content: string) => {
        try { await submitActivityMutation.mutateAsync({ activityId, content }); } catch {}
    };

    const searchModules = useCallback(async (filters: any) => {
        setIsSearchingModules(true);
        setModuleFilters(filters);

        let source: Module[] = [];
        
        if (filters.scope === 'my_modules') {
            source = [...inProgressModules]; 
        } else {
            source = allAvailableModules;
        }

        let results = source;

        if (filters.queryText) {
            if (filters.scope === 'public') {
                results = searchEngine.search(filters.queryText);
            } else {
                const q = filters.queryText.toLowerCase();
                results = results.filter(m => 
                    m.title.toLowerCase().includes(q) || 
                    m.description.toLowerCase().includes(q)
                );
            }
        }

        if (filters.materia && filters.materia !== 'all') {
            results = results.filter(m => {
                const mat = Array.isArray(m.materia) ? m.materia : [m.materia];
                return mat.some(s => s && s.toLowerCase() === filters.materia.toLowerCase());
            });
        }

        if (filters.serie && filters.serie !== 'all') {
            results = results.filter(m => {
                const ser = Array.isArray(m.series) ? m.series : [m.series];
                return ser.some(s => s && s.toLowerCase() === filters.serie.toLowerCase());
            });
        }

        if (filters.status && filters.status !== 'all') {
            results = results.filter(m => {
                const p = m.progress || 0;
                if (filters.status === 'completed') return p === 100;
                if (filters.status === 'in_progress') return p > 0 && p < 100;
                if (filters.status === 'not_started') return p === 0;
                return true;
            });
        }
        
        setTimeout(() => {
            setSearchedModules(results);
            setIsSearchingModules(false);
        }, 50);
    }, [searchEngine, allAvailableModules, inProgressModules]);

    const searchQuizzes = useCallback(async (filters: any) => {
        if (!user) return;
        setIsSearchingQuizzes(true);
        setSearchedQuizzes([]);
        // TODO: Migrar busca de quizzes do Supabase na próxima etapa
        setIsSearchingQuizzes(false);
    }, [user]);

    const handleJoinClass = async (code: string) => {
        if (!user) return false;
        try {
            // 1. Find Class by Code
            const { data: classes, error: findError } = await supabase
                .from('classes')
                .select('id, name')
                .eq('code', code)
                .single();

            if (findError || !classes) {
                addToast("Código inválido ou turma não encontrada.", "error");
                return false;
            }

            // 2. Insert Enrollment
            const { error: enrollError } = await supabase
                .from('class_enrollments')
                .insert([{ class_id: classes.id, student_id: user.id }]);

            if (enrollError) {
                if (enrollError.code === '23505') { // Unique violation
                    addToast("Você já está nesta turma.", "info");
                } else {
                    addToast("Erro ao entrar na turma.", "error");
                }
                return false;
            }

            addToast(`Bem-vindo à turma ${classes.name}!`, "success");
            queryClient.invalidateQueries({ queryKey: ['studentClasses'] });
            return true;
        } catch (error: any) {
            console.error(error);
            addToast("Erro ao entrar na turma.", "error");
            return false;
        }
    };

    const handleLeaveClass = async (classId: string) => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('class_enrollments')
                .delete()
                .eq('class_id', classId)
                .eq('student_id', user.id);

            if (error) throw error;
            
            addToast("Você saiu da turma.", "success");
            queryClient.invalidateQueries({ queryKey: ['studentClasses'] });
        } catch (error) {
            console.error(error);
            addToast("Erro ao sair da turma.", "error");
        }
    };

    const handleModuleProgressUpdate = async (moduleId: string, progress: number) => {
        if (!user) return;
        try {
            const status = progress === 100 ? 'Concluído' : 'Em andamento';
            const { error } = await supabase
                .from('student_module_progress')
                .upsert({
                    student_id: user.id,
                    module_id: moduleId,
                    progress,
                    status,
                    last_updated: new Date().toISOString(),
                    completed_at: progress === 100 ? new Date().toISOString() : null
                });

            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['studentModulesProgress'] });
        } catch (error) {
            console.error(error);
        }
    };
    
    const handleModuleComplete = async (moduleId: string) => {
        await handleModuleProgressUpdate(moduleId, 100);
        addToast("Módulo concluído!", "success");
        // TODO: Trigger gamification event
    };

    return {
        studentClasses, inProgressModules, userSubmissions, searchedModules, searchedQuizzes, moduleFilters,
        isLoading: isLoadingClasses || isLoadingProgress, isSearchingQuizzes, isSearchingModules,
        refreshContent: async () => { queryClient.invalidateQueries() },
        searchModules, searchQuizzes, searchActivities: async () => ({ activities: [], lastDoc: null }),
        handleActivitySubmit, handleJoinClass, handleLeaveClass, handleModuleProgressUpdate, handleModuleComplete,
        setSearchedQuizzes, setSearchedModules
    };
}
