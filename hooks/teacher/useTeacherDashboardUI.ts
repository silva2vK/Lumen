
import { useState, useCallback } from 'react';
import type { TeacherClass, Activity } from '../../types';

export function useTeacherDashboardUI() {
    // Modal Visibility States
    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
    const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
    const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);

    // Selected Item States
    const [selectedClassForNotice, setSelectedClassForNotice] = useState<TeacherClass | null>(null);
    const [activityForSubmissions, setActivityForSubmissions] = useState<Activity | null>(null);

    // Handlers
    const openNoticeModal = useCallback((classData: TeacherClass) => {
        setSelectedClassForNotice(classData);
        setIsNoticeModalOpen(true);
    }, []);

    const closeNoticeModal = useCallback(() => {
        setIsNoticeModalOpen(false);
        setSelectedClassForNotice(null);
    }, []);

    const openSubmissionsModal = useCallback((activity: Activity) => {
        setActivityForSubmissions(activity);
        setIsSubmissionsModalOpen(true);
    }, []);

    const closeSubmissionsModal = useCallback(() => {
        setIsSubmissionsModalOpen(false);
        setActivityForSubmissions(null);
    }, []);

    const openCreateClassModal = useCallback(() => {
        setIsCreateClassModalOpen(true);
    }, []);

    const closeCreateClassModal = useCallback(() => {
        setIsCreateClassModalOpen(false);
    }, []);

    return {
        // State
        isNoticeModalOpen,
        selectedClassForNotice,
        isSubmissionsModalOpen,
        activityForSubmissions,
        isCreateClassModalOpen,
        
        // Actions
        openNoticeModal,
        closeNoticeModal,
        openSubmissionsModal,
        closeSubmissionsModal,
        openCreateClassModal,
        closeCreateClassModal
    };
}
