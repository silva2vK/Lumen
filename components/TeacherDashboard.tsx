
import React, { useEffect, useState } from 'react';
import { ICONS } from '../constants/index';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from './supabaseClient';

interface DashboardCovers {
    main: string | null;
    moduleRepo: string | null;
    questionBank: string | null;
}

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const { setCurrentPage } = useNavigation();
    
    // Estado para as capas configuráveis
    const [covers, setCovers] = useState<DashboardCovers>({
        main: null,
        moduleRepo: null,
        questionBank: null
    });
    
    // Saudação baseada no horário
    const hours = new Date().getHours();
    let greeting = 'Olá';
    if (hours < 12) greeting = 'Bom dia';
    else if (hours < 18) greeting = 'Boa tarde';
    else greeting = 'Boa noite';
    
    const firstName = user?.name.split(' ')[0] || 'Professor';

    // Busca as imagens configuradas pelo Admin (Via Supabase)
    useEffect(() => {
        const loadCovers = async () => {
            try {
                // Tenta cache primeiro para evitar flicker
                const cached = sessionStorage.getItem('teacher_dash_covers');
                if (cached) {
                    setCovers(JSON.parse(cached));
                }

                // Migração: Firestore -> Supabase query
                const { data, error } = await supabase
                    .from('system_settings')
                    .select('data')
                    .eq('id', 'dashboard_config')
                    .single();
                
                if (data && data.data) {
                    const newCovers = {
                        main: data.data.defaultCoverUrl || null,
                        moduleRepo: data.data.moduleRepoCoverUrl || null,
                        questionBank: data.data.questionBankCoverUrl || null
                    };
                    setCovers(newCovers);
                    sessionStorage.setItem('teacher_dash_covers', JSON.stringify(newCovers));
                }
            } catch (error) {
                console.error("Erro ao carregar capas do dashboard:", error);
            }
        };

        loadCovers();
    }, []);

    // Fallbacks visuais de alta qualidade (Unsplash)
    const images = {
        main: covers.main || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1000&auto=format&fit=crop", // Biblioteca clássica
        map: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop", // Globo/Tech
        moduleRepo: covers.moduleRepo || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop", // Livros/Estudo
        questionBank: covers.questionBank || "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1000&auto=format&fit=crop" // Exame/Papel
    };

    // Componente de Card Reutilizável (Versão Compacta)
    const DashboardCard = ({ 
        onClick, 
        image, 
        title, 
        subtitle, 
        icon, 
        colorClass, 
        shadowClass 
    }: { 
        onClick: () => void, 
        image: string, 
        title: string, 
        subtitle: string, 
        icon: React.ReactNode, 
        colorClass: string,
        shadowClass: string
    }) => (
        <div 
            onClick={onClick}
            className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-200 dark:border-white/10 hover:-translate-y-1 bg-slate-900"
        >
            {/* Imagem de Fundo */}
            <div className="absolute inset-0">
                <img 
                    src={image} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" 
                    alt={title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>
            
            {/* Conteúdo Compacto */}
            <div className="absolute bottom-0 left-0 p-4 z-10 w-full">
                <div className="mb-2">
                    <div className={`p-2 inline-block rounded-full backdrop-blur-md border transition-all duration-300 ${colorClass} ${shadowClass}`}>
                        {/* Força tamanho menor no ícone */}
                        {React.cloneElement(icon as React.ReactElement<any>, { className: "h-5 w-5" })}
                    </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-0.5 leading-tight tracking-tight">
                    {title}
                </h3>
                <p className="text-[10px] text-slate-300 font-medium leading-snug opacity-80 uppercase tracking-wider">
                    {subtitle}
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen animate-fade-in pb-12">
            {/* Layout Mestre: Grid de 12 colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pl-2 md:pl-4">
                
                {/* Coluna de Conteúdo (Esquerda) - Ocupa 7 colunas (Visual 7x1 solicitado) */}
                <div className="lg:col-span-7 flex flex-col">
                    
                    {/* 1. Hero Section - Colado no topo, Fonte Gigante */}
                    <div className="flex flex-col space-y-2 pt-0 mt-0 mb-20 md:mb-24">
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-slate-800 dark:text-white drop-shadow-sm leading-[0.85]">
                            {greeting}, <br />
                            <span className="text-brand">
                                Professor {firstName}
                            </span>.
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg font-light leading-relaxed pl-1 pt-4 opacity-80">
                            Central de comando pedagógico.
                        </p>
                    </div>

                    {/* 2. Grid de Navegação (Cards Compactos abaixo da zona de respiro) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:pr-12">
                        
                        {/* LINHA 1 */}
                        <DashboardCard 
                            onClick={() => setCurrentPage('modules')}
                            image={images.main}
                            title="Explorar Módulos"
                            subtitle="Biblioteca Global"
                            icon={ICONS.modules}
                            colorClass="bg-blue-500/20 text-blue-400 border-blue-500/30"
                            shadowClass="group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                        />

                        <DashboardCard 
                            onClick={() => setCurrentPage('interactive_map')}
                            image={images.map}
                            title="Mapa do Tempo"
                            subtitle="Linha Interativa"
                            icon={ICONS.map}
                            colorClass="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            shadowClass="group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                        />

                        {/* LINHA 2 */}
                        <DashboardCard 
                            onClick={() => setCurrentPage('teacher_module_repository')}
                            image={images.moduleRepo}
                            title="Banco de Módulos"
                            subtitle="Meus Rascunhos"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                            colorClass="bg-amber-500/20 text-amber-400 border-amber-500/30"
                            shadowClass="group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                        />

                        <DashboardCard 
                            onClick={() => setCurrentPage('teacher_repository')}
                            image={images.questionBank}
                            title="Banco de Questões"
                            subtitle="Exercícios"
                            icon={ICONS.repository}
                            colorClass="bg-purple-500/20 text-purple-400 border-purple-500/30"
                            shadowClass="group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                        />

                    </div>
                </div>

                {/* Coluna de "Respiro" (Direita) - Vazia, ocupa o restante */}
                <div className="hidden lg:block lg:col-span-5 pointer-events-none">
                    {/* Espaço intencionalmente vazio para wallpaper/estética */}
                </div>

            </div>
        </div>
    );
};

export default TeacherDashboard;
