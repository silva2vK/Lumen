
import React, { useState } from 'react';
import { useStudentAcademic } from '../contexts/StudentAcademicContext';
import { SpinnerIcon, ICONS } from '../constants/index';
import { Modal } from './common/Modal';
import { TeacherClass } from '../types';

const GamerClassCard: React.FC<{ 
    classData: TeacherClass; 
    isExpanded: boolean; 
    onToggleExpand: () => void; 
    onLeaveClick: (id: string, name: string) => void; 
}> = ({ classData, isExpanded, onToggleExpand, onLeaveClick }) => {
    return (
        <div className={`relative bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-[0_0_30px_rgba(var(--brand-rgb),0.3)] border-brand/50' : 'hover:border-white/30'}`}>
            {/* Header Image / Pattern */}
            <div className="h-24 bg-gradient-to-r from-slate-900 to-slate-800 relative">
                {classData.coverImageUrl ? (
                    <img src={classData.coverImageUrl} className="w-full h-full object-cover opacity-60" alt="" />
                ) : (
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                )}
                <div className="absolute bottom-2 left-4">
                    <h3 className="text-lg font-bold text-white shadow-black drop-shadow-md">{classData.name}</h3>
                    <p className="text-xs text-slate-300 font-mono">{classData.code}</p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="flex border-b border-white/10 text-xs text-slate-400">
                <div className="flex-1 p-2 text-center border-r border-white/10">
                    <span className="block font-bold text-white">{classData.noticeCount || 0}</span>
                    <span className="text-[9px] uppercase">Avisos</span>
                </div>
                <div className="flex-1 p-2 text-center border-r border-white/10">
                    <span className="block font-bold text-white">{classData.activityCount || 0}</span>
                    <span className="text-[9px] uppercase">Tasks</span>
                </div>
                <div className="flex-1 p-2 text-center">
                    <span className="block font-bold text-white">{classData.studentCount || 0}</span>
                    <span className="text-[9px] uppercase">Membros</span>
                </div>
            </div>

            {/* Expandable Content (Notices) */}
            {isExpanded && (
                <div className="p-4 bg-[#0a0a0a] border-t border-white/10 animate-fade-in">
                    <h4 className="text-xs font-bold text-brand uppercase mb-3">Últimos Avisos</h4>
                    {classData.notices && classData.notices.length > 0 ? (
                        <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                            {classData.notices.map((notice, idx) => (
                                <div key={idx} className="text-sm text-slate-300 border-l-2 border-slate-700 pl-3 py-1">
                                    <p>{notice.text}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{new Date(notice.timestamp).toLocaleDateString()} • {notice.author}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center border-2 border-white/5 rounded-lg">
                            <p className="text-xs text-slate-600 font-mono uppercase">Nenhum dado de inteligência encontrado.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="p-2 flex gap-2">
                <button 
                    onClick={onToggleExpand}
                    className="flex-1 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                >
                    {isExpanded ? 'Recolher' : 'Detalhes'}
                </button>
                <button 
                    onClick={() => onLeaveClick(classData.id, classData.name)}
                    className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded transition-colors"
                >
                    Sair
                </button>
            </div>
        </div>
    );
};

const JoinClass: React.FC = () => {
    const { studentClasses, handleJoinClass, handleLeaveClass } = useStudentAcademic();
    const [classCode, setClassCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
    
    // Modal States
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [classToLeave, setClassToLeave] = useState<{id: string, name: string} | null>(null);
    const [isLeaving, setIsLeaving] = useState(false);
    
    const safeStudentClasses = studentClasses || [];

    const onJoin = async () => {
        if (!classCode.trim() || isJoining) return;
        setIsJoining(true);
        const success = await handleJoinClass(classCode.trim().toUpperCase());
        setIsJoining(false);
        if (success) {
            setClassCode('');
        }
    };

    const handleLeaveClick = (classId: string, className: string) => {
        setClassToLeave({ id: classId, name: className });
        setIsLeaveModalOpen(true);
    };

    const confirmLeave = async () => {
        if (!classToLeave || isLeaving) return;
        setIsLeaving(true);
        try {
            await handleLeaveClass(classToLeave.id);
            setIsLeaveModalOpen(false);
            setClassToLeave(null);
        } catch (error) {
            // Error handled in hook
        } finally {
            setIsLeaving(false);
        }
    };

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header / Join Section */}
            <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl p-6 md:p-8 overflow-hidden group">
                {/* Background Decor */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-green-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-green-500/10 transition-colors duration-500"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-2">
                            Entrar na Sessão
                        </h2>
                        <p className="text-slate-400 font-mono text-sm">
                            Insira o código de acesso fornecido pelo administrador da missão (Professor).
                        </p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-2">
                        <div className="flex bg-black p-1 rounded-xl border border-white/20 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500/50 transition-all shadow-lg">
                            <input 
                                type="text" 
                                value={classCode}
                                onChange={(e) => setClassCode(e.target.value)}
                                placeholder="CÓDIGO (EX: A1B2C3)"
                                className="bg-transparent text-white font-mono font-bold text-lg px-4 py-3 outline-none w-full md:w-64 placeholder:text-slate-700 uppercase"
                            />
                            <button 
                                onClick={onJoin}
                                disabled={isJoining}
                                className="bg-green-600 hover:bg-green-500 text-black font-bold px-6 rounded-lg uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                            >
                                {isJoining ? <SpinnerIcon className="text-black h-5 w-5" /> : 'START'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Class Grid */}
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-6 bg-green-500 block"></span>
                        Minhas Turmas
                    </h2>
                    <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-slate-300">
                        {safeStudentClasses.length} ATIVAS
                    </span>
                </div>

                {safeStudentClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {safeStudentClasses.map(cls => (
                            <GamerClassCard
                                key={cls.id}
                                classData={cls}
                                isExpanded={expandedClassId === cls.id}
                                onToggleExpand={() => setExpandedClassId(prev => prev === cls.id ? null : cls.id)}
                                onLeaveClick={handleLeaveClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-white/5 rounded-2xl bg-black/20">
                        <div className="text-6xl mb-4 opacity-20 text-white">🎮</div>
                        <p className="text-slate-500 font-mono uppercase tracking-widest">Nenhuma missão em andamento.</p>
                        <p className="text-slate-600 text-xs mt-2">Use o código acima para entrar em uma turma.</p>
                    </div>
                )}
            </div>

            {/* Leave Confirmation Modal */}
            <Modal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title="Confirmar Saída">
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl border border-red-500/50">
                        ⚠️
                    </div>
                    <div>
                        <p className="text-slate-300">Tem certeza que deseja sair da turma <strong className="text-white">{classToLeave?.name}</strong>?</p>
                        <p className="text-xs text-slate-500 mt-2">Você perderá o acesso às atividades desta turma.</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => setIsLeaveModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">
                            Cancelar
                        </button>
                        <button onClick={confirmLeave} disabled={isLeaving} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-colors flex items-center gap-2">
                            {isLeaving && <SpinnerIcon className="h-4 w-4" />}
                            Sair da Turma
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default JoinClass;
