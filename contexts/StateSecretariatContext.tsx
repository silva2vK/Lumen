
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useStateSecretariatData } from '../hooks/useStateSecretariatData';
import type { MunicipalSecretariatData } from '../types';

export interface StateSecretariatContextType {
    municipalities: MunicipalSecretariatData[];
    globalStats: {
        totalMunicipalities: number;
        totalSchools: number;
    };
    isLoading: boolean;
    isAddingMunicipality: boolean;
    handleAddMunicipality: (secretariatId: string) => Promise<void>;
    fetchMunicipalities: () => Promise<void>;
}

const StateSecretariatContext = createContext<StateSecretariatContextType | undefined>(undefined);

export function StateSecretariatProvider({ children }: { children?: ReactNode }) {
    const { user } = useAuth();
    const { addToast } = useToast();

    const stateData = useStateSecretariatData(user, addToast);

    return (
        <StateSecretariatContext.Provider value={stateData}>
            {children}
        </StateSecretariatContext.Provider>
    );
}

export const useStateSecretariatContext = () => {
    const context = useContext(StateSecretariatContext);
    if (context === undefined) {
        throw new Error('useStateSecretariatContext must be used within a StateSecretariatProvider');
    }
    return context;
};
