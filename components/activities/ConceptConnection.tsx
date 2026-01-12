
import React, { useState } from 'react';
import type { Activity } from '../../types';

interface Props {
    activity: Activity;
    onComplete: (data: any) => void;
}

export const ConceptConnection: React.FC<Props> = ({ activity, onComplete }) => {
    const data = activity.conceptConnectionData;
    const [connections, setConnections] = useState<Record<string, string>>({}); // LeftID -> RightID
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

    if (!data) return null;

    const handleLeftClick = (id: string) => {
        // Se já tem conexão, remove
        if (connections[id]) {
            const newConn = { ...connections };
            delete newConn[id];
            setConnections(newConn);
        }
        setSelectedLeft(id);
    };

    const handleRightClick = (id: string) => {
        if (selectedLeft) {
            // Verifica se a conexão está correta (Feedback imediato estilo Duolingo)
            // Ou permite conectar tudo e valida no final.
            // Aqui vamos conectar e validar visualmente.
            const newConn = { ...connections, [selectedLeft]: id };
            setConnections(newConn);
            setSelectedLeft(null);

            // Verifica se completou tudo
            if (Object.keys(newConn).length === data.leftColumn.length) {
                onComplete({ connections: newConn });
            }
        }
    };

    const isConnectedLeft = (id: string) => !!connections[id];
    const isConnectedRight = (id: string) => Object.values(connections).includes(id);

    // Verifica se a conexão está correta para colorir
    const getConnectionStatus = (leftId: string) => {
        const rightId = connections[leftId];
        if (!rightId) return 'none';
        
        const pair = data.pairs.find(p => p.left === leftId && p.right === rightId);
        return pair ? 'correct' : 'wrong';
    };

    return (
        <div className="space-y-8 animate-fade-in select-none">
            <h3 className="text-center text-xl font-bold text-white mb-6">Conecte os Conceitos</h3>
            
            <div className="flex justify-between gap-8 relative">
                {/* Coluna Esquerda */}
                <div className="flex-1 space-y-4">
                    {data.leftColumn.map(item => {
                        const status = getConnectionStatus(item.id);
                        let borderClass = 'border-white/10';
                        if (selectedLeft === item.id) borderClass = 'border-brand ring-2 ring-brand ring-opacity-50';
                        if (status === 'correct') borderClass = 'border-green-500 bg-green-900/20';
                        if (status === 'wrong') borderClass = 'border-red-500 bg-red-900/20';

                        return (
                            <div 
                                key={item.id}
                                onClick={() => handleLeftClick(item.id)}
                                className={`p-4 rounded-xl glass-panel cursor-pointer transition-all duration-200 hover:bg-white/5 border ${borderClass} flex items-center justify-between`}
                            >
                                <span className="text-slate-200 font-medium">{item.text}</span>
                                <div className={`w-3 h-3 rounded-full ${status === 'correct' ? 'bg-green-500' : status === 'wrong' ? 'bg-red-500' : 'bg-slate-600'}`} />
                            </div>
                        );
                    })}
                </div>

                {/* SVG Lines Overlay - Simplificado para Mobile (Visual apenas nas pontas por enquanto ou usar canvas complexo depois) */}
                {/* Para MVP, usamos indicação de cor/status nos cards */}

                {/* Coluna Direita */}
                <div className="flex-1 space-y-4">
                    {data.rightColumn.map(item => {
                        const isTargeted = isConnectedRight(item.id);
                        // Encontra quem conectou neste (reverso)
                        const connectedLeftId = Object.keys(connections).find(key => connections[key] === item.id);
                        const status = connectedLeftId ? getConnectionStatus(connectedLeftId) : 'none';

                        let borderClass = 'border-white/10';
                        if (status === 'correct') borderClass = 'border-green-500 bg-green-900/20';
                        if (status === 'wrong') borderClass = 'border-red-500 bg-red-900/20';

                        return (
                            <div 
                                key={item.id}
                                onClick={() => handleRightClick(item.id)}
                                className={`p-4 rounded-xl glass-panel cursor-pointer transition-all duration-200 hover:bg-white/5 border ${borderClass} flex items-center gap-3`}
                            >
                                <div className={`w-3 h-3 rounded-full ${status === 'correct' ? 'bg-green-500' : status === 'wrong' ? 'bg-red-500' : 'bg-slate-600'}`} />
                                <span className="text-slate-300 text-sm">{item.text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className="text-center text-slate-500 text-sm mt-4">
                Toque em um item da esquerda e depois no correspondente da direita.
            </p>
        </div>
    );
};
