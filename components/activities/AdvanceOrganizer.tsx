
import React from 'react';
import type { Activity, Module } from '../../types';
import { Card } from '../common/Card';
import { useNavigation } from '../../contexts/NavigationContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseClient';

interface Props {
    activity: Activity;
    onComplete: (data?: any) => void;
}

export const AdvanceOrganizer: React.FC<Props> = ({ activity, onComplete }) => {
    const data = activity.advanceOrganizerData;
    const { startModule } = useNavigation();

    if (!data) return null;

    const handleProceed = async () => {
        onComplete({ status: 'viewed' });
        
        if (data.linkedModuleId) {
            try {
                // Fetch basic module data to start it
                const modRef = doc(db, 'modules', data.linkedModuleId);
                const modSnap = await getDoc(modRef);
                
                if (modSnap.exists()) {
                    const moduleData = { id: modSnap.id, ...modSnap.data() } as Module;
                    startModule(moduleData);
                } else {
                    console.warn("Módulo vinculado não encontrado.");
                }
            } catch (e) {
                console.error("Erro ao redirecionar para o módulo:", e);
            }
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Antes de começarmos...</h2>
                <p className="text-slate-400">Vamos conectar o que você já sabe com o novo conteúdo.</p>
            </div>

            <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                </div>
                
                <div className="relative z-10 p-6">
                    <h3 className="text-xl font-bold text-indigo-300 mb-4 uppercase tracking-widest">Ponte Cognitiva</h3>
                    
                    <div className="prose dark:prose-invert max-w-none mb-6">
                        <p className="text-lg leading-relaxed text-slate-200">
                            {data.analogyText}
                        </p>
                    </div>

                    <div className="bg-black/30 p-4 rounded-lg border-l-4 border-brand">
                        <p className="text-sm text-slate-400 mb-1">Conceito Alvo:</p>
                        <p className="text-xl font-bold text-white">{data.targetConcept}</p>
                    </div>
                </div>
            </Card>

            {data.mediaUrl && (
                <div className="aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10">
                    <iframe 
                        className="w-full h-full"
                        src={data.mediaUrl.replace('watch?v=', 'embed/')} 
                        title="Advance Organizer Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            <button 
                onClick={handleProceed}
                className="w-full py-4 bg-brand text-black font-bold text-lg rounded-xl hover:bg-brand/90 transition-all transform hover:scale-[1.01] shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
            >
                Entendi! {data.linkedModuleId ? 'Ir para o Módulo' : 'Finalizar'} &rarr;
            </button>
        </div>
    );
};
