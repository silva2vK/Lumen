
import React, { useState, useEffect } from 'react';
import { useStudentAcademic } from '../contexts/StudentAcademicContext';
import { useNavigation } from '../contexts/NavigationContext';
import { ICONS, SpinnerIcon, SUBJECTS_LIST } from '../constants/index';
import type { Quiz } from '../types';
import { Modal } from './common/Modal';
import { QuizView } from './QuizView';
import { useStudentGamificationContext } from '../contexts/StudentGamificationContext';

const QuizCard: React.FC<{ quiz: Quiz; onClick: () => void }> = ({ quiz, onClick }) => (
    <div 
        onClick={onClick}
        className="group bg-[#0d1117] border border-white/10 rounded-xl p-5 cursor-pointer hover:border-pink-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] flex flex-col h-full relative overflow-hidden"
    >
        <div className="absolute top-0 left-0 w-1 h-full bg-pink-500 group-hover:w-1.5 transition-all" />
        
        <div className="flex justify-between items-start mb-3 pl-2">
            <span className="text-[10px] font-mono text-pink-400 uppercase tracking-wider border border-pink-500/20 px-1.5 py-0.5 rounded bg-pink-500/5">
                {Array.isArray(quiz.materia) ? quiz.materia[0] : quiz.materia || 'Geral'}
            </span>
            <div className="text-slate-500 text-xs flex items-center gap-1">
                <span className="font-bold">{quiz.questions.length}</span> Questões
            </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 pl-2 group-hover:text-pink-400 transition-colors">
            {quiz.title}
        </h3>
        
        <p className="text-sm text-slate-400 pl-2 mb-4 flex-1 line-clamp-2">
            {quiz.description || "Teste seus conhecimentos."}
        </p>

        <div className="mt-auto pl-2 pt-3 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-mono">
                {quiz.date ? new Date(quiz.date).toLocaleDateString() : ''}
            </span>
            <span className="text-xs font-bold text-white bg-pink-600 px-3 py-1 rounded-md group-hover:bg-pink-500 transition-colors">
                INICIAR
            </span>
        </div>
    </div>
);

const Quizzes: React.FC = () => {
    const { searchedQuizzes, isSearchingQuizzes, searchQuizzes } = useStudentAcademic();
    const { startQuiz, activeQuiz, exitQuiz } = useNavigation();
    const { handleQuizCompleteLogic } = useStudentGamificationContext();
    
    // Local filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');
    
    // Internal state for quiz execution modal
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

    // Initial load
    useEffect(() => {
        searchQuizzes({ status: 'Ativo' });
    }, [searchQuizzes]);

    const handleSearch = () => {
        searchQuizzes({
            queryText: searchTerm,
            materia: selectedSubject
        });
    };

    const handleStartQuiz = (quiz: Quiz) => {
        startQuiz(quiz);
        setIsQuizModalOpen(true);
    };

    const handleCloseQuiz = () => {
        setIsQuizModalOpen(false);
        exitQuiz();
    };

    const onQuizFinish = async (quizId: string, title: string, score: number, total: number, answers?: Record<string, string>) => {
        const xp = await handleQuizCompleteLogic(quizId, title, score, total);
        // The modal will show the "Submitted" state handled by QuizView internally first
        // Then we can close after a delay or let user close
        return xp;
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-thin text-white tracking-tight">
                        Banco de <span className="font-bold text-pink-500">Quizzes</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm max-w-xl">
                        Avaliações rápidas para testar seu conhecimento e ganhar XP.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-[#0d1117] p-4 rounded-xl border border-white/10">
                <div className="flex-1 relative">
                    <input 
                        type="text" 
                        placeholder="Buscar quiz..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all placeholder:text-slate-600"
                    />
                    <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                
                <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="bg-black/50 border border-slate-700 rounded-lg py-3 px-4 text-white focus:border-pink-500 outline-none cursor-pointer"
                >
                    <option value="all">Todas as Matérias</option>
                    {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <button 
                    onClick={handleSearch}
                    className="bg-pink-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-pink-500 transition-colors flex items-center justify-center gap-2"
                >
                    {isSearchingQuizzes ? <SpinnerIcon className="h-5 w-5 text-white" /> : <span>Filtrar</span>}
                </button>
            </div>

            {/* Grid */}
            <div className="min-h-[300px]">
                {isSearchingQuizzes ? (
                    <div className="flex justify-center items-center h-64">
                        <SpinnerIcon className="h-12 w-12 text-pink-500" />
                    </div>
                ) : searchedQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {searchedQuizzes.map(quiz => (
                            <QuizCard 
                                key={quiz.id} 
                                quiz={quiz} 
                                onClick={() => handleStartQuiz(quiz)} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-white/5 rounded-3xl bg-black/20 backdrop-blur-sm">
                        <div className="p-4 bg-white/5 rounded-full mb-3 text-slate-500 text-4xl">📝</div>
                        <p className="text-slate-400 font-bold text-sm">Nenhum quiz encontrado.</p>
                        <p className="text-slate-600 text-xs mt-1">Tente ajustar os filtros ou aguarde novas publicações.</p>
                    </div>
                )}
            </div>

            {/* Quiz Execution Modal */}
            {activeQuiz && (
                <Modal isOpen={isQuizModalOpen} onClose={handleCloseQuiz} title={activeQuiz.title} size="full">
                    <div className="max-w-4xl mx-auto py-8 px-4">
                        <QuizView 
                            quiz={activeQuiz} 
                            onQuizComplete={onQuizFinish}
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Quizzes;
