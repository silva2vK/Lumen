import React from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, persister } from '../utils/queryClient';
import { SettingsProvider } from '../contexts/SettingsContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import { LanguageProvider } from '../contexts/LanguageContext';

export function AppProviders({ children }: { children?: React.ReactNode }) {
    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
            <LanguageProvider>
                <SettingsProvider>
                    <AuthProvider>
                        <ToastProvider>
                            {children}
                        </ToastProvider>
                    </AuthProvider>
                </SettingsProvider>
            </LanguageProvider>
        </PersistQueryClientProvider>
    );
}