
import React, { useState, useEffect } from 'react';
import { useSettings, PRESET_THEMES } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { ICONS, SpinnerIcon } from '../constants/index';
import { useToast } from '../contexts/ToastContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseClient';
import { supabase } from './supabaseClient'; // Usando Supabase Client

export const AdminProfileView: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { 
        theme, applyThemePreset, 
        fontProfile, setFontProfile, 
        enableWallpaperMask, setEnableWallpaperMask,
        enableFocusMode, setEnableFocusMode,
        isHighContrastText, setIsHighContrastText,
        loadFontProfile
    } = useSettings();
    const { addToast } = useToast();

    // Local State
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    
    // Thematic Editor State
    const [thematicAccent, setThematicAccent] = useState('#ffffff');
    const [thematicDesktopBg, setThematicDesktopBg] = useState('');
    const [thematicMobileBg, setThematicMobileBg] = useState('');
    const [isSavingThematic, setIsSavingThematic] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setAvatarUrl(user.avatarUrl || '');
        }
        // Load current Thematic config to edit (Mantido no Firestore por enquanto para config global, ou migrar para system_settings no Supabase)
        // Nota: A Fase 5 migrou configs para Supabase 'system_settings'. Atualizando aqui também.
        const loadThematic = async () => {
            try {
                const { data, error } = await supabase
                    .from('system_settings')
                    .select('data')
                    .eq('id', 'thematic_config')
                    .single();

                if (data && data.data) {
                    setThematicAccent(data.data.accentColor || '#ffffff');
                    setThematicDesktopBg(data.data.desktopWallpaper || '');
                    setThematicMobileBg(data.data.mobileWallpaper || '');
                }
            } catch(e) { console.error(e); }
        };
        loadThematic();
    }, [user]);

    // Preload Admin Fonts
    useEffect(() => {
        loadFontProfile('admin_sci_fi');
    }, [loadFontProfile]);

    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            await updateUser({ name, avatarUrl });
            setIsEditing(false);
            addToast("Dados do operador atualizados!", "success");
        } catch (error) {
            addToast("Falha ao sincronizar dados.", "error");
        }
    };

    const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && user) {
            setIsUploadingAvatar(true);
            try {
                const file = e.target.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `admin_${user.id}_${Date.now()}.${fileExt}`;
                
                // Upload para Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                setAvatarUrl(data.publicUrl);
                addToast("Avatar carregado no buffer!", "info");
            } catch (error: any) {
                console.error("Avatar Upload Error:", error);
                addToast(`Erro no upload: ${error.message}`, "error");
            } finally {
                setIsUploadingAvatar(false);
            }
        }
    };

    const handleSaveThematic = async () => {
        setIsSavingThematic(true);
        try {
            const { error } = await supabase
                .from('system_settings')
                .upsert({
                    id: 'thematic_config',
                    data: {
                        accentColor: thematicAccent,
                        desktopWallpaper: thematicDesktopBg,
                        mobileWallpaper: thematicMobileBg
                    },
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            addToast("Atmosfera 'Temática' atualizada com sucesso!", "success");
        } catch (e: any) {
            addToast(`Erro ao salvar: ${e.message}`, "error");
        } finally {
            setIsSavingThematic(false);
        }
    };

    return (
        <div 
            className="min-h-screen animate-fade-in pb-20 font-sans select-none"
            style={{ 
                backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://grainy-gradients.vercel.app/noise.svg")',
                backgroundColor: '#050505'
            }}
        >
            {/* Header Estilo Terminal */}
            <div className="relative mb-12 py-10 border-b border-[#00d2ff]/20 bg-gradient-to-r from-[#00d2ff]/10 to-transparent pl-6">
                <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter dmc-title shadow-cyan-500/50">
                    Console_do_<span className="text-[#00d2ff]">Administrador</span>
                </h1>
                <p className="text-slate-400 font-mono tracking-[0.3em] uppercase text-xs mt-2">
                    Nível de Acesso: SSS // ID: {user?.id}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-6">
                {/* Coluna 1: Identidade e Dados do Operador */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-black border border-[#00d2ff]/30 p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                            <svg className="w-24 h-24 text-[#00d2ff]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        </div>
                        
                        <div className="flex flex-col items-center gap-6 relative z-10">
                            <div className="relative w-32 h-32">
                                <div className="absolute inset-0 bg-[#00d2ff] rotate-45 opacity-20 animate-pulse"></div>
                                <div className="absolute inset-2 border-2 border-[#00d2ff]/40 rotate-45 overflow-hidden bg-black">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="" className="w-full h-full object-cover -rotate-45 scale-150" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center -rotate-45 font-black text-4xl text-[#00d2ff]">A</div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="text-center w-full">
                                {isEditing ? (
                                    <div className="space-y-4 animate-fade-in">
                                        <input 
                                            value={name} 
                                            onChange={e => setName(e.target.value)}
                                            className="w-full bg-black border border-[#00d2ff]/50 p-2 text-white text-center font-mono outline-none focus:border-[#00d2ff]"
                                            placeholder="NOME_CÓDIGO"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={handleSaveProfile} className="flex-1 py-2 bg-green-600 text-white font-bold text-xs uppercase hover:bg-green-500">Salvar</button>
                                            <button onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-slate-800 text-white font-bold text-xs uppercase hover:bg-slate-700">X</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold text-white uppercase font-mono">{name}</h2>
                                        <p className="text-[#00d2ff] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">System_Maintainer</p>
                                        <button onClick={() => setIsEditing(true)} className="mt-4 text-[10px] text-slate-500 hover:text-[#00d2ff] uppercase font-bold tracking-widest">[ Editar_Operador ]</button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-white/10 space-y-4">
                            <div className="flex justify-between items-center text-xs font-mono">
                                <span className="text-slate-500">Status_Conexão:</span>
                                <span className="text-green-400 font-bold">ONLINE_ENCRYPTED</span>
                            </div>
                            <label className="flex justify-between items-center text-xs font-mono cursor-pointer group/upload">
                                <span className="text-slate-500 group-hover/upload:text-white transition-colors">Atualizar_Avatar:</span>
                                <span className="text-[#00d2ff] font-bold">{isUploadingAvatar ? '...' : '[ UPLOAD ]'}</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarFileChange} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Coluna 2: Configuração da Atmosfera "Temática" e Visual Local */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* EDITOR DE ATMOSFERA TEMÁTICA */}
                    <div className="bg-[#0d1117] border border-[#ff0055]/30 p-8 rounded-none relative">
                        <div className="absolute top-0 left-0 bg-[#ff0055] text-black text-[10px] font-bold px-2 py-1 uppercase">Admin Access Only</div>
                        <h3 className="text-xl font-bold text-white uppercase italic mb-8 border-l-4 border-[#ff0055] pl-4">Editor da Atmosfera 'Temática'</h3>
                        <p className="text-slate-400 text-xs font-mono mb-6 max-w-2xl">
                            Configure aqui a aparência do tema especial <strong>"Temática"</strong>. As alterações salvas aqui serão refletidas para qualquer usuário que tenha este tema selecionado. Isso não altera o tema padrão global.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#ff0055] uppercase tracking-widest">Cor de Destaque (Accent)</label>
                                    <div className="flex gap-4 items-center">
                                        <input 
                                            type="color" 
                                            value={thematicAccent} 
                                            onChange={e => setThematicAccent(e.target.value)} 
                                            className="w-10 h-10 bg-transparent border-0 cursor-pointer p-0" 
                                        />
                                        <input 
                                            type="text" 
                                            value={thematicAccent}
                                            onChange={e => setThematicAccent(e.target.value)}
                                            className="bg-black border border-white/20 p-2 text-white font-mono text-xs w-24 focus:border-[#ff0055] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-[#ff0055] uppercase tracking-widest">Wallpaper (URL)</label>
                                    <input 
                                        type="text"
                                        placeholder="Desktop URL (https://...)"
                                        value={thematicDesktopBg}
                                        onChange={e => setThematicDesktopBg(e.target.value)}
                                        className="w-full bg-black border border-white/20 p-2 text-white font-mono text-xs focus:border-[#ff0055] outline-none mb-2"
                                    />
                                    <input 
                                        type="text"
                                        placeholder="Mobile URL (https://...)"
                                        value={thematicMobileBg}
                                        onChange={e => setThematicMobileBg(e.target.value)}
                                        className="w-full bg-black border border-white/20 p-2 text-white font-mono text-xs focus:border-[#ff0055] outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button 
                                onClick={handleSaveThematic}
                                disabled={isSavingThematic}
                                className="px-6 py-3 bg-[#ff0055] hover:bg-[#d40045] text-white font-bold uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(255,0,85,0.4)] disabled:opacity-50"
                            >
                                {isSavingThematic ? 'PUBLICANDO...' : 'PUBLICAR ATMOSFERA'}
                            </button>
                        </div>
                    </div>

                    {/* CONFIGURAÇÃO LOCAL DO ADMIN */}
                    <div className="bg-[#0d1117] border border-white/10 p-8 rounded-none">
                        <h3 className="text-xl font-bold text-white uppercase italic mb-8 border-l-4 border-[#00d2ff] pl-4">Visual Local (Meu Console)</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Atmosfera_Pessoal</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {PRESET_THEMES.map(preset => (
                                        <button 
                                            key={preset.id} 
                                            onClick={() => applyThemePreset(preset.id)}
                                            className={`h-14 border font-bold text-[10px] uppercase transition-all relative overflow-hidden ${theme === preset.id ? 'border-[#00d2ff] scale-105 shadow-[0_0_15px_#00d2ff]' : 'border-slate-800 hover:border-slate-500'}`}
                                            style={{
                                                background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`,
                                                color: '#fff',
                                                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-black opacity-20 hover:opacity-0 transition-opacity" />
                                            <span className="relative z-10">{preset.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Codificação (Fontes)</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <button onClick={() => setFontProfile('standard')} className={`p-3 text-left border text-xs font-bold transition-all ${fontProfile === 'standard' ? 'bg-white/10 border-white text-white' : 'bg-black border-slate-800 text-slate-500'}`}>[ Padrão_System ]</button>
                                    <button onClick={() => setFontProfile('admin_sci_fi')} className={`p-3 text-left border text-xs font-bold transition-all font-scifi ${fontProfile === 'admin_sci_fi' ? 'bg-white/10 border-white text-white' : 'bg-black border-slate-800 text-slate-500'}`}>[ SciFi_Operador ]</button>
                                </div>
                                <div className="pt-4 border-t border-white/5 space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={isHighContrastText} onChange={e => setIsHighContrastText(e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-black text-[#00d2ff] focus:ring-[#00d2ff]" />
                                        <span className="text-xs font-mono text-slate-500 group-hover:text-white uppercase transition-colors">Texto_Alto_Contraste</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" checked={enableWallpaperMask} onChange={e => setEnableWallpaperMask(e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-black text-[#00d2ff] focus:ring-[#00d2ff]" />
                                        <span className="text-xs font-mono text-slate-500 group-hover:text-white uppercase transition-colors">Máscara_de_Fundo</span>
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
