
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Activity, HotspotItem } from '../../types';
import { Card } from '../common/Card';

interface Props {
    activity: Activity;
    onComplete: (data: any) => void;
}

export const VisualSourceAnalysis: React.FC<Props> = ({ activity, onComplete }) => {
    const data = activity.visualSourceData;
    const [foundHotspots, setFoundHotspots] = useState<string[]>([]);
    const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFullScreen(false);
        };
        if (isFullScreen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isFullScreen]);

    if (!data) return <div className="text-red-500">Dados da atividade corrompidos.</div>;

    const handleHotspotClick = (id: string) => {
        setSelectedHotspot(id);
        if (!foundHotspots.includes(id)) {
            const newFound = [...foundHotspots, id];
            setFoundHotspots(newFound);
            // Salva progresso se todos foram encontrados ou incrementalmente
            if (newFound.length === data.hotspots.length) {
                onComplete({ status: 'completed', found: newFound });
            }
        }
    };

    const isPdf = data.imageUrl?.toLowerCase().includes('.pdf');

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-white/10">
                <h3 className="text-white font-bold">
                    {isPdf ? 'Analise o Documento PDF' : 'Encontre os detalhes na imagem'}
                </h3>
                {!isPdf && (
                    <span className="text-brand font-mono">{foundHotspots.length} / {data.hotspots.length}</span>
                )}
            </div>

            <div className="relative w-full overflow-hidden rounded-xl border border-white/10 group shadow-2xl bg-black/50 min-h-[400px]">
                {isPdf ? (
                    <div className="w-full h-[600px] md:h-[800px]">
                        <iframe 
                            src={`${data.imageUrl}#toolbar=0`} 
                            className="w-full h-full rounded-md"
                            title="Visualizador de PDF"
                        />
                    </div>
                ) : (
                    <>
                        <img 
                            src={data.imageUrl} 
                            alt="Fonte Histórica" 
                            className="w-full h-auto object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.01]"
                            onDoubleClick={() => setIsFullScreen(true)}
                            title="Duplo clique para ampliar"
                        />
                        
                        {data.hotspots.map((spot) => {
                            const isFound = foundHotspots.includes(spot.id);
                            const isSelected = selectedHotspot === spot.id;

                            return (
                                <button
                                    key={spot.id}
                                    onClick={() => handleHotspotClick(spot.id)}
                                    className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand ${
                                        isFound 
                                        ? 'bg-green-500/80 text-white shadow-[0_0_15px_rgba(34,197,94,0.6)]' 
                                        : 'bg-white/20 border-2 border-white/50 animate-pulse hover:bg-white/40'
                                    }`}
                                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                                    aria-label={`Detalhe ${spot.id}`}
                                >
                                    {isFound ? '✓' : '?'}
                                </button>
                            );
                        })}

                        {/* Popover de Feedback (Apenas Imagens) */}
                        {selectedHotspot && (
                            <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-xl p-4 rounded-lg border border-white/10 text-white animate-slide-in shadow-2xl z-20">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-brand text-lg mb-1">
                                        {data.hotspots.find(h => h.id === selectedHotspot)?.label}
                                    </h4>
                                    <button onClick={() => setSelectedHotspot(null)} className="text-slate-400 hover:text-white">✕</button>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {data.hotspots.find(h => h.id === selectedHotspot)?.feedback}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
            
            <Card className="bg-blue-900/20 border-blue-500/30">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <p className="text-sm text-blue-200">
                        {isPdf 
                            ? "Leia o documento PDF fornecido acima com atenção. As informações contidas nele serão essenciais para responder às questões a seguir."
                            : "Clique nas áreas da imagem que correspondem ao tema estudado. Cada descoberta revela um contexto histórico importante. Dê um duplo clique na imagem para vê-la em tela cheia."
                        }
                    </p>
                </div>
            </Card>

            {isFullScreen && !isPdf && createPortal(
                <div 
                    className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center cursor-zoom-out animate-fade-in p-4"
                    onClick={() => setIsFullScreen(false)}
                >
                    <div className="relative max-w-full max-h-full">
                        <img 
                            src={data.imageUrl} 
                            alt="Fonte Histórica Ampliada" 
                            className="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl rounded-lg select-none"
                        />
                        <button 
                            className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            onClick={() => setIsFullScreen(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs font-mono bg-black/50 px-4 py-2 rounded-full pointer-events-none border border-white/10 backdrop-blur-sm">
                        Modo de Inspeção (Sem Hotspots)
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
