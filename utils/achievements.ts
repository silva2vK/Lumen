
import { supabase } from "../components/supabaseClient";
import type { Achievement, UserAchievementsDoc } from "../types";

export async function fetchGlobalAchievements(): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('status', 'Ativa');

    if (error) throw error;
    
    // Mapeamento snake_case -> camelCase
    return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        points: d.points,
        tier: d.tier,
        imageUrl: d.image_url,
        criterion: d.criterion,
        criterionType: d.criterion_type,
        criterionCount: d.criterion_count,
        category: d.category,
        rarity: d.rarity,
        status: d.status
    } as Achievement));
  } catch (error) {
    console.error("Erro ao buscar conquistas globais:", error);
    return [];
  }
}

export async function fetchUserAchievementsDoc(userId: string): Promise<UserAchievementsDoc> {
  if (!userId) throw new Error("UserID is required");

  try {
    const { data, error } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

    if (data) {
      return {
        xp: data.xp,
        level: data.level,
        stats: data.stats || { quizzesCompleted: 0, modulesCompleted: 0, activitiesCompleted: 0 },
        unlocked: data.unlocked_achievements || {},
        updatedAt: data.updated_at
      };
    } else {
      // Cria registro inicial se não existir
      const initialData = {
        user_id: userId,
        xp: 0,
        level: 1,
        stats: { quizzesCompleted: 0, modulesCompleted: 0, activitiesCompleted: 0 },
        unlocked_achievements: {}
      };
      
      const { error: insertError } = await supabase
        .from('user_gamification')
        .insert([initialData]);
        
      if (insertError) throw insertError;

      return {
          xp: 0, level: 1, 
          stats: initialData.stats, 
          unlocked: initialData.unlocked_achievements,
          updatedAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error("Erro ao buscar conquistas do usuário:", error);
    return { xp: 0, level: 1, stats: { quizzesCompleted: 0, modulesCompleted: 0, activitiesCompleted: 0 }, unlocked: {} };
  }
}
