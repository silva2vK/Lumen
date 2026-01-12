
import React from 'react';
import type { ActivityLayoutProps } from '../../../types';
import { SpinnerIcon } from '../../../constants/index';

export const CyberLayout: React.FC<ActivityLayoutProps> = ({ 
    activity, items, answers, handleAnswerChange, 
    handleSubmit, isSubmitting, onBack, renderComplexContent, isSubmitted, submission 
}) => {
    return (
        <div className="min-h-screen bg-[#050505] font-sans text-blue-100 relative overflow-hidden flex flex-col">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,210,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>
            
            {/* Top HUD Bar */}
            <div className="relative z-20 h-16 border-b border-blue-500/20 bg-[#0a0a1a]/80 backdrop-blur-md flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 border border-blue-500/30 rounded hover:bg-blue-500/20 transition-all text-blue-400">
                        &lt; BACK
                    </button>
                    <div className="h-8 w-[1px] bg-blue-500/20"></div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-widest uppercase">{activity.title}</h1>
                        <div className="flex items-center gap-2 text-[10px] text-blue-400 font-mono">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            SYSTEM_ONLINE // PROTOCOL_V2
                        </div>
                    </div>
                </div>
                <div className="font-mono text-blue-300 text-xs border border-blue-500/30 px-3 py-1 rounded bg-blue-900/10">
                    XP_REWARD: {activity.points}
                </div>
            </div>

            <div className="flex-1 relative z-10 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                {/* Left Panel: Description & Context */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                    <div className="bg-[#0a0a1a]/60 border border-blue-500/20 p-6 rounded-lg backdrop-blur-sm shadow-[0_0_20px_rgba(0,210,255,0.05)]">
                        <h3 className="text-xs font-bold text-blue-500 uppercase mb-4 flex items-center gap-2">
                            <span className="text-lg">ℹ</span> Mission Brief
                        </h3>
                        <p className="text-sm text-blue-100/80 leading-relaxed font-light">
                            {activity.description}
                        </p>
                    </div>
                    
                    {/* Render Complex Content inside a HUD Frame */}
                    <div className="bg-black border border-blue-500/10 rounded-lg overflow-hidden relative">
                        <div className="absolute top-2 right-2 text-[8px] text-blue-500 font-mono">VISUAL_FEED</div>
                        {renderComplexContent()}
                    </div>
                </div>

                {/* Right Panel: Input Terminal */}
                <div className="lg:col-span-8 bg-[#0a0a1a]/80 border-x border-blue-500/10 relative flex flex-col">
                    {/* Decorative Corner Lines */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {isSubmitted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 border-4 border-green-500 rounded-full flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)] text-green-500">
                                    ✓
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">TRANSMISSION COMPLETE</h2>
                                <p className="text-blue-300/60 font-mono text-sm">Data log archived successfully.</p>
                                {submission?.feedback && (
                                    <div className="mt-8 bg-blue-900/20 border border-blue-500/30 p-4 rounded text-left max-w-md w-full">
                                        <p className="text-[10px] text-blue-400 uppercase font-bold mb-1">Incoming Message:</p>
                                        <p className="text-sm text-blue-100">{submission.feedback}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {items.map((item, idx) => (
                                    <div key={item.id} className="animate-slide-in" style={{ animationDelay: `${idx * 100}ms` }}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-mono px-2 py-1 rounded">
                                                IN_{String(idx + 1).padStart(2, '0')}
                                            </span>
                                            <h3 className="text-white font-medium">{item.question}</h3>
                                        </div>

                                        {item.type === 'text' ? (
                                            <textarea
                                                rows={3}
                                                className="w-full bg-[#050505] border border-blue-500/30 rounded p-4 text-sm text-blue-100 focus:border-blue-400 focus:shadow-[0_0_15px_rgba(59,130,246,0.3)] outline-none transition-all font-mono"
                                                placeholder="> Input data stream..."
                                                value={answers[item.id] || ''}
                                                onChange={e => handleAnswerChange(item.id, e.target.value)}
                                            />
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {item.options?.map(opt => {
                                                    const isChecked = answers[item.id] === opt.id;
                                                    return (
                                                        <button 
                                                            key={opt.id}
                                                            onClick={() => handleAnswerChange(item.id, opt.id)}
                                                            className={`p-3 rounded border text-left text-sm transition-all relative overflow-hidden ${
                                                                isChecked 
                                                                ? 'bg-blue-500/20 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                                                                : 'bg-[#050505] border-blue-500/20 text-blue-300/70 hover:border-blue-500/50 hover:bg-blue-500/5'
                                                            }`}
                                                        >
                                                            {isChecked && <div className="absolute inset-0 bg-blue-400/10 animate-pulse"></div>}
                                                            {opt.text}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {!isSubmitted && (
                        <div className="p-6 border-t border-blue-500/10 bg-[#0a0a1a]/90 backdrop-blur flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest rounded clip-path-slant transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                            >
                                {isSubmitting ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : 'EXECUTE'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
