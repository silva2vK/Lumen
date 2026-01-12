
import React, { useState } from 'react';
import type { Activity } from '../../types';

interface Props {
    activity: Activity;
    onComplete: (data: any) => void;
}

export const IntegrativeDragDrop: React.FC<Props> = ({ activity, onComplete }) => {
    const data = activity.integrativeData;
    if (!data) return null;

    // Estado local para onde os itens estão (pending, colA, colB, intersection)
    // Para simplificar sem DND-KIT, usamos click-to-move (Tap item -> Tap destination)
    const [itemsStatus, setItemsStatus] = useState<Record<string, 'pending' | 'columnA' | 'columnB' | 'intersection'>>(
        Object.fromEntries(data.items.map(i => [i.id, 'pending']))
    );
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const handleItemClick = (id: string) => {
        // Se já está posicionado, volta para pending
        if (itemsStatus[id] !== 'pending') {
            setItemsStatus(prev => ({ ...prev, [id]: 'pending' }));
            return;
        }
        setSelectedItem(id === selectedItem ? null : id);
    };

    const handleZoneClick = (zone: 'columnA' | 'columnB' | 'intersection') => {
        if (selectedItem) {
            setItemsStatus(prev => ({ ...prev, [selectedItem]: zone }));
            setSelectedItem(null);

            // Verifica vitória
            const currentStatus = { ...itemsStatus, [selectedItem]: zone };
            const allPlaced = Object.values(currentStatus).every(s => s !== 'pending');
            
            if (allPlaced) {
                // Validação final opcional ou apenas salvar o estado
                onComplete({ status: 'placed', positions: currentStatus });
            }
        }
    };

    const renderItem = (id: string) => {
        const item = data.items.find(i => i.id === id);
        if (!item) return null;
        
        const isSelected = selectedItem === id;
        
        // Verifica se a posição atual corresponde à correta configurada pelo professor
        // Mapeamento: 'A' -> 'columnA', 'B' -> 'columnB', 'Intersection' -> 'intersection'
        const currentZone = itemsStatus[id];
        const correctZoneCode = item.correctColumnId;
        
        let isCorrect = false;
        if (currentZone === 'columnA' && correctZoneCode === 'A') isCorrect = true;
        if (currentZone === 'columnB' && correctZoneCode === 'B') isCorrect = true;
        if (currentZone === 'intersection' && correctZoneCode === 'Intersection') isCorrect = true;

        const placed = currentZone !== 'pending';
        
        let bgClass = isSelected 
            ? 'bg-brand text-black scale-105 shadow-[0_0_15px_rgba(var(--brand-rgb),0.5)] z-20' 
            : 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600';
        
        // Feedback visual imediato quando posicionado
        if (placed) {
            bgClass = isCorrect 
                ? 'bg-green-600 text-white border-green-500 shadow-sm' 
                : 'bg-red-500 text-white border-red-400 shadow-sm';
        }

        return (
            <button
                key={id}
                onClick={() => handleItemClick(id)}
                className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 w-full mb-2 text-left relative ${bgClass}`}
            >
                {item.content}
                {placed && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-80">
                        {isCorrect ? '✓' : '✕'}
                    </span>
                )}
            </button>
        );
    };

    return (
        <div className="space-y-6 select-none animate-fade-in">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">Reconciliação Integrativa</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Selecione um item abaixo e toque na coluna correspondente para classificá-lo.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
                {/* Coluna A */}
                <div 
                    onClick={() => handleZoneClick('columnA')}
                    className={`flex flex-col rounded-xl border-2 transition-all p-4 relative overflow-hidden ${
                        selectedItem 
                        ? 'border-indigo-500/50 bg-indigo-900/10 cursor-pointer hover:bg-indigo-900/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                        : 'border-indigo-900/30 bg-indigo-900/5'
                    }`}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                    <h4 className="font-bold text-indigo-300 mb-4 text-center uppercase tracking-wider text-sm">{data.columnA}</h4>
                    <div className="w-full flex-1 space-y-2">
                        {data.items.filter(i => itemsStatus[i.id] === 'columnA').map(i => renderItem(i.id))}
                    </div>
                </div>

                {/* Interseção (Meio) */}
                <div 
                    onClick={() => handleZoneClick('intersection')}
                    className={`flex flex-col rounded-xl border-2 transition-all p-4 relative overflow-hidden ${
                        selectedItem 
                        ? 'border-purple-500/50 bg-purple-900/10 cursor-pointer hover:bg-purple-900/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                        : 'border-purple-900/30 bg-purple-900/5'
                    }`}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
                    <h4 className="font-bold text-purple-300 mb-4 text-center uppercase tracking-wider text-sm flex items-center justify-center gap-2">
                        <span className="text-lg">🔗</span> Em Comum
                    </h4>
                    <div className="w-full flex-1 space-y-2">
                        {data.items.filter(i => itemsStatus[i.id] === 'intersection').map(i => renderItem(i.id))}
                    </div>
                </div>

                {/* Coluna B */}
                <div 
                    onClick={() => handleZoneClick('columnB')}
                    className={`flex flex-col rounded-xl border-2 transition-all p-4 relative overflow-hidden ${
                        selectedItem 
                        ? 'border-cyan-500/50 bg-cyan-900/10 cursor-pointer hover:bg-cyan-900/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                        : 'border-cyan-900/30 bg-cyan-900/5'
                    }`}
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500"></div>
                    <h4 className="font-bold text-cyan-300 mb-4 text-center uppercase tracking-wider text-sm">{data.columnB}</h4>
                    <div className="w-full flex-1 space-y-2">
                        {data.items.filter(i => itemsStatus[i.id] === 'columnB').map(i => renderItem(i.id))}
                    </div>
                </div>
            </div>

            {/* Banco de Itens */}
            <div className="bg-[#0d1117] p-6 rounded-xl border border-white/10 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Conceitos Disponíveis</p>
                    <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-slate-400">
                        {data.items.filter(i => itemsStatus[i.id] === 'pending').length} restantes
                    </span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {data.items.filter(i => itemsStatus[i.id] === 'pending').map(i => (
                        <div key={i.id} className="w-full sm:w-auto min-w-[120px]">{renderItem(i.id)}</div>
                    ))}
                    {data.items.every(i => itemsStatus[i.id] !== 'pending') && (
                        <div className="w-full py-8 text-center border-2 border-dashed border-white/5 rounded-lg">
                            <span className="text-2xl block mb-2">🎉</span>
                            <p className="text-slate-500 text-sm font-bold uppercase">Classificação Concluída</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
