
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants/index';
import { useAdminData } from '../contexts/AdminDataContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from './common/Modal';
import { doc, getDoc, setDoc, collection, query, where, orderBy, getDocs, collectionGroup, limit } from 'firebase/firestore';
import { db } from './firebaseClient';
import { useToast } from '../contexts/ToastContext';
import { SpinnerIcon } from '../constants/index';
import { useSettings } from '../contexts/SettingsContext';

// --- DMC STYLE COMPONENTS ---

const StyleRankBadge: React.FC<{ rank: string, subtext: string }> = ({ rank, subtext }) => (
    <div className="relative group perspective-1000">
        <div className="absolute inset-0 bg-[#00d2ff] blur-[40px] opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>
        <div className="relative flex items-center justify-between bg-black/80 border-l-4 border-[#00d2ff] p-6 transform -skew-x-12 hover:skew-x-0 transition-transform duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="transform skew-x-12">
                <h3 className="text-6xl font-black italic tracking-tighter rank-sss leading-none mb-1">{rank}</h3>
                <p className="text-xs font-mono text-[#00d2ff] uppercase tracking-widest">{subtext}</p>
            </div>
            <div className="transform skew-x-12 opacity-30 group-hover:opacity-100 transition-opacity">
                <svg className="w-12 h-12 text-[#00d2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
        </div>
    </div>
);

const MissionCard: React.FC<{ 
    label: string; 
    description: string;
    onClick: () => void;
    icon: React.ReactNode;
    accentColor?: string; // Hex
}> = ({ label, description, onClick, icon, accentColor = '#ff0055' }) => (
    <button
        onClick={onClick}
        className="w-full text-left relative group overflow-hidden"
    >
        <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            style={{ backgroundColor: accentColor }}
        ></div>
        <div className="flex items-center gap-6 p-6 border-b border-white/10 group-hover:pl-10 transition-all duration-200">
            <div 
                className="text-4xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                style={{ color: accentColor }}
            >
                {icon}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white uppercase italic tracking-wide group-hover:text-white transition-colors dmc-title">
                    {label}
                </h3>
                <p className="text-xs font-mono text-slate-500 group-hover:text-slate-300 uppercase tracking-wider">
                    {description}
                </p>
            </div>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                <span className="text-2xl font-black italic" style={{ color: accentColor }}>GO &gt;</span>
            </div>
        </div>
    </button>
);

// --- Index Diagnostic Modal (Kept functional logic, updated UI) ---
interface IndexStatus {
    id: string;
    name: string;
    description: string;
    status: 'checking' | 'active' | 'missing' | 'error';
    link?: string;
}

const IndexDiagnosticModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [indexes, setIndexes] = useState<IndexStatus[]>([
        { id: '1', name: 'Submissões de Alunos', description: 'Permite buscar atividades enviadas por ID do aluno.', status: 'checking' },
        { id: '2', name: 'Notificações (Timeline)', description: 'Ordena notificações não lidas.', status: 'checking' },
        { id: '3', name: 'Módulos Públicos', description: 'Filtra módulos ativos e públicos.', status: 'checking' },
        { id: '4', name: 'Atividades Pendentes', description: 'Filtra pendências por criador.', status: 'checking' },
        { id: '5', name: 'Rankings de Quiz', description: 'Ordena resultados de quiz.', status: 'checking' }
    ]);

    useEffect(() => {
        if (isOpen) {
            runDiagnostics();
        }
    }, [isOpen]);

    const runDiagnostics = async () => {
        // Logic kept same as original, just UI updated in render
        const updates = [...indexes];
        const updateStatus = (id: string, status: IndexStatus['status'], link?: string) => {
            const idx = updates.findIndex(i => i.id === id);
            if (idx !== -1) {
                updates[idx] = { ...updates[idx], status, link };
                setIndexes([...updates]);
            }
        };

        const checkQuery = async (id: string, queryFn: () => Promise<any>) => {
            try {
                await queryFn();
                updateStatus(id, 'active');
            } catch (e: any) {
                const link = extractLink(e.message);
                updateStatus(id, link ? 'missing' : 'error', link);
            }
        };

        await checkQuery('1', () => getDocs(query(collectionGroup(db, 'submissions'), where('studentId', '==', 'DIAGNOSTIC_PROBE'), limit(1))));
        await checkQuery('2', () => getDocs(query(collection(db, "notifications"), where("userId", "==", "DIAGNOSTIC_PROBE"), where("read", "==", false), orderBy("timestamp", "desc"), limit(1))));
        await checkQuery('3', () => getDocs(query(collection(db, "modules"), where("status", "==", "Ativo"), where("visibility", "==", "public"), limit(1))));
        await checkQuery('4', () => getDocs(query(collection(db, "activities"), where("creatorId", "==", "DIAGNOSTIC_PROBE"), where("status", "==", "Pendente"), limit(1))));
        await checkQuery('5', () => getDocs(query(collection(db, "quizzes"), orderBy("date", "desc"), limit(1))));
    };

    const extractLink = (msg: string) => {
        const match = msg.match(/https:\/\/console\.firebase\.google\.com[^\s]*/);
        return match ? match[0] : undefined;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="VERIFICAÇÃO DE INTEGRIDADE">
            <div className="bg-black text-left font-mono text-sm border border-[#00d2ff]/30 p-4">
                <div className="mb-4 text-[#00d2ff]">
                    &gt; INICIANDO SEQUÊNCIA DE DIAGNÓSTICO...
                </div>
                
                <div className="space-y-4">
                    {indexes.map((idx) => (
                        <div key={idx.id} className="flex items-center justify-between border-b border-white/10 pb-2">
                            <div>
                                <p className="text-white font-bold">{idx.name}</p>
                                <p className="text-[10px] text-slate-500">{idx.description}</p>
                            </div>
                            <div>
                                {idx.status === 'checking' && <span className="text-yellow-500 animate-pulse">ESCANEANDO</span>}
                                {idx.status === 'active' && <span className="text-green-500">[OK]</span>}
                                {idx.status === 'missing' && (
                                    <a href={idx.link} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:bg-red-500 hover:text-white px-2 py-1">CORRIGIR ÍNDICE</a>
                                )}
                                {idx.status === 'error' && <span className="text-red-500">FALHA</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

// --- THEME CONFIG MODAL (RENAMED TO THEMATIC CONFIG) ---
const ThematicConfigModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { addToast } = useToast();
    const [desktopWallpaper, setDesktopWallpaper] = useState('');
    const [mobileWallpaper, setMobileWallpaper] = useState('');
    const [accentColor, setAccentColor] = useState('#ffffff');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!isOpen) return;
            try {
                // Reads specific thematic config, NOT user defaults
                const docRef = doc(db, 'system_settings', 'thematic_config');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setDesktopWallpaper(data.desktopWallpaper || '');
                    setMobileWallpaper(data.mobileWallpaper || '');
                    setAccentColor(data.accentColor || '#ffffff');
                }
            } catch (e) { console.error(e); }
        };
        load();
    }, [isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'system_settings', 'thematic_config'), {
                desktopWallpaper, mobileWallpaper, accentColor
            }, { merge: true });
            addToast("Atmosfera 'Temática' atualizada!", "success");
            onClose();
        } catch (e: any) { addToast(e.message, "error"); } 
        finally { setIsSaving(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="CONFIG. ATMOSFERA TEMÁTICA">
            <div className="space-y-6 text-left font-mono">
                <p className="text-xs text-slate-400">
                    Estas configurações afetam apenas usuários que escolherem o tema "Temática".
                </p>
                <div className="space-y-1">
                    <label className="text-xs text-[#00d2ff] uppercase">Wallpaper Desktop (URL)</label>
                    <input type="text" value={desktopWallpaper} onChange={e => setDesktopWallpaper(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white focus:border-[#00d2ff] outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-[#00d2ff] uppercase">Wallpaper Mobile (URL)</label>
                    <input type="text" value={mobileWallpaper} onChange={e => setMobileWallpaper(e.target.value)} className="w-full bg-black border border-white/20 p-2 text-white focus:border-[#00d2ff] outline-none" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-[#00d2ff] uppercase">Cor de Destaque</label>
                    <div className="flex gap-2">
                        <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="bg-transparent border-0 h-8 w-8 cursor-pointer" />
                        <span className="text-white self-center">{accentColor}</span>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-[#00d2ff] text-black font-bold hover:bg-white transition-colors skew-x-[-12deg]">
                        {isSaving ? 'SALVANDO...' : 'ATUALIZAR ATMOSFERA'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const AdminDashboard: React.FC = () => {
    const { totalModulesCount, quizzes, achievements, isLoading } = useAdminData();
    const { setCurrentPage } = useNavigation();
    const { user } = useAuth();
    const { loadFontProfile } = useSettings();
    
    const [isThematicModalOpen, setIsThematicModalOpen] = useState(false);
    const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);

    // Preload Admin Fonts
    useEffect(() => {
        loadFontProfile('admin_sci_fi');
    }, [loadFontProfile]);

    // Calculate dynamic ranks
    const contentVolume = totalModulesCount + quizzes.length;
    const contentRank = contentVolume > 50 ? 'SSS' : contentVolume > 20 ? 'SS' : contentVolume > 10 ? 'S' : 'B';
    const achievementRank = achievements.length > 20 ? 'SSS' : achievements.length > 10 ? 'A' : 'C';

    return (
        <div className="min-h-screen pb-20 animate-fade-in relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#00d2ff] rounded-full blur-[150px] opacity-10 pointer-events-none mix-blend-screen animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ff0055] rounded-full blur-[150px] opacity-10 pointer-events-none mix-blend-screen"></div>

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6 pl-4">
                <div>
                    <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] dmc-title">
                        LUMEN <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] to-white">ADMIN</span>
                    </h1>
                    <p className="text-sm font-mono text-[#00d2ff] mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#00d2ff] rounded-full animate-ping"></span>
                        OPERADOR: {user?.name?.toUpperCase()} // ACESSO: TOTAL
                    </p>
                </div>
                <div className="flex gap-4 mt-6 md:mt-0">
                    <button 
                        onClick={() => setIsIndexModalOpen(true)}
                        className="px-4 py-2 border border-white/20 text-slate-400 text-xs font-mono hover:text-white hover:border-white transition-colors uppercase"
                    >
                        [ DIAG_BANCO ]
                    </button>
                    <button 
                        onClick={() => setIsThematicModalOpen(true)}
                        className="px-4 py-2 border border-[#ff0055]/50 text-[#ff0055] text-xs font-mono hover:bg-[#ff0055] hover:text-white transition-colors uppercase"
                    >
                        [ CONFIG_TEMÁTICA ]
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 px-4">
                {isLoading ? (
                    <div className="h-32 bg-white/5 animate-pulse rounded skew-x-[-12deg]"></div>
                ) : (
                    <>
                        <StyleRankBadge rank={contentRank} subtext={`ARSENAL: ${contentVolume} ITENS`} />
                        <StyleRankBadge rank={achievementRank} subtext={`TROFÉUS: ${achievements.length} DESBLOQ.`} />
                        <StyleRankBadge rank="SS" subtext="INTEGRIDADE DO SISTEMA: 98%" />
                    </>
                )}
            </div>

            {/* Mission Select (Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 px-4">
                
                {/* Content Column */}
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-white italic border-b-2 border-[#00d2ff] inline-block mb-6 pr-12 transform skew-x-[-12deg]">
                        GESTÃO DE CONTEÚDO
                    </h2>
                    
                    <MissionCard 
                        label="Módulos" 
                        description="Gerenciar vetores de aprendizado & distribuição."
                        icon={ICONS.modules}
                        accentColor="#00d2ff"
                        onClick={() => setCurrentPage('admin_modules')}
                    />
                    <MissionCard 
                        label="Quizzes" 
                        description="Protocolos de avaliação & lógica de notas."
                        icon={ICONS.quizzes}
                        accentColor="#8b5cf6"
                        onClick={() => setCurrentPage('admin_quizzes')}
                    />
                    <MissionCard 
                        label="Conquistas" 
                        description="Recompensas de gamificação & medalhas."
                        icon={ICONS.achievements}
                        accentColor="#eab308"
                        onClick={() => setCurrentPage('admin_achievements')}
                    />
                </div>

                {/* Operations Column */}
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-white italic border-b-2 border-[#ff0055] inline-block mb-6 pr-12 transform skew-x-[-12deg]">
                        OPERAÇÕES DO SISTEMA
                    </h2>

                    <MissionCard 
                        label="Economia de XP" 
                        description="Balancear taxas de progressão e multiplicadores."
                        icon={ICONS.gamification}
                        accentColor="#ff0055"
                        onClick={() => setCurrentPage('admin_gamification')}
                    />
                    <MissionCard 
                        label="Telemetria" 
                        description="Estatísticas globais e engajamento do usuário."
                        icon={ICONS.teacher_statistics}
                        accentColor="#10b981"
                        onClick={() => setCurrentPage('admin_stats')}
                    />
                    <MissionCard 
                        label="Executor de Testes" 
                        description="Suíte de simulação e testes de estresse."
                        icon={ICONS.admin_tests}
                        accentColor="#f43f5e"
                        onClick={() => setCurrentPage('admin_tests')}
                    />
                </div>
            </div>

            {/* Modals */}
            <ThematicConfigModal isOpen={isThematicModalOpen} onClose={() => setIsThematicModalOpen(false)} />
            <IndexDiagnosticModal isOpen={isIndexModalOpen} onClose={() => setIsIndexModalOpen(false)} />
        </div>
    );
};

export default AdminDashboard;
