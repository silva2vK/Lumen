
import { supabase } from "../components/supabaseClient";
import type { Achievement, UserGamificationStats, UserAchievementsDoc } from '../types';
import { fetchGlobalAchievements } from './achievements';

export function checkNewAchievements(
    currentStats: UserGamificationStats,
    allAchievements: Achievement[],
    unlockedMap: Record<string, any>
): Achievement[] {
    const newUnlocks: Achievement[] = [];

    for (const achievement of allAchievements) {
        if (unlockedMap[achievement.id]) continue;
        if (achievement.status === 'Inativa') continue;

        let isUnlocked = false;
        const target = achievement.criterionCount || 0;
        if (target <= 0) continue;

        switch (achievement.criterionType) {
            case 'quizzes':
                if ((currentStats.quizzesCompleted || 0) >= target) isUnlocked = true;
                break;
            case 'modules':
                if ((currentStats.modulesCompleted || 0) >= target) isUnlocked = true;
                break;
            case 'activities':
                if ((currentStats.activitiesCompleted || 0) >= target) isUnlocked = true;
                break;
        }

        if (isUnlocked) {
            const achievementWithDate = {
                ...achievement,
                unlocked: true,
                date: new Date().toLocaleDateString('pt-BR')
            };
            newUnlocks.push(achievementWithDate);
        }
    }
    return newUnlocks;
}

export async function processGamificationEvent(
    userId: string,
    eventType: 'quiz_complete' | 'module_complete' | 'activity_sent',
    xpEarned: number
): Promise<Achievement[]> {
    if (!userId) return [];

    try {
        const allAchievements = await fetchGlobalAchievements();
        
        // 1. Fetch current data
        const { data: userDoc } = await supabase
            .from('user_gamification')
            .select('*')
            .eq('user_id', userId)
            .single();

        let currentStats = userDoc?.stats || { quizzesCompleted: 0, modulesCompleted: 0, activitiesCompleted: 0 };
        let currentUnlocked = userDoc?.unlocked_achievements || {};
        let currentXp = userDoc?.xp || 0;
        let currentLevel = userDoc?.level || 1;

        // 2. Increment Stats
        if (eventType === 'quiz_complete') currentStats.quizzesCompleted = (currentStats.quizzesCompleted || 0) + 1;
        else if (eventType === 'module_complete') currentStats.modulesCompleted = (currentStats.modulesCompleted || 0) + 1;
        else if (eventType === 'activity_sent') currentStats.activitiesCompleted = (currentStats.activitiesCompleted || 0) + 1;

        // 3. Check Unlocks
        const newlyUnlocked = checkNewAchievements(currentStats, allAchievements, currentUnlocked);
        
        let newXp = currentXp + xpEarned;
        newlyUnlocked.forEach(ach => newXp += (ach.points || 0));
        
        newlyUnlocked.forEach(ach => {
            currentUnlocked[ach.id] = { date: new Date().toISOString(), seen: false };
        });

        const newLevel = Math.floor(newXp / 100) + 1;

        // 4. Update
        const updates = {
            stats: currentStats,
            unlocked_achievements: currentUnlocked,
            xp: newXp,
            level: Math.max(currentLevel, newLevel),
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('user_gamification')
            .upsert({ user_id: userId, ...updates });

        if (error) throw error;

        return newlyUnlocked;

    } catch (error) {
        console.error("Erro ao processar gamificação:", error);
        return [];
    }
}
