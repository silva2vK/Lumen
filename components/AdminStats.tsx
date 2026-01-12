
import React, { useMemo } from 'react';
import { ICONS } from '../constants/index';
import { useAdminData } from '../contexts/AdminDataContext';

const TelemetryCard: React.FC<{ 
    label: string; 
    value: string | number; 
    subvalue: string;
    icon: React.ReactNode; 
    colorClass: string; 
}> = ({ label, value, subvalue, icon, colorClass }) => (
    <div className="bg-[#0d1117] border border-white/10 p-5 rounded-lg hover:border-white/20 transition-all flex items-start gap-4">
        <div className={`p-3 rounded-md bg-[#161b22] border border-white/5 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-mono font-bold text-slate-500 uppercase mb-1">{label}</p>
            <p className="text-3xl font-mono font-bold text-white tracking-tight">{value}</p>
            <p className="text-xs text-slate-400 mt-1 font-mono">{subvalue}</p>
        </div>
    </div>
);

const AdminStats: React.FC = () => {
    const { modules, quizzes } = useAdminData();
    
    const stats = useMemo(() => {
        const totalPages = modules.reduce((acc, mod) => acc + (mod.pages?.length || 0), 0);
        const avgPages = modules.length > 0 ? (totalPages / modules.length).toFixed(1) : '0.0';
        const totalQuestions = quizzes.reduce((acc, q) => acc + q.questions.length, 0);
        const avgQuestions = quizzes.length > 0 ? (totalQuestions / quizzes.length).toFixed(1) : '0.0';

        return { totalPages, avgPages, totalQuestions, avgQuestions };
    }, [modules, quizzes]);

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-xl font-mono font-bold text-white border-b border-white/10 pb-4">
                &gt; System Telemetry
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <TelemetryCard 
                    label="Volume de Conteúdo" 
                    value={stats.totalPages} 
                    subvalue={`${stats.avgPages} pgs/módulo`}
                    icon={ICONS.block_paragraph} 
                    colorClass="text-blue-400" 
                />
                <TelemetryCard 
                    label="Densidade de Avaliação" 
                    value={stats.totalQuestions} 
                    subvalue={`${stats.avgQuestions} qts/quiz`}
                    icon={ICONS.quizzes} 
                    colorClass="text-purple-400" 
                />
                <TelemetryCard 
                    label="Storage Usage" 
                    value="-- GB" 
                    subvalue="Estimativa Cloud"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>} 
                    colorClass="text-amber-400" 
                />
                <TelemetryCard 
                    label="API Latency" 
                    value="24ms" 
                    subvalue="p95 (Firestore)"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} 
                    colorClass="text-green-400" 
                />
            </div>

            <div className="bg-[#0d1117] border border-white/10 rounded-lg p-6">
                <h3 className="text-sm font-mono font-bold text-slate-400 uppercase mb-4">Distribution Map</h3>
                <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-white/5">
                    {/* Visual Mock of Distribution */}
                    <div className="bg-blue-500 h-full w-[40%]"></div>
                    <div className="bg-purple-500 h-full w-[30%]"></div>
                    <div className="bg-amber-500 h-full w-[20%]"></div>
                    <div className="bg-green-500 h-full w-[10%]"></div>
                </div>
                <div className="flex gap-6 mt-4 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Módulos</span>
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Quizzes</span>
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Assets</span>
                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> User Data</span>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;
