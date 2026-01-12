
import React from 'react';
import type { ActivityLayoutProps } from '../../../types';
import { SpinnerIcon } from '../../../constants/index';

export const MagiLayout: React.FC<ActivityLayoutProps> = ({ 
    activity, items, answers, handleAnswerChange, 
    handleSubmit, isSubmitting, onBack, renderComplexContent, isSubmitted, submission 
}) => {
    return (
        <div className="min-h-screen bg-[#2e1065] font-sans text-orange-500 p-2 md:p-6 overflow-x-hidden pb-32">
            <div className="max-w-5xl mx-auto border-2 border-orange-500 bg-black/80 shadow-[0_0_30px_rgba(249,115,22,0.3)] relative">
                
                {/* Decorative Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 -mb-1 -mr-1"></div>

                {/* Header */}
                <div className="bg-orange-500 text-black p-2 flex justify-between items-center font-black uppercase tracking-tighter">
                    <span className="text-2xl">EMERGENCY MODE</span>
                    <div className="flex gap-2">
                        <span className="bg-black text-orange-500 px-2">CODE: {activity.id.slice(0,3)}</span>
                        <button onClick={onBack} className="bg-black text-orange-500 px-4 hover:bg-orange-900 transition-colors">EXIT</button>
                    </div>
                </div>

                <div className="p-6 md:p-10 relative">
                    {/* Hexagonal Grid Background Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Info Panel */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="border border-orange-500/50 p-4 bg-orange-900/10">
                                <h1 className="text-3xl font-black text-orange-500 leading-none mb-2">{activity.title}</h1>
                                <div className="h-2 w-full bg-orange-500/30 mb-4 overflow-hidden">
                                    <div className="h-full bg-orange-500 w-2/3 animate-pulse"></div>
                                </div>
                                <p className="text-orange-300 text-xs font-mono leading-tight">{activity.description}</p>
                            </div>
                            
                            <div className="border border-purple-500 p-1 bg-purple-900/20">
                                <div className="bg-black/50 p-2">
                                    <span className="text-purple-400 text-xs font-bold uppercase block mb-1">Tactical Map</span>
                                    {renderComplexContent()}
                                </div>
                            </div>
                        </div>

                        {/* Interaction Panel */}
                        <div className="lg:col-span-8">
                            {isSubmitted ? (
                                <div className="flex flex-col items-center justify-center h-full border-2 border-green-500 bg-green-900/20 p-8">
                                    <h2 className="text-4xl font-black text-green-500 mb-4">SUCCESS</h2>
                                    <p className="text-green-300 font-mono">Operations concluded.</p>
                                    {submission?.feedback && (
                                        <div className="mt-6 border-t border-green-500/50 pt-4 w-full">
                                            <p className="text-green-600 font-bold uppercase text-xs">MAGI_SYSTEM_REPORT:</p>
                                            <p className="text-green-200 text-sm">{submission.feedback}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {items.map((item, idx) => (
                                        <div key={item.id} className="border-l-4 border-orange-500 pl-4 py-2 bg-gradient-to-r from-orange-900/10 to-transparent">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="bg-orange-500 text-black font-bold px-2 text-xs">Q-{idx + 1}</span>
                                                <span className="text-orange-100 font-bold">{item.question}</span>
                                            </div>

                                            {item.type === 'text' ? (
                                                <textarea 
                                                    className="w-full bg-black/60 border border-orange-500/30 text-orange-200 p-3 focus:border-orange-500 outline-none font-mono text-sm"
                                                    rows={3}
                                                    value={answers[item.id] || ''}
                                                    onChange={e => handleAnswerChange(item.id, e.target.value)}
                                                />
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {item.options?.map(opt => {
                                                        const isChecked = answers[item.id] === opt.id;
                                                        return (
                                                            <button 
                                                                key={opt.id}
                                                                onClick={() => handleAnswerChange(item.id, opt.id)}
                                                                className={`p-3 text-left text-xs font-bold uppercase border transition-all ${
                                                                    isChecked 
                                                                    ? 'bg-orange-500 text-black border-orange-500' 
                                                                    : 'bg-black border-orange-500/30 text-orange-400 hover:bg-orange-900/30'
                                                                }`}
                                                            >
                                                                {opt.text}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <button 
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xl py-4 clip-path-polygon shadow-[5px_5px_0px_#000] active:translate-y-[2px] active:shadow-none transition-all"
                                        style={{ clipPath: 'polygon(5% 0, 100% 0, 100% 80%, 95% 100%, 0 100%, 0 20%)' }}
                                    >
                                        {isSubmitting ? 'SYNCING...' : 'INITIATE UPLOAD'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
