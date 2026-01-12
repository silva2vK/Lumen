
import React, { useState, useEffect } from 'react';
import { useStudentAcademic } from '../contexts/StudentAcademicContext';
import { useNavigation } from '../contexts/NavigationContext';
import { SpinnerIcon, SUBJECTS_LIST, SCHOOL_YEARS } from '../constants/index';
import type { Module } from '../types';

const ModuleCard: React.FC<{ module: Module; onClick: () => void }> = ({ module, onClick }) => {
    const isCompleted = module.progress === 100;
    const progress = module.progress || 0;

    return (
        <div 
            onClick={onClick}
            className="group relative bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-brand/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]"
        >
            <div className="relative h-40 overflow-hidden">
                {module.coverImageUrl ? (
                    <img 
                        src={module.coverImageUrl} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
                        alt={module.title} 
                    />
                ) : (
                    <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 bg-slate-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />
                
                {/* Badge de Status */}
                <div className="absolute top-3 right-3">
                    {isCompleted ? (
                        <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-md flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Concluído
                        </span>
                    ) : progress > 0 ? (
                        <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-md">
                            {progress}%
                        </span>
                    ) : (
                        <span className="bg-slate-500/20 text-slate-300 border border-slate-500/30 px-2 py-1 rounded text-[10px] font-bold uppercase backdrop-blur-md">
                            Novo
                        </span>
                    )}
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex gap-2 mb-3">
                    <span className="text-[10px] font-mono text-brand uppercase tracking-wider border border-brand/20 px-1.5 py-0.5 rounded bg-brand/5">
                        {Array.isArray(module.materia) ? module.materia[0] : module.materia || 'Geral'}
                    </span>
                    {module.series && (
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider border border-slate-700 px-1.5 py-0.5 rounded bg-slate-800">
                            {Array.isArray(module.series) ? module.series[0] : module.series}
                        </span>
                    )}
                </div>
                <h3 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-brand transition-colors line-clamp-2">
                    {module.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">
                    {module.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <span className="text-xs text-slate-500 font-mono">
                        {module.pages?.length || 0} PÁGINAS
                    </span>
                    <span className="text-brand text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        Acessar &rarr;
                    </span>
                </div>
            </div>
            
            {/* Progress Bar Bottom */}
            <div className="h-1 w-full bg-slate-800">
                <div 
                    className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-brand'}`} 
                    style={{ width: `${progress}%` }} 
                />
            </div>
        </div>
    );
};

const Modules: React.FC = () => {
    const { searchedModules, isLoading, searchModules } = useStudentAcademic();
    const { startModule } = useNavigation();
    
    // Filtros Locais
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedSeries, setSelectedSeries] = useState('all');
    // Predefinição: "Em Andamento"
    const [selectedStatus, setSelectedStatus] = useState('in_progress');
    // Predefinição: "Minha Biblioteca"
    const [selectedScope, setSelectedScope] = useState<'my_modules' | 'public'>('my_modules');

    // Executa a busca inicial apenas uma vez na montagem
    useEffect(() => {
        handleSearch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Função manual de busca que lê todos os estados atuais
    const handleSearch = () => {
        searchModules({
            queryText: searchTerm,
            materia: selectedSubject,
            serie: selectedSeries,
            status: selectedStatus,
            scope: selectedScope
        });
    };

    // Handler para troca de aba (Trigger imediato para melhor UX)
    const handleScopeChange = (scope: 'my_modules' | 'public') => {
        setSelectedScope(scope);
        // Pequeno timeout para garantir que o state atualizou antes de buscar, 
        // ou passamos o scope explicitamente.
        // Como o state é assíncrono, passamos o valor novo direto:
        searchModules({
            queryText: searchTerm,
            materia: selectedSubject,
            serie: selectedSeries,
            status: selectedStatus,
            scope: scope
        });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-thin text-white tracking-tight">
                        Biblioteca de <span className="font-bold text-brand">Módulos</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm max-w-xl">
                        Acesse conteúdos didáticos, materiais de apoio e trilhas de aprendizagem.
                    </p>
                </div>
                
                {/* Scope Toggles */}
                <div className="flex p-1 bg-[#0d1117] border border-white/10 rounded-lg">
                    <button 
                        onClick={() => handleScopeChange('my_modules')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                            selectedScope === 'my_modules' 
                            ? 'bg-brand text-black shadow-sm' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        Minha Biblioteca
                    </button>
                    <button 
                        onClick={() => handleScopeChange('public')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                            selectedScope === 'public' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        Biblioteca Pública
                    </button>
                </div>
            </div>

            {/* Filters Bar - Compact Layout */}
            <div className="flex flex-col xl:flex-row gap-4 bg-[#0d1117] p-4 rounded-xl border border-white/10">
                
                {/* Search Group (Compact) */}
                <div className="flex flex-1 gap-2 min-w-0">
                    <div className="relative flex-grow">
                        <input 
                            type="text" 
                            placeholder="Título ou tema..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full h-full bg-black/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-slate-600"
                        />
                        <svg className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button 
                        onClick={handleSearch}
                        className="px-4 md:px-6 bg-brand hover:bg-brand/90 text-black font-bold text-sm rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(var(--brand-rgb),0.2)] whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="hidden sm:inline">Buscar</span>
                    </button>
                </div>
                
                {/* Dropdowns Group */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full xl:w-auto">
                    <select 
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="bg-black/50 border border-slate-700 rounded-lg py-2.5 px-3 text-white text-sm focus:border-brand outline-none cursor-pointer"
                    >
                        <option value="all">Todas as Matérias</option>
                        {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select 
                        value={selectedSeries}
                        onChange={(e) => setSelectedSeries(e.target.value)}
                        className="bg-black/50 border border-slate-700 rounded-lg py-2.5 px-3 text-white text-sm focus:border-brand outline-none cursor-pointer"
                    >
                        <option value="all">Todas as Séries</option>
                        {SCHOOL_YEARS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select 
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-black/50 border border-slate-700 rounded-lg py-2.5 px-3 text-white text-sm focus:border-brand outline-none cursor-pointer col-span-2 md:col-span-1"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="not_started">Não Iniciado</option>
                        <option value="in_progress">Em Andamento</option>
                        <option value="completed">Concluído</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="min-h-[300px]">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <SpinnerIcon className="h-12 w-12 text-brand" />
                    </div>
                ) : searchedModules.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {searchedModules.map(module => (
                            <ModuleCard 
                                key={module.id} 
                                module={module} 
                                onClick={() => startModule(module)} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-white/5 rounded-3xl bg-black/20 backdrop-blur-sm">
                        <div className="p-4 bg-white/5 rounded-full mb-3 text-slate-500 text-4xl">📚</div>
                        <p className="text-slate-400 font-bold text-sm">Nenhum módulo encontrado.</p>
                        <p className="text-slate-600 text-xs mt-1">
                            {selectedScope === 'my_modules' 
                                ? "Você não tem módulos nesta categoria. Tente explorar a Biblioteca Pública." 
                                : "Tente ajustar os filtros e clique no botão de busca."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modules;
