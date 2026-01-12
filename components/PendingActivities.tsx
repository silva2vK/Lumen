
import React, { useState, useMemo } from 'react';
import { useTeacherClassContext } from '../contexts/TeacherClassContext';
import { useNavigation } from '../contexts/NavigationContext';
import type { Activity, PendingActivity } from '../types';
import { db } from './firebaseClient';
import { doc, getDoc } from 'firebase/firestore';
import { usePendingActivities } from '../hooks/teacher/usePendingActivities';
import { useAuth } from '../contexts/AuthContext';
import { ICONS, SpinnerIcon } from '../constants/index';
import { Modal } from './common/Modal';

const IssueRow: React.FC<{ item: PendingActivity; onView: () => void }> = ({ item, onView }) => (
    <div 
        className="group flex items-start gap-4 p-4 border-b border-white/5 hover:bg-[#161b22] transition-colors cursor-pointer"
        onClick={onView}
    >
        {/* Status Icon (Open Issue Style) */}
        <div className="pt-1 text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
        </div>

        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                    {item.title}
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[10px] text-slate-400 font-mono">
                    #{item.id.slice(-6)}
                </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="font-mono bg-white/5 px-1.5 rounded text-slate-400 border border-white/5">
                    {item.className}
                </span>
                <span>aguardando</span>
                <span>correção</span>
            </div>
        </div>

        {/* Action / Count */}
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                <span className="text-sm font-bold font-mono">{item.pendingCount}</span>
            </div>
            <button 
                className="hidden md:flex px-3 py-1 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold rounded-md border border-[rgba(240,246,252,0.1)] transition-colors items-center gap-1 shadow-sm"
            >
                Corrigir
            </button>
        </div>
    </div>
);

const ZeroInboxState: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center select-none">
        <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-green-500/20 to-emerald-500/5 border border-green-500/30 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full animate-ping bg-green-500/10"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">Sem Pendências</h3>
        <p className="text-slate-500 max-w-sm text-sm">
            Todas as atividades foram corrigidas. O diário de classe está atualizado.
        </p>
        <div className="mt-6 flex items-center gap-2 px-3 py-1 bg-[#0d1117] border border-green-500/30 rounded text-[10px] font-mono text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            TUDO EM DIA
        </div>
    </div>
);

const PendingActivities: React.FC = () => {
    const { user } = useAuth();
    const { teacherClasses } = useTeacherClassContext();
    const { startGrading } = useNavigation();
    const [selectedClassId, setSelectedClassId] = useState('all');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Fetch directly from hook
    const { data: allPendingActivities = [], isLoading: isFetching } = usePendingActivities(user?.id);

    // Memoize sorted classes for the modal
    const sortedClasses = useMemo(() => {
        return [...teacherClasses].sort((a, b) => a.name.localeCompare(b.name));
    }, [teacherClasses]);

    const pendingActivities = useMemo((): PendingActivity[] => {
        if (selectedClassId === 'all') {
            return allPendingActivities;
        }
        return allPendingActivities.filter(activity => activity.classId === selectedClassId);
    }, [allPendingActivities, selectedClassId]);

    const selectedClassName = useMemo(() => {
        if (selectedClassId === 'all') return 'TODAS AS CLASSES';
        const cls = teacherClasses.find(c => c.id === selectedClassId);
        return cls ? cls.name.toUpperCase() : 'TURMA SELECIONADA';
    }, [selectedClassId, teacherClasses]);

    const handleOpenGrading = async (pendingItem: PendingActivity) => {
        setIsActionLoading(true);
        try {
            const activityRef = doc(db, "activities", pendingItem.id);
            const activitySnap = await getDoc(activityRef);
            
            if (activitySnap.exists()) {
                const activityData = { id: activitySnap.id, ...activitySnap.data() } as Activity;
                startGrading(activityData);
            } else {
                alert("Atividade não encontrada. Hash inválido.");
            }
        } catch (error) {
            console.error("Error preparing grading:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSelectClass = (id: string) => {
        setSelectedClassId(id);
        setIsFilterModalOpen(false);
    };

    const isLoading = isFetching || isActionLoading;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <span className="text-orange-400">●</span> Pendências
                    </h2>
                </div>
                
                {/* Custom Trigger Button for Modal */}
                <button 
                    onClick={() => setIsFilterModalOpen(true)}
                    className="flex items-center bg-[#0d1117] border border-white/10 rounded-lg p-1.5 hover:border-white/30 transition-colors group cursor-pointer"
                >
                    <span className="text-xs text-slate-500 font-bold px-2">FILTRO:</span>
                    <span className="text-sm text-slate-300 font-mono pr-2 group-hover:text-white truncate max-w-[200px]">
                        {selectedClassName}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* List Container */}
            <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                {/* List Header */}
                <div className="bg-[#161b22] px-4 py-3 border-b border-white/10 flex justify-between items-center">
                    <div className="flex gap-4 text-sm font-bold text-slate-300">
                        <span className="flex items-center gap-1 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {pendingActivities.length} Pendentes
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            0 Corrigidas
                        </span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-slate-500 font-mono flex flex-col items-center">
                        <SpinnerIcon className="h-6 w-6 mb-2 text-brand" />
                        <span>SINCRONIZANDO...</span>
                    </div>
                ) : pendingActivities.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {pendingActivities.map(item => (
                            <IssueRow 
                                key={`${item.id}-${item.classId}`} 
                                item={item} 
                                onView={() => handleOpenGrading(item)} 
                            />
                        ))}
                    </div>
                ) : (
                    <ZeroInboxState />
                )}
            </div>

            {/* Filter Modal */}
            <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filtrar por Turma">
                <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                    <button
                        onClick={() => handleSelectClass('all')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors border flex items-center justify-between ${
                            selectedClassId === 'all' 
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                                : 'bg-[#0d1117] border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20'
                        }`}
                    >
                        <span className="font-bold">TODAS AS CLASSES</span>
                        {selectedClassId === 'all' && <span className="text-indigo-400">✓</span>}
                    </button>
                    
                    <div className="h-px bg-white/10 my-2 mx-2"></div>

                    {sortedClasses.map(cls => (
                        <button
                            key={cls.id}
                            onClick={() => handleSelectClass(cls.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors border flex items-center justify-between ${
                                selectedClassId === cls.id 
                                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                                    : 'bg-[#0d1117] border-white/10 text-slate-300 hover:bg-white/5 hover:border-white/20'
                            }`}
                        >
                            <span>{cls.name}</span>
                            {selectedClassId === cls.id && <span className="text-indigo-400">✓</span>}
                        </button>
                    ))}
                    
                    {sortedClasses.length === 0 && (
                        <p className="text-center text-slate-500 py-4 text-sm">Nenhuma turma encontrada.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default PendingActivities;
