
import React from 'react';
import type { ActivityLayoutProps } from '../../../types';

export const ScholarLayout: React.FC<ActivityLayoutProps> = ({ 
    activity, items, answers, handleAnswerChange, 
    handleSubmit, isSubmitting, onBack, renderComplexContent, isSubmitted, submission 
}) => {
    return (
        <div className="min-h-screen bg-[#1c1917] font-serif text-[#292524] pb-32 relative">
            {/* Wooden/Dark Texture Background */}
            <div className="fixed inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto pt-10 px-4">
                {/* Back Button - styled like a bookmark */}
                <button onClick={onBack} className="absolute left-0 top-10 -ml-16 bg-red-800 text-red-100 px-4 py-8 rounded-l-md font-bold tracking-widest writing-vertical-lr hover:bg-red-900 transition-colors shadow-lg hidden xl:block">
                    VOLTAR
                </button>
                <button onClick={onBack} className="xl:hidden mb-4 text-[#a8a29e] hover:text-white font-bold">
                    &larr; Voltar
                </button>

                {/* Main Paper Sheet */}
                <div className="bg-[#e7e5e4] shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[80vh] p-8 md:p-16 relative mx-auto max-w-3xl transform rotate-[0.5deg]">
                    {/* Paper Texture Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
                    
                    <div className="relative z-20">
                        <div className="border-b-2 border-[#292524] pb-4 mb-8 flex justify-between items-end">
                            <h1 className="text-4xl font-black tracking-tight text-[#292524]">{activity.title}</h1>
                            <span className="font-mono text-sm text-[#57534e]">{activity.points} Pts</span>
                        </div>

                        <p className="text-lg leading-relaxed text-[#44403c] mb-12 font-medium italic border-l-4 border-[#a8a29e] pl-6">
                            {activity.description}
                        </p>

                        <div className="mb-12">
                            {renderComplexContent()}
                        </div>

                        {isSubmitted ? (
                            <div className="bg-[#f5f5f4] border border-[#d6d3d1] p-8 text-center">
                                <div className="text-4xl text-green-700 mb-2">✦</div>
                                <h3 className="text-xl font-bold text-[#292524]">Atividade Registrada</h3>
                                <p className="text-[#57534e]">Suas respostas foram arquivadas na biblioteca.</p>
                                {submission?.feedback && (
                                    <div className="mt-6 p-4 bg-[#fff] border border-[#e7e5e4] text-left font-handwriting text-lg text-[#292524] shadow-sm rotate-1">
                                        <p className="text-xs uppercase text-[#a8a29e] font-sans font-bold mb-2">Nota do Professor:</p>
                                        "{submission.feedback}"
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {items.map((item, idx) => (
                                    <div key={item.id}>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="font-black text-2xl text-[#292524]">{idx + 1}.</span>
                                            <p className="text-lg font-bold text-[#44403c]">{item.question}</p>
                                        </div>

                                        {item.type === 'text' ? (
                                            <div className="relative">
                                                {/* Lined Paper Effect */}
                                                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#d6d3d1 1px, transparent 1px)', backgroundSize: '100% 2rem', marginTop: '1.9rem' }}></div>
                                                <textarea 
                                                    rows={6}
                                                    className="w-full bg-transparent border-none text-lg leading-[2rem] text-[#292524] focus:ring-0 resize-y pl-2 font-medium"
                                                    value={answers[item.id] || ''}
                                                    onChange={e => handleAnswerChange(item.id, e.target.value)}
                                                    placeholder="Escreva sua resposta..."
                                                />
                                            </div>
                                        ) : (
                                            <div className="space-y-3 pl-8">
                                                {item.options?.map(opt => {
                                                    const isChecked = answers[item.id] === opt.id;
                                                    return (
                                                        <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className={`w-5 h-5 rounded-full border-2 border-[#57534e] flex items-center justify-center transition-all ${isChecked ? 'bg-[#292524] border-[#292524]' : 'group-hover:border-[#292524]'}`}>
                                                                {isChecked && <div className="w-2 h-2 rounded-full bg-[#e7e5e4]" />}
                                                            </div>
                                                            <span className={`text-lg ${isChecked ? 'font-bold text-[#292524]' : 'text-[#57534e] group-hover:text-[#292524]'}`}>
                                                                {opt.text}
                                                            </span>
                                                            <input type="radio" name={`q-${item.id}`} className="hidden" checked={isChecked} onChange={() => handleAnswerChange(item.id, opt.id)} />
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                <div className="pt-8 border-t-2 border-[#292524] mt-12 flex justify-center">
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="bg-[#292524] text-[#e7e5e4] px-10 py-3 font-bold text-lg tracking-widest hover:bg-[#000] transition-colors shadow-lg"
                                    >
                                        {isSubmitting ? 'Arquivando...' : 'Finalizar Escrita'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
