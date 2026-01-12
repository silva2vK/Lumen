
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getWallpaper, saveWallpaper, deleteWallpaper } from '../utils/wallpaperManager';
import { supabase } from '../components/supabaseClient';

export type Theme = 'standard' | 'oled' | 'paper' | 'nebula' | 'dracula' | 'high-contrast' | 'synthwave' | 'eva' | 'restless-dreams' | 'shadow-monarch' | 'tematica';
export type FontProfile = 'standard' | 'gothic' | 'confidential' | 'code' | 'cute' | 'executive' | 'admin_sci_fi';

export interface ThemePreset {
    id: Theme;
    label: string;
    accent: string; 
    colors: [string, string]; 
}

export interface GlobalTheme {
    desktop: string | null;
    mobile: string | null;
    accent: string | null;
}

export const PRESET_THEMES: ThemePreset[] = [
    { id: 'standard', label: 'Padrão', accent: '#4ade80', colors: ['#09090b', '#18181b'] },
    { id: 'tematica', label: 'Temática (Admin)', accent: '#ffffff', colors: ['#222', '#444'] },
    { id: 'shadow-monarch', label: 'Shadow Monarch', accent: '#00a8ff', colors: ['#050510', '#020617'] }, 
    { id: 'restless-dreams', label: 'Restless Dreams', accent: '#8a1c1c', colors: ['#1a1c1a', '#0f0f0e'] },
    { id: 'oled', label: 'OLED', accent: '#ffffff', colors: ['#000000', '#000000'] },
    { id: 'eva', label: 'Unit-01', accent: '#a3e635', colors: ['#2e1065', '#4c1d95'] },
    { id: 'synthwave', label: 'Synthwave', accent: '#d946ef', colors: ['#2e022d', '#4a044e'] },
    { id: 'nebula', label: 'Nebula', accent: '#818cf8', colors: ['#0f172a', '#312e81'] },
    { id: 'dracula', label: 'Dracula', accent: '#bd93f9', colors: ['#282a36', '#44475a'] },
    { id: 'paper', label: 'Papiro', accent: '#d6d3d1', colors: ['#1c1917', '#292524'] },
    { id: 'high-contrast', label: 'Alto Contraste', accent: '#ffff00', colors: ['#000000', '#ffffff'] },
];

const FONT_URLS: Record<string, string> = {
    'gothic': 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&display=swap',
    'confidential': 'https://fonts.googleapis.com/css2?family=Special+Elite&display=swap',
    'code': 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300..700&display=swap',
    'cute': 'https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap',
    'executive': 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap',
    'admin_sci_fi': 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Cinzel:wght@400;500;600;700;800;900&display=swap', 
    'japanese': 'https://fonts.googleapis.com/css2?family=Sawarabi+Mincho&display=swap'
};

interface SettingsContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    applyThemePreset: (presetId: Theme) => void;
    isHighContrastText: boolean;
    setIsHighContrastText: (value: boolean) => void;
    
    wallpaper: string | null;
    globalTheme: GlobalTheme;
    enableWallpaperMask: boolean; 
    setEnableWallpaperMask: (value: boolean) => void;
    enableFocusMode: boolean;
    setEnableFocusMode: (value: boolean) => void;
    updateWallpaper: (file: File) => Promise<void>;
    removeWallpaper: () => Promise<void>;
    accentColor: string;
    setAccentColor: (color: string) => void;
    
    fontProfile: FontProfile;
    setFontProfile: (font: FontProfile) => void;
    
    loadFontProfile: (profileKey: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '74 222 128';
};

export function SettingsProvider({ children }: { children?: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('standard');
    const [isHighContrastText, setIsHighContrastText] = useState(false);
    
    const [wallpaper, setWallpaper] = useState<string | null>(null);
    const [globalTheme, setGlobalTheme] = useState<GlobalTheme>({ desktop: null, mobile: null, accent: null });
    
    const [thematicConfig, setThematicConfig] = useState<GlobalTheme>({ desktop: null, mobile: null, accent: '#ffffff' });
    
    const [enableWallpaperMask, setEnableWallpaperMaskState] = useState(true);
    const [enableFocusMode, setEnableFocusModeState] = useState(true); 
    const [accentColor, setAccentColorState] = useState<string>('#4ade80');
    const [fontProfile, setFontProfileState] = useState<FontProfile>('standard');

    const applyAccentToDOM = (color: string) => {
        document.documentElement.style.setProperty('--brand-color', color);
        document.documentElement.style.setProperty('--brand-rgb', hexToRgb(color));
    };

    const loadFont = useCallback((url: string) => {
        if (!document.querySelector(`link[href="${url}"]`)) {
            const link = document.createElement('link');
            link.href = url;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
    }, []);

    const loadFontProfile = useCallback((profileKey: string) => {
        if (FONT_URLS[profileKey]) {
            loadFont(FONT_URLS[profileKey]);
        }
    }, [loadFont]);

    // Listener para configurações do tema "Temática" (Via Supabase Realtime ou Polling)
    useEffect(() => {
        const fetchThematic = async () => {
            const { data } = await supabase
                .from('system_settings')
                .select('data')
                .eq('id', 'thematic_config')
                .single();
            
            if (data && data.data) {
                const config = data.data;
                setThematicConfig({
                    desktop: config.desktopWallpaper || null,
                    mobile: config.mobileWallpaper || null,
                    accent: config.accentColor || '#ffffff'
                });
            }
        };
        fetchThematic();
        
        // Opcional: Adicionar Realtime subscription aqui se necessário
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') as Theme | null;
        if (savedTheme && PRESET_THEMES.some(p => p.id === savedTheme)) setTheme(savedTheme);
        
        const savedHighContrastText = localStorage.getItem('app-high-contrast-text') === 'true';
        setIsHighContrastText(savedHighContrastText);

        const savedMask = localStorage.getItem('app-wallpaper-mask');
        if (savedMask !== null) setEnableWallpaperMaskState(savedMask === 'true');

        const savedFocus = localStorage.getItem('app-focus-mode');
        if (savedFocus !== null) setEnableFocusModeState(savedFocus === 'true');

        if (savedTheme !== 'tematica') {
            const savedAccent = localStorage.getItem('app-accent-color');
            if (savedAccent) {
                setAccentColorState(savedAccent);
                applyAccentToDOM(savedAccent);
            } else {
                applyAccentToDOM('#4ade80');
            }
        }
        
        const savedFont = localStorage.getItem('app-font-profile') as FontProfile | null;
        if (savedFont) setFontProfileState(savedFont);

        getWallpaper().then(url => { if (url) setWallpaper(url); });
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (isHighContrastText) {
            root.classList.add('high-contrast-text');
        } else {
            root.classList.remove('high-contrast-text');
        }
    }, [isHighContrastText]);

    useEffect(() => {
        const root = window.document.documentElement;
        PRESET_THEMES.forEach(p => root.classList.remove(p.id));
        root.classList.add(theme);
        root.classList.add('dark');
        
        const body = document.body;
        body.classList.remove('font-gothic', 'font-confidential', 'font-code', 'font-cute', 'font-executive');
        
        if (fontProfile !== 'standard') {
            body.classList.add(`font-${fontProfile}`);
            loadFontProfile(fontProfile);
        }
        if (theme === 'shadow-monarch') loadFontProfile('admin_sci_fi');
        if (theme === 'restless-dreams') loadFontProfile('confidential');

        if (theme === 'tematica') {
            if (thematicConfig.accent) {
                setAccentColorState(thematicConfig.accent);
                applyAccentToDOM(thematicConfig.accent);
            }
            setGlobalTheme(thematicConfig);
        } else {
            setGlobalTheme({ desktop: null, mobile: null, accent: null });
            const savedAccent = localStorage.getItem('app-accent-color');
            if (savedAccent) applyAccentToDOM(savedAccent);
        }
        
        localStorage.setItem('app-theme', theme);
    }, [theme, fontProfile, loadFontProfile, thematicConfig]);

    const updateWallpaperState = async (file: File) => {
        await saveWallpaper(file);
        const url = URL.createObjectURL(file);
        setWallpaper(url);
    };

    const removeWallpaperState = async () => {
        await deleteWallpaper();
        setWallpaper(null);
    };

    const setAccentColor = (color: string) => {
        if (theme === 'tematica') return; 
        setAccentColorState(color);
        applyAccentToDOM(color);
        localStorage.setItem('app-accent-color', color);
    };

    const setEnableWallpaperMask = (value: boolean) => {
        setEnableWallpaperMaskState(value);
        localStorage.setItem('app-wallpaper-mask', String(value));
    };

    const setEnableFocusMode = (value: boolean) => {
        setEnableFocusModeState(value);
        localStorage.setItem('app-focus-mode', String(value));
    };
    
    const setFontProfile = (font: FontProfile) => {
        setFontProfileState(font);
        localStorage.setItem('app-font-profile', font);
    };

    const toggleHighContrastText = (value: boolean) => {
        setIsHighContrastText(value);
        localStorage.setItem('app-high-contrast-text', String(value));
    }

    const applyThemePreset = (presetId: Theme) => {
        setTheme(presetId);
        const preset = PRESET_THEMES.find(p => p.id === presetId);
        if (preset && presetId !== 'tematica') {
            setAccentColor(preset.accent);
        }
        if (presetId === 'high-contrast') {
            toggleHighContrastText(true);
        }
    };

    const value = { 
        theme, setTheme, applyThemePreset,
        isHighContrastText, setIsHighContrastText: toggleHighContrastText,
        wallpaper, globalTheme, 
        enableWallpaperMask, setEnableWallpaperMask, 
        enableFocusMode, setEnableFocusMode,
        updateWallpaper: updateWallpaperState, removeWallpaper: removeWallpaperState,
        accentColor, setAccentColor,
        fontProfile, setFontProfile,
        loadFontProfile
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
