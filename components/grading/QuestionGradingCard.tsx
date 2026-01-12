
import React from 'react';
import type { ActivityItem } from '../../types';
import { Card } from '../common/Card';
import { ICONS, SpinnerIcon } from '../../constants/index';

interface QuestionGradingCardProps {
    item: ActivityItem;
    index: number;
    answer: string;
    score: number;
    onScoreChange: (val: string) => void;
    onGradeWithAI: () => void;
    isGradingThis: boolean;
    manualOverride: boolean;
    onToggleOverride: () => void;
}

export const QuestionGradingCard: React.FC<QuestionGradingCardProps> = ({
    item, index, answer, score, onScoreChange, onGradeWithAI, isGradingThis, manualOverride, onToggleOverride
}) => {
    const isMC = item.type === 'multiple_choice';
    
    let isCorrect = null;
    if (isMC && item.correctOptionId) isCorrect = answer === item.correctOptionId;
    
    const canEditScore = !isMC || manualOverride;

    return (
        <Card className={`border-l-4 ${isMC ? (isCorrect ? 'border-l-green-500' : 'border-l-red-500') : 'border-l-blue-500'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">Questão {index + 1}</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500 ml-2">Max: {item.points} pts</span>
                </div>
                
                <div className="flex items-center gap-2">
                    {!isMC && (
                        <button
                            onClick={onGradeWithAI}
                            disabled={isGradingThis || !answer}
                            className="mr-2 flex items-center px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded hover:bg-indigo-200 disabled:opacity-50 dark:bg-indigo-900/50 dark:text-indigo-300"
                            title="Avaliar resposta com IA"
                        >
                            {isGradingThis ? <SpinnerIcon className="h-3 w-3" /> : ICONS.ai_generate}
                            <span className="ml-1">{isGradingThis ? 'Avaliando...' : 'IA'}</span>
                        </button>
                    )}

                    <label className="text-xs font-bold text-slate-500">Nota:</label>
                    <input 
                        type="number" 
                        value={score}
                        onChange={e => onScoreChange(e.target.value)}
                        min={0}
                        max={item.points}
                        step="0.1"
                        readOnly={!canEditScore}
                        className={`w-20 p-1 text-sm border rounded text-center font-bold ${!canEditScore ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed' : 'bg-white dark:bg-slate-700 dark:text-white border-slate-300 dark:border-slate-600'}`}
                    />
                    
                    {isMC && (
                        <button 
                            onClick={onToggleOverride}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:underline"
                            title={canEditScore ? "Voltar para cálculo automático" : "Editar nota manualmente"}
                        >
                            {canEditScore ? 'Auto' : 'Editar'}
                        </button>
                    )}
                </div>
            </div>
            
            <p className="mb-4 text-slate-800 dark:text-slate-100">{item.question}</p>
            
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Resposta do Aluno:</p>
                {isMC ? (
                    <div className="flex items-center gap-2">
                        {isCorrect ? (
                            <span className="text-green-600 font-bold flex items-center"><span className="mr-1">✓</span> {item.options?.find(o => o.id === answer)?.text || '(Sem resposta)'}</span>
                        ) : (
                            <div className="flex flex-col">
                                <span className="text-red-600 font-bold flex items-center line-through decoration-2"><span className="mr-1">✗</span> {item.options?.find(o => o.id === answer)?.text || '(Sem resposta)'}</span>
                                <span className="text-green-600 text-sm mt-1">Correto: {item.options?.find(o => o.id === item.correctOptionId)?.text}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{answer || '(Sem resposta)'}</p>
                )}
            </div>
        </Card>
    );
};
