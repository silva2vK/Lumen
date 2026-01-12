
import React from 'react';
import type { ActivityLayoutProps } from '../../../types';
import { SpinnerIcon } from '../../../constants/index';

export const StandardLayout: React.FC<ActivityLayoutProps> = ({ 
    activity, items, answers, handleAnswerChange, 
    handleSubmit, isSubmitting, onBack, renderComplexContent, isSubmitted, submission, uploadedFiles, handleFileSelect 
}) => {
    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans pb-32">
            <div className="max-w-6xl mx-auto pt-6 px-4 md:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-[#30363d] pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-[#8b949e] mb-2">
                            <span className="cursor-pointer hover:text-[#58a6ff] underline-offset-2 hover:underline" onClick={onBack}>{activity.materia || 'Disciplina'}</span>
                            <span>/</span>
                            <span className="font-semibold text-white">{activity.title}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-3">
                            {activity.title} <span className="text-[#8b949e] font-light text-2xl">#{activity.id.slice(0, 4)}</span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 ${isSubmitted ? 'bg-[#8957e5]/10 text-[#d2a8ff] border-[#8957e5]/30' : 'bg-[#238636]/10 text-[#3fb950] border-[#238636]/30'}`}>
                                {isSubmitted ? (
                                    <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg> Merged (Enviado)</>
                                ) : (
                                    <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path></svg> Open (Pendente)</>
                                )}
                            </span>
                            <span className="text-[#8b949e]">
                                {activity.creatorName || 'Professor'} abriu esta atividade {activity.dueDate ? `• Prazo: ${new Date(activity.dueDate).toLocaleDateString()}` : ''}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Context / README */}
                    <div className="lg:col-span-9 space-y-6">
                        {/* Description Box (README style) */}
                        <div className="border border-[#30363d] rounded-md bg-[#0d1117] overflow-hidden">
                            <div className="bg-[#161b22] px-4 py-2 border-b border-[#30363d] flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#8b949e]" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 1 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9Zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8ZM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.25.25 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25Z"></path></svg>
                                    <span className="text-xs font-bold text-[#c9d1d9] font-mono">README.md</span>
                                </div>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="prose prose-invert max-w-none prose-sm md:prose-base prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-[#30363d]">
                                    <p>{activity.description}</p>
                                    {renderComplexContent()}
                                </div>
                            </div>
                        </div>

                        {/* Questions Flow (Timeline style) */}
                        <div className="relative pl-0 md:pl-4 pt-4">
                            {/* Vertical Line */}
                            <div className="absolute left-4 md:left-12 top-0 bottom-0 w-0.5 bg-[#30363d] hidden md:block"></div>

                            {items.map((item, idx) => (
                                <div key={item.id} className="relative mb-8 md:pl-20">
                                    {/* Timeline Icon */}
                                    <div className="absolute left-8 top-0 w-8 h-8 bg-[#21262d] border border-[#30363d] rounded-full flex items-center justify-center z-10 hidden md:flex text-[#8b949e]">
                                        <span className="text-xs font-bold">{idx + 1}</span>
                                    </div>

                                    {/* Question Box */}
                                    <div className="border border-[#30363d] rounded-md bg-[#0d1117] relative">
                                        {/* Pointy bit for comment bubble look */}
                                        <div className="absolute top-3 -left-1.5 w-3 h-3 bg-[#161b22] border-l border-t border-[#30363d] transform -rotate-45 hidden md:block"></div>

                                        <div className="bg-[#161b22] px-4 py-2 border-b border-[#30363d] rounded-t-md flex justify-between items-center">
                                            <span className="text-sm font-semibold text-[#c9d1d9]">Questão {idx + 1}</span>
                                            <span className="text-xs text-[#8b949e] border border-[#30363d] px-2 py-0.5 rounded-full">{item.points} pts</span>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-[#c9d1d9] mb-4 text-sm md:text-base font-medium leading-relaxed">{item.question}</p>
                                            
                                            {!isSubmitted ? (
                                                item.type === 'text' ? (
                                                    <div className="relative">
                                                        <textarea
                                                            rows={4}
                                                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md p-3 text-sm text-[#c9d1d9] focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] outline-none transition-all placeholder-[#484f58] font-mono resize-y min-h-[100px]"
                                                            placeholder="Escreva sua resposta..."
                                                            value={answers[item.id] || ''}
                                                            onChange={e => handleAnswerChange(item.id, e.target.value)}
                                                        />
                                                        <div className="absolute bottom-2 right-2 text-[10px] text-[#484f58] pointer-events-none">Markdown supported</div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {item.options?.map(opt => (
                                                            <label key={opt.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-[#161b22] cursor-pointer border border-transparent hover:border-[#30363d] transition-all group">
                                                                <input 
                                                                    type="radio" 
                                                                    name={`q-${item.id}`}
                                                                    className="appearance-none w-4 h-4 rounded-full border border-[#30363d] bg-[#0d1117] checked:bg-[#1f6feb] checked:border-[#1f6feb] focus:ring-0 focus:ring-offset-0 checked:after:content-[''] checked:after:block checked:after:w-1.5 checked:after:h-1.5 checked:after:rounded-full checked:after:bg-white checked:after:m-auto checked:after:mt-[3px] group-hover:border-[#8b949e]"
                                                                    checked={answers[item.id] === opt.id}
                                                                    onChange={() => handleAnswerChange(item.id, opt.id)}
                                                                />
                                                                <span className="text-sm text-[#c9d1d9] group-hover:text-[#58a6ff] transition-colors">{opt.text}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )
                                            ) : (
                                                <div className="p-3 bg-[#161b22] rounded border border-[#30363d] text-sm text-[#8b949e] font-mono">
                                                    {item.type === 'multiple_choice' 
                                                        ? item.options?.find(o => o.id === answers[item.id])?.text || 'Sem resposta'
                                                        : answers[item.id] || 'Sem resposta'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* File Upload Section */}
                            {activity.allowFileUpload && !isSubmitted && (
                                <div className="relative mb-8 md:pl-20">
                                    <div className="absolute left-8 top-0 w-8 h-8 bg-[#21262d] border border-[#30363d] rounded-full flex items-center justify-center z-10 hidden md:flex text-[#8b949e]">
                                        <span className="text-xs font-bold">📎</span>
                                    </div>
                                    <div className="border border-[#30363d] rounded-md bg-[#0d1117] relative">
                                        <div className="absolute top-3 -left-1.5 w-3 h-3 bg-[#0d1117] border-l border-t border-[#30363d] transform -rotate-45 hidden md:block"></div>
                                        <div className="p-4">
                                            <h3 className="text-sm font-semibold text-[#c9d1d9] mb-2">Anexar Arquivos</h3>
                                            <div className="border border-dashed border-[#30363d] rounded-md p-8 text-center hover:bg-[#161b22] hover:border-[#8b949e] transition-all cursor-pointer relative bg-[#0d1117]">
                                                <input 
                                                    type="file" 
                                                    multiple 
                                                    onChange={handleFileSelect} 
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <p className="text-sm text-[#c9d1d9] font-medium">Arraste arquivos aqui ou clique para selecionar.</p>
                                                <p className="text-xs text--[#8b949e] mt-1">Imagens, documentos ou PDFs.</p>
                                                {uploadedFiles.length > 0 && (
                                                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                                        {uploadedFiles.map((f, i) => (
                                                            <span key={i} className="text-xs bg-[#1f6feb]/20 text-[#58a6ff] px-2 py-1 rounded border border-[#1f6feb]/40 flex items-center gap-1">
                                                                📄 {f.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submission Area */}
                        {!isSubmitted && (
                            <div className="md:pl-20 border-t border-[#30363d] pt-6 flex justify-end gap-3">
                                <button 
                                    onClick={onBack}
                                    className="px-4 py-2 bg-[#21262d] text-[#c9d1d9] text-sm font-semibold rounded-md border border-[#30363d] hover:bg-[#30363d] hover:border-[#8b949e] transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-[#238636] text-white text-sm font-bold rounded-md hover:bg-[#2ea043] border border-[rgba(240,246,252,0.1)] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting && <SpinnerIcon className="w-4 h-4 animate-spin text-white" />}
                                    {isSubmitting ? 'Enviando...' : 'Finalizar Atividade'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="border border-[#30363d] rounded-md bg-[#0d1117] overflow-hidden">
                            <div className="p-4 border-b border-[#30363d] bg-[#161b22]">
                                <h3 className="text-xs font-bold text-[#c9d1d9] uppercase">Detalhes</h3>
                            </div>
                            <div className="p-4 space-y-4 text-sm text-[#8b949e]">
                                <div className="flex justify-between items-center pb-3 border-b border-[#30363d]">
                                    <span>Status</span>
                                    <span className={isSubmitted ? "text-[#a371f7]" : "text-[#3fb950]"}>{isSubmitted ? 'Concluído' : 'Pendente'}</span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-[#30363d]">
                                    <span>Prazo</span>
                                    <span className="text-[#c9d1d9]">{activity.dueDate ? new Date(activity.dueDate).toLocaleDateString() : 'Sem prazo'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Pontos</span>
                                    <span className="text-[#c9d1d9]">{activity.points} XP</span>
                                </div>
                            </div>
                        </div>

                        {/* Feedback Box if submitted */}
                        {isSubmitted && submission?.feedback && (
                            <div className="border border-[#30363d] rounded-md bg-[#0d1117] overflow-hidden">
                                <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#a371f7]"></div>
                                    <h3 className="text-xs font-bold text-[#c9d1d9] uppercase">Feedback do Professor</h3>
                                </div>
                                <div className="p-4 text-sm text-[#c9d1d9] leading-relaxed">
                                    {submission.feedback}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
