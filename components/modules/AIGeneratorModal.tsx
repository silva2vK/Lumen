import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { InputField } from '../common/FormHelpers';
import { ICONS, SpinnerIcon } from '../../constants/index';
import type { ModulePageContentType } from '../../types';

interface AIGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (prompt: string, type: ModulePageContentType) => Promise<string | string[] | null>;
    onAddContent: (content: string | string[], type: ModulePageContentType) => void;
}

const BLOCK_CONFIG = [
    { type: 'title', label: 'Título' },
    { type: 'paragraph', label: 'Parágrafo' },
    { type: 'list', label: 'Lista' },
    { type: 'quote', label: 'Citação' }
];

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({ isOpen, onClose, onGenerate, onAddContent }) => {
    const [prompt, setPrompt] = useState('');
    const [blockType, setBlockType] = useState<ModulePageContentType>('paragraph');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<string | string[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim() || isGenerating) return;
        setIsGenerating(true);
        setError(null);
        setGeneratedContent(null);
        
        try {
            // Internally, the onGenerate handler (in ModuleForm) calls the API.
            // We rely on the proxy to handle the model selection, but the ModuleForm can override it.
            // For now, ModuleForm uses the default call which we updated in the proxy to handle models.
            // But we should update the prompt strategy here if needed or just pass the instruction.
            const content = await onGenerate(prompt, blockType);
            if (content) setGeneratedContent(content);
            else setError("Não foi possível gerar conteúdo.");
        } catch (e) {
            setError("Erro ao gerar conteúdo.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAdd = () => {
        if (generatedContent) {
            onAddContent(generatedContent, blockType);
            setGeneratedContent(null);
            setPrompt('');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gerar Conteúdo com IA (Gemini 3 Pro)">
            <div className="space-y-4">
                <InputField label="Descreva o conteúdo didático" required>
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        rows={4}
                        placeholder="Ex: Explique as causas da Revolução Francesa focando na crise econômica..."
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        autoFocus
                    />
                </InputField>
                 <InputField label="Tipo de Bloco" required>
                     <select
                         value={blockType}
                         onChange={e => setBlockType(e.target.value as ModulePageContentType)}
                         className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus-visible:ring-indigo-500 focus-visible:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                     >
                         {BLOCK_CONFIG.map(config => (
                             <option key={config.type} value={config.type}>{config.label}</option>
                         ))}
                    </select>
                </InputField>
                <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-full flex items-center justify-center px-4 py-2 bg-indigo-200 text-indigo-900 font-semibold rounded-lg hover:bg-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-600 hc-button-primary-override"
                >
                    {isGenerating ? <SpinnerIcon className="h-5 w-5 text-indigo-900 dark:text-white" /> : <div className="h-5 w-5">{ICONS.ai_generate}</div>}
                    <span className="ml-2">{isGenerating ? 'Processando (Gemini 3)...' : 'Gerar Conteúdo'}</span>
                </button>

                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                
                {generatedContent && (
                    <div className="mt-4 p-4 border-t dark:border-slate-700 space-y-4">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200">Conteúdo Gerado:</h4>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-md max-h-48 overflow-y-auto border dark:border-slate-600">
                            {Array.isArray(generatedContent) ? (
                                <ul className="list-disc list-inside">
                                    {generatedContent.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
                            )}
                        </div>
                        <button onClick={handleAdd} className="w-full flex items-center justify-center px-4 py-2 bg-green-200 text-green-900 font-semibold rounded-lg hover:bg-green-300 dark:bg-green-500/30 dark:text-green-200 dark:hover:bg-green-500/40 hc-button-primary-override">
                            Adicionar ao Módulo
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};