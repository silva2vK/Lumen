
import React, { useState, useEffect, useMemo } from 'react';
import { useStudentAcademic } from '../contexts/StudentAcademicContext';
import { useNavigation } from '../contexts/NavigationContext';
import { ICONS, SpinnerIcon } from '../constants/index';
import type { Activity } from '../types';
import { collection, query, where, getDocs, orderBy, collectionGroup } from 'firebase/firestore';
import { db } from './firebaseClient';
import { useAuth } from '../contexts/AuthContext';

const ActivityCard: React.FC<{ activity: Activity; status: string; onClick: () => void }> = ({ activity, status, onClick }) => {
    // Determine visuals based on status
    let statusColor = "text-slate-500 bg-slate-800 border-slate-700";
    let statusLabel = "Pendente";
    
    if (status === 'Corrigido') {
        statusColor = "text-green-400 bg-green-900/30 border-green-500/50";
        statusLabel = "Corrigido";
    } else if (status === 'Aguardando correção') {
        statusColor = "text-yellow-400 bg-yellow-900/30 border-yellow-500/50";
        statusLabel = "Enviado";
    } else {
        // Pendente
        statusColor = "text-blue-400 bg-blue-900/30 border-blue-500/50";
        statusLabel = "A Fazer";
    }

    return (
        <div 
            onClick={onClick}
            className="group bg-[#0d1117] border border-white/10 rounded-xl p-5 cursor-pointer hover:border-brand/50 transition-all duration-300 hover:shadow-lg flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${statusColor}`}>
                    {statusLabel}
                </span>
                <span className="text-xs font-mono text-slate-500 bg-black/40 px-2 py-1 rounded">
                    {activity.points} XP
                </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand transition-colors line-clamp-2">
                {activity.title}
            </h3>
            
            <p className="text-sm text-slate-400 mb-4 flex-1 line-clamp-3 leading-relaxed">
                {activity.description || "Sem descrição disponível."}
            </p>

            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>{activity.className || "Geral"}</span>
                <span>{activity.dueDate ? `Prazo: ${new Date(activity.dueDate).toLocaleDateString()}` : "Sem prazo"}</span>
            </div>
        </div>
    );
};

const Activities: React.FC = () => {
    const { studentClasses } = useStudentAcademic();
    const { openActivity } = useNavigation();
    const { user } = useAuth();
    
    // Estado para armazenar TODAS as atividades (Raw Data)
    const [allActivities, setAllActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<'a_fazer' | 'enviados' | 'corrigidos'>('a_fazer');

    // Fetch activities based on user classes (EXECUTA APENAS 1 VEZ ou se mudar usuário/turma)
    useEffect(() => {
        const fetchActivities = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // 1. Get all activities assigned to student's classes
                const classIds = studentClasses.map(c => c.id);
                if (classIds.length === 0) {
                    setAllActivities([]);
                    setLoading(false);
                    return;
                }

                // Chunk queries because 'in' limit is 10
                const chunks = [];
                for (let i = 0; i < classIds.length; i += 10) {
                    chunks.push(classIds.slice(i, i + 10));
                }

                const fetchedActivities: Activity[] = [];
                
                for (const chunk of chunks) {
                    const q = query(
                        collection(db, "activities"),
                        where("classId", "in", chunk),
                        where("status", "in", ["Ativo", "Pendente"]) // Only fetch active assignments
                    );
                    const snap = await getDocs(q);
                    snap.forEach(d => fetchedActivities.push({ id: d.id, ...d.data() } as Activity));
                }

                // 2. Get user submissions to determine status
                const submissionsSnap = await getDocs(query(collectionGroup(db, 'submissions'), where('studentId', '==', user.id)));
                const submissionsMap: Record<string, string> = {}; // ActivityID -> Status
                
                submissionsSnap.forEach(d => {
                    // Assuming submission doc is inside activity subcollection
                    // Path: activities/{activityId}/submissions/{userId}
                    const activityId = d.ref.parent.parent?.id;
                    if (activityId) {
                        submissionsMap[activityId] = d.data().status;
                    }
                });

                // 3. Merge data (Inject user status into activity object)
                const mergedActivities = fetchedActivities.map(act => ({
                    ...act,
                    // Inject user specific status for UI logic
                    userStatus: submissionsMap[act.id] || 'Pendente', // 'Pendente' aqui significa "Sem envio"
                    submissions: submissionsMap[act.id] ? [{ status: submissionsMap[act.id] }] as any : []
                }));

                setAllActivities(mergedActivities);

            } catch (error) {
                console.error("Error fetching activities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
        // REMOVIDO 'selectedStatus' das dependências para evitar re-fetch
    }, [user, studentClasses]);

    // Filtragem em Memória (Instantânea)
    const filteredActivities = useMemo(() => {
        return allActivities.filter(act => {
            const subStatus = (act as any).userStatus;
            
            if (selectedStatus === 'a_fazer') {
                // Mostra se não tiver submissão OU se estiver marcado apenas como Pendente (sem envio)
                return !subStatus || subStatus === 'Pendente';
            }
            if (selectedStatus === 'enviados') {
                return subStatus === 'Aguardando correção';
            }
            if (selectedStatus === 'corrigidos') {
                return subStatus === 'Corrigido';
            }
            return false;
        });
    }, [allActivities, selectedStatus]);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-thin text-white tracking-tight">
                        Minhas <span className="font-bold text-blue-500">Atividades</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm max-w-xl">
                        Gerencie suas tarefas, acompanhe entregas e veja correções.
                    </p>
                </div>
                
                {/* Tabs - Agora troca apenas o filtro local */}
                <div className="flex bg-[#0d1117] p-1 rounded-lg border border-white/10">
                    <button 
                        onClick={() => setSelectedStatus('a_fazer')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${selectedStatus === 'a_fazer' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        A Fazer
                    </button>
                    <button 
                        onClick={() => setSelectedStatus('enviados')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${selectedStatus === 'enviados' ? 'bg-yellow-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Enviados
                    </button>
                    <button 
                        onClick={() => setSelectedStatus('corrigidos')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${selectedStatus === 'corrigidos' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Corrigidos
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="min-h-[300px]">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <SpinnerIcon className="h-12 w-12 text-blue-500" />
                    </div>
                ) : filteredActivities.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredActivities.map(act => (
                            <ActivityCard 
                                key={act.id} 
                                activity={act} 
                                status={(act as any).userStatus} 
                                onClick={() => openActivity(act)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-white/5 rounded-3xl bg-black/20 backdrop-blur-sm">
                        <div className="p-4 bg-white/5 rounded-full mb-3 text-slate-500 text-4xl">📋</div>
                        <p className="text-slate-400 font-bold text-sm">Nenhuma atividade encontrada.</p>
                        <p className="text-slate-600 text-xs mt-1">
                            {selectedStatus === 'a_fazer' ? "Você está em dia com suas tarefas!" : "Nenhum histórico nesta categoria."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Activities;
