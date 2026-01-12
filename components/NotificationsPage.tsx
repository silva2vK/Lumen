
import React, { useState, useMemo } from 'react';
import type { Notification, Activity } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useStudentNotificationsContext } from '../contexts/StudentNotificationContext';
import { useTeacherCommunicationContext } from '../contexts/TeacherCommunicationContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSettings } from '../contexts/SettingsContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseClient';
import { useToast } from '../contexts/ToastContext';
import { SpinnerIcon, ICONS } from '../constants/index';

// --- Assets & Icons ---

const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'activity_correction':
            return (
                <div className="text-green-400 bg-green-400/10 p-2 rounded-lg border border-green-400/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>
            );
        case 'activity_post':
            return (
                <div className="text-blue-400 bg-blue-400/10 p-2 rounded-lg border border-blue-400/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                </div>
            );
        case 'module_post':
            return (
                <div className="text-purple-400 bg-purple-400/10 p-2 rounded-lg border border-purple-400/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                </div>
            );
        default: // Notice / Generic
            return (
                <div className="text-slate-400 bg-slate-400/10 p-2 rounded-lg border border-slate-400/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
                    </svg>
                </div>
            );
    }
};

const UrgencyTag: React.FC<{ urgency: 'low' | 'medium' | 'high' }> = ({ urgency }) => {
    const styles = {
        low: 'text-slate-500 border-slate-700 bg-slate-800/50',
        medium: 'text-yellow-500 border-yellow-900/50 bg-yellow-900/20',
        high: 'text-red-400 border-red-900/50 bg-red-900/20 animate-pulse',
    };

    const labels = {
        low: 'INFO',
        medium: 'NORMAL',
        high: 'URGENTE',
    };

    return (
        <span className={`text-[10px] font-mono border px-1.5 py-0.5 rounded uppercase tracking-wider ${styles[urgency]}`}>
            {labels[urgency]}
        </span>
    );
};

// --- Main List Item ---

const NotificationRow: React.FC<{ notification: Notification; onClick: () => void }> = ({ notification, onClick }) => {
    const isUnread = !notification.read;
    
    return (
        <div 
            onClick={onClick}
            className={`
                group relative flex items-start gap-4 p-4 border-b border-white/5 transition-all duration-200 cursor-pointer
                ${isUnread ? 'bg-[#0F1115] hover:bg-[#16181D]' : 'bg-transparent hover:bg-white/5 opacity-70 hover:opacity-100'}
            `}
        >
            {/* Unread Indicator Bar */}
            {isUnread && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand shadow-[0_0_10px_var(--brand-color)]" />
            )}

            {/* Icon Column */}
            <div className="flex-shrink-0 pt-1">
                <NotificationIcon type={notification.type} />
            </div>

            {/* Content Column */}
            <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-semibold truncate ${isUnread ? 'text-white' : 'text-slate-400'}`}>
                            {notification.title}
                        </h3>
                        {notification.groupCount && notification.groupCount > 1 && (
                            <span className="text-[10px] bg-slate-700 text-white px-1.5 rounded-full font-mono">
                                +{notification.groupCount}
                            </span>
                        )}
                        <UrgencyTag urgency={notification.urgency} />
                    </div>
                    <span className="flex-shrink-0 text-[10px] font-mono text-slate-500 whitespace-nowrap">
                        {new Date(notification.timestamp).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                
                <p className="text-sm text-slate-400 font-medium leading-relaxed group-hover:text-slate-200 transition-colors line-clamp-2">
                    {notification.summary}
                </p>
                
                {/* Footer Meta */}
                <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-600 font-mono uppercase tracking-wide">
                    {notification.actorName && (
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-700" />
                            {notification.actorName}
                        </span>
                    )}
                    <span>ID: {notification.id.slice(-6)}</span>
                </div>
            </div>

            {/* Chevron Action */}
            <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    );
};

// --- Page Component ---

const NotificationsPage: React.FC = () => {
    const { userRole } = useAuth();
    const { addToast } = useToast();
    const { setCurrentPage, openActivity } = useNavigation();
    
    // Context Logic
    let studentData: any = {};
    if (userRole === 'aluno') {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        studentData = useStudentNotificationsContext();
    }
    
    let teacherData: any = {};
    if (userRole === 'professor') {
        try {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            teacherData = useTeacherCommunicationContext();
        } catch { /* ignore */ }
    }
    
    const data = userRole === 'aluno' ? studentData : teacherData;
    const { notifications = [], handleMarkAllNotificationsRead = async () => {}, unreadNotificationCount = 0, handleMarkNotificationAsRead = async () => {} } = data || {};
    
    const [isUpdating, setIsUpdating] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'system'>('all');
    const [loadingActivityId, setLoadingActivityId] = useState<string | null>(null);

    const filteredNotifications = useMemo(() => {
        if (filter === 'unread') return notifications.filter((n: Notification) => !n.read);
        if (filter === 'system') return notifications.filter((n: Notification) => n.type === 'system');
        return notifications;
    }, [notifications, filter]);

    const handleMarkAll = async () => {
        setIsUpdating(true);
        await handleMarkAllNotificationsRead();
        setIsUpdating(false);
        addToast("Todas as notificações marcadas como lidas.", "success");
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read && handleMarkNotificationAsRead) {
            handleMarkNotificationAsRead(notification.id);
        }

        if (notification.deepLink.id && notification.deepLink.page === 'student_activity_view') {
            setLoadingActivityId(notification.id);
            try {
                const activityRef = doc(db, "activities", notification.deepLink.id);
                const activitySnap = await getDoc(activityRef);
                
                if (activitySnap.exists()) {
                    const activityData = { id: activitySnap.id, ...activitySnap.data() } as Activity;
                    openActivity(activityData);
                } else {
                    addToast("Atividade não encontrada ou excluída.", "error");
                    setCurrentPage('activities');
                }
            } catch (error) {
                console.error("Erro ao carregar atividade:", error);
                addToast("Erro ao abrir atividade.", "error");
            } finally {
                setLoadingActivityId(null);
            }
        } else {
            setCurrentPage(notification.deepLink.page);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-brand">●</span> Feed de Atividades
                    </h1>
                    <p className="text-slate-500 font-mono text-xs mt-1">
                        Logs do Sistema • {notifications.length} Eventos • {unreadNotificationCount} Não Lidos
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-[#0F1115] p-1 rounded-lg border border-white/5">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        TODAS
                    </button>
                    <button 
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'unread' ? 'bg-brand text-black shadow-sm shadow-brand/50' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        NÃO LIDAS
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-[#09090b] rounded-xl border border-white/10 overflow-hidden shadow-2xl relative flex flex-col">
                
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#0F1115]">
                    <span className="text-[10px] font-mono text-slate-500">ORDEM: MAIS RECENTE</span>
                    <button 
                        onClick={handleMarkAll}
                        disabled={unreadNotificationCount === 0 || isUpdating}
                        className="text-[10px] font-mono font-bold text-brand hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                        {isUpdating && <SpinnerIcon className="h-3 w-3" />}
                        [ MARCAR TODAS COMO LIDAS ]
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredNotifications.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {filteredNotifications.map(n => (
                                <NotificationRow 
                                    key={n.id} 
                                    notification={n} 
                                    onClick={() => handleNotificationClick(n)} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 select-none">
                            <div className="w-24 h-24 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="font-mono text-sm">SEM NOVOS EVENTOS</p>
                            <p className="text-xs">O sistema está atualizado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Loading Overlay */}
            {loadingActivityId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#0F1115] border border-brand p-6 rounded-xl shadow-[0_0_30px_rgba(var(--brand-rgb),0.3)] flex flex-col items-center">
                        <SpinnerIcon className="h-8 w-8 text-brand animate-spin mb-4" />
                        <span className="text-white font-mono text-sm tracking-widest">CARREGANDO RECURSO...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
