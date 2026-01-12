
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './common/Card';
import { SpinnerIcon } from '../constants/index';
import { useNavigation } from '../contexts/NavigationContext';
import type { ActivityItem } from '../types';
import { useToast } from '../contexts/ToastContext';
import { useTeacherGrading } from '../hooks/teacher/useTeacherGrading';
import { useAuth } from '../contexts/AuthContext';
import { streamGradingFeedback } from '../services/gradingService';
import { StudentListSidebar } from './grading/StudentListSidebar';
import { QuestionGradingCard } from './grading/QuestionGradingCard';
import { GradingControls } from './grading/GradingControls';

const TeacherGradingView: React.FC = () => {
    const { gradingActivity, exitGrading } = useNavigation();
    const { user } = useAuth();
    const { addToast } = useToast();

    const { activity, submissions, answerKey, isLoading, gradeMutation } = useTeacherGrading(gradingActivity?.id, user);

    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('all');
    const [questionScores, setQuestionScores] = useState<Record<string, number>>({});
    const [currentGrade, setCurrentGrade] = useState<string>('');
    const [currentFeedback, setCurrentFeedback] = useState<string>('');
    const [isAutoGrading, setIsAutoGrading] = useState(false);

    const filteredSubmissions = useMemo(() => {
        return submissions.filter(s => filterStatus === 'all' ? true : filterStatus === 'pending' ? s.status === 'Aguardando correção' : s.status === 'Corrigido');
    }, [submissions, filterStatus]);

    const selectedSubmission = useMemo(() => submissions.find(s => s.studentId === selectedStudentId), [submissions, selectedStudentId]);

    // Items logic (similar to existing)
    const items = useMemo((): ActivityItem[] => {
        if (!activity) return [];
        if (activity.items && activity.items.length > 0) return activity.items;
        if (activity.questions && activity.questions.length > 0) {
            return activity.questions.map((q: any) => ({
                id: q.id.toString(),
                type: 'multiple_choice',
                question: q.question,
                options: q.choices,
                // Note: correctAnswerId might be missing in public doc, but we use answerKey for grading now
                points: 1
            } as ActivityItem));
        }
        return [];
    }, [activity]);

    const studentAnswers = useMemo(() => {
        try { return JSON.parse(selectedSubmission?.content || '{}'); } catch { return {}; }
    }, [selectedSubmission]);

    useEffect(() => {
        if (selectedSubmission) {
            const initialScores: Record<string, number> = selectedSubmission.scores || {};
            setQuestionScores(initialScores);
            setCurrentFeedback(selectedSubmission.feedback || '');
            setCurrentGrade(selectedSubmission.grade?.toString() || '');
        }
    }, [selectedSubmission]);

    // AUTO GRADE FUNCTION
    const handleAutoGrade = () => {
        if (!answerKey || !items.length) {
            addToast("Gabarito não disponível para correção automática.", "info");
            return;
        }
        
        setIsAutoGrading(true);
        const newScores: Record<string, number> = {};
        let total = 0;

        items.forEach(item => {
            const studentAns = studentAnswers[item.id];
            const correctAns = answerKey[item.id]; // Get from secure key
            
            if (correctAns && studentAns === correctAns) {
                newScores[item.id] = item.points;
                total += item.points;
            } else {
                newScores[item.id] = 0;
            }
        });

        setQuestionScores(newScores);
        setCurrentGrade(total.toString());
        setCurrentFeedback("Correção automática aplicada com base no gabarito.");
        setIsAutoGrading(false);
        addToast("Notas calculadas automaticamente.", "success");
    };

    const handleSave = async () => {
        if (!selectedSubmission) return;
        await gradeMutation.mutateAsync({
            studentId: selectedSubmission.studentId,
            grade: parseFloat(currentGrade) || 0,
            feedback: currentFeedback,
            scores: questionScores
        });
        addToast("Nota salva!", "success");
    };

    if (isLoading) return <div className="p-10 text-center"><SpinnerIcon className="h-8 w-8 mx-auto" /></div>;

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
            <StudentListSidebar 
                submissions={filteredSubmissions} selectedStudentId={selectedStudentId} onSelectStudent={setSelectedStudentId}
                filterStatus={filterStatus} setFilterStatus={setFilterStatus} searchTerm="" setSearchTerm={() => {}} onExit={exitGrading}
            />
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden p-4 relative">
                {selectedSubmission ? (
                    <>
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl font-bold dark:text-white">{selectedSubmission.studentName}</h2>
                            {answerKey && (
                                <button onClick={handleAutoGrade} disabled={isAutoGrading} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-500 text-sm font-bold flex items-center">
                                    {isAutoGrading ? <SpinnerIcon className="h-4 w-4 mr-2"/> : '⚡ Auto-Corrigir'}
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pb-20">
                            {items.map((item, idx) => (
                                <QuestionGradingCard 
                                    key={item.id} item={item} index={idx} answer={studentAnswers[item.id]} 
                                    score={questionScores[item.id] || 0} 
                                    onScoreChange={(v) => setQuestionScores(p => ({...p, [item.id]: parseFloat(v)||0}))}
                                    onGradeWithAI={() => {}} isGradingThis={false} manualOverride={true} onToggleOverride={() => {}}
                                />
                            ))}
                        </div>
                        <GradingControls 
                            currentFeedback={currentFeedback} setCurrentFeedback={setCurrentFeedback}
                            currentGrade={currentGrade} maxPoints={activity?.points || 10}
                            isSaving={gradeMutation.isPending} isLast={false} onSave={handleSave}
                            hasTextQuestions={false} isGradingAll={false} onGradeAllWithAI={() => {}}
                        />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">Selecione um aluno.</div>
                )}
            </div>
        </div>
    );
};

export default TeacherGradingView;
