
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants/index';
import { useAdminData } from '../contexts/AdminDataContext';
import { Card } from './common/Card';
import type { GamificationActionConfig } from '../types';

// Hardcoded definitions for known triggers
const KNOWN_ACTIONS: Omit<GamificationActionConfig, 'currentXp'>[] = [
    { 
        id: 'quiz_complete', 
        label: 'Quiz Concluído', 
        description: 'Concedido ao aluno ao finalizar um quiz com sucesso (1ª tentativa).',
        defaultXp: 10,
        isImplemented: true
    },
    { 
        id: 'module_complete', 
        label: 'Módulo Finalizado', 
        description: 'Concedido ao completar 100% de leitura de um módulo.',
        defaultXp: 50,
        isImplemented: true
    },
    { 
        id: 'activity_sent', 
        label: 'Atividade Enviada', 
        description: 'Concedido no momento do envio de uma resposta de atividade.',
        defaultXp: 20,
        isImplemented: true
    }
];

const SUGGESTIONS: Omit<GamificationActionConfig, 'currentXp'>[] = [
    {
        id: 'daily_streak',
        label: 'Login Diário (Streak)',
        description: 'Bonus progressivo por acessar a plataforma consecutivamente.',
        defaultXp: 5,
        isImplemented: false
    },
    {
        id: 'perfect_score',
        label: 'Gabaritou Quiz',
        description: 'Bonus extra por acertar 100% das questões.',
        defaultXp: 30,
        isImplemented: false
    },
    {
        id: 'early_bird',
        label: 'Entrega Antecipada',
        description: 'Bonus por entregar atividade 48h antes do prazo.',
        defaultXp: 15,
        isImplemented: false
    },
    {
        id: 'forum_helper',
        label: 'Colaborador do Fórum',
        description: 'Quando uma resposta do aluno é marcada como útil.',
        defaultXp: 10,
        isImplemented: false
    }
];

const AdminGamification: React.FC = () => {
    const { gamificationConfig, updateGamificationAction, isSubmitting } = useAdminData();
    const [localValues, setLocalValues] = useState<Record<string, number>>({});

    // Sync local state with context when loaded
    useEffect(() => {
        if (gamificationConfig) {
            setLocalValues(gamificationConfig.actions || {});
        }
    }, [gamificationConfig]);

    const handleInputChange = (id: string, value: string) => {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num >= 0) {
            setLocalValues(prev => ({ ...prev, [id]: num }));
        }
    };

    const handleBlur = (id: string) => {
        // Save on blur if value changed
        if (gamificationConfig && localValues[id] !== gamificationConfig.actions[id]) {
            updateGamificationAction(id, localValues[id]);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <span className="text-yellow-500">{ICONS.gamification}</span>
                    <span>Economia de Gamificação</span>
                </h1>
                <p className="text-slate-400 text-sm font-mono max-w-2xl">
                    Central de controle da distribuição de XP. Ajuste os valores para balancear a progressão dos alunos em tempo real.
                </p>
            </div>

            {/* Active Triggers */}
            <section>
                <h2 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Triggers Ativos (Live)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {KNOWN_ACTIONS.map(action => (
                        <div key={action.id} className="bg-[#0d1117] border border-white/10 p-5 rounded-xl hover:border-green-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="text-4xl">⚡</span>
                            </div>
                            
                            <div className="relative z-10">
                                <h3 className="text-white font-bold text-sm mb-1">{action.label}</h3>
                                <p className="text-slate-500 text-xs mb-4 min-h-[40px]">{action.description}</p>
                                
                                <div className="flex items-center gap-3 bg-black/40 p-2 rounded-lg border border-white/5">
                                    <span className="text-xs font-mono text-slate-400">VALOR XP:</span>
                                    <input 
                                        type="number"
                                        min="0"
                                        disabled={isSubmitting}
                                        value={localValues[action.id] ?? action.defaultXp}
                                        onChange={(e) => handleInputChange(action.id, e.target.value)}
                                        onBlur={() => handleBlur(action.id)}
                                        className="bg-transparent text-right font-bold text-yellow-400 w-full focus:outline-none border-b border-transparent focus:border-yellow-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Roadmap / Suggestions */}
            <section className="pt-8 border-t border-white/5">
                <h2 className="text-lg font-bold text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                    <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                    Sugestões de Expansão (Roadmap)
                </h2>
                <p className="text-xs text-slate-600 mb-6">
                    Estas ações não estão implementadas no código, mas representam oportunidades futuras para engajamento.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-60 hover:opacity-100 transition-opacity duration-500">
                    {SUGGESTIONS.map(sugg => (
                        <div key={sugg.id} className="bg-[#0d1117] border border-white/5 p-4 rounded-lg flex flex-col justify-between h-full group border-dashed">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-slate-300 font-bold text-xs">{sugg.label}</h4>
                                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-slate-500">PROPOSTA</span>
                                </div>
                                <p className="text-slate-500 text-[10px] leading-relaxed mb-4">{sugg.description}</p>
                            </div>
                            <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs font-mono text-slate-600">
                                <span>Ref: {sugg.id}</span>
                                <span className="text-yellow-600">~{sugg.defaultXp} XP</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AdminGamification;
