
import React, { useState, useEffect } from 'react';

export const OfflineIndicator: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBackOnline, setShowBackOnline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowBackOnline(true);
            const timer = setTimeout(() => setShowBackOnline(false), 4000);
            return () => clearTimeout(timer);
        };
        const handleOffline = () => {
            setIsOnline(false);
            setShowBackOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOnline) {
        return (
            <div 
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[100] bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg border border-slate-600 flex items-center justify-between animate-fade-in"
                role="alert"
            >
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                    </svg>
                    <div>
                        <p className="font-bold text-sm">Você está offline</p>
                        <p className="text-xs text-slate-300">
                            Modo offline ativado.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (showBackOnline) {
        return (
            <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[100] bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg border border-green-500 flex items-center justify-between animate-fade-in">
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                        <p className="font-bold text-sm">Conexão restaurada</p>
                        <p className="text-xs text-green-100">Você está online.</p>
                    </div>
                </div>
                <button onClick={() => setShowBackOnline(false)} className="ml-4 text-green-200 hover:text-white">✕</button>
            </div>
        );
    }

    return null;
};
