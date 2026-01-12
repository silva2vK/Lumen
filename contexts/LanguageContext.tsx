import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations, Language } from '../constants/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children?: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('pt');

    useEffect(() => {
        const savedLang = localStorage.getItem('app-language') as Language;
        if (savedLang && ['pt', 'en', 'es'].includes(savedLang)) {
            setLanguageState(savedLang);
        } else {
            // Auto-detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (browserLang === 'en') setLanguageState('en');
            else if (browserLang === 'es') setLanguageState('es');
            else setLanguageState('pt');
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app-language', lang);
        // Set HTML lang attribute for accessibility
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
    };

    const t = (path: string): string => {
        const keys = path.split('.');
        let current: any = translations[language];
        
        for (const key of keys) {
            if (current[key] === undefined) {
                console.warn(`Translation missing for key: ${path} in language: ${language}`);
                return path; // Fallback to key
            }
            current = current[key];
        }
        
        return current as string;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};