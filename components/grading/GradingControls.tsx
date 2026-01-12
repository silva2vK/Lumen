
import React from 'react';
import { Card } from '../common/Card';
import { ICONS, SpinnerIcon } from '../../constants/index';

interface GradingControlsProps {
    currentFeedback: string;
    setCurrentFeedback: (val: string) => void;
    currentGrade: string;
    maxPoints: number;
    isSaving: boolean;
    isLast: boolean;
    onSave: (action: 'stay' | 'next' | 'exit') => void;
    hasTextQuestions: boolean;
    isGradingAll: boolean;
    onGradeAllWithAI: () => void;
    isLegacySubmission?: boolean;
}

export const GradingControls: React.FC<GradingControlsProps> = ({
    currentFeedback, setCurrentFeedback, currentGrade, maxPoints,
    isSaving, isLast, onSave, hasTextQuestions, isGradingAll, onGradeAllWithAI, isLegacySubmission
}) => {
    return (
        <>
            <Card className="mt-8 border-t-4 border-indigo-500">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Feedback Geral</label>
                <textarea 
                    rows={3}
                    value={currentFeedback}
                    onChange={e => setCurrentFeedback(e.target.value)}
                    placeholder="Escreva um comentário para o aluno..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                />
            </Card>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-800 border-t dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-500 uppercase">Nota Final</span>
                        <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                            {currentGrade} <span className="text-sm text-slate-400 font-normal">/ {maxPoints}</span>
                        </span>
                    </div>
                    {hasTextQuestions && !isLegacySubmission && (
                        <button
                            onClick={onGradeAllWithAI}
                            disabled={isGradingAll}
                            className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg hover:bg-purple-200 disabled:opacity-50 dark:bg-purple-900/30 dark:text-purple-300 ml-4"
                        >
                            {isGradingAll ? <SpinnerIcon className="h-4 w-4 mr-1" /> : <div className="h-4 w-4 mr-1">{ICONS.ai_generate}</div>}
                            Corrigir Texto (IA)
                        </button>
                    )}
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        onClick={() => onSave('stay')}
                        disabled={isSaving}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600"
                    >
                        Salvar
                    </button>
                    <button 
                        onClick={() => onSave(isLast ? 'exit' : 'next')}
                        disabled={isSaving}
                        className={`flex-1 sm:flex-none px-6 py-2 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 flex items-center justify-center transition-colors ${isLast ? 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {isSaving ? <SpinnerIcon className="h-4 w-4 mr-2" /> : null}
                        {isLast ? 'Salvar e Sair' : 'Salvar e Próximo'}
                    </button>
                </div>
            </div>
        </>
    );
};
