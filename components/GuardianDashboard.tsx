
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigation } from '../contexts/NavigationContext'; // Importar navegação
import { SpinnerIcon, ICONS } from '../constants/index';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseClient';
import type { User, StudentGradeSummaryDoc, Unidade, GradeReportSubject } from '../types';
import { createNotification } from '../utils/createNotification';

interface Ward extends User {
    // Basic profile info is inherited from User
}

// --- RETRO COMPONENTS ---

const RetroWindow: React.FC<{ title: string; children: React.ReactNode; icon?: string; className?: string }> = ({ title, children, icon = "📁", className = "" }) => (
    <div className={`bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.5)] font-retro text-black ${className}`}>
        <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex justify-between items-center text-white select-none">
            <div className="flex items-center gap-2">
                <span className="text-sm">{icon}</span>
                <span className="font-bold tracking-wide text-sm">{title}</span>
            </div>
            <div className="flex gap-1">
                <button className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center text-black font-bold text-xs leading-none shadow-sm active:border-t-black active:border-l-black active:border-b-white active:border-r-white">_</button>
                <button className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black flex items-center justify-center text-black font-bold text-xs leading-none shadow-sm active:border-t-black active:border-l-black active:border-b-white active:border-r-white">X</button>
            </div>
        </div>
        <div className="p-4 bg-[#e0dcd3]">
            {children}
        </div>
    </div>
);

const RetroButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'normal' | 'primary' }> = ({ children, variant = 'normal', className = "", ...props }) => (
    <button 
        {...props}
        className={`
            px-4 py-1.5 font-bold font-retro text-sm active:translate-y-[1px] active:translate-x-[1px]
            border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black
            active:border-t-black active:border-l-black active:border-b-white active:border-r-white
            ${variant === 'primary' ? 'font-black' : ''}
            bg-[#c0c0c0] text-black hover:bg-[#d4d0c8] disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
        `}
    >
        {children}
    </button>
);

// --- Helpers ---

const getScoreColor = (score: number | undefined | null): string => {
    if (score === undefined || score === null) return 'text-gray-500';
    const val = Number(score.toFixed(1));
    if (val >= 10) return 'text-[#008000]'; // Green
    if (val >= 7.1) return 'text-[#000080]'; // Blue
    if (val >= 5.0) return 'text-[#808000]'; // Olive
    return 'text-[#800000]'; // Maroon
};

const StudentGradeCard: React.FC<{ student: Ward }> = ({ student }) => {
    const [grades, setGrades] = useState<StudentGradeSummaryDoc[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchGrades = async () => {
            setIsLoading(true);
            try {
                const q = query(collection(db, "student_grades"), where("studentId", "==", student.id));
                const snapshot = await getDocs(q);
                const results: StudentGradeSummaryDoc[] = [];
                snapshot.forEach(d => { results.push(d.data() as StudentGradeSummaryDoc); });
                if (mounted) setGrades(results);
            } catch (error) { console.error(error); } 
            finally { if (mounted) setIsLoading(false); }
        };
        fetchGrades();
        return () => { mounted = false; };
    }, [student.id]);

    const toggleClass = (classId: string) => {
        setExpandedClassId(prev => prev === classId ? null : classId);
    };

    return (
        <div className="mb-4 border-2 border-white border-b-gray-500 border-r-gray-500 p-1 bg-white">
            <div className="flex items-center gap-3 bg-[#000080] text-white p-2 mb-2">
                <div className="w-8 h-8 bg-gray-300 border-2 border-white border-b-black border-r-black flex items-center justify-center text-black font-bold text-lg font-retro">
                    {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold font-retro uppercase tracking-wider">{student.name}</h3>
                    <p className="text-xs font-mono text-gray-300">{student.series || 'N/A'}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 border border-white rounded-full animate-pulse shadow-[0_0_5px_#00ff00]"></div>
            </div>

            {isLoading ? (
                <div className="text-center py-4 font-mono text-xs">LOADING_DATA...</div>
            ) : grades.length === 0 ? (
                <div className="text-center py-4 font-retro text-gray-500 border-2 border-dashed border-gray-400 bg-gray-100 m-2">
                    [ NO_RECORDS_FOUND ]
                </div>
            ) : (
                <div className="space-y-2 px-2 pb-2">
                    {grades.map(gradeDoc => {
                        const classId = gradeDoc.classId;
                        const isExpanded = expandedClassId === classId;
                        const sortedUnits = Object.keys(gradeDoc.unidades || {}).sort();

                        return (
                            <div key={classId} className="border border-gray-400 bg-[#f0f0f0]">
                                <button 
                                    onClick={() => toggleClass(classId)}
                                    className="w-full flex justify-between items-center p-2 hover:bg-[#e0e0e0] font-retro text-sm active:bg-gray-300"
                                >
                                    <span className="font-bold text-black flex items-center gap-2">
                                        <span className="text-blue-800">📂</span> {gradeDoc.className || 'Turma'}
                                    </span>
                                    <span className="font-mono text-xs">{isExpanded ? '[-]' : '[+]'}</span>
                                </button>
                                
                                {isExpanded && (
                                    <div className="p-2 bg-white border-t border-gray-400">
                                        {sortedUnits.length === 0 ? (
                                            <p className="text-xs text-gray-500 font-mono pl-4">EMPTY_DIR</p>
                                        ) : (
                                            sortedUnits.map(unitName => {
                                                const unitData = gradeDoc.unidades[unitName as Unidade];
                                                if (!unitData || !unitData.subjects) return null;
                                                
                                                return (
                                                    <div key={unitName} className="mb-2 last:mb-0 ml-4 border-l border-dotted border-gray-400 pl-2">
                                                        <h5 className="font-bold text-xs uppercase text-gray-600 mb-1 font-mono">./{unitName}</h5>
                                                        <div className="grid gap-1">
                                                            {Object.entries(unitData.subjects).map(([subjectName, rawSubjData]) => {
                                                                const subjData = rawSubjData as GradeReportSubject;
                                                                return (
                                                                    <div key={subjectName} className="flex justify-between items-center text-xs font-mono bg-gray-50 px-1 hover:bg-yellow-100">
                                                                        <span className="text-black">{subjectName}</span>
                                                                        <span className={`font-bold ${getScoreColor(subjData.totalPoints)}`}>
                                                                            {Number(subjData.totalPoints).toFixed(1)}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const GuardianDashboard: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const { setCurrentPage } = useNavigation();
    
    const [wards, setWards] = useState<Ward[]>([]);
    const [isLoadingWards, setIsLoadingWards] = useState(true);
    const [newStudentId, setNewStudentId] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Fetch Wards
    useEffect(() => {
        const fetchWards = async () => {
            if (!user) return;
            setIsLoadingWards(true);
            try {
                const userDocRef = doc(db, "users", user.id);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const wardIds: string[] = userData.wards || [];
                    
                    if (wardIds.length > 0) {
                        const wardPromises = wardIds.map(id => getDoc(doc(db, "users", id)));
                        const wardSnaps = await Promise.all(wardPromises);
                        
                        const loadedWards: Ward[] = [];
                        wardSnaps.forEach(snap => {
                            if (snap.exists()) loadedWards.push({ id: snap.id, ...snap.data() } as Ward);
                        });
                        setWards(loadedWards);
                    } else {
                        setWards([]);
                    }
                }
            } catch (error) {
                console.error(error);
                addToast("Erro ao carregar dados.", "error");
            } finally {
                setIsLoadingWards(false);
            }
        };
        fetchWards();
    }, [user, addToast]);

    const handleAddStudent = async () => {
        if (!newStudentId.trim() || !user) return;
        if (newStudentId === user.id) { addToast("Operação inválida.", "error"); return; }
        if (wards.some(w => w.id === newStudentId)) { addToast("Aluno já vinculado.", "info"); return; }

        setIsAdding(true);
        try {
            const studentRef = doc(db, "users", newStudentId);
            const studentSnap = await getDoc(studentRef);

            if (!studentSnap.exists() || studentSnap.data().role !== 'aluno') {
                addToast("ID inválido ou não é aluno.", "error");
                setIsAdding(false);
                return;
            }

            const invQuery = query(collection(db, "invitations"), where("inviterId", "==", user.id), where("inviteeId", "==", newStudentId), where("status", "==", "pending"));
            const invSnap = await getDocs(invQuery);
            if (!invSnap.empty) { addToast("Solicitação já enviada.", "info"); setIsAdding(false); return; }

            await addDoc(collection(db, "invitations"), {
                type: 'guardian_access_request', inviterId: user.id, inviterName: user.name, inviteeId: newStudentId, status: 'pending', timestamp: serverTimestamp()
            });

            await createNotification({
                userId: newStudentId, actorId: user.id, actorName: user.name, type: 'notice_post', title: 'Solicitação de Vínculo',
                text: `${user.name} solicitou acesso ao seu perfil.`, classId: 'system'
            });

            setNewStudentId('');
            addToast("Solicitação enviada!", "success");
        } catch (error) { console.error(error); addToast("Erro ao processar.", "error"); } finally { setIsAdding(false); }
    };

    return (
        <div className="min-h-screen bg-[#008080] p-4 font-retro relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            
            {/* CRT Scanline Overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,6px_100%]"></div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                
                {/* SYSTEM WINDOW (Sidebar/Actions) */}
                <div className="md:col-span-4 space-y-6">
                    <RetroWindow title="LumenOS 2000" icon="💻">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-black mb-1 uppercase tracking-widest text-[#000080]" style={{ textShadow: '2px 2px 0px #fff' }}>Painel do Responsável</h1>
                            <p className="text-xs font-mono bg-white border border-gray-400 p-1">v2.0.1 (Stable)</p>
                        </div>

                        <div className="space-y-4">
                            <div className="border-2 border-gray-400 p-1 bg-white">
                                <label className="block text-xs font-bold text-black mb-1 bg-gray-200 px-1 border-b border-gray-400">Vincular Aluno (ID)</label>
                                <div className="flex gap-1 p-2">
                                    <input
                                        type="text"
                                        value={newStudentId}
                                        onChange={(e) => setNewStudentId(e.target.value)}
                                        className="w-full bg-black text-green-400 font-mono text-sm p-1 border-2 border-inset border-gray-500 focus:outline-none"
                                        placeholder="user_id_here"
                                    />
                                    <RetroButton onClick={handleAddStudent} disabled={isAdding || !newStudentId.trim()} className="px-2">
                                        {isAdding ? '...' : '+'}
                                    </RetroButton>
                                </div>
                            </div>

                            {/* Public Access Buttons */}
                            <div className="border-2 border-gray-400 p-1 bg-[#e0dcd3]">
                                <div className="bg-[#000080] text-white text-xs font-bold px-2 py-1 mb-2">
                                    RECURSOS PÚBLICOS
                                </div>
                                <div className="space-y-2 p-2">
                                    <RetroButton onClick={() => setCurrentPage('modules')} className="w-full text-left flex items-center gap-2">
                                        <span className="text-lg">📚</span> Biblioteca de Módulos
                                    </RetroButton>
                                    <RetroButton onClick={() => setCurrentPage('quizzes')} className="w-full text-left flex items-center gap-2">
                                        <span className="text-lg">📝</span> Banco de Quizzes
                                    </RetroButton>
                                </div>
                            </div>
                        </div>
                    </RetroWindow>

                    {/* System Status Mock */}
                    <div className="bg-black border-4 border-gray-500 p-2 font-mono text-xs text-green-500 shadow-xl">
                        <p>&gt; SYSTEM CHECK...</p>
                        <p>&gt; CONNECTION: ESTABLISHED</p>
                        <p>&gt; USER: {user?.name.toUpperCase()}</p>
                        <p className="animate-pulse">&gt; WAITING_INPUT_</p>
                    </div>
                </div>

                {/* MAIN CONTENT (Wards) */}
                <div className="md:col-span-8">
                    <RetroWindow title="Meus Dependentes (C:\Users\Students)" icon="👥" className="h-full min-h-[500px]">
                        <div className="bg-white border-2 border-inset border-gray-400 h-full p-4 overflow-y-auto custom-scrollbar" style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.1)' }}>
                            {isLoadingWards ? (
                                <div className="flex flex-col items-center justify-center h-40">
                                    <SpinnerIcon className="h-8 w-8 text-black mb-2" />
                                    <span className="font-mono text-xs">Reading disk...</span>
                                </div>
                            ) : wards.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <span className="text-4xl grayscale mb-2">🚫</span>
                                    <p className="font-bold text-sm">NENHUM ARQUIVO</p>
                                    <p className="text-xs font-mono">Use o painel lateral para vincular.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {wards.map(student => (
                                        <StudentGradeCard key={student.id} student={student} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </RetroWindow>
                </div>
            </div>
        </div>
    );
};

export default GuardianDashboard;
