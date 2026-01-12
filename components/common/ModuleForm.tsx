
import React, { useState, useEffect, useCallback } from 'react';
import type { Module, ModulePage, ModulePageContent, ModulePageContentType, HistoricalEra, LessonPlan } from '../../types';
import { ICONS, SpinnerIcon, SUBJECTS_LIST, SCHOOL_YEARS } from '../../constants/index';
import { useToast } from '../../contexts/ToastContext';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseClient';
import { supabase } from '../supabaseClient';
import { useModuleEditor } from '../../hooks/useModuleEditor';

// Sub-Components
import { ModuleMetadataForm } from '../modules/ModuleMetadataForm';
import { ModuleContentEditor } from '../modules/ModuleContentEditor';
import { AIGeneratorModal } from '../modules/AIGeneratorModal';

const DIDACTIC_SYSTEM_PROMPT = `Você é um Arquiteto de Conteúdo Didático experiente. Crie conteúdos claros, objetivos e academicamente rigorosos. Use fontes oficiais. Retorne apenas o conteúdo solicitado, sem preâmbulos.`;

interface ModuleFormProps {
    initialData?: Module | null;
    userId: string | undefined;
    onSave: (data: any, isDraft: boolean) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    title: string;
    subtitle: string;
    defaultSeries?: string[];
    defaultSubjects?: string[];
    availableClasses?: { id: string; name: string }[];
}

export const ModuleForm: React.FC<ModuleFormProps> = ({ 
    initialData, 
    userId, 
    onSave, 
    onCancel, 
    isSubmitting, 
    title: formTitle, 
    subtitle,
    defaultSeries = [SCHOOL_YEARS[0]],
    defaultSubjects = ['História'],
    availableClasses
}) => {
    const { addToast } = useToast();

    // Editor Hook
    const { 
        pages, setPages, addPage, removePage, updatePageTitle, 
        addBlock, removeBlock, updateBlock, moveBlock 
    } = useModuleEditor([{ id: Date.now(), title: 'Página 1', content: [] }]);

    // Metadata State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [duration, setDuration] = useState('');
    const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    
    // Timeline Meta
    const [historicalYear, setHistoricalYear] = useState<number | undefined>(undefined);
    const [historicalEra, setHistoricalEra] = useState<HistoricalEra | undefined>(undefined);
    
    // Lesson Plan State
    const [lessonPlan, setLessonPlan] = useState<LessonPlan>({
        objectives: '',
        generalCompetencies: '', // New
        mobilizedSkills: '',     // New
        methodology: '',
        resources: '',
        evaluation: '',
        bncc: ''
    });

    const [isLoadingContent, setIsLoadingContent] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // AI Generation State
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiTargetPageId, setAiTargetPageId] = useState<number | null>(null);

    // Initialization
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setDescription(initialData.description || '');
            setCoverImageUrl(initialData.coverImageUrl || '');
            setVideoUrl(initialData.videoUrl || '');
            setDuration(initialData.duration || '');
            setHistoricalYear(initialData.historicalYear);
            setHistoricalEra(initialData.historicalEra);
            
            // Initializing Lesson Plan
            if (initialData.lessonPlan) {
                setLessonPlan(initialData.lessonPlan);
            }

            if (Array.isArray(initialData.series)) {
                setSelectedSeries(initialData.series);
            } else if (initialData.series) {
                setSelectedSeries([initialData.series]);
            } else {
                setSelectedSeries(defaultSeries);
            }

            const subjects = initialData.subjects || (initialData.materia ? (Array.isArray(initialData.materia) ? initialData.materia : [initialData.materia]) : []);
            setSelectedSubjects(subjects.length > 0 ? subjects : defaultSubjects);

            // Populate selected classes if editing
            if (initialData.classIds) {
                setSelectedClassIds(initialData.classIds);
            }

            const loadPages = async () => {
                if (initialData.pages && initialData.pages.length > 0) {
                    setPages(JSON.parse(JSON.stringify(initialData.pages)));
                } else {
                    setIsLoadingContent(true);
                    try {
                        const docRef = doc(db, 'module_contents', initialData.id);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists() && docSnap.data().pages) {
                            setPages(docSnap.data().pages);
                        } else {
                            setPages([{ id: Date.now(), title: 'Página 1', content: [] }]);
                        }
                    } catch (err) {
                        console.error("Error fetching module content:", err);
                        addToast("Erro ao carregar conteúdo do módulo.", "error");
                        setPages([{ id: Date.now(), title: 'Página 1', content: [] }]);
                    } finally {
                        setIsLoadingContent(false);
                    }
                }
            };
            loadPages();

        } else {
             setSelectedSeries(defaultSeries);
             setSelectedSubjects(defaultSubjects);
             setPages([{ id: Date.now(), title: 'Página 1', content: [] }]);
             setSelectedClassIds([]);
             setLessonPlan({ objectives: '', generalCompetencies: '', mobilizedSkills: '', methodology: '', resources: '', evaluation: '', bncc: '' });
        }
    }, [initialData, defaultSeries, defaultSubjects, addToast, setPages]);

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!userId) {
            addToast("Erro de autenticação. Recarregue a página.", "error");
            return;
        }

        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `module_cover_${userId}_${Date.now()}.${fileExt}`;
                
                // Upload para Supabase Storage (Bucket 'covers')
                const { error: uploadError } = await supabase.storage
                    .from('covers')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('covers')
                    .getPublicUrl(fileName);
                
                setCoverImageUrl(data.publicUrl);
                addToast("Capa enviada com sucesso!", "success");
            } catch (error: any) {
                console.error("Upload failed", error);
                addToast(`Erro ao enviar imagem: ${error.message || 'Falha no upload'}`, "error");
            } finally {
                setIsUploading(false);
                // Reset input to allow selecting same file again if needed
                e.target.value = ''; 
            }
        }
    };

    // Helper for Content Images
    const handleContentImageUpload = async (file: File): Promise<string> => {
        if (!userId) throw new Error("Usuário não autenticado");
        
        const fileExt = file.name.split('.').pop();
        const fileName = `content_${userId}_${Date.now()}.${fileExt}`;
        
        // Upload para Supabase Storage (Bucket 'content')
        const { error: uploadError } = await supabase.storage
            .from('content')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('content')
            .getPublicUrl(fileName);
            
        return data.publicUrl;
    };

    // AI Logic
    const openAIModal = (pageId: number) => {
        setAiTargetPageId(pageId);
        setIsAIModalOpen(true);
    };

    const handleAIGenerate = async (prompt: string, type: ModulePageContentType) => {
        try {
            // Nota: Se estiver usando o proxy de IA com token do supabase, ajuste auth.currentUser
            // Aqui mantemos a lógica existente se o backend de IA for Firebase Functions ou similar
            // Se for migrar totalmente IA para Edge Functions do Supabase, ajuste esta chamada.
            const user = auth.currentUser; 
            // Fallback para supabase session se auth.currentUser for null (caso tenha migrado Auth completamente)
            let token;
            if (user) {
                token = await user.getIdToken();
            } else {
                const { data: { session } } = await supabase.auth.getSession();
                token = session?.access_token;
            }
            
            if (!token) throw new Error("Usuário não autenticado. Faça login novamente.");

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    model: "gemini-3-pro-preview", // Use Pro for High Quality Content
                    contents: [{ parts: [{ text: `Gere um conteúdo didático do tipo "${type}" sobre: "${prompt}".\n\n${DIDACTIC_SYSTEM_PROMPT}` }] }],
                })
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error("Não autorizado. Verifique sua sessão.");
                throw new Error(`Erro na comunicação com a IA: ${response.statusText}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!text) throw new Error("Resposta vazia da IA");

            if (type === 'list') {
                return text.split('\n').filter((item: string) => item.trim() !== '');
            } else {
                return text;
            }
        } catch (error) {
            console.error("Error generating AI content:", error);
            throw error;
        }
    };

    const handleAddAIContent = (content: string | string[], type: ModulePageContentType) => {
        if (aiTargetPageId === null) return;
        
        const newPages = pages.map(p => {
            if (p.id === aiTargetPageId) {
                const newBlock: ModulePageContent = {
                    type,
                    content,
                    align: 'left',
                };
                return { ...p, content: [...p.content, newBlock] };
            }
            return p;
        });
        
        setPages(newPages);
        
        setIsAIModalOpen(false);
        setAiTargetPageId(null);
    };

    const handleSaveWrapper = async (isDraft: boolean) => {
        if (!title || selectedSeries.length === 0 || selectedSubjects.length === 0) {
            addToast("Preencha todos os campos obrigatórios (Título, Série e Matéria).", "error");
            return;
        }

        // Validate Class Selection for Teachers (when not drafting)
        if (!isDraft && availableClasses && availableClasses.length > 0 && selectedClassIds.length === 0) {
            addToast("Selecione pelo menos uma turma para publicar.", "error");
            return;
        }

        const moduleData = {
            title, description, coverImageUrl, videoUrl, duration,
            pages,
            series: selectedSeries,
            materia: selectedSubjects,
            subjects: selectedSubjects,
            classIds: selectedClassIds,
            historicalYear,
            historicalEra,
            lessonPlan // Include Lesson Plan data
        };

        await onSave(moduleData, isDraft);
    };

    if (isLoadingContent) {
        return (
            <div className="flex justify-center items-center h-full min-h-[500px]">
                <div className="flex flex-col items-center space-y-4">
                    <SpinnerIcon className="h-12 w-12 text-brand" />
                    <p className="text-slate-500 font-mono animate-pulse">Carregando estúdio de criação...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in relative min-h-screen pb-32">
            
            {/* --- Sticky Header Actions --- */}
            <div className="sticky top-0 z-30 bg-[#09090b]/80 backdrop-blur-md border-b border-white/10 px-4 py-4 mb-8 -mx-4 sm:-mx-6 lg:-mx-10 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="text-brand">{ICONS.teacher_create_module}</span>
                        {formTitle}
                    </h1>
                    <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                        onClick={onCancel} 
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
                    <button 
                        onClick={() => handleSaveWrapper(true)} 
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none px-5 py-2 bg-[#161b22] text-amber-400 border border-amber-500/30 font-semibold rounded-lg hover:bg-amber-500/10 transition-colors disabled:opacity-50 text-sm"
                    >
                        Salvar Rascunho
                    </button>
                    <button 
                        onClick={() => handleSaveWrapper(false)} 
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none px-6 py-2 bg-brand text-black font-bold rounded-lg hover:bg-brand/90 hover:shadow-[0_0_15px_rgba(var(--brand-rgb),0.4)] disabled:opacity-50 flex items-center justify-center gap-2 transition-all text-sm"
                    >
                        {isSubmitting ? <SpinnerIcon className="h-4 w-4" /> : <div className="h-4 w-4">{ICONS.plus}</div>}
                        <span>{initialData ? 'Salvar Alterações' : 'Publicar Módulo'}</span>
                    </button>
                </div>
            </div>

            {/* --- Main Workspace Layout --- */}
            <div className="grid grid-cols-12 gap-8">
                
                {/* Left Panel: Metadata (Sticky on Desktop) */}
                <aside className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6 h-fit lg:sticky lg:top-24">
                    <ModuleMetadataForm 
                        title={title} setTitle={setTitle}
                        description={description} setDescription={setDescription}
                        coverImageUrl={coverImageUrl} setCoverImageUrl={setCoverImageUrl}
                        videoUrl={videoUrl} setVideoUrl={setVideoUrl}
                        duration={duration} setDuration={setDuration}
                        selectedSeries={selectedSeries} setSelectedSeries={setSelectedSeries}
                        selectedSubjects={selectedSubjects} setSelectedSubjects={setSelectedSubjects}
                        isUploading={isUploading} handleCoverUpload={handleCoverUpload}
                        disabled={isSubmitting}
                        availableClasses={availableClasses}
                        selectedClassIds={selectedClassIds}
                        setSelectedClassIds={setSelectedClassIds}
                        historicalYear={historicalYear} setHistoricalYear={setHistoricalYear}
                        historicalEra={historicalEra} setHistoricalEra={setHistoricalEra}
                        lessonPlan={lessonPlan} setLessonPlan={setLessonPlan}
                    />
                </aside>

                {/* Right Panel: Content Editor */}
                <main className="col-span-12 lg:col-span-8 xl:col-span-9">
                    <ModuleContentEditor 
                        pages={pages}
                        updatePageTitle={updatePageTitle}
                        addPage={addPage}
                        removePage={removePage}
                        addBlock={addBlock}
                        removeBlock={removeBlock}
                        updateBlock={updateBlock}
                        moveBlock={moveBlock}
                        openAIModal={openAIModal}
                        onImageUpload={handleContentImageUpload}
                    />
                </main>
            </div>

            <AIGeneratorModal 
                isOpen={isAIModalOpen}
                onClose={() => { setIsAIModalOpen(false); setAiTargetPageId(null); }}
                onGenerate={handleAIGenerate}
                onAddContent={handleAddAIContent}
            />
        </div>
    );
};
