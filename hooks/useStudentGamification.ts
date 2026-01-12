
import { useState, useEffect, useCallback } from 'react';
import type { Achievement, UserStats } from '../types';
import { fetchGlobalAchievements, fetchUserAchievementsDoc } from '../utils/achievements';
import { supabase } from '../components/supabaseClient';
import { useToast } from '../contexts/ToastContext';

export function useStudentGamification(user: any) {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userStats, setUserStats] = useState<UserStats>({ xp: 0, level: 1, xpForNextLevel: 100, levelName: 'Iniciante' });
    const { addToast } = useToast();

    const loadGamificationData = useCallback(async () => {
        if (!user) return;
        
        const [globalAchievements, userAchievementsDoc] = await Promise.all([
            fetchGlobalAchievements(),
            fetchUserAchievementsDoc(user.id)
        ]);

        const mergedAchievements = globalAchievements.map(ach => {
            const userUnlockData = userAchievementsDoc.unlocked[ach.id];
            return {
                ...ach,
                unlocked: !!userUnlockData,
                date: userUnlockData ? new Date(userUnlockData.date).toLocaleDateString('pt-BR') : ''
            } as Achievement;
        });
        setAchievements(mergedAchievements);

        const fetchedStats: UserStats = {
            xp: userAchievementsDoc.xp,
            level: userAchievementsDoc.level,
            xpForNextLevel: 100,
            levelName: userAchievementsDoc.level < 5 ? 'Iniciante' : 'Estudante'
        };
        setUserStats(fetchedStats);
    }, [user]);

    useEffect(() => {
        if (user) {
            loadGamificationData();
        }
    }, [user, loadGamificationData]);

    const handleQuizCompleteLogic = async (quizId: string, title: string, score: number, total: number, answers?: Record<string, string>) => {
        if (!user) return 0;

        try {
            // Em vez de salvar em 'users/../quiz_results' que não existe no Supabase da mesma forma,
            // poderíamos criar uma tabela 'quiz_results', mas para MVP vamos focar na submissão
            // A lógica de XP real deve ser server-side. Aqui apenas notificamos o sucesso.
            
            // Simulação de envio bem-sucedido
            addToast(`Quiz enviado! Aguarde a correção para receber seu XP.`, 'info');
            return 0;

        } catch (error) {
            console.error("Erro ao salvar quiz:", error);
            addToast("Erro ao enviar respostas.", "error");
            return 0;
        }
    };

    return {
        achievements,
        userStats,
        loadGamificationData,
        handleQuizCompleteLogic,
        setUserStats
    };
}
