import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './Card';

interface ErrorBoundaryProps {
    children?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public state: ErrorBoundaryState = {
        hasError: false,
        error: null
    };

    // Explicitly declaring props to avoid TypeScript error in some configurations
    public readonly props: Readonly<ErrorBoundaryProps>;

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.props = props;
    }

    public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-slate-900">
                    <Card className="max-w-lg w-full text-center border-l-4 border-red-500">
                        <div className="mb-4 text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Ops! Algo deu errado.</h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">
                            Encontramos um erro inesperado. Tente recarregar a página.
                        </p>
                        <p className="text-xs text-slate-400 font-mono mb-6 text-left bg-slate-50 dark:bg-slate-900 p-3 rounded overflow-auto max-h-32">
                            {this.state.error?.message}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus:ring-offset-2"
                        >
                            Recarregar Página
                        </button>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
