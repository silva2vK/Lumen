
import React, { useState, useEffect } from 'react';
import { ICONS, SpinnerIcon, SUBJECTS_LIST } from '../constants/index';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebaseClient';
import type { Quiz } from '../types';
import { Modal } from './common/Modal';
import { QuizView } from './QuizView';

const GuardianQuizzes: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');

    useEffect(() => {
        const fetchQuizzes = async () => {
            setLoading(true);
            try {
                // Fetch public quizzes
                const q = query(collection(db, "quizzes"), where("status", "==", "Ativo"), orderBy("date", "desc"), limit(50));
                const snap = await getDocs(q);
                const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() } as Quiz));
                setQuizzes(loaded);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    const filteredQuizzes = quizzes.filter(q => {
        const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = selectedSubject === 'all' || (Array.isArray(q.materia) ? q.materia.includes(selectedSubject) : q.materia === selectedSubject);
        return matchesSearch && matchesSubject;
    });

    return (
        <div className="space-y-8 animate-fade-in pb-20 p-4 font-retro">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-4 border-black pb-6 bg-[#c0c0c0] p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                <div>
                    <h1 className="text-2xl font-black text-[#000080] uppercase tracking-tight">
                        Banco de Quizzes
                    </h1>
                    <p className="text-black mt-2 text-sm font-mono bg-white border border-gray-500 p-1 inline-block">
                        Acesso Público - Modo Leitura
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-[#c0c0c0] p-4 border-2 border-white border-b-black border-r-black">
                <input 
                    type="text" 
                    placeholder="Buscar quiz..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-white border-2 border-gray-500 border-b-white border-r-white py-2 px-4 text-black focus:outline-none font-mono"
                />
                
                <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="bg-white border-2 border-gray-500 border-b-white border-r-white py-2 px-4 text-black focus:outline-none cursor-pointer font-mono"
                >
                    <option value="all">Todas as Matérias</option>
                    {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* List */}
            <div className="min-h-[300px] bg-[#e0dcd3] border-2 border-gray-500 p-4 shadow-inner">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <SpinnerIcon className="h-12 w-12 text-black" />
                    </div>
                ) : filteredQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map(quiz => (
                            <div 
                                key={quiz.id} 
                                onClick={() => setSelectedQuiz(quiz)}
                                className="bg-white border-2 border-black p-4 cursor-pointer hover:bg-yellow-100 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-[#000080] text-white text-xs px-2 py-1 font-bold">
                                        {Array.isArray(quiz.materia) ? quiz.materia[0] : quiz.materia || 'Geral'}
                                    </span>
                                    <span className="font-mono text-xs text-gray-500">{quiz.questions.length} Qs</span>
                                </div>
                                <h3 className="font-bold text-black mb-2">{quiz.title}</h3>
                                <p className="text-xs text-gray-600 line-clamp-2 font-mono">{quiz.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <p className="text-gray-500 font-bold font-mono">NENHUM DADO ENCONTRADO.</p>
                    </div>
                )}
            </div>

            {/* View Modal (Read Only) */}
            {selectedQuiz && (
                <Modal isOpen={!!selectedQuiz} onClose={() => setSelectedQuiz(null)} title={selectedQuiz.title} size="lg">
                    <div className="bg-[#e0dcd3] p-4 text-black font-retro border-2 border-gray-500 max-h-[70vh] overflow-y-auto">
                        <div className="mb-6 border-b-2 border-gray-400 pb-4">
                            <p className="font-bold">Descrição:</p>
                            <p className="text-sm font-mono">{selectedQuiz.description}</p>
                        </div>
                        
                        <div className="space-y-6">
                            {selectedQuiz.questions.map((q, idx) => (
                                <div key={q.id} className="bg-white border border-gray-400 p-4 shadow-sm">
                                    <p className="font-bold mb-2">Q{idx+1}: {q.question}</p>
                                    <ul className="list-disc pl-5 space-y-1 text-sm font-mono">
                                        {q.choices.map(c => (
                                            <li key={c.id}>{c.text}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 text-center">
                            <p className="text-xs text-red-600 font-bold uppercase bg-yellow-200 p-2 border border-red-600 inline-block">
                                Modo de Visualização - Respostas Desabilitadas
                            </p>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default GuardianQuizzes;
