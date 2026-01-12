
import { doc, getDoc } from "firebase/firestore";
import { db } from "../components/firebaseClient";

// Cache simples em memória para evitar leituras excessivas na mesma sessão
let cachedConfig: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutos

export const getGamificationConfig = async (): Promise<Record<string, number>> => {
    const now = Date.now();
    
    if (cachedConfig && (now - lastFetchTime < CACHE_DURATION)) {
        return cachedConfig;
    }

    try {
        const docRef = doc(db, 'system_settings', 'gamification_config');
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
            const data = snap.data();
            cachedConfig = data.actions || {};
            lastFetchTime = now;
            return cachedConfig!;
        }
    } catch (error) {
        console.error("Erro ao buscar configuração de gamificação:", error);
    }

    // Fallbacks padrão caso o banco esteja inacessível ou não configurado
    return {
        'quiz_complete': 10,
        'module_complete': 50,
        'activity_sent': 20
    };
};
