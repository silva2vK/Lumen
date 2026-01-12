
import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from './common/Modal';
import { ICONS, SpinnerIcon } from '../constants/index';
import { useTeacherAcademicContext } from '../contexts/TeacherAcademicContext';
import { useTeacherClassContext } from '../contexts/TeacherClassContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Activity } from '../types';
import { useAuth } from '../contexts/AuthContext';

// --- Sub Components ---

const RepoHeader: React.FC<{ 
    count: number; 
    onNew: () => void; 
    searchTerm: string; 
    setSearchTerm: (t: string) => void;
}> = ({ count, onNew, searchTerm, setSearchTerm }) => {
    const { user } = useAuth();
    return (
        <div className="bg-[#0d1117] pt-4 mb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 px-1">
                <div className="flex items-center gap-2 text-xl text-slate-200">
                    <svg className="w-5 h-5 text-slate-500" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9Zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8ZM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25Z"></path></svg>
                    <span className="text-blue-400 hover:underline cursor-pointer">{user?.name?.split(' ')[0].toLowerCase() || 'professor'}</span>
                    <span className="text-slate-500">/</span>
                    <span className="font-bold hover:underline cursor-pointer">banco-de-questoes</span>
                    <span className="text-xs border border-slate-700 rounded-full px-2 py-0.5 text-slate-500 ml-2">Privado</span>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Ir para arquivo..."
                        className="w-full md:w-64 bg-[#0d1117] border border-slate-700 text-slate-300 text-sm rounded-md px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                    />
                    <button 
                        onClick={onNew}
                        className="bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-bold px-4 py-1.5 rounded-md border border-[rgba(240,246,252,0.1)] transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
                    >
                        <span>Nova atividade</span>
                    </button>
                </div>
            </div>
            
            {/* Context Bar */}
            <div className="flex gap-2 mb-4">
                <button className="px-3 py-1 bg-[#21262d] border border-slate-700 rounded-md text-xs font-semibold text-slate-300 flex items-center gap-2 hover:bg-[#30363d] transition-colors">
                    <svg className="w-3 h-3 text-slate-400" viewBox="0 0 16 16" fill="currentColor"><path d="M3.25 11.25a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0Zm0-1.5a.25.25 0 1 0 0 .5.25.25 0 0 0 0-.5Zm10 1.5a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0Zm0-1.5a.25.25 0 1 0 0 .5.25.25 0 0 0 0-.5ZM6 5.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5A.75.75 0 0 1 6 5.25Zm2 3.5a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75ZM.75 4h14.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5ZM.75 8h3.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5Zm0 4h1.5a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1 0-1.5ZM9 12h6.25a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5Z"></path></svg>
                    main
                </button>
                <div className="flex-grow"></div>
                <div className="text-xs text-slate-500 font-mono self-center">
                    {count} itens
                </div>
            </div>
        </div>
    );
};

const ActivityRow: React.FC<{ 
    activity: Activity; 
    onUse: (a: Activity) => void; 
    onEdit: (a: Activity) => void;
    onDelete: (id: string) => void; 
    onClick: () => void;
    isSelected: boolean;
}> = ({ activity, onUse, onEdit, onDelete, onClick, isSelected }) => {
    
    // File icon based on type
    const getIcon = () => {
        switch(activity.type) {
            case 'VisualSourceAnalysis': return '🖼️';
            case 'ConceptConnection': return '🔗';
            case 'AdvanceOrganizer': return '🌉';
            default: return '📄'; // Text file
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return days === 0 ? 'hoje' : days === 1 ? 'ontem' : `há ${days} dias`;
    };

    return (
        <div 
            onClick={onClick}
            className={`flex items-center gap-3 p-2.5 border-t border-slate-800 hover:bg-[#161b22] cursor-pointer transition-colors group ${isSelected ? 'bg-[#161b22]' : 'bg-[#0d1117]'}`}
        >
            <div className="w-5 text-center text-sm opacity-70" title={activity.type}>{getIcon()}</div>
            
            <div className="flex-grow min-w-0 md:flex md:items-center md:gap-4">
                <span className="font-semibold text-slate-200 text-sm hover:text-blue-400 hover:underline truncate md:w-1/3 block">
                    {activity.title}
                </span>
                <span className="text-slate-500 text-xs truncate md:flex-grow hidden md:block max-w-md font-mono">
                    {activity.description || 'Sem descrição'}
                </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 whitespace-nowrap font-mono">
                <span className="hidden sm:inline-block px-1.5 py-0.5 border border-slate-700 rounded text-[10px] text-slate-400">
                    {activity.points} pts
                </span>
                <span>{timeAgo(activity.createdAt)}</span>
                
                {/* Actions */}
                <div className={`flex gap-2 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onUse(activity); }} 
                        className="text-green-400 hover:text-green-300" title="Publicar"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z"></path><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z"></path></svg>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(activity); }} 
                        className="text-blue-400 hover:text-blue-300" title="Editar"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.928a.75.75 0 0 1-.927-.927l.928-3.251a1.75 1.75 0 0 1 .445-.756l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086ZM11.189 6.25 9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.249.249 0 0 0 .108-.064l6.286-6.286Z"></path></svg>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }} 
                        className="text-red-400 hover:text-red-300" title="Excluir"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.75 1.75 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 6.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM11 6.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Z"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const PublishModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    activity: Activity | null;
    onPublish: (classId: string, dueDate: string, points: number) => Promise<void>;
}> = ({ isOpen, onClose, activity, onPublish }) => {
    const { teacherClasses } = useTeacherClassContext();
    const [classId, setClassId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [points, setPoints] = useState(10);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (activity) {
            setPoints(activity.points || 0);
            if (activity.classId) setClassId(activity.classId);
            setDueDate('');
        }
    }, [activity]);

    const handlePublish = async () => {
        if (!classId) return;
        setIsSubmitting(true);
        await onPublish(classId, dueDate, points);
        setIsSubmitting(false);
        onClose();
    };

    if (!activity) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Publicar: ${activity.title}`}>
            <div className="space-y-4">
                <p className="text-sm text-slate-400">
                    Configure os parâmetros de distribuição para esta atividade.
                </p>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Turma de Destino</label>
                    <select 
                        value={classId} 
                        onChange={e => setClassId(e.target.value)}
                        className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded-md text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                        <option value="">Selecione uma turma...</option>
                        {teacherClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Entrega</label>
                        <input 
                            type="date" 
                            value={dueDate} 
                            onChange={e => setDueDate(e.target.value)} 
                            className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded-md text-slate-200 text-sm focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pontos (Máx)</label>
                        <input 
                            type="number" 
                            max="10" 
                            value={points} 
                            onChange={e => setPoints(Number(e.target.value))} 
                            className="w-full p-2 bg-[#0d1117] border border-slate-700 rounded-md text-slate-200 text-sm focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800 mt-4">
                    <button onClick={onClose} className="px-4 py-1.5 bg-[#21262d] border border-[rgba(240,246,252,0.1)] text-slate-300 rounded-md hover:bg-[#30363d] text-sm font-semibold transition-colors">
                        Cancelar
                    </button>
                    <button 
                        onClick={handlePublish} 
                        disabled={!classId || isSubmitting}
                        className="px-4 py-1.5 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 flex items-center text-sm font-bold shadow-sm border border-[rgba(240,246,252,0.1)]"
                    >
                        {isSubmitting ? <SpinnerIcon className="h-4 w-4 mr-2" /> : null}
                        Publicar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// --- Activity Type Selection Modal ---
const ActivityTypeSelectionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelectType: (type: 'classic' | 'interactive') => void;
}> = ({ isOpen, onClose, onSelectType }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar novo arquivo" size="lg">
            <div className="space-y-6 pb-4">
                <p className="text-slate-400 text-sm text-center">
                    Selecione o modelo para sua nova atividade.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => onSelectType('classic')}
                        className="flex flex-col items-center p-6 border border-slate-700 bg-[#0d1117] hover:bg-[#161b22] hover:border-blue-500 rounded-xl transition-all group"
                    >
                        <div className="text-3xl mb-3 opacity-80 group-hover:opacity-100">📝</div>
                        <h3 className="text-sm font-bold text-slate-200 mb-1 group-hover:text-blue-400">Folha de Atividade Clássica</h3>
                        <p className="text-xs text-slate-500 text-center">Q&A Padrão, Múltipla Escolha, Envio de Arquivo.</p>
                    </button>

                    <button 
                        onClick={() => onSelectType('interactive')}
                        className="flex flex-col items-center p-6 border border-slate-700 bg-[#0d1117] hover:bg-[#161b22] hover:border-purple-500 rounded-xl transition-all group"
                    >
                        <div className="text-3xl mb-3 opacity-80 group-hover:opacity-100">✨</div>
                        <h3 className="text-sm font-bold text-slate-200 mb-1 group-hover:text-purple-400">Laboratório Interativo</h3>
                        <p className="text-xs text-slate-500 text-center">Análise Visual, Mapa Conceitual, Métodos Ausubel.</p>
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const TeacherRepository: React.FC = () => {
    const { draftActivities, handleDeleteActivity, handlePublishDraft } = useTeacherAcademicContext();
    const { teacherClasses } = useTeacherClassContext();
    const { startEditingActivity, setCurrentPage } = useNavigation();
    const [selectedDraft, setSelectedDraft] = useState<Activity | null>(null);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewActivity, setViewActivity] = useState<Activity | null>(null);

    const filteredDrafts = useMemo(() => {
        return draftActivities.filter(draft => {
            return draft.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   draft.description.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [draftActivities, searchTerm]);

    const handleDelete = async (id: string) => {
        if (window.confirm("Remover este rascunho permanentemente? Esta ação é irreversível.")) {
            await handleDeleteActivity(id);
            if (viewActivity?.id === id) setViewActivity(null);
        }
    };

    const handleUse = (activity: Activity) => {
        setSelectedDraft(activity);
        setIsPublishModalOpen(true);
    };

    const handlePublishConfirm = async (classId: string, dueDate: string, points: number) => {
        if (selectedDraft) {
            const className = teacherClasses.find(c => c.id === classId)?.name || 'Turma';
            await handlePublishDraft(selectedDraft.id, { classId, className, dueDate, points });
        }
    };

    const handleCreateNewClick = () => {
        setIsTypeSelectionOpen(true);
    };

    const handleTypeSelection = (type: 'classic' | 'interactive') => {
        setIsTypeSelectionOpen(false);
        if (type === 'classic') {
            setCurrentPage('teacher_create_activity');
        } else {
            setCurrentPage('teacher_create_interactive_activity');
        }
    };

    const previewActivity = viewActivity || filteredDrafts[0];

    return (
        <div className="font-sans animate-fade-in pb-12">
            <RepoHeader 
                count={draftActivities.length} 
                onNew={handleCreateNewClick} 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <div className="border border-slate-700 rounded-md overflow-hidden bg-[#0d1117]">
                {/* File List - REMOVED GITHUB HEADER ROW */}
                <div className="divide-y divide-slate-800">
                    {filteredDrafts.length > 0 ? (
                        filteredDrafts.map(draft => (
                            <ActivityRow 
                                key={draft.id} 
                                activity={draft} 
                                onUse={handleUse} 
                                onEdit={startEditingActivity}
                                onDelete={handleDelete} 
                                onClick={() => setViewActivity(draft)}
                                isSelected={viewActivity?.id === draft.id}
                            />
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500 font-mono text-sm">
                            <p>-- Repositório Vazio --</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Section */}
            {previewActivity && (
                <div className="mt-8 border border-slate-700 rounded-md overflow-hidden bg-[#0d1117]">
                    <div className="p-3 bg-[#161b22] border-b border-slate-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeWidth="2" stroke="currentColor" strokeLinecap="round" /></svg>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">DETALHES.md</span>
                    </div>
                    <div className="p-8">
                        <h1 className="text-2xl font-bold text-slate-200 border-b border-slate-800 pb-2 mb-4">
                            {previewActivity.title}
                        </h1>
                        <p className="text-slate-400 leading-relaxed mb-6 font-mono text-sm">{previewActivity.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm font-mono text-slate-500">
                            <div>
                                <span className="block font-bold text-slate-400">Tipo:</span> 
                                {previewActivity.type}
                            </div>
                            <div>
                                <span className="block font-bold text-slate-400">Tópico:</span> 
                                {previewActivity.materia} / {previewActivity.unidade}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <PublishModal 
                isOpen={isPublishModalOpen} 
                onClose={() => setIsPublishModalOpen(false)} 
                activity={selectedDraft}
                onPublish={handlePublishConfirm}
            />

            <ActivityTypeSelectionModal 
                isOpen={isTypeSelectionOpen}
                onClose={() => setIsTypeSelectionOpen(false)}
                onSelectType={handleTypeSelection}
            />
        </div>
    );
};

export default TeacherRepository;
