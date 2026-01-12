
import React, { useState } from 'react';
import type { Activity, TreeData } from '../../types';

interface Props {
    activity: Activity;
    onComplete: (data?: any) => void;
}

const TreeNode: React.FC<{ node: TreeData; depth?: number }> = ({ node, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="flex flex-col items-center">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                    relative z-10 px-6 py-4 rounded-xl border transition-all duration-300 transform 
                    ${isExpanded 
                        ? 'bg-brand text-black border-brand scale-105 shadow-[0_0_20px_rgba(var(--brand-rgb),0.4)]' 
                        : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                    }
                `}
            >
                <div className="text-lg font-bold">{node.label}</div>
                {isExpanded && <div className="mt-2 text-sm opacity-90 border-t border-black/20 pt-2">{node.content}</div>}
                {hasChildren && (
                    <div className={`mt-2 text-xs uppercase tracking-widest font-bold opacity-70 ${isExpanded ? 'text-black' : 'text-slate-400'}`}>
                        {isExpanded ? '▲ Recolher' : '▼ Expandir'}
                    </div>
                )}
            </button>

            {isExpanded && hasChildren && (
                <div className="flex flex-col items-center animate-fade-in w-full">
                    <div className="h-8 w-0.5 bg-slate-600"></div> {/* Linha vertical */}
                    <div className="flex flex-wrap justify-center gap-8 border-t border-slate-600 pt-8 px-4 relative">
                        {/* Gambiarra visual para conectar linhas horizontais - em CSS puro é complexo, aqui simplificado */}
                        {node.children!.map((child) => (
                            <div key={child.id} className="flex flex-col items-center">
                                {/* Pequena linha vertical topo de cada filho */}
                                <div className="h-8 w-0.5 bg-slate-600 absolute -top-0"></div> 
                                <TreeNode node={child} depth={depth + 1} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const ProgressiveTree: React.FC<Props> = ({ activity, onComplete }) => {
    const data = activity.progressiveTreeData;
    if (!data) return null;

    return (
        <div className="w-full overflow-x-auto custom-scrollbar pb-12">
            <div className="min-w-[800px] flex flex-col items-center py-8">
                <h3 className="text-2xl font-bold text-white mb-8">Mapa Mental Progressivo</h3>
                <TreeNode node={data.root} />
                
                <button 
                    onClick={() => onComplete({ status: 'explored' })}
                    className="mt-16 px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-lg"
                >
                    Concluir Exploração
                </button>
            </div>
        </div>
    );
};
