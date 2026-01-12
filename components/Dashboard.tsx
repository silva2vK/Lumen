
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useStudentAcademic } from '../contexts/StudentAcademicContext';
import { ICONS } from '../constants/index';
import { supabase } from './supabaseClient';
import type { Module } from '../types';

const RecentModulesPanel: React.FC = () => {
    const { startModule } = useNavigation();
    const [recents, setRecents] = useState<Module[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('lumen_recent_modules');
            if (raw) setRecents(JSON.parse(raw));
        } catch (e) {
            console.error("Error loading recents", e);
        }
    }, []);

    if (recents.length === 0) return null;

    return (
        <div className="mt-12 lg:mt-0 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6 border-b-2 border-red-900/50 pb-2 w-fit pr-12">
                <span className="text-red-700 text-2xl drop-shadow-[0_0_8px_rgba(185,28,28,0.8)]">❖</span>
                <h2 className="text-xl font-epic font-bold text-stone-300 uppercase tracking-[0.2em] shadow-black drop-shadow-md">
                    Histórico
                </h2>
            </div>

            <div className="space-y-4">
                {recents.map((mod, i) => (
                    <div 
                        key={mod.id}
                        onClick={() => startModule(mod)}
                        className="group relative h-20 w-full bg-black/80 border-l-4 border-stone-800 hover:border-red-800 transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-red-900/20"
                    >
                        {mod.coverImageUrl && (
                            <img 
                                src={mod.coverImageUrl} 
                                className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-500" 
                                alt=""
                            />
                        )}
                        
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                        
                        <div className="relative z-10 h-full flex flex-col justify-center pl-4 pr-2">
                            <h3 className="text-sm font-epic font-bold text-stone-300 group-hover:text-white uppercase tracking-wider truncate transition-colors">
                                {mod.title}
                            </h3>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[9px] font-mono text-stone-600 group-hover:text-red-500/80 uppercase">
                                    {Array.isArray(mod.materia) ? mod.materia[0] : mod.materia}
                                </span>
                                <span className="text-[10px] text-stone-700 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 font-bold">
                                    RESUME &gt;
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { setCurrentPage } = useNavigation();
    
    const { inProgressModules } = useStudentAcademic();

    const [defaultCoverUrl, setDefaultCoverUrl] = useState<string | null>(null);

    const firstName = user?.name.split(' ')[0] || 'Visitante';
    const activeModule = inProgressModules.length > 0 ? inProgressModules[0] : null;

    useEffect(() => {
        const fetchDefaultCover = async () => {
            try {
                const { data } = await supabase
                    .from('system_settings')
                    .select('data')
                    .eq('id', 'dashboard_config')
                    .single();
                
                if (data && data.data) {
                    setDefaultCoverUrl(data.data.defaultCoverUrl);
                }
            } catch (error) {
                console.error("Failed to load default dashboard cover", error);
            }
        };
        fetchDefaultCover();
    }, []);

    const bgImage = activeModule?.coverImageUrl || defaultCoverUrl;

    const hours = new Date().getHours();
    let greeting = 'Bem-vindo';
    if (hours < 12) greeting = 'Bom dia';
    else if (hours < 18) greeting = 'Boa tarde';
    else greeting = 'Boa noite';

    return (
        <div className="space-y-12 animate-fade-in pb-12">
            <div className="flex flex-col space-y-4 pt-4 px-2 pb-6 md:pb-16">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
                    {greeting}, <span className="text-brand">{firstName}</span>.
                </h1>
                <p className="text-slate-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
                    Seu espaço de aprendizado está pronto. O que vamos explorar hoje?
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                <div className="w-full lg:w-1/2">
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div 
                            onClick={() => setCurrentPage(activeModule ? 'modules' : 'modules')}
                            className="group relative h-64 md:h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border-2 !border-brand/30 hover:!border-brand"
                        >
                            <div className="absolute inset-0 bg-slate-900">
                                {bgImage ? (
                                    <img src={bgImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500" alt="Capa" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-black" />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 p-6 md:p-8">
                                <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-widest text-brand uppercase bg-black/50 rounded-full backdrop-blur-md border border-brand/30">
                                    {activeModule ? 'Continuar' : 'Iniciar'}
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-brand transition-colors">
                                    {activeModule ? activeModule.title : "Explorar Módulos"}
                                </h3>
                                <p className="text-xs md:text-sm text-slate-300 line-clamp-2">
                                    {activeModule ? activeModule.description : "Inicie sua jornada de conhecimento."}
                                </p>
                                {activeModule && (
                                    <div className="mt-4 w-full bg-white/20 rounded-full h-1">
                                        <div className="bg-brand h-1 rounded-full shadow-[0_0_10px_var(--brand-color)]" style={{ width: `${activeModule.progress || 0}%` }} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div 
                            onClick={() => setCurrentPage('interactive_map')}
                            className="group relative h-64 md:h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border-2 !border-brand/30 hover:!border-brand"
                        >
                            <div className="absolute inset-0 bg-slate-900">
                                <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000" className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000" alt="" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            
                            <div className="absolute bottom-0 left-0 p-6 md:p-8">
                                <div className="mb-3">
                                    <div className="p-3 bg-brand/10 inline-block rounded-full text-brand backdrop-blur-md border border-brand/30 group-hover:shadow-[0_0_15px_rgba(var(--brand-rgb),0.4)] transition-all">
                                        {ICONS.map}
                                    </div>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover:text-brand transition-colors">Mapa Interativo</h3>
                                <p className="text-xs md:text-sm text-slate-300">Navegue pela história.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/3">
                    <RecentModulesPanel />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
