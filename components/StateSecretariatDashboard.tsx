
import React, { useState } from 'react';
import { Card } from './common/Card';
import { ICONS, SpinnerIcon } from '../constants/index';
import { useStateSecretariatContext } from '../contexts/StateSecretariatContext';
import { Modal } from './common/Modal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
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

// Dados Mock para Gráfico de Tendência (Evolução IDEB simulada)
const TREND_DATA = [
    { name: '2020', ideb: 4.2 },
    { name: '2021', ideb: 4.5 },
    { name: '2022', ideb: 4.8 },
    { name: '2023', ideb: 5.1 },
    { name: '2024', ideb: 5.4 },
    { name: 'Meta', ideb: 6.0 },
];

const StateSecretariatDashboard: React.FC = () => {
    const { municipalities, globalStats, isLoading, isAddingMunicipality, handleAddMunicipality } = useStateSecretariatContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [secretariatIdInput, setSecretariatIdInput] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'intelligence'>('overview');

    const onSubmitAdd = async () => {
        await handleAddMunicipality(secretariatIdInput);
        setIsModalOpen(false);
        setSecretariatIdInput('');
    };

    // Calculate aggregated stats for chart
    const dropoutData = municipalities.map(m => ({
        name: m.name.replace('Secretaria Municipal', '').trim() || 'Município',
        risk: Math.round(m.dropoutRiskRate || 0)
    })).sort((a, b) => b.risk - a.risk).slice(0, 7);

    const averagePerformance = municipalities.length > 0 
        ? (municipalities.reduce((acc, m) => acc + (m.networkPerformance || 0), 0) / municipalities.length).toFixed(1)
        : '0.0';

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <SpinnerIcon className="h-12 w-12 text-teal-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Secretaria Estadual</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Gestão da rede e monitoramento de Secretarias Municipais.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === 'overview' ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                    >
                        Rede
                    </button>
                    <button 
                        onClick={() => setActiveTab('intelligence')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center ${activeTab === 'intelligence' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
                        Dados
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-sm hover:bg-teal-700 transition-colors ml-2"
                    >
                        <div className="h-5 w-5 mr-2">{ICONS.plus}</div>
                        <span>Add Município</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Municípios" 
                    value={globalStats.totalMunicipalities} 
                    description="Secretarias integradas" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                    iconBgColor="bg-teal-100 dark:bg-teal-900/50" 
                    iconTextColor="text-teal-600 dark:text-teal-300"
                />
                <StatCard 
                    title="Escolas da Rede" 
                    value={globalStats.totalSchools} 
                    description="Total estadual" 
                    icon={ICONS.director_dashboard}
                    iconBgColor="bg-indigo-100 dark:bg-indigo-900/50" 
                    iconTextColor="text-indigo-600 dark:text-indigo-300"
                />
                <StatCard 
                    title="Índice de Qualidade" 
                    value={averagePerformance} 
                    description="Média ponderada da rede" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                    iconBgColor="bg-amber-100 dark:bg-amber-900/50" 
                    iconTextColor="text-amber-600 dark:text-amber-300"
                />
            </div>

            {activeTab === 'overview' && (
                <Card className="!p-0 overflow-hidden">
                    <div className="p-6 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Rede de Ensino</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 border-b dark:border-slate-700">
                                    <th className="p-4">Secretaria Municipal</th>
                                    <th className="p-4">ID de Gestão</th>
                                    <th className="p-4 text-center">Escolas</th>
                                    <th className="p-4 text-center">Nota Média</th>
                                    <th className="p-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {municipalities.length > 0 ? (
                                    municipalities.map(muni => (
                                        <tr key={muni.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">{muni.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{muni.email}</p>
                                            </td>
                                            <td className="p-4 text-xs font-mono text-slate-500 dark:text-slate-400">{muni.id}</td>
                                            <td className="p-4 text-center font-medium text-slate-700 dark:text-slate-300">{muni.totalSchools}</td>
                                            <td className="p-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                                                {muni.networkPerformance ? muni.networkPerformance.toFixed(1) : '-'}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full dark:bg-green-900/30 dark:text-green-300">
                                                    Conectada
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                            Nenhum município vinculado. Adicione o ID de uma Secretaria Municipal para começar.
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
                    {/* CHART 1: Evolution Trend */}
                    <Card>
                        <ChartContainer title="Evolução do Índice de Qualidade (IDEB Estimado)" subtitle="Análise temporal da rede estadual.">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <ChartGradients />
                                    <defs>
                                        <linearGradient id="colorIdeb" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                                    <YAxis domain={[0, 10]} stroke="#6B7280" fontSize={12} />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="ideb" 
                                        name="IDEB"
                                        stroke="#0D9488" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorIdeb)" 
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Card>

                    {/* CHART 2: Dropout Risk by Municipality */}
                    <Card>
                        <ChartContainer title="Risco de Evasão por Município (%)" subtitle="Top 7 municípios com maior índice de risco.">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={dropoutData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="risk"
                                        nameKey="name"
                                        label={({name, risk}) => `${name.substring(0,3)}: ${risk}%`}
                                    >
                                        {dropoutData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#EF4444' : index === 1 ? '#F59E0B' : '#10B981'} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Card>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Secretaria Municipal">
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Insira o ID do usuário da Secretaria Municipal para integrá-lo à rede estadual.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            ID da Secretaria
                        </label>
                        <input
                            type="text"
                            value={secretariatIdInput}
                            onChange={(e) => setSecretariatIdInput(e.target.value)}
                            placeholder="Ex: AbC123..."
                            className="w-full p-2 border border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={onSubmitAdd}
                            disabled={isAddingMunicipality || !secretariatIdInput}
                            className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center"
                        >
                            {isAddingMunicipality ? <SpinnerIcon className="h-4 w-4 mr-2" /> : null}
                            Vincular
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default StateSecretariatDashboard;
