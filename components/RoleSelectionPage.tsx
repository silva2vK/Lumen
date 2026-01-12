import React from 'react';
import type { Role } from '../types';

const Logo: React.FC = () => (
    <div className="flex items-center space-x-3 justify-center">
        <img src="https://i.imgur.com/XISQWUh.png" alt="Lumen Logo" className="w-12 h-12 object-contain" />
        <h1 className="font-bold text-3xl leading-tight text-slate-800 dark:text-slate-200 hc-text-override">Lumen</h1>
    </div>
);

const StudentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
);

const ProfessorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

const DirectorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
);

const FamilyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.121-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.121-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);

const SecretariatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
);

const StateSecretariatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v4" /></svg>
);

const AdminIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);

interface RoleSelectionPageProps {
    onRoleSelected: (role: Role) => void;
    error?: string | null;
}

export const RoleSelectionPage: React.FC<RoleSelectionPageProps> = ({ onRoleSelected, error }) => {
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 hc-bg-override">
            <div className="max-w-sm w-full space-y-8">
                <div className="flex justify-center">
                    <Logo />
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 space-y-6 hc-bg-override hc-border-override">
                    <div className="space-y-1 text-center">
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 hc-text-override">Selecione seu Perfil</h1>
                        <p className="text-gray-500 dark:text-slate-400 text-sm hc-text-override">Esta escolha será salva para seus próximos acessos.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 p-4 rounded-lg text-sm text-red-700 dark:text-red-300" role="alert">
                            <p className="font-bold mb-2">Ocorreu um Erro ao Criar seu Perfil</p>
                            <p className="whitespace-pre-wrap">{error}</p>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <button 
                            onClick={() => onRoleSelected('aluno')}
                            className="w-full flex items-center justify-center py-3 px-4 border border-indigo-300 rounded-lg shadow-sm text-base font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition-colors dark:bg-indigo-900/50 dark:text-indigo-200 dark:border-indigo-700 dark:hover:bg-indigo-900 hc-button-override"
                        >
                            <StudentIcon />
                            <span className="ml-3">Sou Aluno</span>
                        </button>
                        <button 
                            onClick={() => onRoleSelected('professor')}
                             className="w-full flex items-center justify-center py-3 px-4 border border-sky-300 rounded-lg shadow-sm text-base font-medium text-sky-700 bg-sky-100 hover:bg-sky-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 transition-colors dark:bg-sky-900/50 dark:text-sky-200 dark:border-sky-700 dark:hover:bg-sky-900 hc-button-override"
                        >
                            <ProfessorIcon />
                             <span className="ml-3">Sou Professor</span>
                        </button>
                        <button 
                            onClick={() => onRoleSelected('responsavel')}
                             className="w-full flex items-center justify-center py-3 px-4 border border-orange-300 rounded-lg shadow-sm text-base font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 transition-colors dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-700 dark:hover:bg-orange-900 hc-button-override"
                        >
                            <FamilyIcon />
                             <span className="ml-3">Sou Responsável</span>
                        </button>
                        <button 
                            onClick={() => onRoleSelected('direcao')}
                             className="w-full flex items-center justify-center py-3 px-4 border border-emerald-300 rounded-lg shadow-sm text-base font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 transition-colors dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-700 dark:hover:bg-emerald-900 hc-button-override"
                        >
                            <DirectorIcon />
                             <span className="ml-3">Sou Direção</span>
                        </button>
                        <button 
                            onClick={() => onRoleSelected('secretaria')}
                             className="w-full flex items-center justify-center py-3 px-4 border border-purple-300 rounded-lg shadow-sm text-base font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 transition-colors dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700 dark:hover:bg-purple-900 hc-button-override"
                        >
                            <SecretariatIcon />
                             <span className="ml-3">Sou Secretaria Municipal</span>
                        </button>
                        <button 
                            onClick={() => onRoleSelected('secretaria_estadual')}
                             className="w-full flex items-center justify-center py-3 px-4 border border-teal-300 rounded-lg shadow-sm text-base font-medium text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 transition-colors dark:bg-teal-900/50 dark:text-teal-200 dark:border-teal-700 dark:hover:bg-teal-900 hc-button-override"
                        >
                            <StateSecretariatIcon />
                             <span className="ml-3">Sou Secretaria Estadual</span>
                        </button>
                        {/* Admin Button for Maintenance */}
                        <button 
                            onClick={() => onRoleSelected('admin')}
                            className="w-full flex items-center justify-center py-3 px-4 border border-red-300 rounded-lg shadow-sm text-base font-medium text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 transition-colors dark:bg-red-900/50 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-900 hc-button-override"
                        >
                            <AdminIcon />
                            <span className="ml-3">Sou Administrador</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};