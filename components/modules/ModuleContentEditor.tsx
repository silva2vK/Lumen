
import React, { useState } from 'react';
import type { ModulePage, ModulePageContent, ModulePageContentType } from '../../types';
import { ICONS, SpinnerIcon } from '../../constants/index';

interface ModuleContentEditorProps {
    pages: ModulePage[];
    updatePageTitle: (pageId: number, title: string) => void;
    addPage: () => void;
    removePage: (pageId: number) => void;
    addBlock: (pageId: number, type: ModulePageContentType) => void;
    removeBlock: (pageId: number, index: number) => void;
    updateBlock: (pageId: number, index: number, data: Partial<ModulePageContent>) => void;
    moveBlock: (pageId: number, index: number, direction: 'up' | 'down') => void;
    openAIModal: (pageId: number) => void;
    onImageUpload: (file: File) => Promise<string>;
}

export const ModuleContentEditor: React.FC<ModuleContentEditorProps> = ({
    pages, updatePageTitle, addPage, removePage, addBlock, removeBlock, updateBlock, moveBlock, openAIModal, onImageUpload
}) => {
    const [activePageId, setActivePageId] = useState<number>(pages[0]?.id || 0);
    const activePage = pages.find(p => p.id === activePageId) || pages[0];
    const [isUploading, setIsUploading] = useState<number | null>(null); // Track uploading block index

    const handleImageChange = async (blockIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(blockIndex);
            try {
                const url = await onImageUpload(e.target.files[0]);
                updateBlock(activePage.id, blockIndex, { content: url });
            } catch (error) {
                alert("Erro ao enviar imagem.");
            } finally {
                setIsUploading(null);
            }
        }
    };

    const inputBase = "w-full bg-[#0d1117] border border-slate-700 rounded p-2 text-white text-sm focus:border-brand outline-none transition-all";

    return (
        <div className="flex flex-col h-full bg-[#050505] rounded-xl border border-white/10 overflow-hidden">
            {/* Page Tabs */}
            <div className="flex overflow-x-auto border-b border-white/10 bg-[#0d1117] p-2 gap-2 custom-scrollbar">
                {pages.map((page, index) => (
                    <div 
                        key={page.id}
                        onClick={() => setActivePageId(page.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all min-w-[120px] justify-between group ${activePageId === page.id ? 'bg-white/10 text-white border border-white/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
                    >
                        <span className="text-xs font-bold whitespace-nowrap">Pág {index + 1}</span>
                        {pages.length > 1 && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button onClick={addPage} className="px-3 py-2 bg-brand/10 text-brand hover:bg-brand/20 rounded-lg text-xs font-bold uppercase transition-colors whitespace-nowrap">
                    + Nova Página
                </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Page Title */}
                    <div>
                        <input 
                            type="text" 
                            value={activePage.title}
                            onChange={(e) => updatePageTitle(activePage.id, e.target.value)}
                            className="text-3xl font-bold bg-transparent border-none text-white placeholder-slate-600 focus:ring-0 w-full"
                            placeholder="Título da Página"
                        />
                        <div className="h-1 w-20 bg-brand mt-2 rounded-full"></div>
                    </div>

                    {/* Blocks */}
                    <div className="space-y-6">
                        {activePage.content.map((block, blockIndex) => (
                            <div key={blockIndex} className="group relative pl-8 transition-all hover:bg-white/5 p-4 rounded-xl border border-transparent hover:border-white/5">
                                {/* Controls */}
                                <div className="absolute left-0 top-4 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
                                    <button onClick={() => moveBlock(activePage.id, blockIndex, 'up')} className="p-1 hover:text-white text-slate-500">↑</button>
                                    <button onClick={() => moveBlock(activePage.id, blockIndex, 'down')} className="p-1 hover:text-white text-slate-500">↓</button>
                                    <button onClick={() => removeBlock(activePage.id, blockIndex)} className="p-1 hover:text-red-400 text-slate-500">✕</button>
                                </div>

                                {/* Content Renders */}
                                {block.type === 'title' && (
                                    <input 
                                        type="text" 
                                        value={block.content as string} 
                                        onChange={e => updateBlock(activePage.id, blockIndex, { content: e.target.value })} 
                                        className="text-xl font-bold bg-transparent w-full text-white border-b border-transparent focus:border-slate-700 outline-none placeholder-slate-600"
                                        placeholder="Subtítulo..."
                                    />
                                )}

                                {block.type === 'paragraph' && (
                                    <textarea 
                                        value={block.content as string} 
                                        onChange={e => updateBlock(activePage.id, blockIndex, { content: e.target.value })} 
                                        rows={3}
                                        className="w-full bg-transparent text-slate-300 text-sm leading-relaxed outline-none resize-y placeholder-slate-600 border-l-2 border-transparent focus:border-slate-600 pl-2"
                                        placeholder="Digite o texto do parágrafo..."
                                    />
                                )}

                                {block.type === 'image' && (
                                    <div className="space-y-4">
                                        <div className="aspect-video bg-black/40 rounded-lg flex items-center justify-center overflow-hidden border border-white/10 relative group/img">
                                            {isUploading === blockIndex ? (
                                                <SpinnerIcon className="h-8 w-8 text-brand" />
                                            ) : block.content && typeof block.content === 'string' ? (
                                                <img src={block.content} alt={block.alt || 'Preview'} className="max-h-full object-contain" />
                                            ) : (
                                                <div className="text-slate-600 flex flex-col items-center">
                                                    <span className="text-4xl mb-2">🖼️</span>
                                                    <span className="text-xs">Preview da Imagem</span>
                                                </div>
                                            )}
                                            
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                <label className="cursor-pointer px-4 py-2 bg-white text-black font-bold rounded-full text-xs hover:scale-105 transition-transform">
                                                    Carregar Imagem
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(blockIndex, e)} />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="text" placeholder="https://..." value={block.content as string} onChange={e => updateBlock(activePage.id, blockIndex, { content: e.target.value })} className={`${inputBase} py-2 text-xs`} />
                                            <input type="text" placeholder="Legenda (Alt)" value={block.alt || ''} onChange={e => updateBlock(activePage.id, blockIndex, { alt: e.target.value })} className={`${inputBase} py-2 text-xs w-1/3`} />
                                        </div>
                                    </div>
                                )}

                                {block.type === 'video' && (
                                    <div className="space-y-2">
                                        <input type="text" placeholder="URL do YouTube (https://www.youtube.com/watch?v=...)" value={block.content as string} onChange={e => updateBlock(activePage.id, blockIndex, { content: e.target.value })} className={inputBase} />
                                        <div className="aspect-video bg-black rounded-lg border border-white/10 flex items-center justify-center text-slate-700">
                                            <span className="text-xs">Preview de Vídeo</span>
                                        </div>
                                    </div>
                                )}

                                {block.type === 'list' && (
                                    <div className="space-y-2">
                                        {(block.content as string[]).map((item, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <span className="text-brand">•</span>
                                                <input 
                                                    type="text" 
                                                    value={item} 
                                                    onChange={e => {
                                                        const newContent = [...(block.content as string[])];
                                                        newContent[idx] = e.target.value;
                                                        updateBlock(activePage.id, blockIndex, { content: newContent });
                                                    }}
                                                    className="flex-1 bg-transparent border-b border-slate-800 text-slate-300 text-sm focus:border-slate-500 outline-none"
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const newContent = (block.content as string[]).filter((_, i) => i !== idx);
                                                        updateBlock(activePage.id, blockIndex, { content: newContent });
                                                    }}
                                                    className="text-red-500 opacity-0 group-hover:opacity-100 px-2"
                                                >
                                                    -
                                                </button>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => updateBlock(activePage.id, blockIndex, { content: [...(block.content as string[]), ''] })}
                                            className="text-xs text-brand hover:underline pl-4"
                                        >
                                            + Adicionar Item
                                        </button>
                                    </div>
                                )}

                                {block.type === 'quote' && (
                                    <div className="flex gap-4">
                                        <div className="w-1 bg-slate-600 rounded-full"></div>
                                        <textarea 
                                            value={block.content as string} 
                                            onChange={e => updateBlock(activePage.id, blockIndex, { content: e.target.value })} 
                                            rows={2}
                                            className="w-full bg-transparent text-slate-300 italic text-sm outline-none resize-y placeholder-slate-700"
                                            placeholder="Citação..."
                                        />
                                    </div>
                                )}

                                {block.type === 'divider' && (
                                    <div className="h-px bg-slate-800 my-4 w-full" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Add Block Bar */}
                    <div className="pt-8 flex flex-wrap gap-2 justify-center border-t border-white/5 mt-8">
                        {[
                            { type: 'title', icon: 'H', label: 'Título' },
                            { type: 'paragraph', icon: '¶', label: 'Texto' },
                            { type: 'image', icon: '🖼️', label: 'Imagem' },
                            { type: 'video', icon: '▶', label: 'Vídeo' },
                            { type: 'list', icon: '•', label: 'Lista' },
                            { type: 'quote', icon: '❝', label: 'Citação' },
                            { type: 'divider', icon: '—', label: 'Divisor' },
                        ].map(btn => (
                            <button
                                key={btn.type}
                                onClick={() => addBlock(activePage.id, btn.type as ModulePageContentType)}
                                className="px-4 py-2 bg-[#161b22] hover:bg-[#21262d] border border-slate-700 rounded-lg text-slate-300 text-xs font-bold transition-all flex items-center gap-2"
                            >
                                <span>{btn.icon}</span> {btn.label}
                            </button>
                        ))}
                        <button
                            onClick={() => openAIModal(activePage.id)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 ml-4 shadow-lg shadow-indigo-500/20"
                        >
                            <span>✨</span> Gerar com IA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
