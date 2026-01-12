
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../components/supabaseClient';
import type { Notification, TeacherClass, User } from '../types';

export function useStudentNotifications(user: User | null, studentClasses: TeacherClass[]) {
    const [privateNotifications, setPrivateNotifications] = useState<Notification[]>([]);
    const [readReceipts, setReadReceipts] = useState<Set<string>>(new Set());

    // --- Fetch Notificações (Polling a cada 30s) ---
    useEffect(() => {
        if (!user || user.role !== 'aluno') return;

        const fetchNotifications = async () => {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .eq('read', false)
                .order('created_at', { ascending: false })
                .limit(20);

            if (data) {
                const notifs = data.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    summary: d.text || d.summary,
                    urgency: d.urgency,
                    deepLink: d.deep_link,
                    read: d.read,
                    timestamp: d.created_at,
                    userId: d.user_id,
                    type: d.type,
                    actorName: d.actor_name,
                    groupCount: d.group_count
                } as Notification));
                setPrivateNotifications(notifs);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 30s polling

        return () => clearInterval(interval);
    }, [user]);

    const notifications = useMemo(() => {
        return privateNotifications.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }, [privateNotifications]);

    const unreadNotificationCount = notifications.filter(n => !n.read).length;

    const handleMarkAllNotificationsRead = async () => {
        if (!user) return;
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false);
            
        if (!error) {
            setPrivateNotifications([]);
        }
    };

    const handleMarkNotificationAsRead = async (id: string) => {
        if (!user) return;
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        if (!error) {
            setPrivateNotifications(prev => prev.filter(n => n.id !== id));
        }
    };

    return {
        notifications,
        unreadNotificationCount,
        handleMarkAllNotificationsRead,
        handleMarkNotificationAsRead
    };
}
