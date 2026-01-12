
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useSecretariatData } from '../hooks/useSecretariatData';
import type { SchoolData } from '../types';

export interface SecretariatContextType {
    schools: SchoolData[];
    globalStats: {
        totalSchools: number;
        totalClasses: number;
        totalStudents: number;
    };
    isLoading: boolean;
    isAddingSchool: boolean;
    handleAddSchool: (directorId: string) => Promise<void>;
    fetchSchools: () => Promise<void>;
}

const SecretariatContext = createContext<SecretariatContextType | undefined>(undefined);

export function SecretariatProvider({ children }: { children?: ReactNode }) {
    const { user } = useAuth();
    const { addToast } = useToast();

    const secretariatData = useSecretariatData(user, addToast);

    return (
        <SecretariatContext.Provider value={secretariatData}>
            {children}
        </SecretariatContext.Provider>
    );
}

export const useSecretariatContext = () => {
    const context = useContext(SecretariatContext);
    if (context === undefined) {
        throw new Error('useSecretariatContext must be used within a SecretariatProvider');
    }
    return context;
};
