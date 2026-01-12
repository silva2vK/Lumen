
import React, { useEffect, useState } from 'react';
import type { ActivityLayoutProps } from '../../../types';

// Efeitos de animação e texturas injetados via style
const SilentHillStyles = () => (
    <style>{`
        @keyframes fog-move {
            0% { transform: translateX(-10%) translateY(0); opacity: 0.4; }
            50% { transform: translateX(10%) translateY(-5%); opacity: 0.6; }
            100% { transform: translateX(-10%) translateY(0); opacity: 0.4; }
        }
        @keyframes noise {
            0%, 100% { background-position: 0 0; }
            10% { background-position: -5% -10%; }
            20% { background-position: -15% 5%; }
            30% { background-position: 7% -25%; }
            40% { background-position: 20% 25%; }
            50% { background-position: -25% 10%; }
            60% { background-position: 15% 5%; }
            70% { background-position: 0% 15%; }
            80% { background-position: 25% 35%; }
            90% { background-position: -10% 10%; }
        }
        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(153, 27, 27, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(153, 27, 27, 0); }
            100% { box-shadow: 0 0 0 0 rgba(153, 27, 27, 0); }
        }
        .font-sh-title {
            font-family: 'Cinzel', serif;
            letter-spacing: 0.05em;
        }
        .font-sh-body {
            font-family: 'Special Elite', monospace;
        }
        .sh-noise {
            background-image: url("https://grainy-gradients.vercel.app/noise.svg");
            animation: noise 2s steps(4) infinite;
            pointer-events: none;
        }
        .sh-fog-layer {
            background: url('https://raw.githubusercontent.com/danielkellyio/fog-effect/master/fog1.png') repeat-x;
            background-size: 200% 100%;
            animation: fog-move 60s linear infinite alternate;
        }
        .sh-checkbox:checked + div {
            background-color: #7f1d1d;
            border-color: #7f1d1d;
        }
        /* Efeito de papel sujo */
        .sh-paper {
            background-color: #d6d3d1;
            background-image: 
                linear-gradient(rgba(255,255,255,0.8), rgba(214,211,209,0.9)),
                url("https://www.transparenttextures.com/patterns/aged-paper.png");
            box-shadow: 0 0 100px rgba(0,0,0,0.9) inset, 0 0 20px rgba(0,0,0,0.8);
        }
    `}</style>
);

export const RestlessLayout: React.FC<ActivityLayoutProps> = ({ 
    activity, items, answers, handleAnswerChange, 
    handleSubmit, isSubmitting, onBack, renderComplexContent, isSubmitted, submission 
}) => {
    const [scrolled, setScrolled] = useState(0);

    // Efeito de Parallax sutil na névoa
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-stone-300 relative overflow-hidden font-sh-body selection:bg-red-900 selection:text-white">
            <SilentHillStyles />

            {/* --- LAYERS DE ATMOSFERA --- */}
            
            {/* 1. Base Texture (Rust/Concrete) */}
            <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] opacity-20 pointer-events-none mix-blend-overlay z-0"></div>
            
            {/* 2. Fog Layers */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40 sh-fog-layer" style={{ transform: `translateY(${scrolled * 0.1}px)` }}></div>
            <div className="fixed inset-0 pointer-events-none z-0 opacity-30 sh-fog-layer" style={{ animationDuration: '40s', animationDirection: 'reverse', transform: `scale(1.2) translateY(${scrolled * 0.05}px)` }}></div>

            {/* 3. Vignette (Flashlight Effect) */}
            <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.85)_80%,#000_100%)]"></div>

            {/* 4. Film Grain (Noise) */}
            <div className="fixed inset-0 sh-noise opacity-10 z-20 mix-blend-overlay"></div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="relative z-30 max-w-4xl mx-auto pt-16 pb-32 px-6">
                
                {/* Header Diegético */}
                <div className="flex justify-between items-end mb-8 border-b border-red-900/30 pb-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-red-700 opacity-80 mb-2 font-bold animate-pulse">
                            Restless Dreams // Arquivo Encontrado
                        </p>
                        <h1 className="text-4xl md:text-5xl text-stone-100 font-sh-title uppercase tracking-widest text-shadow-sm">
                            {activity.title}
                        </h1>
                    </div>
                    <button 
                        onClick={onBack} 
                        className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-red-500 transition-colors"
                    >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">&lt;</span>
                        Sair da Névoa
                    </button>
                </div>

                {isSubmitted ? (
                    /* TELA DE RESULTADO (OTHERWORLD STYLE) */
                    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center relative border border-red-900/30 bg-black/80 backdrop-blur-sm p-12 shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
                        <h2 className="text-5xl text-red-600 font-sh-title mb-6 tracking-[0.2em] uppercase">Registrado</h2>
                        <p className="text-stone-400 max-w-md mx-auto text-lg italic mb-8">
                            "Não há como voltar atrás agora. Suas escolhas foram gravadas na pedra."
                        </p>
                        
                        {submission?.feedback && (
                            <div className="w-full max-w-lg border-l-2 border-red-800 pl-6 py-2 text-left bg-red-900/10">
                                <p className="text-xs text-red-500 uppercase tracking-widest mb-2 font-bold">Observação do Supervisor:</p>
                                <p className="text-stone-300 font-sh-body leading-relaxed">
                                    "{submission.feedback}"
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* "MEMO" DO JOGO (PAPER STYLE) */
                    <div className="sh-paper relative transform rotate-[-0.5deg] p-8 md:p-12 text-stone-800 shadow-2xl">
                        {/* Manchas de "sujeira/idade" */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-stone-900/5 blur-2xl rounded-full pointer-events-none"></div>
                        <div className="absolute bottom-10 left-10 w-48 h-48 bg-yellow-900/5 blur-3xl rounded-full pointer-events-none"></div>

                        <div className="relative z-10">
                            <p className="text-lg font-medium italic border-l-2 border-stone-400 pl-4 mb-10 opacity-90">
                                "{activity.description}"
                            </p>

                            <div className="mb-12 grayscale contrast-125 mix-blend-multiply opacity-90">
                                {renderComplexContent()}
                            </div>

                            <div className="space-y-12">
                                {items.map((item, idx) => (
                                    <div key={item.id} className="relative">
                                        <div className="flex items-baseline gap-3 mb-4">
                                            <span className="text-2xl font-sh-title text-red-900/80 font-bold">{idx + 1}.</span>
                                            <p className="text-lg font-bold text-stone-900 leading-snug">{item.question}</p>
                                        </div>

                                        {item.type === 'text' ? (
                                            <div className="relative mt-2">
                                                <textarea
                                                    rows={4}
                                                    className="w-full bg-transparent border-b-2 border-stone-400 focus:border-red-800 text-stone-900 text-lg leading-relaxed placeholder:text-stone-500/50 outline-none resize-y transition-colors p-2"
                                                    placeholder="Escreva aqui..."
                                                    value={answers[item.id] || ''}
                                                    onChange={e => handleAnswerChange(item.id, e.target.value)}
                                                />
                                                <div className="absolute right-0 bottom-2 text-[10px] text-stone-500 uppercase tracking-widest pointer-events-none">
                                                    // Registro Pessoal
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 pl-2">
                                                {item.options?.map(opt => {
                                                    const isChecked = answers[item.id] === opt.id;
                                                    return (
                                                        <label 
                                                            key={opt.id} 
                                                            className={`flex items-start gap-4 p-3 cursor-pointer group transition-all ${isChecked ? 'bg-stone-900/5' : 'hover:bg-stone-900/5'}`}
                                                        >
                                                            <div className="relative flex-shrink-0 mt-1">
                                                                <input 
                                                                    type="radio" 
                                                                    name={`q-${item.id}`} 
                                                                    className="peer sr-only sh-checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => handleAnswerChange(item.id, opt.id)}
                                                                />
                                                                <div className="w-5 h-5 border-2 border-stone-600 peer-focus:ring-2 peer-focus:ring-red-500/50 transition-all rounded-sm flex items-center justify-center">
                                                                    {isChecked && (
                                                                        <div className="w-full h-full bg-red-900 opacity-80" style={{ clipPath: 'polygon(10% 10%, 90% 90%, 90% 10%, 10% 90%)' }}></div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className={`text-base ${isChecked ? 'font-bold text-red-900' : 'text-stone-800 group-hover:text-stone-900'}`}>
                                                                {opt.text}
                                                            </span>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* SAVE POINT (Botão de Envio) */}
                {!isSubmitted && (
                    <div className="fixed bottom-8 right-8 z-50">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="relative group w-24 h-24 bg-red-900 flex items-center justify-center shadow-[0_0_30px_rgba(153,27,27,0.5)] border border-red-500/30 hover:scale-105 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                            style={{ animation: 'pulse-red 3s infinite' }}
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            {isSubmitting ? (
                                <div className="text-white text-xs font-bold uppercase tracking-widest animate-pulse">
                                    Saving...
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-8 h-8 border-2 border-white/80 mx-auto mb-1 rotate-45 group-hover:rotate-90 transition-transform duration-700"></div>
                                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] block">Save</span>
                                </div>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
