
import React, { useState, useMemo } from 'react';
import { useStudentAcademic } from '../contexts/StudentAcademicContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './common/Card';
import type { Unidade, ClassGradeReport, GradeReportActivityDetail, GradeReportSubject } from '../types';
import { SpinnerIcon } from '../constants/index';

// --- Helpers ---

const getUnitOrder = (unit: string): number => {
    const map: Record<string, number> = {
        '1ª Unidade': 1,
        '2ª Unidade': 2,
        '3ª Unidade': 3,
        '4ª Unidade': 4
    };
    return map[unit] || 99;
};

// Cores estilo Gamer/Xbox com alto contraste
const getScoreStyle = (score: number | undefined | null) => {
    if (score === undefined || score === null) return { color: 'text-slate-500', bar: 'bg-slate-700', border: 'border-slate-700' };
    
    const val = Number(score.toFixed(1));
    
    if (val >= 10) return { color: 'text-yellow-400', bar: 'bg-yellow-400', border: 'border-yellow-400', glow: 'shadow-[0_0_15px_rgba(250,204,21,0.4)]' }; // Lendário
    if (val >= 7.0) return { color: 'text-green-400', bar: 'bg-green-500', border: 'border-green-500', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.4)]' }; // Aprovado (Xbox Green)
    if (val >= 5.0) return { color: 'text-orange-400', bar: 'bg-orange-500', border: 'border-orange-500', glow: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]' }; // Recuperação
    return { color: 'text-red-500', bar: 'bg-red-600', border: 'border-red-600', glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]' }; // Crítico
};

// Componente: Subject Tile (O "Bloco" do Xbox)
const SubjectTile: React.FC<{ 
    subjectName: string; 
    data: GradeReportSubject; 
    onClick: () => void;
    isExpanded: boolean;
}> = ({ subjectName, data, onClick, isExpanded }) => {
    const score = data.totalPoints || 0;
    const style = getScoreStyle(score);
    
    // Calcula progresso (Assumindo base 10 para visualização, mas adaptável)
    const progressPercent = Math.min(Math.max((score / 10) * 100, 0), 100);

    const activityList = Object.values(data.activities || {}) as GradeReportActivityDetail[];

    return (
        <div 
            onClick={onClick}
            className={`
                relative overflow-hidden rounded-xl bg-[#1a1b1e] border border-white/5 
                transition-all duration-300 cursor-pointer group hover:bg-[#222327]
                ${isExpanded ? `ring-2 ring-offset-2 ring-offset-[#09090b] ${style.border.replace('border-', 'ring-')}` : 'hover:-translate-y-1 hover:shadow-xl'}
            `}
        >
            {/* Barra lateral colorida (Indicador de Status) */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.bar}`} />

            <div className="p-5 pl-7">
                <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider truncate pr-2">
                        {subjectName}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                        {activityList.length} ATIV
                    </span>
                </div>

                {/* Big Score Number */}
                <div className="flex items-end gap-1 mb-2">
                    <span className={`text-4xl font-black tracking-tighter ${style.color} drop-shadow-md`}>
                        {score.toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 mb-1.5">/ 10.0</span>
                </div>

                {/* Progress Bar (HP Bar Style) */}
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                    <div 
                        className={`h-full ${style.bar} ${style.glow || ''} transition-all duration-1000 ease-out`} 
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Expanded Details Panel */}
            {isExpanded && (
                <div className="bg-[#111] border-t border-white/10 p-4 pl-7 animate-fade-in">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Detalhamento das Avaliações</p>
                    <ul className="space-y-2">
                        {activityList.length > 0 ? activityList.map(act => (
                            <li key={act.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                <span className="text-slate-300 truncate pr-4">{act.title}</span>
                                <span className="font-mono font-bold text-slate-400">
                                    {act.grade} <span className="text-[9px] opacity-50">/ {act.maxPoints}</span>
                                </span>
                            </li>
                        )) : (
                            <li className="text-xs text-slate-600 italic">Sem atividades registradas.</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

const ClassReportDashboard: React.FC<{ classId: string; classReport: ClassGradeReport; }> = ({ classReport }) => {
    const safeUnidades = classReport.unidades || {};
    const sortedUnidades = useMemo(() => {
        return Object.keys(safeUnidades).sort((a, b) => getUnitOrder(a) - getUnitOrder(b));
    }, [safeUnidades]);

    // Estado da Unidade Selecionada (Default: Última unidade disponível ou 1ª)
    const [selectedUnit, setSelectedUnit] = useState<string>(sortedUnidades[0] || '1ª Unidade');
    const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

    const currentUnitData = safeUnidades[selectedUnit as Unidade];
    const subjects = currentUnitData?.subjects ? Object.keys(currentUnitData.subjects).sort() : [];

    // Cálculo da Média Geral da Unidade (Simples)
    const unitAverage = useMemo(() => {
        if (!currentUnitData || !currentUnitData.subjects || subjects.length === 0) return 0;
        const total = subjects.reduce((acc, sub) => acc + (currentUnitData.subjects[sub].totalPoints || 0), 0);
        return total / subjects.length;
    }, [currentUnitData, subjects]);

    const averageStyle = getScoreStyle(unitAverage);

    if (sortedUnidades.length === 0) {
        return (
            <Card className="bg-[#0d1117] border border-white/10">
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                    <span className="text-4xl mb-3 opacity-50">📊</span>
                    <h3 className="font-bold text-lg text-slate-300">{classReport.className}</h3>
                    <p className="text-sm">Aguardando lançamento de notas.</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="bg-[#0d1117] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Header: Class Info & Unit Average */}
            <div className="relative p-6 md:p-8 bg-gradient-to-r from-[#161b22] to-[#0d1117] border-b border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Boletim Escolar</span>
                        <h2 className="text-2xl md:text-3xl font-black text-white mt-1 tracking-tight">{classReport.className}</h2>
                    </div>
                    
                    {/* Unit Average Badge */}
                    <div className="flex items-center gap-4 bg-black/40 p-3 pr-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2 ${averageStyle.border} ${averageStyle.color} ${averageStyle.glow} bg-[#0d1117]`}>
                            {unitAverage.toFixed(1)}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-400 uppercase">Média Geral</span>
                            <span className="text-[10px] text-slate-600 font-mono uppercase">{selectedUnit}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unit Navigation (Xbox Bumpers Style) */}
            <div className="flex overflow-x-auto custom-scrollbar border-b border-white/5 bg-[#09090b]">
                {sortedUnidades.map((unit) => (
                    <button
                        key={unit}
                        onClick={() => { setSelectedUnit(unit); setExpandedSubject(null); }}
                        className={`
                            px-6 py-4 text-sm font-bold uppercase tracking-wide transition-all border-b-2 flex-shrink-0
                            ${selectedUnit === unit 
                                ? 'text-white border-brand bg-white/5' 
                                : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                            }
                        `}
                    >
                        {unit}
                    </button>
                ))}
            </div>

            {/* Subjects Grid */}
            <div className="p-6 min-h-[300px] bg-[#09090b]">
                {subjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjects.map((subjectName) => (
                            <SubjectTile 
                                key={subjectName}
                                subjectName={subjectName}
                                data={currentUnitData!.subjects[subjectName]}
                                isExpanded={expandedSubject === subjectName}
                                onClick={() => setExpandedSubject(expandedSubject === subjectName ? null : subjectName)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-4">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <p className="font-mono text-sm">NENHUM DADO REGISTRADO NESTA UNIDADE</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Boletim: React.FC = () => {
    const { user } = useAuth();
    const { gradeReport, isLoading } = useStudentAcademic();

    if (isLoading) {
        return (
             <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
                <SpinnerIcon className="h-12 w-12 text-brand" />
                <p className="text-slate-500 font-mono text-sm uppercase tracking-widest animate-pulse">Carregando Dados Acadêmicos...</p>
            </div>
        )
    }

    if (!user) return null;

    const safeReport = gradeReport || {};
    const hasData = Object.keys(safeReport).length > 0;

    if (!hasData) {
         return (
            <Card className="text-center py-20 bg-[#0d1117] border border-white/10">
                <div className="inline-block bg-slate-800 rounded-full p-6 mb-4">
                    <span className="text-4xl">📴</span>
                </div>
                <h2 className="text-xl font-bold text-white">Boletim Offline</h2>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                    Você ainda não está matriculado em nenhuma turma ou as notas ainda não foram sincronizadas pelo servidor central.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand/10 rounded-lg text-brand border border-brand/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-thin text-white tracking-tight">
                    Desempenho <span className="font-bold text-brand">Acadêmico</span>
                </h1>
            </div>

            <div className="grid gap-8">
                {Object.entries(safeReport).map(([classId, classReport]) => (
                    <ClassReportDashboard key={classId} classId={classId} classReport={classReport} />
                ))}
            </div>
        </div>
    );
};

export default Boletim;
