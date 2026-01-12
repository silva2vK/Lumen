
import React, { useState, useMemo } from 'react';
import { Modal } from './common/Modal';
import { ICONS, SpinnerIcon, SCHOOL_YEARS, SUBJECTS_LIST } from '../constants/index';
import { useTeacherAcademicContext } from '../contexts/TeacherAcademicContext';
import { useTeacherClassContext } from '../contexts/TeacherClassContext';
import { useNavigation } from '../contexts/NavigationContext';
import { Module } from '../types';
import { useAuth } from '../contexts/AuthContext';

// --- Github-style Components ---

const RepoHeader: React.FC<{ 
    repoName: string; 
    itemCount: number; 
    onNew: () => void; 
    searchTerm: string; 
    setSearchTerm: (term: string) => void;
    filterSerie: string;
    setFilterSerie: (s: string) => void;
    filterMateria: string;
    setFilterMateria: (m: string) => void;
}> = ({ repoName, itemCount, onNew, searchTerm, setSearchTerm, filterSerie, setFilterSerie, filterMateria, setFilterMateria }) => {
    const { user } = useAuth();
    return (
        <div className="bg-[#0d1117] pt-4 mb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 px-1">
                <div className="flex items-center gap-2 text-xl text-slate-200">
                    <svg className="w-5 h-5 text-slate-500" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9Zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8ZM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25Z"></path></svg>
                    <span className="text-blue-400 hover:underline cursor-pointer">{user?.name?.split(' ')[0].toLowerCase() || 'professor'}</span>
                    <span className="text-slate-500">/</span>
                    <span className="font-bold hover:underline cursor-pointer">{repoName}</span>
                    <span className="text-xs border border-slate-700 rounded-full px-2 py-0.5 text-slate-500 ml-2">Público</span>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                    {/* Filters */}
                    <select 
                        value={filterSerie}
                        onChange={(e) => setFilterSerie(e.target.value)}
                        className="bg-[#0d1117] border border-slate-700 text-slate-300 text-xs rounded-md px-2 py-1.5 focus:border-blue-500 outline-none"
                    >
                        <option value="all">Todas as Séries</option>
                        {SCHOOL_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>

                    <select 
                        value={filterMateria}
                        onChange={(e) => setFilterMateria(e.target.value)}
                        className="bg-[#0d1117] border border-slate-700 text-slate-300 text-xs rounded-md px-2 py-1.5 focus:border-blue-500 outline-none max-w-[150px]"
                    >
                        <option value="all">Todas as Matérias</option>
                        {SUBJECTS_LIST.map(subj => <option key={subj} value={subj}>{subj}</option>)}
                    </select>

                    <div className="relative flex-grow md:flex-grow-0">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar módulo..."
                            className="w-full md:w-48 bg-[#0d1117] border border-slate-700 text-slate-300 text-sm rounded-md px-3 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                        />
                    </div>
                    <button 
                        onClick={onNew}
                        className="bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-bold px-4 py-1.5 rounded-md border border-[rgba(240,246,252,0.1)] transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
                    >
                        <span>Novo módulo</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const FileRow: React.FC<{ 
    module: Module; 
    onPublish: (module: Module) => void; 
    onEdit: (module: Module) => void;
    onDelete: (id: string) => void; 
    onClick: () => void;
    isSelected: boolean;
}> = ({ module, onPublish, onEdit, onDelete, onClick, isSelected }) => {
    const timeAgo = (dateStr?: string) => {
        if (!dateStr) return 'algum tempo atrás';
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'hoje';
        if (days === 1) return 'ontem';
        return `há ${days} dias`;
    };

    return (
        <div 
            onClick={onClick}
            className={`flex items-center gap-3 p-3 border-t border-slate-800 hover:bg-[#161b22] cursor-pointer transition-colors group ${isSelected ? 'bg-[#161b22]' : 'bg-[#0d1117]'}`}
        >
            {/* Icon */}
            <div className="text-slate-500">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25V1.75Z"></path></svg>
            </div>

            {/* Title / Name */}
            <div className="flex-grow min-w-0 md:flex md:items-center md:gap-4">
                <div className="flex flex-col md:w-1/3">
                    <span className="font-semibold text-slate-200 text-sm hover:text-blue-400 hover:underline truncate block">
                        {module.title}
                    </span>
                    <div className="flex gap-1 mt-0.5">
                        {module.series && (
                            <span className="text-[9px] text-slate-500 border border-slate-700 px-1 rounded">
                                {Array.isArray(module.series) ? module.series[0] : module.series}
                            </span>
                        )}
                        {module.materia && (
                            <span className="text-[9px] text-slate-500 border border-slate-700 px-1 rounded">
                                {Array.isArray(module.materia) ? module.materia[0] : module.materia}
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Commit Message / Description */}
                <span className="text-slate-500 text-xs truncate md:flex-grow hidden md:block max-w-md">
                    {module.description || 'Nenhuma descrição fornecida para este módulo.'}
                </span>
            </div>

            {/* Meta & Actions */}
            <div className="flex items-center gap-4 text-xs text-slate-500 whitespace-nowrap">
                <span>{timeAgo(module.createdAt)}</span>
                
                {/* Actions (Visible on hover or selected) */}
                <div className={`flex gap-2 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onPublish(module); }}
                        className="text-green-400 hover:text-green-300" 
                        title="Publicar"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z"></path><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z"></path></svg>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(module); }}
                        className="text-blue-400 hover:text-blue-300"
                        title="Editar"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.928a.75.75 0 0 1-.927-.927l.928-3.251a1.75 1.75 0 0 1 .445-.756l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354l-1.086-1.086ZM11.189 6.25 9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.249.249 0 0 0 .108-.064l6.286-6.286Z"></path></svg>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(module.id); }}
                        className="text-red-400 hover:text-red-300"
                        title="Excluir"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 1.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3V1.75Zm4.5 0V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.75 1.75 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 6.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM11 6.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Z"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const PublishModuleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    module: Module | null;
    onPublish: (classIds: string[]) => Promise<void>;
}> = ({ isOpen, onClose, module, onPublish }) => {
    const { teacherClasses } = useTeacherClassContext();
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClassSelection = (classId: string) => {
        setSelectedClassIds(prev => 
            prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
        );
    };

    const handlePublish = async () => {
        if (selectedClassIds.length === 0) return;
        setIsSubmitting(true);
        await onPublish(selectedClassIds);
        setIsSubmitting(false);
        onClose();
    };

    if (!module) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Publicar: ${module.title}`}>
            <div className="space-y-4">
                <p className="text-sm text-slate-400">
                    Distribua este módulo para as turmas selecionadas.
                </p>

                <div className="border border-slate-700 rounded-md bg-[#0d1117]">
                    {teacherClasses.length === 0 ? (
                        <p className="text-sm text-slate-500 p-4">Nenhuma turma ativa encontrada.</p>
                    ) : (
                        teacherClasses.map(c => (
                            <label key={c.id} className="flex items-center p-3 hover:bg-slate-800/50 cursor-pointer border-b border-slate-800 last:border-0">
                                <input
                                    type="checkbox"
                                    checked={selectedClassIds.includes(c.id)}
                                    onChange={() => handleClassSelection(c.id)}
                                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-green-500 focus:ring-green-500"
                                />
                                <span className="ml-3 text-sm text-slate-300 font-mono">{c.name}</span>
                            </label>
                        ))
                    )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                    <button onClick={onClose} className="px-4 py-1.5 bg-[#21262d] border border-[rgba(240,246,252,0.1)] text-slate-300 rounded-md hover:bg-[#30363d] text-sm font-semibold transition-colors">
                        Cancelar
                    </button>
                    <button 
                        onClick={handlePublish} 
                        disabled={selectedClassIds.length === 0 || isSubmitting}
                        className="px-4 py-1.5 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] disabled:opacity-50 flex items-center text-sm font-bold shadow-sm border border-[rgba(240,246,252,0.1)]"
                    >
                        {isSubmitting ? <SpinnerIcon className="h-4 w-4 mr-2" /> : null}
                        Distribuir para {selectedClassIds.length} turmas
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const TeacherModuleRepository: React.FC = () => {
    const { draftModules, handleDeleteModule, handlePublishModuleDraft } = useTeacherAcademicContext();
    const { startEditingModule, setCurrentPage } = useNavigation();
    
    // State for filtering and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSerie, setFilterSerie] = useState('all');
    const [filterMateria, setFilterMateria] = useState('all');
    const [currentPage, setCurrentPageNum] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const [selectedDraft, setSelectedDraft] = useState<Module | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewModule, setViewModule] = useState<Module | null>(null);

    // Reset pagination when filters change
    useMemo(() => {
        setCurrentPageNum(1);
    }, [searchTerm, filterSerie, filterMateria]);

    const filteredDrafts = useMemo(() => {
        return draftModules.filter(draft => {
            const matchesSearch = draft.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  draft.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            const draftSeries = Array.isArray(draft.series) ? draft.series : (draft.series ? [draft.series] : []);
            const matchesSerie = filterSerie === 'all' || draftSeries.includes(filterSerie);

            const draftMaterias = Array.isArray(draft.materia) ? draft.materia : (draft.materia ? [draft.materia] : []);
            const matchesMateria = filterMateria === 'all' || draftMaterias.includes(filterMateria);

            return matchesSearch && matchesSerie && matchesMateria;
        });
    }, [draftModules, searchTerm, filterSerie, filterMateria]);

    const totalPages = Math.ceil(filteredDrafts.length / ITEMS_PER_PAGE);
    const paginatedDrafts = filteredDrafts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE, 
        currentPage * ITEMS_PER_PAGE
    );

    const handleDelete = async (id: string) => {
        if (window.confirm("Você tem certeza que deseja excluir este módulo? Esta ação não pode ser desfeita.")) {
            await handleDeleteModule('draft', id); 
            if (viewModule?.id === id) setViewModule(null);
        }
    };

    const handlePublishClick = (module: Module) => {
        setSelectedDraft(module);
        setIsModalOpen(true);
    };

    const handlePublishConfirm = async (classIds: string[]) => {
        if (selectedDraft) {
            await handlePublishModuleDraft(selectedDraft.id, classIds);
        }
    };

    const previewModule = viewModule || paginatedDrafts[0];

    return (
        <div className="animate-fade-in font-sans min-h-screen pb-10">
            <RepoHeader 
                repoName="banco-de-modulos" 
                itemCount={filteredDrafts.length} 
                onNew={() => setCurrentPage('teacher_create_module')} 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterSerie={filterSerie}
                setFilterSerie={setFilterSerie}
                filterMateria={filterMateria}
                setFilterMateria={setFilterMateria}
            />

            {/* File Explorer Table */}
            <div className="border border-slate-700 rounded-md overflow-hidden bg-[#0d1117]">
                {/* List */}
                <div className="divide-y divide-slate-800">
                    {paginatedDrafts.length > 0 ? (
                        paginatedDrafts.map(draft => (
                            <FileRow 
                                key={draft.id} 
                                module={draft} 
                                onPublish={handlePublishClick} 
                                onEdit={startEditingModule}
                                onDelete={handleDelete}
                                onClick={() => setViewModule(draft)}
                                isSelected={viewModule?.id === draft.id}
                            />
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            <p>Nenhum módulo encontrado com os filtros atuais.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-t border-slate-800">
                        <div className="text-xs text-slate-500">
                            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredDrafts.length)} de {filteredDrafts.length}
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setCurrentPageNum(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-xs font-bold text-slate-400 bg-[#0d1117] border border-slate-700 rounded hover:bg-[#21262d] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <div className="px-3 py-1 text-xs text-slate-300">
                                Página {currentPage} de {totalPages}
                            </div>
                            <button 
                                onClick={() => setCurrentPageNum(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-xs font-bold text-slate-400 bg-[#0d1117] border border-slate-700 rounded hover:bg-[#21262d] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* README Preview Area */}
            {previewModule && (
                <div className="mt-8 border border-slate-700 rounded-md overflow-hidden bg-[#0d1117]">
                    <div className="p-3 bg-[#161b22] border-b border-slate-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeWidth="2" stroke="currentColor" strokeLinecap="round" /></svg>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">DETALHES.md</span>
                    </div>
                    <div className="p-8">
                        <h1 className="text-3xl font-bold text-slate-200 border-b border-slate-800 pb-2 mb-6">
                            {previewModule.title}
                        </h1>
                        
                        <div className="prose prose-invert max-w-none">
                            <p className="text-slate-400 leading-relaxed mb-6">{previewModule.description}</p>
                            
                            <h3 className="text-xl font-semibold text-slate-300 mb-2">Especificações</h3>
                            <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-sm">
                                <li><strong>Matérias:</strong> {Array.isArray(previewModule.materia) ? previewModule.materia.join(', ') : previewModule.materia}</li>
                                <li><strong>Séries:</strong> {Array.isArray(previewModule.series) ? previewModule.series.join(', ') : previewModule.series}</li>
                                <li><strong>Páginas:</strong> {previewModule.pages?.length || 0}</li>
                                <li><strong>Dificuldade:</strong> {previewModule.difficulty}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <PublishModuleModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                module={selectedDraft}
                onPublish={handlePublishConfirm}
            />
        </div>
    );
};

export default TeacherModuleRepository;
