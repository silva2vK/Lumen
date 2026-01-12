
import React, { useMemo, useState } from 'react';
import { Card } from '../common/Card';
import { SpinnerIcon, SCHOOL_YEARS, SUBJECTS_LIST } from '../../constants/index';
import { HistoricalEra, LessonPlan } from '../../types';

// --- Reusable Modern Inputs (Refined for High-End Look) ---
const ModernInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
        <input 
            {...props}
            className="w-full input-tech px-4 py-3 text-sm"
        />
    </div>
);

const ModernTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
        <textarea 
            {...props}
            className="w-full input-tech px-4 py-3 text-sm resize-y min-h-[100px]"
        />
    </div>
);

const ModernSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, ...props }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
        <div className="relative">
            <select 
                {...props}
                className="w-full input-tech px-4 py-3 text-sm appearance-none cursor-pointer"
            >
                {children}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>
    </div>
);

// --- PEDAGOGICAL SUGGESTIONS (BNCC STANDARDS) ---
const DIDACTIC_RESOURCES_SUGGESTIONS = [
    "Fontes históricas (documentais, iconográficas, orais)",
    "Tecnologias Digitais de Informação e Comunicação (TDIC)",
    "Patrimônio Cultural Material e Imaterial",
    "Cartografia Histórica e Mapas Temáticos",
    "Acervos Museológicos e Arquivísticos",
    "Produções Audiovisuais e Cinema",
    "Literatura e Narrativas Históricas",
    "Recursos Educacionais Abertos (REA)",
    "Plataforma Digital Lumen"
];

const GENERAL_COMPETENCIES_SUGGESTIONS = [
    "1. Conhecimento", "2. Pensamento Científico, Crítico e Criativo",
    "3. Repertório Cultural", "4. Comunicação", "5. Cultura Digital",
    "6. Trabalho e Projeto de Vida", "7. Argumentação", "8. Autoconhecimento e Autocuidado",
    "9. Empatia e Cooperação", "10. Responsabilidade e Cidadania"
];

const SuggestionChips: React.FC<{ options: string[], onSelect: (val: string) => void }> = ({ options, onSelect }) => (
    <div className="flex flex-wrap gap-2 mt-2 p-2 bg-[#0d1117]/50 rounded-lg border border-white/5">
        <span className="text-[10px] text-slate-500 font-bold uppercase self-center mr-2">Sugestões:</span>
        {options.map(opt => (
            <button
                key={opt}
                type="button"
                onClick={() => onSelect(opt)}
                className="text-[10px] px-2 py-1 bg-[#161b22] border border-slate-700 rounded-md text-slate-300 hover:text-white hover:border-brand hover:bg-brand/10 transition-all text-left"
            >
                + {opt}
            </button>
        ))}
    </div>
);

// --- CYCLIC EVALUATION COMPONENT ---
const EvaluationCycleSelector: React.FC<{ 
    currentText: string;
    onUpdate: (val: string) => void;
}> = ({ currentText, onUpdate }) => {
    
    // Track selected cycle using state
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const cycleItems = [
        { 
            id: 1, 
            label: 'Avaliação Diagnóstica', 
            desc: 'Identifica o ponto de partida.', 
            color: 'border-cyan-500 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-900/40',
            dot: 'bg-cyan-500'
        },
        { 
            id: 2, 
            label: 'Avaliação Formativa', 
            desc: 'Acompanha o progresso e ajusta o ensino.', 
            color: 'border-purple-500 text-purple-400 bg-purple-950/20 hover:bg-purple-900/40',
            dot: 'bg-purple-500'
        },
        { 
            id: 3, 
            label: 'Avaliação Somativa', 
            desc: 'Mede o desempenho final.', 
            color: 'border-pink-500 text-pink-400 bg-pink-950/20 hover:bg-pink-900/40',
            dot: 'bg-pink-500'
        },
        { 
            id: 4, 
            label: 'Reinício', 
            desc: 'Resultados informam novas diagnósticas.', 
            color: 'border-yellow-500 text-yellow-400 bg-yellow-950/20 hover:bg-yellow-900/40',
            dot: 'bg-yellow-500'
        }
    ];

    const handleSelect = (item: typeof cycleItems[0]) => {
        setSelectedId(item.id);
        const entry = `**${item.label}**: ${item.desc}`;
        onUpdate(entry);
    };

    return (
        <div className="space-y-4">
            <div className="bg-[#0d1117] p-4 rounded-xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10 font-black text-6xl text-white select-none">
                    ↻
                </div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Fluxo de Articulação (Selecione um)</h4>
                
                <div className="relative space-y-4 pl-4">
                    {/* Linha Conectora Vertical */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-yellow-500 opacity-30"></div>

                    {cycleItems.map((item, index) => {
                        const isActive = selectedId === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSelect(item)}
                                className={`relative w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all group ${
                                    isActive ? item.color + ' ring-1 ring-white/20 scale-[1.02]' : 'border-transparent hover:bg-white/5 opacity-70 hover:opacity-100'
                                }`}
                            >
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-black text-xs z-10 ${item.dot} shadow-lg shadow-black/50 ring-2 ring-[#0d1117]`}>
                                    {item.id}
                                </div>
                                <div>
                                    <p className="font-bold text-sm leading-none mb-1">{item.label}</p>
                                    <p className="text-[10px] opacity-80 leading-snug">{item.desc}</p>
                                </div>
                                {/* Seta Cíclica no último item */}
                                {index === 3 && (
                                    <div className="absolute -left-2 top-8 w-4 h-8 border-l-2 border-b-2 border-yellow-500/30 rounded-bl-xl pointer-events-none transform -rotate-12 translate-x-1"></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
            <ModernTextArea 
                label="Detalhamento da Avaliação" 
                value={currentText} 
                onChange={e => onUpdate(e.target.value)} 
                rows={3}
                placeholder="Selecione uma etapa acima para preencher automaticamente..."
            />
        </div>
    );
};

// --- MOCK DATABASES (Keeping logic intact) ---
const THEMATIC_UNITS_DATABASE: Record<string, Record<string, string[]>> = {
    'História': {
        '6º Ano': ['História: tempo, espaço e registros', 'Mundo clássico vs outras sociedades', 'Organização política', 'Trabalho e sociedade'],
        '7º Ano': ['Mundo moderno e conexões globais', 'Humanismos e Renascimentos', 'Poder colonial', 'Lógicas mercantis'],
        '8º Ano': ['Mundo contemporâneo: crise do Antigo Regime', 'Independências nas Américas', 'Brasil Império', 'Século XIX'],
        '9º Ano': ['República no Brasil', 'Totalitarismos', 'Ditadura e Redemocratização', 'História recente'],
        '1º Ano (Ensino Médio)': ['Sociedade e Cidadania', 'Política e Poder', 'Trabalho', 'Cultura'],
        '2º Ano (Ensino Médio)': ['Território', 'Dinâmicas Econômicas', 'Movimentos Sociais', 'Sustentabilidade'],
        '3º Ano (Ensino Médio)': ['Globalização', 'Ética', 'Memória', 'Projetos de Vida']
    }
};

interface ModuleMetadataFormProps {
    title: string; setTitle: (v: string) => void;
    description: string; setDescription: (v: string) => void;
    coverImageUrl: string; setCoverImageUrl: (v: string) => void;
    videoUrl: string; setVideoUrl: (v: string) => void;
    duration: string; setDuration: (v: string) => void;
    selectedSeries: string[]; setSelectedSeries: (v: string[]) => void;
    selectedSubjects: string[]; setSelectedSubjects: (v: string[]) => void;
    isUploading: boolean; handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    availableClasses?: { id: string; name: string }[];
    selectedClassIds: string[]; setSelectedClassIds: (ids: string[]) => void;
    historicalYear: number | undefined; setHistoricalYear: (v: number | undefined) => void;
    historicalEra: HistoricalEra | undefined; setHistoricalEra: (v: HistoricalEra | undefined) => void;
    lessonPlan?: LessonPlan; setLessonPlan?: (lp: LessonPlan) => void;
}

export const ModuleMetadataForm: React.FC<ModuleMetadataFormProps> = ({
    title, setTitle, description, setDescription, coverImageUrl, setCoverImageUrl,
    duration, setDuration,
    selectedSeries, setSelectedSeries, selectedSubjects, setSelectedSubjects,
    isUploading, handleCoverUpload, disabled, availableClasses, selectedClassIds, setSelectedClassIds,
    historicalYear, setHistoricalYear, historicalEra, setHistoricalEra, lessonPlan, setLessonPlan
}) => {
    
    const [activeTab, setActiveTab] = useState<'info' | 'plan'>('info');

    // --- LOGIC HELPERS ---
    
    // Heuristic function to determine era based on year
    const determineEra = (year: number): HistoricalEra => {
        if (year < -4000) return 'Pré-História';
        if (year < 476) return 'Antiga';
        if (year < 1453) return 'Média';
        if (year < 1789) return 'Moderna';
        return 'Contemporânea';
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') {
            setHistoricalYear(undefined);
            return;
        }
        
        const year = Number(val);
        setHistoricalYear(year);
        
        // Auto-select Era
        const autoEra = determineEra(year);
        setHistoricalEra(autoEra);
    };

    const handleToggleClass = (classId: string) => {
        if (selectedClassIds.includes(classId)) setSelectedClassIds(selectedClassIds.filter(id => id !== classId));
        else setSelectedClassIds([...selectedClassIds, classId]);
    };

    const toggleMultiSelect = (setter: (v: string[]) => void, current: string[], value: string) => {
        if (current.includes(value)) setter(current.filter(v => v !== value));
        else setter([...current, value]);
    };

    const updateLessonPlan = (field: keyof LessonPlan, value: string) => {
        if (setLessonPlan && lessonPlan) setLessonPlan({ ...lessonPlan, [field]: value });
    };

    const appendToLessonPlan = (field: keyof LessonPlan, value: string) => {
        if (setLessonPlan && lessonPlan) {
            const current = lessonPlan[field] || '';
            const separator = current.trim().length > 0 ? '\n- ' : '- ';
            // Avoid duplicates simply
            if (!current.includes(value)) {
                setLessonPlan({ ...lessonPlan, [field]: current + separator + value });
            }
        }
    };

    const availableThematicUnits = useMemo(() => {
        const units: string[] = [];
        selectedSubjects.forEach(subject => {
            const subjectData = THEMATIC_UNITS_DATABASE[subject];
            if (subjectData) {
                selectedSeries.forEach(serie => {
                    if (subjectData[serie]) units.push(...subjectData[serie]);
                });
            }
        });
        return [...new Set(units)];
    }, [selectedSubjects, selectedSeries]);

    const toggleThematicUnit = (unit: string) => {
        if (!lessonPlan || !setLessonPlan) return;
        const currentUnits = lessonPlan.thematicUnit ? lessonPlan.thematicUnit.split('; ').filter(Boolean) : [];
        const newUnits = currentUnits.includes(unit) ? currentUnits.filter(u => u !== unit) : [...currentUnits, unit];
        setLessonPlan({ ...lessonPlan, thematicUnit: newUnits.join('; ') });
    };

    return (
        <div className="space-y-6">
            
            {/* Tabs */}
            <div className="flex p-1 bg-[#0d1117] border border-white/10 rounded-xl">
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'info' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Metadados
                </button>
                <button 
                    onClick={() => setActiveTab('plan')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'plan' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    Plano de Aula
                </button>
            </div>

            {activeTab === 'info' && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Preview Card (Realistic Dashboard Look) */}
                    <div className="group relative h-48 w-full rounded-3xl overflow-hidden border border-white/10 shadow-lg hover:border-brand/50 transition-all">
                        <div className="absolute inset-0 bg-slate-900">
                            {coverImageUrl ? (
                                <img src={coverImageUrl} className="w-full h-full object-cover opacity-60" alt="Capa" />
                            ) : (
                                <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 bg-slate-800 flex items-center justify-center">
                                    <span className="text-xs text-slate-500 font-mono">SEM CAPA</span>
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        
                        {/* Upload Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm z-20">
                            <label className={`cursor-pointer px-4 py-2 bg-brand text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2 ${isUploading ? 'opacity-50' : ''}`}>
                                {isUploading ? <SpinnerIcon className="h-4 w-4 text-black" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                                <span>{isUploading ? 'Enviando...' : 'Alterar Capa'}</span>
                                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={disabled || isUploading} />
                            </label>
                        </div>

                        <div className="absolute bottom-0 left-0 p-5 w-full z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white leading-tight line-clamp-1">{title || 'Título do Módulo'}</h3>
                                    <p className="text-xs text-slate-300 line-clamp-1 mt-1">{description || 'Descrição breve...'}</p>
                                </div>
                            </div>
                            <div className="mt-3 w-full bg-white/20 rounded-full h-1">
                                <div className="bg-brand h-1 rounded-full w-1/3" />
                            </div>
                        </div>
                    </div>

                    <ModernInput label="Título" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Revolução Industrial" disabled={disabled} />
                    <ModernTextArea label="Descrição" value={description} onChange={e => setDescription(e.target.value)} placeholder="Resumo do conteúdo..." rows={3} disabled={disabled} />

                    <div className="grid grid-cols-1">
                        <ModernInput label="Duração Estimada" value={duration} onChange={e => setDuration(e.target.value)} placeholder="Ex: 2 horas" disabled={disabled} />
                    </div>

                    {/* Timeline */}
                    <div className="bg-[#0d1117]/50 border border-white/5 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-brand uppercase mb-3 flex items-center gap-2">
                            <span className="text-lg">🗺️</span> Mapa do Tempo
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <ModernInput 
                                label="Ano Histórico" 
                                type="number" 
                                value={historicalYear !== undefined ? historicalYear : ''} 
                                onChange={handleYearChange} 
                                placeholder="Ex: 1789" 
                            />
                            <ModernSelect label="Era Histórica" value={historicalEra || ''} onChange={e => setHistoricalEra(e.target.value as HistoricalEra || undefined)}>
                                <option value="">Selecione...</option>
                                <option value="Pré-História">Pré-História</option>
                                <option value="Antiga">Antiga</option>
                                <option value="Média">Média</option>
                                <option value="Moderna">Moderna</option>
                                <option value="Contemporânea">Contemporânea</option>
                            </ModernSelect>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Matéria</label>
                        <div className="flex flex-wrap gap-2">
                            {SUBJECTS_LIST.map(sub => (
                                <button
                                    key={sub}
                                    onClick={() => toggleMultiSelect(setSelectedSubjects, selectedSubjects, sub)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                        selectedSubjects.includes(sub) 
                                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500' 
                                        : 'bg-[#0d1117] text-slate-500 border-slate-700 hover:border-slate-500'
                                    }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Séries</label>
                        <div className="flex flex-wrap gap-2">
                            {SCHOOL_YEARS.map(serie => (
                                <button
                                    key={serie}
                                    onClick={() => toggleMultiSelect(setSelectedSeries, selectedSeries, serie)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                        selectedSeries.includes(serie) 
                                        ? 'bg-purple-500/20 text-purple-300 border-purple-500' 
                                        : 'bg-[#0d1117] text-slate-500 border-slate-700 hover:border-slate-500'
                                    }`}
                                >
                                    {serie}
                                </button>
                            ))}
                        </div>
                    </div>

                    {availableClasses && availableClasses.length > 0 && (
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Visibilidade (Turmas)</label>
                            <div className="max-h-40 overflow-y-auto bg-[#0d1117] border border-white/10 rounded-xl p-2 custom-scrollbar">
                                {availableClasses.map(cls => (
                                    <label key={cls.id} className="flex items-center p-2 rounded hover:bg-white/5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedClassIds.includes(cls.id)}
                                            onChange={() => handleToggleClass(cls.id)}
                                            className="rounded border-slate-600 bg-black text-brand focus:ring-brand mr-3"
                                        />
                                        <span className="text-sm text-slate-300">{cls.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'plan' && lessonPlan && setLessonPlan && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-indigo-900/10 border border-indigo-500/30 p-4 rounded-xl">
                        <h4 className="text-indigo-400 font-bold mb-2 flex items-center"><span className="text-xl mr-2">📚</span> Planejamento Pedagógico</h4>
                        <p className="text-xs text-indigo-300/80">Estes dados não são visíveis para os alunos, servindo para documentação docente.</p>
                    </div>

                    <ModernTextArea label="Objetivos de Aprendizagem" value={lessonPlan.objectives} onChange={e => updateLessonPlan('objectives', e.target.value)} placeholder="O que o aluno aprenderá..." rows={3} />
                    
                    {/* COMPETÊNCIAS GERAIS */}
                    <div>
                        <ModernTextArea 
                            label="Competências Gerais (BNCC)" 
                            value={lessonPlan.generalCompetencies || ''} 
                            onChange={e => updateLessonPlan('generalCompetencies', e.target.value)} 
                            rows={3} 
                            placeholder="Selecione abaixo ou digite..."
                        />
                        <SuggestionChips options={GENERAL_COMPETENCIES_SUGGESTIONS} onSelect={(val) => appendToLessonPlan('generalCompetencies', val)} />
                    </div>

                    {/* HABILIDADES MOBILIZADAS */}
                    <ModernTextArea 
                        label="Habilidades Mobilizadas (Específicas)" 
                        value={lessonPlan.mobilizedSkills || ''} 
                        onChange={e => updateLessonPlan('mobilizedSkills', e.target.value)} 
                        rows={3} 
                        placeholder="Ex: Identificar, Analisar, Comparar..."
                    />

                    <div className="space-y-2">
                        <ModernInput label="Unidades Temáticas (BNCC)" value={lessonPlan.thematicUnit || ''} onChange={e => updateLessonPlan('thematicUnit', e.target.value)} placeholder="Selecione abaixo ou digite..." />
                        {availableThematicUnits.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-2 bg-[#0d1117] rounded-lg border border-white/5">
                                {availableThematicUnits.map((unit, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => toggleThematicUnit(unit)}
                                        className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                                            (lessonPlan.thematicUnit || '').includes(unit) 
                                            ? 'bg-brand/20 text-brand border-brand' 
                                            : 'text-slate-500 border-slate-700 hover:text-slate-300'
                                        }`}
                                    >
                                        {unit}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <ModernTextArea label="Metodologia / Estratégias" value={lessonPlan.methodology} onChange={e => updateLessonPlan('methodology', e.target.value)} rows={3} />
                    
                    <div>
                        <ModernTextArea label="Recursos Didáticos" value={lessonPlan.resources} onChange={e => updateLessonPlan('resources', e.target.value)} rows={2} />
                        <SuggestionChips options={DIDACTIC_RESOURCES_SUGGESTIONS} onSelect={(val) => appendToLessonPlan('resources', val)} />
                    </div>

                    <div>
                        <EvaluationCycleSelector 
                            currentText={lessonPlan.evaluation} 
                            onUpdate={(val) => updateLessonPlan('evaluation', val)} 
                        />
                    </div>

                    <ModernInput label="Códigos BNCC" value={lessonPlan.bncc} onChange={e => updateLessonPlan('bncc', e.target.value)} placeholder="EF08HI01, ..." />
                </div>
            )}
        </div>
    );
};
