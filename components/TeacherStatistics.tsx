
import React, { useMemo } from 'react';
import { Card } from './common/Card';
import { ICONS } from '../constants/index';
import { useTeacherClassContext } from '../contexts/TeacherClassContext';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ChartContainer, CustomTooltip, ChartGradients } from './common/ChartComponents';

// --- Components Visuals ---

const MetricCard: React.FC<{ 
    label: string; 
    value: string | number; 
    subtext: string; 
    trend?: 'up' | 'down' | 'neutral';
    color: string;
}> = React.memo(({ label, value, subtext, trend, color }) => (
    <div className="relative overflow-hidden bg-[#0d1117] border border-white/10 rounded-xl p-5 group hover:border-white/20 transition-all">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-opacity opacity-50 group-hover:opacity-100" />
        
        <div className="relative z-10">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-slate-100 font-mono" style={{ color: color }}>{value}</h3>
                {trend === 'up' && <span className="text-[10px] text-green-400">▲</span>}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-mono border-t border-white/5 pt-2 inline-block">
                {subtext}
            </p>
        </div>
    </div>
));

const ClassDataRow: React.FC<{
    name: string;
    students: number;
    activities: number;
    avgGrade: number;
    pending: number;
}> = React.memo(({ name, students, activities, avgGrade, pending }) => (
    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors group">
        <td className="py-3 px-4">
            <div className="font-bold text-slate-200 text-sm group-hover:text-brand transition-colors">{name}</div>
        </td>
        <td className="py-3 px-4 text-right font-mono text-xs text-slate-400">{students}</td>
        <td className="py-3 px-4 text-right font-mono text-xs text-slate-400">{activities}</td>
        <td className="py-3 px-4 text-right">
            <div className="flex items-center justify-end gap-2">
                <span className={`text-xs font-bold ${avgGrade >= 70 ? 'text-green-400' : avgGrade >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {avgGrade.toFixed(1)}%
                </span>
                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${avgGrade >= 70 ? 'bg-green-500' : avgGrade >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${avgGrade}%` }} />
                </div>
            </div>
        </td>
        <td className="py-3 px-4 text-right">
            {pending > 0 ? (
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    {pending}
                </span>
            ) : (
                <span className="text-slate-600 text-xs">-</span>
            )}
        </td>
    </tr>
));

const TeacherStatistics: React.FC = () => {
    const { teacherClasses } = useTeacherClassContext();

    // --- Complex Data Aggregation (Optimized with useMemo) ---
    // This calculation is expensive (nested loops over classes -> activities -> submissions)
    // We memoize strictly on teacherClasses. If teacherClasses is stable (from React Query cache), this won't run.
    const { 
        globalStats, 
        classBreakdown,
        chartData 
    } = useMemo(() => {
        let totalStudents = 0;
        let totalActivitiesCreated = 0;
        let totalPending = 0;
        let sumGrades = 0;
        let countGrades = 0;

        const breakdown = teacherClasses.map(cls => {
            const studentCount = cls.studentCount || (cls.students?.length || 0);
            const activityCount = cls.activityCount || (cls.activities?.length || 0);
            
            // Pending Calculation (Approximation based on loaded data or metadata)
            const pendingCount = cls.activities?.reduce((acc, a) => acc + (a.pendingSubmissionCount || 0), 0) || 0;

            // Grade Calculation (Based on loaded submissions)
            let clsSumGrades = 0;
            let clsMaxGrades = 0;
            
            cls.activities?.forEach(act => {
                if (act.submissions) {
                    act.submissions.forEach(sub => {
                        if (sub.status === 'Corrigido' && typeof sub.grade === 'number') {
                            clsSumGrades += sub.grade;
                            clsMaxGrades += act.points;
                        }
                    });
                }
            });

            const clsAvg = clsMaxGrades > 0 ? (clsSumGrades / clsMaxGrades) * 100 : 0;

            // Global Accumulation
            totalStudents += studentCount;
            totalActivitiesCreated += activityCount;
            totalPending += pendingCount;
            sumGrades += clsAvg; 
            if (clsMaxGrades > 0) countGrades++;

            return {
                id: cls.id,
                name: cls.name,
                students: studentCount,
                activities: activityCount,
                avgGrade: clsAvg,
                pending: pendingCount
            };
        });

        const globalAvg = countGrades > 0 ? sumGrades / countGrades : 0;

        // Chart Data: Compare Classes by Avg Grade & Engagement Potential
        const chart = breakdown.map(b => ({
            name: b.name.split(' - ')[0], // Short name
            Média: Math.round(b.avgGrade),
            Atividades: b.activities
        })).sort((a, b) => b.Média - a.Média); // Top performers first

        return {
            globalStats: {
                students: totalStudents,
                activities: totalActivitiesCreated,
                pending: totalPending,
                avg: globalAvg
            },
            classBreakdown: breakdown,
            chartData: chart
        };
    }, [teacherClasses]); // Only re-run if class data structure changes

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2 bg-brand/10 rounded-lg text-brand">
                    {ICONS.teacher_statistics}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">System Analytics</h2>
                    <p className="text-xs text-slate-400 font-mono">REALTIME_METRICS_V2.0 // TEACHER_VIEW</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    label="Total Students" 
                    value={globalStats.students} 
                    subtext="Active in database" 
                    color="#60a5fa"
                />
                <MetricCard 
                    label="Content Ratio" 
                    value={globalStats.activities} 
                    subtext="Activities Deployed" 
                    color="#c084fc"
                />
                <MetricCard 
                    label="Performance Idx" 
                    value={`${globalStats.avg.toFixed(0)}%`} 
                    subtext="Global Average" 
                    trend="up"
                    color="#4ade80"
                />
                <MetricCard 
                    label="Action Items" 
                    value={globalStats.pending} 
                    subtext="Pending Reviews" 
                    color="#fbbf24"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Chart: Class Comparison */}
                <div className="lg:col-span-2 bg-[#0d1117] border border-white/10 rounded-xl p-6 shadow-xl">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-brand rounded-full"></span>
                        Desempenho Comparativo
                    </h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <ChartGradients />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{fill: '#94a3b8', fontSize: 10}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    interval={0}
                                />
                                <YAxis 
                                    tick={{fill: '#94a3b8', fontSize: 10}} 
                                    axisLine={false} 
                                    tickLine={false}
                                />
                                <Tooltip 
                                    content={<CustomTooltip />} 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                                />
                                <Bar 
                                    dataKey="Média" 
                                    fill="url(#gradIndigo)" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={30}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary: Breakdown Table (Dense) */}
                <div className="lg:col-span-1 bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden shadow-xl flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-[#161b22]">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                            Detalhamento por Turma
                        </h3>
                    </div>
                    <div className="overflow-y-auto max-h-[340px] custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#0d1117] sticky top-0 z-10 text-[10px] uppercase text-slate-500 font-bold">
                                <tr>
                                    <th className="py-2 px-4 bg-[#0d1117]">Turma</th>
                                    <th className="py-2 px-4 text-right bg-[#0d1117]">Alun.</th>
                                    <th className="py-2 px-4 text-right bg-[#0d1117]">Ativ.</th>
                                    <th className="py-2 px-4 text-right bg-[#0d1117]">Média</th>
                                    <th className="py-2 px-4 text-right bg-[#0d1117]">Pend.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classBreakdown.map(cls => (
                                    <ClassDataRow key={cls.id} {...cls} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherStatistics;
