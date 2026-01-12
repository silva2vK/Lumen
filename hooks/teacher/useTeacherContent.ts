
import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../../components/supabaseClient';
import type { Module, Activity, TeacherClass } from '../../types';
import { useQueryClient } from '@tanstack/react-query';

export function useTeacherContent(
    user: any, 
    addToast: (msg: string, type: any) => void,
    setTeacherClasses: React.Dispatch<React.SetStateAction<TeacherClass[]>>,
    teacherClasses: TeacherClass[]
) {
    const [modules, setModules] = useState<Module[]>([]);
    const [draftActivities, setDraftActivities] = useState<Activity[]>([]);
    const [draftModules, setDraftModules] = useState<Module[]>([]);
    const [isLoadingContent, setIsLoadingContent] = useState(true);
    const [isSubmittingContent, setIsSubmittingContent] = useState(false);
    const [modulesLibraryLoaded, setModulesLibraryLoaded] = useState(false);

    const fetchTeacherContent = useCallback(async (forceRefresh = false) => {
        if (!user) return;
        setIsLoadingContent(true);

        try {
            // 1. Buscar Rascunhos de Atividades
            const { data: draftsData } = await supabase
                .from('activities')
                .select('*')
                .eq('creator_id', user.id)
                .eq('status', 'Rascunho');

            const drafts = (draftsData || []).map((d: any) => ({
                id: d.id,
                ...d,
                // Mapeia colunas snake_case para camelCase se necessário, ou ajusta types
                visualSourceData: d.visual_source_data,
                conceptConnectionData: d.concept_connection_data,
                advanceOrganizerData: d.advance_organizer_data,
                progressiveTreeData: d.progressive_tree_data,
                integrativeData: d.integrative_data,
                createdAt: d.created_at
            } as Activity));
            setDraftActivities(drafts);

            // 2. Buscar Rascunhos de Módulos
            const { data: modDraftsData } = await supabase
                .from('modules')
                .select('*')
                .eq('creator_id', user.id)
                .eq('status', 'Rascunho');

            const modDrafts = (modDraftsData || []).map((d: any) => ({
                id: d.id,
                ...d,
                coverImageUrl: d.cover_image_url,
                videoUrl: d.video_url,
                historicalYear: d.historical_year,
                historicalEra: d.historical_era,
                date: d.created_at
            } as Module));
            setDraftModules(modDrafts);

        } catch (error: any) {
            console.warn("Erro ao carregar conteúdo:", error);
        } finally {
            setIsLoadingContent(false);
        }

    }, [user]);

    useEffect(() => {
        if (user) {
            fetchTeacherContent();
        }
    }, [user, fetchTeacherContent]);

    const fetchModulesLibrary = useCallback(async () => {
        if (modulesLibraryLoaded || !user) return;
        try {
            const { data } = await supabase
                .from('modules')
                .select('*')
                .eq('status', 'Ativo')
                .or(`visibility.eq.public,creator_id.eq.${user.id}`);

            const fetchedModules = (data || []).map((d: any) => ({
                id: d.id,
                ...d,
                coverImageUrl: d.cover_image_url,
                videoUrl: d.video_url,
                historicalYear: d.historical_year,
                historicalEra: d.historical_era
            } as Module));
            
            setModules(fetchedModules);
            setModulesLibraryLoaded(true);
        } catch (error) {
            console.error("Error loading modules library:", error);
            setModules([]);
        }
    }, [modulesLibraryLoaded, user]);

    // --- Actions ---

    const handleSaveActivity = useCallback(async (activity: Omit<Activity, 'id'>, isDraft: boolean = false) => {
        if (!user) return false;
        setIsSubmittingContent(true);
        try {
            const status = isDraft ? "Rascunho" : "Pendente";
            
            // Prepare payload converting camelCase to snake_case for Postgres
            const payload = {
                title: activity.title,
                description: activity.description,
                type: activity.type,
                points: activity.points,
                materia: activity.materia,
                unidade: activity.unidade,
                class_id: activity.classId || null,
                due_date: activity.dueDate || null,
                allow_file_upload: activity.allowFileUpload,
                status: status,
                items: activity.items,
                visual_source_data: activity.visualSourceData,
                concept_connection_data: activity.conceptConnectionData,
                advance_organizer_data: activity.advanceOrganizerData,
                progressive_tree_data: activity.progressiveTreeData,
                integrative_data: activity.integrativeData,
                creator_id: user.id
            };

            const { data, error } = await supabase
                .from('activities')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            if (isDraft) {
                const newDraft = { id: data.id, ...activity, status, createdAt: new Date().toISOString() } as Activity;
                setDraftActivities(prev => [newDraft, ...prev]);
                addToast("Atividade salva como rascunho!", "success");
            } else {
                if (activity.classId) {
                    // TODO: Migrar tabela de broadcasts/notices
                    // Por enquanto, apenas logamos
                    console.log("Broadcast de atividade pendente de migração completa");
                }
                addToast("Atividade publicada com sucesso!", "success");
                fetchTeacherContent(true);
            }
            return true;
        } catch (error: any) { 
            console.error(error); 
            addToast(`Erro ao criar atividade: ${error.message}`, "error"); 
            return false; 
        } finally {
            setIsSubmittingContent(false);
        }
    }, [user, addToast, fetchTeacherContent]);

    const handleUpdateActivity = useCallback(async (activityId: string, activityData: Partial<Activity>, isDraft: boolean = false) => {
        if (!user) return false;
        setIsSubmittingContent(true);
        try {
            const status = isDraft ? "Rascunho" : "Pendente";
            
            const payload: any = {
                title: activityData.title,
                description: activityData.description,
                points: activityData.points,
                status: status
            };
            // Add optional fields if present
            if (activityData.type) payload.type = activityData.type;
            if (activityData.visualSourceData) payload.visual_source_data = activityData.visualSourceData;
            // ... map other fields

            const { error } = await supabase
                .from('activities')
                .update(payload)
                .eq('id', activityId);

            if (error) throw error;

            if (isDraft) {
                setDraftActivities(prev => prev.map(a => a.id === activityId ? { ...a, ...activityData, status } : a));
                addToast("Rascunho atualizado!", "success");
            } else {
                setDraftActivities(prev => prev.filter(a => a.id !== activityId));
                addToast("Atividade publicada!", "success");
                fetchTeacherContent(true);
            }
            return true;
        } catch (error: any) { 
            console.error(error); 
            addToast("Erro ao atualizar atividade.", "error"); 
            return false; 
        } finally {
            setIsSubmittingContent(false);
        }
    }, [user, addToast, fetchTeacherContent]);

    const handlePublishDraft = useCallback(async (activityId: string, updateData: { classId: string, className: string, dueDate: string, points: number }) => {
        // Implementação simplificada para Supabase
        // Clona o rascunho para uma nova atividade 'Pendente'
        if (!user) return false;
        try {
            // 1. Get Draft
            const { data: draft } = await supabase.from('activities').select('*').eq('id', activityId).single();
            if (!draft) throw new Error("Rascunho não encontrado");

            // 2. Insert New
            const { error } = await supabase.from('activities').insert([{
                ...draft,
                id: undefined, // New ID
                class_id: updateData.classId,
                due_date: updateData.dueDate,
                points: updateData.points,
                status: 'Pendente',
                created_at: new Date().toISOString()
            }]);

            if (error) throw error;
            addToast("Atividade publicada!", "success");
            return true;
        } catch (error: any) {
            addToast(error.message, "error");
            return false;
        }
    }, [user, addToast]);

    const handleDeleteActivity = useCallback(async (activityId: string) => {
        if (!user) return;
        try {
            const { error } = await supabase.from('activities').delete().eq('id', activityId);
            if (error) throw error;
            setDraftActivities(prev => prev.filter(a => a.id !== activityId));
            addToast("Atividade excluída.", "success");
        } catch (error: any) { console.error(error); addToast("Erro ao excluir.", "error"); }
    }, [user, addToast]);

    const handleDeleteModule = useCallback(async (classId: string, moduleId: string) => {
        if (!user) return;
        try {
            const { error } = await supabase.from('modules').delete().eq('id', moduleId);
            if (error) throw error;

            setModules(prev => prev.filter(m => m.id !== moduleId));
            setDraftModules(prev => prev.filter(m => m.id !== moduleId));
            addToast("Módulo excluído!", "success");
        } catch (error: any) { console.error(error); addToast("Erro ao excluir.", "error"); }
    }, [user, addToast]);

    const handleSaveModule = useCallback(async (module: Omit<Module, 'id'>, isDraft: boolean = false) => {
        if (!user) return false;
        setIsSubmittingContent(true);
        try {
            const { pages, ...metadata } = module;
            const status = isDraft ? "Rascunho" : "Ativo";
            
            // 1. Insert Module Metadata
            const modulePayload = {
                title: metadata.title,
                description: metadata.description,
                cover_image_url: metadata.coverImageUrl,
                video_url: metadata.videoUrl,
                duration: metadata.duration,
                series: metadata.series,
                materia: metadata.materia,
                subjects: metadata.subjects,
                historical_year: metadata.historicalYear,
                historical_era: metadata.historicalEra,
                visibility: metadata.visibility,
                status: status,
                creator_id: user.id
            };

            const { data: modData, error: modError } = await supabase
                .from('modules')
                .insert([modulePayload])
                .select()
                .single();

            if (modError) throw modError;

            // 2. Insert Content (Pages)
            const { error: contentError } = await supabase
                .from('module_contents')
                .insert([{ module_id: modData.id, pages: pages }]);

            if (contentError) throw contentError;

            // 3. Handle Visibility Link (Se específico para turmas)
            if (metadata.visibility === 'specific_class' && metadata.classIds) {
                const links = metadata.classIds.map(cid => ({ module_id: modData.id, class_id: cid }));
                if (links.length > 0) {
                    await supabase.from('module_class_visibility').insert(links);
                }
            }

            if (isDraft) {
                const newDraft = { id: modData.id, ...module, status } as Module;
                setDraftModules(prev => [newDraft, ...prev]);
                addToast("Módulo salvo como rascunho!", "success");
            } else {
                addToast("Módulo criado!", "success");
            }
            
            setModulesLibraryLoaded(false);
            return true;
        } catch (error) { 
            console.error(error); 
            addToast("Erro ao salvar módulo.", "error"); 
            return false; 
        } finally {
            setIsSubmittingContent(false);
        }
    }, [user, addToast]);

    const handleUpdateModule = useCallback(async (module: Module, isDraft: boolean = false) => {
        // Implementar lógica de update similar ao save
        // Por brevidade, use lógica similar mapeando campos
        addToast("Update de módulo em implementação.", "info");
    }, [addToast]);

    const handlePublishModuleDraft = useCallback(async (moduleId: string, classIds: string[]) => {
        // Implementar
        addToast("Publicação de rascunho em implementação.", "info");
        return false;
    }, [user, addToast]);

    return {
        modules, draftActivities, draftModules,
        isLoadingContent, isSubmittingContent,
        fetchTeacherContent, fetchModulesLibrary,
        handleSaveActivity, handleUpdateActivity, handleDeleteActivity,
        handleDeleteModule, handleSaveModule, handleUpdateModule, handlePublishModuleDraft,
        handlePublishDraft
    };
}
