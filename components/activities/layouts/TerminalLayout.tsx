
import React from 'react';
import type { ActivityLayoutProps } from '../../../types';

export const TerminalLayout: React.FC<ActivityLayoutProps> = ({ 
    activity, items, answers, handleAnswerChange, 
    handleSubmit, isSubmitting, onBack, renderComplexContent, isSubmitted, submission 
}) => {
    return (
        <div className="min-h-screen bg-black font-mono text-green-500 p-4 md:p-8 overflow-hidden relative">
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            
            {/* Scanline Effect */}
            <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8 border-b border-green-900 pb-2 flex justify-between items-end">
                    <div>
                        <p className="text-xs text-green-800 mb-1">root@lumen:~# ./start_activity.sh --id={activity.id}</p>
                        <h1 className="text-2xl md:text-3xl font-bold text-green-400 uppercase glitch-text" data-text={activity.title}>{activity.title}</h1>
                    </div>
                    <button onClick={onBack} className="text-green-700 hover:text-green-400 hover:bg-green-900/20 px-2 py-1 uppercase text-xs font-bold transition-colors">
                        [ ABORT ]
                    </button>
                </div>

                <div className="mb-8 text-green-600 text-sm border-l-2 border-green-800 pl-4 py-2">
                    <span className="text-green-800 font-bold mr-2">&gt;&gt;</span>
                    {activity.description}
                </div>

                <div className="mb-8 border border-green-900 p-2">
                    <div className="bg-black border-b border-green-900 mb-2 px-2 py-1 text-xs text-green-800 uppercase">Interactive_Module_Render</div>
                    {renderComplexContent()}
                </div>

                {isSubmitted ? (
                    <div className="border border-green-500 p-6 text-center animate-pulse">
                        <h2 className="text-xl font-bold mb-2">UPLOAD_COMPLETE</h2>
                        <p className="text-sm text-green-700">Data synchronized with mainframe.</p>
                        {submission?.feedback && (
                            <div className="mt-4 text-left border-t border-green-900 pt-4">
                                <p className="text-xs text-green-800 uppercase mb-1">admin_response:</p>
                                <p className="text-green-400">"{submission.feedback}"</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-10">
                        {items.map((item, idx) => (
                            <div key={item.id} className="group">
                                <div className="flex gap-2 mb-2">
                                    <span className="text-green-700">[{String(idx).padStart(2, '0')}]</span>
                                    <p className="font-bold text-green-300">{item.question}</p>
                                </div>

                                {item.type === 'text' ? (
                                    <div className="flex gap-2">
                                        <span className="text-green-500 mt-1">&gt;</span>
                                        <textarea 
                                            rows={3}
                                            className="w-full bg-black border-none text-green-400 focus:ring-0 p-0 resize-y font-mono placeholder-green-900"
                                            placeholder="..."
                                            value={answers[item.id] || ''}
                                            onChange={e => handleAnswerChange(item.id, e.target.value)}
                                        />
                                        <span className="animate-pulse bg-green-500 w-2 h-5 mt-1 block"></span>
                                    </div>
                                ) : (
                                    <div className="pl-8 space-y-1">
                                        {item.options?.map(opt => {
                                            const isChecked = answers[item.id] === opt.id;
                                            return (
                                                <button 
                                                    key={opt.id}
                                                    onClick={() => handleAnswerChange(item.id, opt.id)}
                                                    className="block w-full text-left hover:bg-green-900/20 px-2 py-1 transition-colors"
                                                >
                                                    <span className={isChecked ? "text-green-400 font-bold" : "text-green-800"}>
                                                        {isChecked ? "(X)" : "( )"} {opt.text}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="pt-8 border-t border-green-900">
                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full border border-green-500 text-green-500 hover:bg-green-500 hover:text-black py-3 font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'UPLOADING_PACKETS...' : 'EXECUTE_SUBMISSION'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
