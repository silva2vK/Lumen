
import React, { createContext, useContext, useMemo } from 'react';
import type { Module, Quiz, Activity, TeacherClass, GradeReport, ActivitySubmission } from '../types';
import { useAuth } from './AuthContext';
import { useStudentContent } from '../hooks/useStudentContent';
import { useStudentReport } from '../hooks/useStudentReport';
import { QueryDocumentSnapshot } from 'firebase/firestore';

interface ModuleFilters {
    queryText: string;
    serie: string;
    materia: string;
    status: string;
    scope: 'my_modules' | 'public';
}

// 1. Define State Interface (Data)
interface StudentAcademicState {
    inProgressModules: Module[];
    searchedModules: Module[];
    searchedQuizzes: Quiz[];
    studentClasses: TeacherClass[];
    gradeReport: GradeReport;
    userSubmissions: Record<string, ActivitySubmission>;
    moduleFilters: ModuleFilters;
    isLoading: boolean;
    isSearchingModules: boolean;
    isSearchingQuizzes: boolean;
}

// 2. Define Actions Interface (Functions)
interface StudentAcademicActions {
    refreshContent: (forceRefresh?: boolean) => Promise<void>;
    searchModules: (filters: any) => Promise<void>;
    searchQuizzes: (filters: any) => Promise<void>;
    searchActivities: (filters: any, lastDoc?: QueryDocumentSnapshot | null) => Promise<{ activities: Activity[], lastDoc: QueryDocumentSnapshot | null }>;
    handleActivitySubmit: (activityId: string, content: string) => Promise<void>;
    handleJoinClass: (code: string) => Promise<boolean>;
    handleLeaveClass: (classId: string) => void;
    handleModuleProgressUpdate: (moduleId: string, progress: number) => Promise<void>;
    handleModuleComplete: (moduleId: string) => Promise<void>;
    setSearchedQuizzes: React.Dispatch<React.SetStateAction<Quiz[]>>;
    setSearchedModules: React.Dispatch<React.SetStateAction<Module[]>>;
}

// 3. Create Split Contexts
const StudentAcademicStateContext = createContext<StudentAcademicState | undefined>(undefined);
const StudentAcademicActionsContext = createContext<StudentAcademicActions | undefined>(undefined);

export function StudentAcademicProvider({ children }: { children?: React.ReactNode }) {
    const { user } = useAuth();
    
    // React Query Powered Hook
    const content = useStudentContent(user);
    
    // Reporting Hook (Independent)
    const { gradeReport, isLoadingReport } = useStudentReport(user, content.studentClasses);

    // 4. Memoize State Value
    const stateValue: StudentAcademicState = useMemo(() => ({
        inProgressModules: content.inProgressModules,
        searchedModules: content.searchedModules,
        searchedQuizzes: content.searchedQuizzes,
        studentClasses: content.studentClasses,
        gradeReport,
        userSubmissions: content.userSubmissions,
        moduleFilters: content.moduleFilters,
        isLoading: content.isLoading || isLoadingReport,
        isSearchingModules: content.isSearchingModules,
        isSearchingQuizzes: content.isSearchingQuizzes
    }), [
        content.inProgressModules, content.searchedModules, content.searchedQuizzes,
        content.studentClasses, gradeReport, content.userSubmissions,
        content.moduleFilters, content.isLoading, isLoadingReport,
        content.isSearchingModules, content.isSearchingQuizzes
    ]);

    // 5. Memoize Actions Value
    const actionsValue: StudentAcademicActions = useMemo(() => ({
        refreshContent: content.refreshContent,
        searchModules: content.searchModules,
        searchQuizzes: content.searchQuizzes,
        searchActivities: content.searchActivities,
        handleActivitySubmit: content.handleActivitySubmit,
        handleJoinClass: content.handleJoinClass,
        handleLeaveClass: content.handleLeaveClass,
        handleModuleProgressUpdate: content.handleModuleProgressUpdate,
        handleModuleComplete: content.handleModuleComplete,
        setSearchedQuizzes: content.setSearchedQuizzes,
        setSearchedModules: content.setSearchedModules
    }), [
        content.refreshContent, content.searchModules, content.searchQuizzes,
        content.searchActivities, content.handleActivitySubmit, content.handleJoinClass,
        content.handleLeaveClass, content.handleModuleProgressUpdate, content.handleModuleComplete,
        content.setSearchedQuizzes, content.setSearchedModules
    ]);

    return (
        <StudentAcademicActionsContext.Provider value={actionsValue}>
            <StudentAcademicStateContext.Provider value={stateValue}>
                {children}
            </StudentAcademicStateContext.Provider>
        </StudentAcademicActionsContext.Provider>
    );
}

// 6. Split Hooks
export const useStudentAcademicState = () => {
    const context = useContext(StudentAcademicStateContext);
    if (context === undefined) {
        throw new Error('useStudentAcademicState must be used within a StudentAcademicProvider');
    }
    return context;
};

export const useStudentAcademicActions = () => {
    const context = useContext(StudentAcademicActionsContext);
    if (context === undefined) {
        throw new Error('useStudentAcademicActions must be used within a StudentAcademicProvider');
    }
    return context;
};

// 7. Combined Hook for Backward Compatibility
export const useStudentAcademic = () => {
    const state = useStudentAcademicState();
    const actions = useStudentAcademicActions();
    
    return useMemo(() => ({
        ...state,
        ...actions
    }), [state, actions]);
};
