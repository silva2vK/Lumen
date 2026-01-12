
import React, { useState } from 'react';
import type { Quiz, QuizQuestion } from '../types';
import { SpinnerIcon } from '../constants/index';

interface QuizViewProps {
    quiz?: Quiz;
    questions?: QuizQuestion[];
    onQuizComplete: (quizId: string, quizTitle: string, score: number, total: number, answers?: Record<string, string>) => Promise<number>;
}

const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const QuestionMedia: React.FC<{ url: string }> = ({ url }) => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
        return (
            <div className="my-4 aspect-video">
               <iframe className="w-full h-full rounded-lg shadow-md" src={`https://www.youtube.com/embed/${videoId}`} title="Video" frameBorder="0" allowFullScreen></iframe>
            </div>
        );
    }
    return <img src={url} alt="Mídia" className="my-4 rounded-lg shadow-md max-h-72 mx-auto" loading="lazy" />;
};

export const QuizView: React.FC<QuizViewProps> = ({ quiz, questions: questionsFromProps, onQuizComplete }) => {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const questions = quiz?.questions || questionsFromProps;
    if (!questions) return <p>Questões não encontradas.</p>;
    
    const quizId = quiz?.id || '';
    const quizTitle = quiz?.title || 'Quiz';

    const handleAnswerChange = (questionId: number, choiceId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        
        // Passamos 0 como score pois a correção agora é assíncrona/servidor
        // Enviamos o mapa de respostas como último argumento
        await onQuizComplete(quizId, quizTitle, 0, questions.length, answers);
        
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="text-center py-10">
                 <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Respostas Enviadas!</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                    Seu quiz foi enviado para o servidor. O resultado e o XP serão liberados após o processamento.
                </p>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 max-w-sm mx-auto">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Status</p>
                    <p className="text-blue-500 font-mono font-bold">AGUARDANDO CORREÇÃO</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 hc-text-primary">Teste seu conhecimento</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {questions.map((q, index) => (
                        <fieldset key={q.id}>
                             {q.mediaUrl && <QuestionMedia url={q.mediaUrl} />}
                            <legend className="font-semibold text-slate-700 dark:text-slate-200 hc-text-primary mb-2">
                                <span className="text-slate-400 mr-2">{index + 1}.</span> {q.question}
                            </legend>
                            <div className="space-y-2">
                                {q.choices.map(choice => (
                                    <label key={choice.id} className="flex items-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:hover:bg-slate-800 transition-colors">
                                        <input
                                            type="radio"
                                            name={`question-${q.id}`}
                                            value={choice.id}
                                            checked={answers[q.id] === choice.id}
                                            onChange={() => handleAnswerChange(q.id, choice.id)}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 focus-visible:ring-indigo-500"
                                        />
                                        <span className="ml-3 text-sm text-slate-600 dark:text-slate-300">{choice.text}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    ))}
                </div>
                <button
                    type="submit"
                    disabled={Object.keys(answers).length !== questions.length || isSubmitting}
                    className="mt-8 w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-lg hover:shadow-indigo-500/30"
                >
                    {isSubmitting ? (
                        <>
                            <SpinnerIcon className="h-5 w-5 mr-2" />
                            Enviando Respostas...
                        </>
                    ) : (
                        'Enviar para Correção'
                    )}
                </button>
            </form>
        </div>
    );
};
