
import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useTeacherContent } from '../hooks/teacher/useTeacherContent';
import { useTeacherClassContext } from './TeacherClassContext';
import type { Module, Activity, PendingActivity } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { usePendingActivities } from '../hooks/teacher/usePendingActivities';
import { useTeacherGrading } from '../hooks/teacher/useTeacherGrading'; // Import for single source grading logic

export interface TeacherAcademicContextType {
    modules: Module[];
    draftActivities: Activity[];
    draftModules: Module[];
    isLoadingContent: boolean;
    isSubmittingContent: boolean;
    allPendingActivities: PendingActivity[];
    dashboardStats: {
        totalClasses: number;
        totalStudents: number;
        totalModulesCreated: number;
        totalPendingSubmissions: number;
    };
    fetchTeacherContent: (forceRefresh?: boolean) => Promise<void>;
    fetchModulesLibrary: () => Promise<void>;
    handleSaveActivity: (activity: Omit<Activity, 'id'>, isDraft?: boolean) => Promise<boolean>;
    handleUpdateActivity: (activityId: string, activityData: Partial<Activity>, isDraft?: boolean) => Promise<boolean>;
    handleDeleteActivity: (activityId: string) => Promise<void>;
    handleDeleteModule: (classId: string, moduleId: string) => void;
    handleSaveModule: (module: Omit<Module, 'id'>, isDraft?: boolean) => Promise<boolean>;
    handleUpdateModule: (module: Module, isDraft?: boolean) => Promise<void>;
    handlePublishModuleDraft: (moduleId: string, classIds: string[]) => Promise<boolean>;
    handlePublishDraft: (activityId: string, updateData: { classId: string, className: string, dueDate: string, points: number }) => Promise<boolean>;
    handleModuleProgressUpdate: (moduleId: string, progress: number) => Promise<void>;
    handleModuleComplete: (moduleId: string) => Promise<void>;
}

export const TeacherAcademicContext = createContext<TeacherAcademicContextType | undefined>(undefined);

export function TeacherAcademicProvider({ children }: { children?: React.ReactNode }) {
    const { user } = useAuth();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    
    const { teacherClasses, setTeacherClasses } = useTeacherClassContext();

    const contentData = useTeacherContent(user, addToast, setTeacherClasses, teacherClasses);
    
    // React Query hook for pending activities (Source of Truth for badges and lists)
    const { data: pendingActivities = [] } = usePendingActivities(user?.id);

    const handleSaveActivityWrapper = async (activity: Omit<Activity, 'id'>, isDraft?: boolean) => {
        const result = await contentData.handleSaveActivity(activity, isDraft);
        if (result && !isDraft) {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        }
        return result;
    };

    const handleUpdateActivityWrapper = async (activityId: string, activityData: Partial<Activity>, isDraft?: boolean) => {
        const result = await contentData.handleUpdateActivity(activityId, activityData, isDraft);
        if (result && !isDraft) {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
        }
        return result;
    };

    const handleDeleteActivityWrapper = async (activityId: string) => {
        await contentData.handleDeleteActivity(activityId);
        queryClient.invalidateQueries({ queryKey: ['activities'] });
    };

    const handleSaveModuleWrapper = async (module: Omit<Module, 'id'>, isDraft?: boolean) => {
        const result = await contentData.handleSaveModule(module, isDraft);
        if (result && !isDraft) {
            queryClient.invalidateQueries({ queryKey: ['modules'] });
        }
        return result;
    };

    const handleUpdateModuleWrapper = async (module: Module, isDraft?: boolean) => {
        await contentData.handleUpdateModule(module, isDraft);
        if (!isDraft) {
            queryClient.invalidateQueries({ queryKey: ['modules'] });
        }
    };

    const handlePublishModuleDraftWrapper = async (moduleId: string, classIds: string[]) => {
        const result = await contentData.handlePublishModuleDraft(moduleId, classIds);
        if (result) {
            queryClient.invalidateQueries({ queryKey: ['modules'] });
        }
        return result;
    };

    const handleDeleteModuleWrapper = (classId: string, moduleId: string) => {
        contentData.handleDeleteModule(classId, moduleId);
        queryClient.invalidateQueries({ queryKey: ['modules'] });
    };

    const dashboardStats = useMemo(() => {
        const myModulesCount = contentData.modules.filter(m => m.creatorId === user?.id).length;
        return {
            totalClasses: teacherClasses.length,
            totalStudents: teacherClasses.reduce((acc, c) => acc + (c.studentCount || (c.students || []).length || 0), 0),
            totalModulesCreated: myModulesCount,
            totalPendingSubmissions: pendingActivities.reduce((acc, a) => acc + a.pendingCount, 0)
        };
    }, [teacherClasses, contentData.modules, pendingActivities, user?.id]);

    const handleModuleProgressUpdate = async () => {};
    const handleModuleComplete = async () => {};
    
    const value = {
        ...contentData,
        handleSaveActivity: handleSaveActivityWrapper,
        handleUpdateActivity: handleUpdateActivityWrapper,
        handleDeleteActivity: handleDeleteActivityWrapper,
        handleSaveModule: handleSaveModuleWrapper,
        handleUpdateModule: handleUpdateModuleWrapper,
        handlePublishModuleDraft: handlePublishModuleDraftWrapper,
        handleDeleteModule: handleDeleteModuleWrapper,
        
        allPendingActivities: pendingActivities,
        dashboardStats,
        handleModuleProgressUpdate,
        handleModuleComplete
    };

    return (
        <TeacherAcademicContext.Provider value={value}>
            {children}
        </TeacherAcademicContext.Provider>
    );
}

export const useTeacherAcademicContext = () => {
    const context = useContext(TeacherAcademicContext);
    if (context === undefined) {
        throw new Error('useTeacherAcademicContext must be used within a TeacherAcademicProvider');
    }
    return context;
};
