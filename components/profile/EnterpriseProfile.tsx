
import React from 'react';
import { useSettings, PRESET_THEMES } from '../../contexts/SettingsContext';
import type { ProfileViewProps } from './ProfileTypes';

export const EnterpriseProfile: React.FC<ProfileViewProps> = (props) => {
    const { 
        theme, applyThemePreset, accentColor, setAccentColor, fontProfile, setFontProfile,
        enableWallpaperMask, setEnableWallpaperMask, enableFocusMode, setEnableFocusMode,
        isHighContrastText, setIsHighContrastText
    } = useSettings();
    const { user, isEditing, setIsEditing, name, setName, avatarUrl, handleSave, handleAvatarFileChange, isUploadingAvatar } = props;

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Meu Perfil Corporativo</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center h-fit">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg mx-auto mb-4 bg-slate-100 dark:bg-slate-600">
                        {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-indigo-400">P</div>}
                    </div>
                    {isEditing ? (
                        <div className="space-y-4 text-left">
                            <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700" />
                            <input type="file" onChange={handleAvatarFileChange} className="text-xs" />
                            <div className="flex gap-2">
                                <button onClick={handleSave} disabled={isUploadingAvatar} className="flex-1 py-2 bg-brand text-black font-bold rounded">Salvar</button>
                                <button onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-slate-500 text-white rounded">X</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 mt-2">Docente</span>
                            <button onClick={() => setIsEditing(true)} className="w-full mt-8 py-2 bg-slate-100 dark:bg-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200">Editar Perfil</button>
                        </>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="font-bold text-lg mb-6">Preferências Visuais</h3>
                        <div className="space-y-8">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase mb-3">Atmosfera</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {PRESET_THEMES.map(p => (
                                        <button 
                                            key={p.id} 
                                            onClick={() => applyThemePreset(p.id)} 
                                            className={`p-3 border rounded text-xs font-bold transition-all relative overflow-hidden ${theme === p.id ? 'border-brand ring-2 ring-brand/20' : 'border-slate-200 dark:border-slate-600'}`}
                                            style={{
                                                background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})`,
                                                color: '#fff',
                                                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                            }}
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase mb-3">Estilo de Fonte</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {(['standard', 'executive'] as const).map(f => (
                                        <button key={f} onClick={() => setFontProfile(f)} className={`p-3 border rounded text-xs font-bold ${fontProfile === f ? 'border-brand bg-brand/5' : 'border-slate-200'}`}>
                                            {f === 'standard' ? 'Padrão' : 'Corporativa (Executiva)'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase mb-3">Cores</p>
                                <div className="flex gap-4 items-center">
                                    <input 
                                        type="color" 
                                        value={accentColor} 
                                        onChange={e => setAccentColor(e.target.value)} 
                                        className="w-12 h-12 bg-transparent border-0 cursor-pointer p-0" 
                                    />
                                    <span className="text-sm font-mono">{accentColor}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                <p className="text-sm font-bold text-slate-500 uppercase mb-4">Acessibilidade e Comportamento</p>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={isHighContrastText} onChange={e => setIsHighContrastText(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Modo de Texto em Alto Contraste</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={enableWallpaperMask} onChange={e => setEnableWallpaperMask(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Habilitar máscara de leitura sobre papéis de parede</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={enableFocusMode} onChange={e => setEnableFocusMode(e.target.checked)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Modo Foco automático durante atividades</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
