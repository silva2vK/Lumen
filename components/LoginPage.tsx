
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SpinnerIcon } from '../constants/index';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';

const Logo: React.FC = () => (
    <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-20 h-20 bg-black/40 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_-10px_rgba(var(--brand-rgb),0.3)] flex items-center justify-center border border-white/10 p-4 relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <img src="https://i.imgur.com/XISQWUh.png" alt="Lumen Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        </div>
        <h1 className="mt-6 text-4xl font-scifi font-bold text-white tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Lumen
        </h1>
    </div>
);

const EyeIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const EyeOffIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .946-3.11 3.52-5.445 6.44-6.41M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.05 2.05L21.95 21.95" /></svg>;

type ViewMode = 'login' | 'signup' | 'reset';

export const LoginPage: React.FC<{ initialError?: string | null }> = ({ initialError }) => {
    const { signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const { loadFontProfile } = useSettings();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('login');
    const [error, setError] = useState<string | null>(initialError || null);
    const [message, setMessage] = useState<string | null>(null);

    // Preload Sci-Fi fonts for Logo (Orbitron)
    useEffect(() => {
        loadFontProfile('admin_sci_fi');
    }, [loadFontProfile]);

    const clearState = () => {
        setError(null);
        setMessage(null);
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearState();

        try {
            if (viewMode === 'reset') {
                if (!email.trim()) throw new Error(t('login.email'));
                await resetPassword(email);
                setMessage(t('login.successReset'));
            } else if (viewMode === 'signup') {
                if (password !== confirmPassword) throw new Error('As senhas não coincidem.');
                if (!name.trim()) throw new Error(t('login.name'));
                
                await signUpWithEmail(name.trim(), email, password);
                setMessage(t('login.successRegister'));
                setViewMode('login');
                setName('');
                setPassword('');
                setConfirmPassword('');
            } else {
                // Login
                await signInWithEmail(email, password);
            }
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    const getSubtitle = () => {
        if (viewMode === 'signup') return t('login.createSubtitle');
        if (viewMode === 'reset') return t('login.resetSubtitle');
        return t('login.subtitle');
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
            
            {/* Ambient Background Effects (Xbox/Github Style) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl pointer-events-none z-0">
                <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-brand/20 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0 mix-blend-overlay"></div>

            {/* Language Selector */}
            <div className="absolute top-6 right-6 z-20">
                <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="bg-black/40 text-slate-400 border border-white/10 text-xs rounded-full px-3 py-1.5 focus:outline-none focus:border-brand focus:text-white transition-colors cursor-pointer hover:bg-white/5 backdrop-blur-md"
                >
                    <option value="pt">PT-BR</option>
                    <option value="en">EN-US</option>
                    <option value="es">ES-ES</option>
                </select>
            </div>

            <div className="w-full max-w-md z-10 relative">
                <div className="text-center mb-8">
                    <Logo />
                    <p className="text-sm text-slate-400 font-medium tracking-wide">
                        {getSubtitle()}
                    </p>
                </div>

                <div className="bg-[#121214]/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10 ring-1 ring-white/5 relative overflow-hidden group">
                    {/* Subtle Top Border Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    
                    <div className="space-y-6 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-300 text-xs">{error}</p>
                            </div>
                        )}
                        
                        {message && (
                            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-green-300 text-xs">{message}</p>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {viewMode === 'signup' && (
                                 <div className="space-y-1.5">
                                    <label htmlFor="name" className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">
                                        {t('login.name')}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand transition-colors">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all sm:text-sm"
                                            placeholder="Seu nome completo"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">
                                    {t('login.email')}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand transition-colors">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all sm:text-sm"
                                        placeholder="aluno@escola.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {viewMode !== 'reset' && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center ml-1">
                                        <label htmlFor="password" className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                            {t('login.password')}
                                        </label>
                                        {viewMode === 'login' && (
                                            <button
                                                type="button"
                                                onClick={() => { setViewMode('reset'); clearState(); }}
                                                className="text-[10px] uppercase font-bold text-brand hover:text-white transition-colors"
                                            >
                                                {t('login.forgotPassword')}
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand transition-colors">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-10 pr-10 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all sm:text-sm"
                                            placeholder="••••••••"
                                            required
                                            disabled={loading}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-white transition-colors" aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}>
                                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                             {viewMode === 'signup' && (
                                <div className="space-y-1.5">
                                    <label htmlFor="confirmPassword"  className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">
                                        {t('login.confirmPassword')}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand transition-colors">
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="block w-full pl-10 pr-10 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 transition-all sm:text-sm"
                                            placeholder="••••••••"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_20px_-5px_rgba(var(--brand-rgb),0.4)] text-sm font-bold text-white bg-brand hover:bg-brand/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand focus:ring-offset-[#09090b] transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                            >
                                {loading ? <SpinnerIcon /> : (viewMode === 'signup' ? t('login.submitRegister') : viewMode === 'reset' ? t('login.submitReset') : t('login.submitLogin'))}
                            </button>
                        </form>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    {viewMode === 'reset' ? (
                        <button
                            onClick={() => { setViewMode('login'); clearState(); }}
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            ← {t('login.backToLogin')}
                        </button>
                    ) : (
                        <p className="text-sm text-slate-400">
                            {viewMode === 'signup' ? 'Já possui conta? ' : 'Ainda não tem conta? '}
                            <button
                                onClick={() => {
                                    setViewMode(prev => {
                                        if (prev === 'login') {
                                            setName('');
                                            setConfirmPassword('');
                                            return 'signup';
                                        }
                                        return 'login';
                                    });
                                    clearState();
                                }}
                                className="font-bold text-brand hover:text-white transition-colors ml-1"
                            >
                                {viewMode === 'signup'
                                    ? t('login.hasAccount')
                                    : t('login.noAccount')
                                }
                            </button>
                        </p>
                    )}
                </div>
            </div>
            
            {/* Footer Footer */}
            <div className="absolute bottom-4 text-[10px] text-slate-600 font-mono">
                Lumen Education v2.0 • System Online
            </div>
        </div>
    );
};
