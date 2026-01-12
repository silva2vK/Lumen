
import React, { useState, useMemo } from 'react';
import { ICONS } from '../constants/index';
import { useAdminData } from '../contexts/AdminDataContext';
import { useNavigation } from '../contexts/NavigationContext';
import type { Quiz } from '../types';
import { Modal } from './common/Modal';
import { QuizView } from './QuizView';

const QuizRow: React.FC<{ quiz: Quiz; onView: () => void; onEdit: () => void; onDelete: () => void; onStatusChange: () => void; }> = ({ quiz, onView, onEdit, onDelete, onStatusChange }) => {
    const { modules } = useAdminData();
    const moduleTitle = useMemo(() => {
        if (!quiz.moduleId) return <span className="text-slate-600 italic">Standalone</span>;
        const mod = modules.find(m => m.id === quiz.moduleId);
        return mod ? <span className="text-blue-400">{mod.title}</span> : <span className="text-red-400">Orphaned</span>;
    }, [modules, quiz.moduleId]);

    const statusDot = quiz.status === 'Ativo' ? 'bg-green-500' : 'bg-slate-600';
    const statusText = quiz.status === 'Ativo' ? 'text-green-400' : 'text-slate-500';

    return (
        <tr className="group border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="p-4 align-middle">
                <span className="font-semibold text-slate-200 text-sm group-hover:text-white">{quiz.title}</span>
            </td>
            <td className="p-4 align-middle text-xs font-mono">{moduleTitle}</td>
            <td className="p-4 align-middle">
                <span className="bg-[#161b22] border border-white/10 text-slate-400 px-2 py-1 rounded text-xs font-bold">
                    {quiz.questions.length} Qts
                </span>
            </td>
            <td className="p-4 align-middle">
                <button 
                    onClick={onStatusChange}
                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                >
                    <div className={`w-2 h-2 rounded-full ${statusDot}`}></div>
                    <span className={`text-xs font-mono font-bold ${statusText}`}>{quiz.status}</span>
                </button>
            </td>
            <td className="p-4 align-middle text-right">
                <div className="flex items-center justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                     <button onClick={onView} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Ver">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                     </button>
                     <button onClick={onEdit} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                     </button>
                     <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                </div>
            </td>
        </tr>
    );
};

const AdminManageQuizzes: React.FC = () => {
    const { quizzes, handleDeleteQuiz, handleUpdateQuiz } = useAdminData();
    const { setCurrentPage, startEditingQuiz } = useNavigation();
    const [viewingQuiz, setViewingQuiz] = useState<Quiz | null>(null);

    const onStatusChange = async (quiz: Quiz) => {
        const newStatus = quiz.status === 'Ativo' ? 'Inativo' : 'Ativo';
        await handleUpdateQuiz({ ...quiz, status: newStatus });
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center bg-[#0d1117] p-4 rounded-lg border border-white/10">
                 <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-white font-mono flex items-center">
                        <span className="text-pink-500 mr-2">./</span>
                        Quizzes
                    </h2>
                    <span className="text-xs font-mono text-slate-500 border border-slate-700 rounded px-2 py-0.5">{quizzes.length} Items</span>
                 </div>
                <button 
                    onClick={() => setCurrentPage('admin_create_quiz')}
                    className="flex items-center justify-center px-4 py-2 bg-pink-600 text-white text-xs font-bold rounded hover:bg-pink-500 transition-colors uppercase tracking-wider">
                    <div className="h-4 w-4 mr-2">{ICONS.plus}</div>
                    Novo Quiz
                </button>
            </div>
            
            <div className="bg-[#0d1117] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#161b22] text-xs font-mono font-bold text-slate-400 border-b border-white/10">
                            <th className="p-4 uppercase">Título</th>
                            <th className="p-4 uppercase">Módulo Pai</th>
                            <th className="p-4 uppercase">Volume</th>
                            <th className="p-4 uppercase">Status</th>
                            <th className="p-4 text-right uppercase">Opções</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#0d1117]">
                        {quizzes.map(quiz => (
                            <QuizRow 
                                key={quiz.id} 
                                quiz={quiz} 
                                onView={() => setViewingQuiz(quiz)} 
                                onEdit={() => startEditingQuiz(quiz)} 
                                onDelete={() => handleDeleteQuiz(quiz.id)} 
                                onStatusChange={() => onStatusChange(quiz)} 
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {viewingQuiz && (
                <Modal isOpen={!!viewingQuiz} onClose={() => setViewingQuiz(null)} title={viewingQuiz.title}>
                    <div className="max-h-[70vh] overflow-y-auto p-1 bg-[#0d1117] text-slate-300">
                        <QuizView quiz={viewingQuiz} onQuizComplete={async () => 0} />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminManageQuizzes;
