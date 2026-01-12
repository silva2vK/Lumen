
import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { useStudentAcademic } from '../contexts/StudentAcademicContext';
import { useSettings } from '../contexts/SettingsContext';
import type { Activity, ActivityItem, ActivitySubmission } from '../types';
import { SpinnerIcon } from '../constants/index';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseClient';
import { useToast } from '../contexts/ToastContext';
import { supabase } from './supabaseClient'; // Usando Supabase

// --- IMPORTING LAYOUTS ---
import { RestlessLayout } from './activities/layouts/RestlessLayout';
import { ScholarLayout } from './activities/layouts/ScholarLayout';
import { MagiLayout } from './activities/layouts/MagiLayout';
import { CyberLayout } from './activities/layouts/CyberLayout';
import { StandardLayout } from './activities/layouts/StandardLayout';

// Lazy Load Complex Activities Components (Ausubel)
const VisualSourceAnalysis = React.lazy(() => import('./activities/VisualSourceAnalysis').then(m => ({ default: m.VisualSourceAnalysis })));
const ConceptConnection = React.lazy(() => import('./activities/ConceptConnection').then(m => ({ default: m.ConceptConnection })));
const AdvanceOrganizer = React.lazy(() => import('./activities/AdvanceOrganizer').then(m => ({ default: m.AdvanceOrganizer })));
const ProgressiveTree = React.lazy(() => import('./activities/ProgressiveTree').then(m => ({ default: m.ProgressiveTree })));
const IntegrativeDragDrop = React.lazy(() => import('./activities/IntegrativeDragDrop').then(m => ({ default: m.IntegrativeDragDrop })));

const StudentActivityResponse: React.FC = () => {
    const { activeActivity, setCurrentPage } = useNavigation();
    const { handleActivitySubmit } = useStudentAcademic();
    const { user } = useAuth();
    const { addToast } = useToast();
    const { theme } = useSettings();

    // Local State
    const [activity, setActivity] = useState<Activity | null>(activeActivity);
    const [submission, setSubmission] = useState<ActivitySubmission | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [dynamicData, setDynamicData] = useState<any>(null); 

    // Fetch Data
    useEffect(() => {
        if (!activeActivity?.id || !user) return;

        if (activeActivity.submissions && activeActivity.submissions.length > 0) {
            setSubmission(activeActivity.submissions[0]);
        }

        const fetchFreshData = async () => {
            if (!navigator.onLine) return;
            setIsLoading(true);
            try {
                const docRef = doc(db, 'activities', activeActivity.id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setActivity({ id: docSnap.id, ...docSnap.data() } as Activity);
                }
                const subRef = doc(db, 'activities', activeActivity.id, 'submissions', user.id);
                const subSnap = await getDoc(subRef);
                if (subSnap.exists()) {
                    setSubmission(subSnap.data() as ActivitySubmission);
                }
            } catch (error) {
                console.error("Error fetching activity:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!activeActivity.submissions || activeActivity.submissions.length === 0) {
            fetchFreshData();
        }
    }, [activeActivity?.id, user]);

    // Items logic
    const items = useMemo(() => {
        if (!activity) return [];
        if (activity.items && activity.items.length > 0) return activity.items;
        if (activity.questions && activity.questions.length > 0) {
            return activity.questions.map((q: any) => ({
                id: q.id.toString(),
                type: 'multiple_choice',
                question: q.question,
                options: q.choices,
                points: 1 
            } as ActivityItem));
        }
        return [];
    }, [activity]);

    const handleAnswerChange = (itemId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [itemId]: value }));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setUploadedFiles(Array.from(e.target.files));
    };

    const handleDynamicComplete = (data?: any) => {
        setDynamicData(data || {});
        addToast("Progresso registrado.", "info");
    };

    const handleSubmit = async () => {
        if (!activity || !user) return;
        setIsSubmitting(true);
        try {
            let submittedFilesPayload: { name: string, url: string }[] = [];
            if (uploadedFiles.length > 0) {
                addToast("Enviando arquivos...", "info");
                for (const file of uploadedFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${activity.id}_${user.id}_${Date.now()}.${fileExt}`;
                    
                    // Upload para Supabase Storage (Bucket 'submissions')
                    const { error: uploadError } = await supabase.storage
                        .from('submissions')
                        .upload(fileName, file);

                    if (uploadError) throw uploadError;

                    const { data } = supabase.storage
                        .from('submissions')
                        .getPublicUrl(fileName);
                        
                    submittedFilesPayload.push({ name: file.name, url: data.publicUrl });
                }
            }

            const submissionPayload = {
                answers,
                submittedFiles: submittedFilesPayload,
                dynamicData
            };

            await handleActivitySubmit(activity.id, JSON.stringify(submissionPayload));
            setCurrentPage('activities');
        } catch (error: any) {
            addToast(`Erro: ${error.message}`, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render Dynamic Components wrapper
    const renderComplexContent = () => {
        if (!activity) return null;
        return (
            <Suspense fallback={<div className="p-8 text-center animate-pulse text-xs uppercase tracking-widest">Carregando Módulo...</div>}>
                {activity.type === 'VisualSourceAnalysis' && <VisualSourceAnalysis activity={activity} onComplete={handleDynamicComplete} />}
                {activity.type === 'ConceptConnection' && <ConceptConnection activity={activity} onComplete={handleDynamicComplete} />}
                {activity.type === 'AdvanceOrganizer' && <AdvanceOrganizer activity={activity} onComplete={handleDynamicComplete} />}
                {activity.type === 'ProgressiveTree' && <ProgressiveTree activity={activity} onComplete={handleDynamicComplete} />}
                {activity.type === 'IntegrativeDragDrop' && <IntegrativeDragDrop activity={activity} onComplete={handleDynamicComplete} />}
            </Suspense>
        );
    };

    if (!activeActivity || !activity) return <div className="min-h-screen bg-black flex items-center justify-center"><SpinnerIcon className="w-8 h-8 text-white" /></div>;

    // --- PROPS FOR LAYOUTS ---
    const layoutProps = {
        activity, items, answers, handleAnswerChange, 
        handleSubmit, isSubmitting, 
        onBack: () => setCurrentPage('activities'), 
        renderComplexContent, 
        isSubmitted: !!submission, 
        submission, 
        uploadedFiles, 
        handleFileSelect
    };

    // --- LAYOUT ROUTER (Strict Logic) ---
    
    // 1. Prioritize Horror Layout for specific types OR Restless Dreams theme
    if (activity.type === 'VisualSourceAnalysis' || theme === 'restless-dreams') {
        return <RestlessLayout {...layoutProps} />;
    }

    // 2. Paper / Scholar
    if (theme === 'paper') {
        return <ScholarLayout {...layoutProps} />;
    }

    // 3. Eva / Magi
    if (theme === 'eva') {
        return <MagiLayout {...layoutProps} />;
    }

    // 4. Cyber / Nebula / Synthwave / Shadow Monarch (General Sci-Fi)
    if (['nebula', 'synthwave', 'shadow-monarch'].includes(theme)) {
        return <CyberLayout {...layoutProps} />;
    }

    // 5. Default / Standard
    return <StandardLayout {...layoutProps} />;
};

export default StudentActivityResponse;
