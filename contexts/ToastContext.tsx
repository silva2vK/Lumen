
import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';
import { Toast } from '../components/common/Toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// FIX: Refactored the provider component to a standard function declaration to resolve errors where the 'children' prop was not being correctly recognized by the type system.
export function ToastProvider({ children }: { children?: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Container posicionado no Topo Centro */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-sm flex flex-col items-center gap-3 z-[9999] pointer-events-none"
            >
                {/* Pointer events auto nas toasts para permitir clique no fechar */}
                <div className="contents pointer-events-auto">
                    {toasts.map(toast => (
                        <Toast
                            key={toast.id}
                            message={toast.message}
                            type={toast.type}
                            onDismiss={() => removeToast(toast.id)}
                        />
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
