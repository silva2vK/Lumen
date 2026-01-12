
import React from 'react';
import { ActivitySubmission } from '../../types';

interface StudentListSidebarProps {
    submissions: ActivitySubmission[];
    selectedStudentId: string | null;
    onSelectStudent: (id: string) => void;
    filterStatus: 'all' | 'pending' | 'graded';
    setFilterStatus: (status: 'all' | 'pending' | 'graded') => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onExit: () => void;
}

export const StudentListSidebar: React.FC<StudentListSidebarProps> = ({
    submissions, selectedStudentId, onSelectStudent,
    filterStatus, setFilterStatus, searchTerm, setSearchTerm, onExit
}) => {
    return (
        <div className={`w-full md:w-80 flex-col bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 shadow-sm overflow-hidden ${selectedStudentId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-slate-700 dark:text-slate-200">Alunos ({submissions.length})</h2>
                    <button onClick={onExit} className="text-xs text-indigo-600 hover:underline dark:text-indigo-400">Sair</button>
                </div>
                <input 
                    type="text" 
                    placeholder="Buscar aluno..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 text-sm border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white mb-2"
                />
                <div className="flex gap-2">
                    <button onClick={() => setFilterStatus('all')} className={`flex-1 text-xs py-1 rounded ${filterStatus === 'all' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>Todos</button>
                    <button onClick={() => setFilterStatus('pending')} className={`flex-1 text-xs py-1 rounded ${filterStatus === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>Pendentes</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {submissions.map(sub => (
                    <button
                        key={sub.studentId}
                        onClick={() => onSelectStudent(sub.studentId)}
                        className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors ${
                            selectedStudentId === sub.studentId 
                                ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 border' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent'
                        }`}
                    >
                        <div className="overflow-hidden">
                            <p className={`font-medium truncate ${selectedStudentId === sub.studentId ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>{sub.studentName}</p>
                            <p className="text-xs text-slate-500 truncate">{new Date(sub.submissionDate).toLocaleDateString()}</p>
                        </div>
                        {sub.status === 'Corrigido' ? (
                            <div className="h-5 w-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                        ) : (
                            <div className="h-5 w-5 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">!</div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
