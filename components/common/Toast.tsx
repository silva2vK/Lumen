
import React, { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onDismiss: () => void;
}

const ICONS: Record<ToastType, React.ReactNode> = {
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

// Estética Gamer: Fundo escuro, Bordas Neon, Sombra Glow
const GAMER_THEME: Record<ToastType, string> = {
    success: 'border-green-500 shadow-[0_0_20px_-5px_rgba(34,197,94,0.6)] text-green-400',
    error: 'border-red-500 shadow-[0_0_20px_-5px_rgba(239,68,68,0.6)] text-red-400',
    info: 'border-cyan-500 shadow-[0_0_20px_-5px_rgba(6,182,212,0.6)] text-cyan-400',
};

const PROGRESS_COLOR: Record<ToastType, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-cyan-500',
};

export const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Reduzido para 3 segundos (3000ms)
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onDismiss, 300); // Tempo da animação de saída
        }, 3000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(onDismiss, 300);
    };

    const enterAnimation = 'animate-[toast-in-top_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]';
    const exitAnimation = 'animate-[toast-out-top_0.3s_ease-in_forwards]';

    return (
        <div
            role="alert"
            className={`
                relative w-full max-w-sm overflow-hidden 
                bg-[#09090b]/95 backdrop-blur-xl 
                border-l-4 ${GAMER_THEME[type]}
                rounded-r-lg font-mono
                ${isExiting ? exitAnimation : enterAnimation}
            `}
        >
            {/* Background Grid Pattern (Subtle) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            <div className="relative flex items-center p-4 z-10">
                <div className="flex-shrink-0 mr-3 animate-pulse">
                    {ICONS[type]}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold tracking-wide text-white drop-shadow-md">
                        {message}
                    </p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="ml-4 text-slate-500 hover:text-white transition-colors focus:outline-none"
                    aria-label="Fechar"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Barra de Progresso Gamer */}
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/10">
                <div 
                    className={`h-full ${PROGRESS_COLOR[type]} animate-[progress_3s_linear_forwards] origin-left shadow-[0_0_10px_currentColor]`}
                ></div>
            </div>

            <style>{`
                @keyframes toast-in-top {
                    from { opacity: 0; transform: translateY(-50px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes toast-out-top {
                    from { opacity: 1; transform: translateY(0) scale(1); }
                    to { opacity: 0; transform: translateY(-20px) scale(0.9); }
                }
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};
