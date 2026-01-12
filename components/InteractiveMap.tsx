
import React, { useState, useMemo, useEffect, useContext, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { TeacherAcademicContext } from '../contexts/TeacherAcademicContext';
import { useStudentAcademic } from '../contexts/StudentAcademicContext';
import { SpinnerIcon, ICONS } from '../constants/index';
import type { HistoricalEra, Module, Activity } from '../types';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseClient';
import { getSubjectTheme } from '../utils/subjectTheme';
import { scheduleTask } from '../utils/scheduler';

// --- Configuration & Assets ---

const DEFAULT_BACKGROUNDS: Record<HistoricalEra, string[]> = {
    'Pré-História': ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop'],
    'Antiga': ['https://images.unsplash.com/photo-1599739291060-4578e77dac5d?q=80&w=1600&auto=format&fit=crop'],
    'Média': ['https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1600&auto=format&fit=crop'],
    'Moderna': ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1600&auto=format&fit=crop'],
    'Contemporânea': ['https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1600&auto=format&fit=crop'],
};

// Neon Palette for Gamer Aesthetic
const ERA_COLORS: Record<HistoricalEra, string> = {
    'Pré-História': '#F59E0B', // Amber
    'Antiga': '#EAB308',       // Yellow/Gold
    'Média': '#D946EF',        // Fuchsia/Magical
    'Moderna': '#EF4444',      // Red/Revolution
    'Contemporânea': '#06B6D4', // Cyan/Future
};

// Helper para cores de Série (Consistente com Modules.tsx)
const getSeriesColor = (series: string | string[] | undefined) => {
    const s = Array.isArray(series) ? series[0] : (series || '');
    if (!s || s === 'all') return undefined;
    
    if (s.includes('6º')) return 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10';
    if (s.includes('7º')) return 'text-teal-400 border-teal-400/30 bg-teal-400/10';
    if (s.includes('8º')) return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
    if (s.includes('9º')) return 'text-lime-400 border-lime-400/30 bg-lime-400/10';
    if (s.includes('1º')) return 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10';
    if (s.includes('2º')) return 'text-violet-400 border-violet-400/30 bg-violet-400/10';
    if (s.includes('3º')) return 'text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-400/10';
    
    return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
};

const toRoman = (num: number): string => {
    const lookup: Record<string, number> = {C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
    let str = '';
    for ( let i in lookup ) {
        while ( num >= lookup[i] ) {
            str += i;
            num -= lookup[i];
        }
    }
    return str;
};

const formatCentury = (year: number): string => {
    const century = Math.ceil(Math.abs(year) / 100) || 1;
    const suffix = year < 0 ? ' a.C.' : '';
    return `(Século ${toRoman(century)}${suffix})`;
};

interface TimelineItem {
    id: string;
    type: 'module' | 'activity';
    title: string;
    year: number;
    era: HistoricalEra;
    data: Module | Activity;
}

// --- Components ---

const CyberGrid: React.FC = () => (
    <div 
        className="absolute bottom-0 left-0 right-0 h-[50vh] z-0 pointer-events-none opacity-40"
        style={{
            background: `
                linear-gradient(to bottom, transparent 0%, #000 100%),
                repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 100px),
                repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 100px)
            `,
            transform: 'perspective(1000px) rotateX(60deg) scale(2)',
            transformOrigin: 'bottom center',
            width: '100%',
            maskImage: 'linear-gradient(to bottom, transparent, black)'
        }}
    />
);

const TimelineNode: React.FC<{
    item: TimelineItem;
    index: number;
    onClick: (item: TimelineItem) => void;
    color: string;
}> = React.memo(({ item, index, onClick, color }) => {
    // Staggered layout logic
    const isOdd = index % 2 !== 0;
    const height = isOdd ? 280 : 380; // Alternating heights
    
    // Depth simulation
    const zIndex = 50 + (index % 5);

    const data = item.data as any;
    const coverImage = data.coverImageUrl || data.imageUrl;
    
    // Theme & Styling Logic
    const theme = getSubjectTheme(data.materia);
    const seriesColor = getSeriesColor(data.series) || 'text-slate-400 border-slate-400/30 bg-slate-400/10';
    const isCompleted = data.progress === 100;
    const progress = data.progress || 0;

    return (
        <div 
            className="absolute bottom-0 w-24 flex flex-col items-center justify-end group/node transition-all duration-500"
            style={{ 
                left: `${index * 240 + 100}px`, // Increased spacing for wider cards
                height: `${height}px`,
                zIndex
            }}
        >
            {/* Holographic Beam */}
            <div 
                className="absolute bottom-0 w-[1px] bg-gradient-to-t from-transparent via-white/20 to-white/60 group-hover/node:w-[2px] group-hover/node:via-white/50 transition-all duration-300"
                style={{ height: '100%', boxShadow: `0 0 15px ${color}40` }}
            />

            {/* The Anchor (Data Point on the Floor) */}
            <div 
                className="absolute -bottom-3 w-6 h-6 rounded-full border-2 bg-[#09090b] flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover/node:scale-125 transition-transform duration-300 z-10"
                style={{ borderColor: color, boxShadow: `0 0 10px ${color}` }}
            >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>

            {/* Year & Century Label (Floating above anchor) */}
            <div className="absolute bottom-6 flex flex-col items-center gap-0.5 z-20 transition-transform duration-300 group-hover/node:translate-y-[-5px]">
                <div className="bg-black/80 text-[10px] font-mono font-bold text-slate-300 px-2 py-0.5 rounded border border-white/10 group-hover/node:text-white group-hover/node:border-white/30 transition-colors whitespace-nowrap shadow-lg">
                    {item.year > 0 ? item.year : `${Math.abs(item.year)} a.C.`}
                </div>
                <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest bg-black/40 px-1 rounded">
                    {formatCentury(item.year)}
                </span>
            </div>

            {/* The Card (Standardized Module Design) */}
            <div 
                onClick={(e) => { e.stopPropagation(); onClick(item); }}
                className={`
                    relative mb-auto w-72 
                    bg-black/40 border border-white/10 
                    rounded-2xl overflow-hidden cursor-pointer 
                    transform transition-all duration-500 origin-bottom backdrop-blur-md
                    group-hover/node:scale-110 group-hover/node:z-50 
                    hover:bg-black/60 hover:${theme.border} hover:border-opacity-50 
                    hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]
                `}
            >
                {/* Glow Effect on Hover */}
                <div 
                    className="absolute inset-0 opacity-0 group-hover/node:opacity-20 transition-opacity duration-300 pointer-events-none"
                    style={{ background: `linear-gradient(to top, ${color}, transparent)` }}
                />

                {/* Header Image Area */}
                <div className="relative h-32 w-full bg-[#050505] overflow-hidden border-b border-white/5">
                    {coverImage ? (
                        <img 
                            src={coverImage} 
                            alt="" 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/node:scale-110 opacity-80 group-hover/node:opacity-100" 
                        />
                    ) : (
                        <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                    )}
                    
                    {/* Badge Type */}
                    <div className="absolute top-2 right-2 z-20">
                        <span 
                            className="text-[9px] uppercase font-bold px-2 py-1 rounded text-black shadow-sm"
                            style={{ backgroundColor: color }}
                        >
                            {item.type === 'module' ? 'MÓDULO' : 'ATIVIDADE'}
                        </span>
                    </div>
                </div>

                {/* Content Body */}
                <div className="p-4 flex flex-col gap-2 relative z-10">
                    <h4 className="text-sm font-bold text-slate-100 leading-tight line-clamp-2 group-hover/node:text-brand transition-colors">
                        {item.title}
                    </h4>

                    {/* Metadata Row: Materia -> Série */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${theme.bg} ${theme.text} ${theme.border}`}>
                            {Array.isArray(data.materia) ? data.materia[0] : data.materia || 'Geral'}
                        </span>

                        {data.series && (
                            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${seriesColor}`}>
                                {Array.isArray(data.series) ? data.series[0] : data.series}
                            </span>
                        )}
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-medium">
                        {data.description || 'Sem descrição.'}
                    </p>

                    {/* Progress Bar (Only for Modules) */}
                    {item.type === 'module' && (
                        <div className="mt-2 pt-2 border-t border-white/5">
                            <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-1">
                                <span>PROGRESSO</span>
                                <span className={isCompleted ? 'text-green-400' : 'text-brand'}>{progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-brand shadow-[0_0_5px_var(--brand-color)]'}`} 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Points (Only for Activities) */}
                    {item.type === 'activity' && (
                        <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 font-mono uppercase">Recompensa</span>
                            <span className="text-brand font-bold font-mono">+{data.points} XP</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

const HeadsUpDisplay: React.FC<{
    zoom: number;
    setZoom: (z: number) => void;
    resetCamera: () => void;
    eraSections: { era: HistoricalEra, left: number }[];
    onJumpToEra: (left: number) => void;
}> = ({ zoom, setZoom, resetCamera, eraSections, onJumpToEra }) => {
    return (
        <>
            {/* Bottom Era Navigation (Fast Travel) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl">
                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-full px-2 py-2 flex items-center justify-between shadow-2xl overflow-x-auto custom-scrollbar">
                    {eraSections.map((section) => (
                        <button
                            key={section.era}
                            onClick={() => onJumpToEra(section.left)}
                            className="flex-1 px-4 py-2 rounded-full text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wide truncate group relative min-w-[100px]"
                        >
                            <span 
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ backgroundColor: ERA_COLORS[section.era] }}
                            />
                            {section.era}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};

const InteractiveMap: React.FC = () => {
    const { userRole } = useAuth();
    const { startModule, openActivity } = useNavigation();
    
    const teacherContext = useContext(TeacherAcademicContext);
    const studentContext = useStudentAcademic();

    const [backgrounds, setBackgrounds] = useState<Record<HistoricalEra, string[]>>(DEFAULT_BACKGROUNDS);
    const [publicModules, setPublicModules] = useState<Module[]>([]);
    const [isLoadingPublic, setIsLoadingPublic] = useState(false);

    // Optimized Data State (Calculated via Scheduler)
    const [mapData, setMapData] = useState<{items: TimelineItem[], eraSections: { era: HistoricalEra, left: number, width: number, bg: string }[], totalWidth: number}>({ items: [], eraSections: [], totalWidth: 0 });
    const [isCalculating, setIsCalculating] = useState(false);

    // Camera & Physics
    const [cameraX, setCameraX] = useState(0);
    const [zoom, setZoom] = useState(1);
    
    const [isDragging, setIsDragging] = useState(false);
    const lastX = useRef(0);
    const viewportRef = useRef<HTMLDivElement>(null);

    // Initial Data Fetching
    useEffect(() => {
        const fetchBackgrounds = async () => {
            try {
                const docRef = doc(db, 'system_settings', 'timeline_backgrounds');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    const mergedBgs = { ...DEFAULT_BACKGROUNDS };
                    ['Pré-História', 'Antiga', 'Média', 'Moderna', 'Contemporânea'].forEach(era => {
                        if (data[era] && Array.isArray(data[era]) && data[era].length > 0 && data[era][0] !== '') {
                            mergedBgs[era as HistoricalEra] = data[era];
                        }
                    });
                    setBackgrounds(mergedBgs);
                }
            } catch (err) { console.error(err); }
        };
        fetchBackgrounds();
    }, []);

    // Load Public Modules for Students
    useEffect(() => {
        if (userRole === 'aluno') {
            setIsLoadingPublic(true);
            const q = query(collection(db, "modules"), where("status", "==", "Ativo"), where("visibility", "==", "public"));
            getDocs(q).then(snap => {
                setPublicModules(snap.docs.map(d => ({ id: d.id, ...d.data() } as Module)));
            }).finally(() => setIsLoadingPublic(false));
        } else if (userRole === 'professor' && teacherContext?.modules.length === 0) {
            teacherContext.fetchModulesLibrary();
        }
    }, [userRole, teacherContext]);

    // Offloaded Calculation using Scheduler
    useEffect(() => {
        let isMounted = true;
        const calculateMapLayout = async () => {
            setIsCalculating(true);
            
            const result = await scheduleTask(() => {
                let modules: Module[] = [];
                let activities: Activity[] = [];

                if (userRole === 'professor' && teacherContext) {
                    modules = teacherContext.modules;
                } else if (userRole === 'aluno' && studentContext) {
                    studentContext.studentClasses.forEach(cls => {
                        if (Array.isArray(cls.modules)) modules.push(...cls.modules);
                        if (Array.isArray(cls.activities)) activities.push(...cls.activities);
                    });
                    modules.push(...publicModules);
                    // Dedupe
                    modules = Array.from(new Map(modules.map(m => [m.id, m])).values());
                    activities = Array.from(new Map(activities.map(a => [a.id, a])).values());
                }

                const rawItems: TimelineItem[] = [];
                const pushItem = (obj: any, type: 'module' | 'activity') => {
                    if (obj.historicalYear !== undefined && obj.historicalEra) {
                        rawItems.push({ id: obj.id, type, title: obj.title, year: obj.historicalYear, era: obj.historicalEra, data: obj });
                    }
                };
                modules.forEach(m => pushItem(m, 'module'));
                activities.forEach(a => pushItem(a, 'activity'));
                rawItems.sort((a, b) => a.year - b.year);

                // Calculate Era Sections
                const sections: { era: HistoricalEra, left: number, width: number, bg: string }[] = [];
                let currentX = 0;
                const ERAS: HistoricalEra[] = ['Pré-História', 'Antiga', 'Média', 'Moderna', 'Contemporânea'];

                ERAS.forEach(era => {
                    const count = rawItems.filter(i => i.era === era).length;
                    const width = Math.max(1600, count * 280); // Increased per-item width
                    const bg = backgrounds[era]?.[0] || '';
                    sections.push({ era, left: currentX, width, bg });
                    currentX += width;
                });

                return { items: rawItems, eraSections: sections, totalWidth: currentX };
            }, 'user-visible');

            if (isMounted) {
                setMapData(result);
                setIsCalculating(false);
            }
        };

        calculateMapLayout();
        
        return () => { isMounted = false; };
    }, [userRole, teacherContext?.modules, studentContext?.studentClasses, publicModules, backgrounds]);

    const { items, eraSections, totalWidth } = mapData;

    // --- Interaction Handlers ---

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        if (e.ctrlKey) {
            setZoom(z => Math.min(2, Math.max(0.5, z - e.deltaY * 0.005)));
        } else {
            setCameraX(x => Math.max(0, Math.min(x + e.deltaX + e.deltaY, totalWidth - window.innerWidth)));
        }
    }, [totalWidth]);

    useEffect(() => {
        const el = viewportRef.current;
        if (el) el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el?.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    // Touch/Mouse Drag Logic
    const handleStart = (clientX: number) => {
        setIsDragging(true);
        lastX.current = clientX;
    };
    const handleMove = (clientX: number) => {
        if (!isDragging) return;
        const delta = lastX.current - clientX;
        lastX.current = clientX;
        setCameraX(x => Math.max(0, Math.min(x + delta, totalWidth - window.innerWidth / zoom)));
    };

    const jumpToEra = (left: number) => {
        setCameraX(left);
    };

    const isLoading = (userRole === 'aluno' ? studentContext?.isLoading : teacherContext?.isLoadingContent) || isLoadingPublic || isCalculating;

    if (isLoading && items.length === 0) {
        return <div className="h-[80vh] flex items-center justify-center"><SpinnerIcon className="h-12 w-12 text-brand" /></div>;
    }

    return (
        <div 
            ref={viewportRef}
            className="relative h-[calc(100vh-6rem)] w-full overflow-hidden bg-[#050505] select-none rounded-xl border border-white/10 shadow-2xl"
            onMouseDown={e => handleStart(e.clientX)}
            onMouseMove={e => handleMove(e.clientX)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={e => handleStart(e.touches[0].clientX)}
            onTouchMove={e => handleMove(e.touches[0].clientX)}
            onTouchEnd={() => setIsDragging(false)}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            <HeadsUpDisplay 
                zoom={zoom} 
                setZoom={setZoom} 
                resetCamera={() => { setCameraX(0); setZoom(1); }}
                eraSections={eraSections}
                onJumpToEra={jumpToEra}
            />

            {/* WORLD CONTAINER */}
            <div 
                className="absolute inset-0 h-full will-change-transform"
                style={{ 
                    transform: `translateX(${-cameraX}px) scale(${zoom})`, 
                    transformOrigin: 'top left',
                    width: `${totalWidth}px` 
                }}
            >
                {/* 1. Backgrounds & Environment */}
                <div className="absolute inset-0 flex h-full pointer-events-none">
                    {eraSections.map(section => (
                        <div 
                            key={section.era} 
                            style={{ width: `${section.width}px` }} 
                            className="relative h-full border-r border-white/5 overflow-hidden"
                        >
                            {/* Background Image */}
                            <div 
                                className="absolute inset-0 bg-cover bg-center opacity-30 blur-[2px] transition-all duration-1000"
                                style={{ backgroundImage: `url(${section.bg})` }} 
                            />
                            
                            {/* Era Title (Gigantic) */}
                            <h1 className="absolute top-20 left-10 text-[10rem] font-black text-white/5 uppercase tracking-tighter whitespace-nowrap font-epic select-none">
                                {section.era}
                            </h1>

                            {/* Section Color Fog */}
                            <div 
                                className="absolute bottom-0 inset-x-0 h-1/2 opacity-20"
                                style={{ background: `linear-gradient(to top, ${ERA_COLORS[section.era]}, transparent)` }}
                            />
                        </div>
                    ))}
                </div>

                <CyberGrid />

                {/* 2. Timeline Track (The Beam) */}
                <div className="absolute bottom-[100px] left-0 right-0 h-[2px] bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50" />
                </div>

                {/* 3. Items Layer */}
                <div className="absolute inset-0 pointer-events-none z-20">
                    {items.map((item, idx) => {
                        // Calculate absolute position based on era offset
                        const section = eraSections.find(s => s.era === item.era);
                        if (!section) return null;
                        
                        // Relative index within era for spacing
                        const eraItems = items.filter(i => i.era === item.era);
                        const localIndex = eraItems.findIndex(i => i.id === item.id);
                        
                        // Position logic
                        const leftPos = section.left + 200 + (localIndex * 240); 

                        return (
                            <div key={item.id} className="absolute bottom-[100px] pointer-events-auto" style={{ left: `${leftPos}px` }}>
                                <TimelineNode 
                                    item={item} 
                                    index={idx} 
                                    onClick={(i) => i.type === 'module' ? startModule(i.data as Module) : openActivity(i.data as Activity)} 
                                    color={ERA_COLORS[item.era]}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default InteractiveMap;
