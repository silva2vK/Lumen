
import React, { useState, useMemo } from 'react';
import { Card } from './common/Card';
import { ICONS, SpinnerIcon } from '../constants/index';
import { useSecretariatContext } from '../contexts/SecretariatContext';
import { Modal } from './common/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartContainer, CustomTooltip, ChartGradients } from './common/ChartComponents';

const StatCard: React.FC<{ title: string; value: string | number; description: string; icon: React.ReactNode; iconBgColor: string; iconTextColor: string }> = ({ title, value, description, icon, iconBgColor, iconTextColor }) => (
    <Card>
        <div className="flex justify-between items-start">
            <div>
                <p className="font-semibold text-slate-600 dark:text-slate-300 hc-text-secondary">{title}</p>
                <p className="font-bold text-slate-800 dark:text-slate-100 mt-1 hc-text-primary text-3xl">{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hc-text-secondary">{description}</p>
            </div>
            <div className={`p-3 rounded-full ${iconBgColor} ${iconTextColor}`}>
                {icon}
            </div>
        </div>
    </Card>
);

const SecretariatDashboard: React.FC = () => {
    const { schools, globalStats, isLoading, isAddingSchool, handleAddSchool } = useSecretariatContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [directorIdInput, setDirectorIdInput] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'intelligence'>('overview');

    const onSubmitAdd = async () => {
        await handleAddSchool(directorIdInput);
        setIsModalOpen(false);
        setDirectorIdInput('');
    };

    // --- Data Aggregation for Charts ---
    const performanceData = useMemo(() => {
        // Aggregate average grades by subject across all schools
        const subjectTotals: Record<string, { total: number; count: number }> = {};
        
        schools.forEach(school => {
            if (school.performanceBySubject) {
                Object.entries(school.performanceBySubject).forEach(([subject, score]) => {
                    if (!subjectTotals[subject]) subjectTotals[subject] = { total: 0, count: 0 };
                    // Explicitly cast score to number to avoid TS error
                    subjectTotals[subject].total += (score as number);
                    subjectTotals[subject].count += 1;
                });
            }
        });

        return Object.entries(subjectTotals).map(([name, data]) => ({
            name,
            score: parseFloat((data.total / data.count).toFixed(1))
        })).sort((a, b) => b.score - a.score);
    }, [schools]);

    const studentDistributionData = useMemo(() => {
        const totalActive = schools.reduce((acc, s) => acc + (s.totalStudents * (s.activeStudentRate || 0) / 100), 0);
        const totalInactive = globalStats.totalStudents - totalActive;
        
        return [
            { name: 'Ativos', value: Math.round(totalActive), color: '#10B981' },
            { name: 'Inativos (Risco)', value: Math.round(totalInactive), color: '#EF4444' }
        ];
    }, [schools, globalStats.totalStudents]);

    const rankingData = useMemo(() => {
        return [...schools]
            .sort((a, b) => (b.averageAttendance || 0) - (a.averageAttendance || 0))
            .slice(0, 5)
            .map(s => ({
                name: s.name,
                attendance: Math.round(s.averageAttendance || 0)
            }));
    }, [schools]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <SpinnerIcon className="h-12 w-12 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Painel da Secretaria</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Gestão da rede municipal de ensino.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'overview' ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                    >
                        Visão Geral
                    </button>
                    <button 
                        onClick={() => setActiveTab('intelligence')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center ${activeTab === 'intelligence' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
                        Inteligência de Dados
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors ml-2"
                    >
                        <div className="h-5 w-5 mr-2">{ICONS.plus}</div>
                        <span>Adicionar Escola</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview (Always Visible) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total de Escolas" 
                    value={globalStats.totalSchools} 
                    description="Unidades monitoradas" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                    iconBgColor="bg-blue-100 dark:bg-blue-900/50" 
                    iconTextColor="text-blue-600 dark:text-blue-300"
                />
                <StatCard 
                    title="Total de Turmas" 
                    value={globalStats.totalClasses} 
                    description="Em toda a rede" 
                    icon={ICONS.teacher_dashboard}
                    iconBgColor="bg-purple-100 dark:bg-purple-900/50" 
                    iconTextColor="text-purple-600 dark:text-purple-300"
                />
                <StatCard 
                    title="Total de Alunos" 
                    value={globalStats.totalStudents} 
                    description="Matriculados" 
                    icon={ICONS.students}
                    iconBgColor="bg-emerald-100 dark:bg-emerald-900/50" 
                    iconTextColor="text-emerald-600 dark:text-emerald-300"
                />
            </div>

            {activeTab === 'overview' && (
                <Card className="!p-0 overflow-hidden">
                    <div className="p-6 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Escolas Monitoradas</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 border-b dark:border-slate-700">
                                    <th className="p-4">Escola / Diretor</th>
                                    <th className="p-4">ID</th>
                                    <th className="p-4 text-center">Turmas</th>
                                    <th className="p-4 text-center">Alunos</th>
                                    <th className="p-4 text-center">Freq. Média</th>
                                    <th className="p-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {schools.length > 0 ? (
                                    schools.map(school => (
                                        <tr key={school.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">{school.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{school.email}</p>
                                            </td>
                                            <td className="p-4 text-xs font-mono text-slate-500 dark:text-slate-400">{school.id}</td>
                                            <td className="p-4 text-center font-medium text-slate-700 dark:text-slate-300">{school.totalClasses}</td>
                                            <td className="p-4 text-center font-medium text-slate-700 dark:text-slate-300">{school.totalStudents}</td>
                                            <td className="p-4 text-center">
                                                {school.averageAttendance ? (
                                                    <span className={`font-bold ${school.averageAttendance > 85 ? 'text-green-600' : school.averageAttendance > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {school.averageAttendance.toFixed(1)}%
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full dark:bg-green-900/30 dark:text-green-300">
                                                    Ativa
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                            Nenhuma escola adicionada. Use o botão acima para adicionar pelo ID do Diretor.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {activeTab === 'intelligence' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                    {/* CHART 1: Performance by Subject */}
                    <Card>
                        <ChartContainer title="Desempenho Médio por Disciplina" subtitle="Notas médias agregadas da rede.">
                            <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <ChartGradients />
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
                                <XAxis type="number" domain={[0, 10]} hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fill: '#6B7280', fontSize: 12}} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                <Bar 
                                    dataKey="score" 
                                    name="Média" 
                                    fill="url(#gradIndigo)" 
                                    radius={[0, 4, 4, 0]} 
                                    barSize={20} 
                                    label={{ position: 'right', fill: '#6B7280', fontSize: 12 }} 
                                />
                            </BarChart>
                        </ChartContainer>
                    </Card>

                    {/* CHART 2: Student Distribution */}
                    <Card>
                        <ChartContainer title="Engajamento e Risco de Evasão" subtitle="Baseado na atividade dos últimos 30 dias.">
                            <PieChart>
                                <Pie
                                    data={studentDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {studentDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ChartContainer>
                    </Card>

                    {/* CHART 3: Top Schools Ranking */}
                    <Card className="p-4 lg:col-span-2">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Top 5 Escolas por Frequência</h3>
                        <div className="space-y-4">
                            {rankingData.map((item, index) => (
                                <div key={index} className="flex items-center">
                                    <span className={`w-6 text-sm font-bold ${index === 0 ? 'text-yellow-500' : 'text-slate-500'}`}>#{index + 1}</span>
                                    <div className="flex-1 ml-2">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{item.attendance}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                            <div 
                                                className="h-2.5 rounded-full transition-all duration-1000 bg-gradient-to-r from-indigo-500 to-purple-500" 
                                                style={{ width: `${item.attendance}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Escola">
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Insira o ID do usuário Diretor da escola que deseja monitorar.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            ID da Escola (Diretor)
                        </label>
                        <input
                            type="text"
                            value={directorIdInput}
                            onChange={(e) => setDirectorIdInput(e.target.value)}
                            placeholder="Ex: 7X8y9Z..."
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={onSubmitAdd}
                            disabled={isAddingSchool || !directorIdInput}
                            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                        >
                            {isAddingSchool ? <SpinnerIcon className="h-4 w-4 mr-2" /> : null}
                            Adicionar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SecretariatDashboard;
