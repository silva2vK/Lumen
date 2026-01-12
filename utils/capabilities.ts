
/**
 * Lectorium/Lumen Core - Capabilities Manager
 * Detecta recursos do navegador e hardware para aplicar a estratégia de "Progressive Enhancement".
 */

export type PerformanceTier = 'high' | 'medium' | 'low';

export interface SystemCapabilities {
    // APIs Modernas
    hasScheduler: boolean;
    hasOffscreenCanvas: boolean;
    hasIdleCallback: boolean;
    hasOPFS: boolean; // Origin Private File System
    
    // Hardware (Estimado)
    deviceMemory: number; // GB (aproximado, Chrome only)
    cpuCores: number;
    
    // Network
    saveData: boolean; // Modo de economia de dados ativado?
    
    // Classificação
    tier: PerformanceTier;
}

// Extensão de tipos para APIs experimentais ou específicas do Chrome
declare global {
    interface Navigator {
        deviceMemory?: number;
        connection?: {
            saveData?: boolean;
            effectiveType?: string;
        };
    }
    interface Window {
        scheduler?: {
            postTask: (callback: () => void, options?: any) => Promise<any>;
        };
        OffscreenCanvas?: { new (width: number, height: number): any };
    }
}

const detectCapabilities = (): SystemCapabilities => {
    const nav = typeof navigator !== 'undefined' ? navigator : {} as Navigator;
    const win = typeof window !== 'undefined' ? window : {} as Window;

    // 1. Detecção de APIs
    const hasScheduler = !!win.scheduler?.postTask;
    const hasOffscreenCanvas = !!win.OffscreenCanvas;
    const hasIdleCallback = !!win.requestIdleCallback;
    const hasOPFS = !!nav.storage?.getDirectory;

    // 2. Detecção de Hardware (Defaults conservadores se não disponível)
    // deviceMemory retorna 0.25, 0.5, 1, 2, 4, 8 (GB). Se > 8, retorna 8.
    const deviceMemory = nav.deviceMemory || 4; 
    const cpuCores = nav.hardwareConcurrency || 4;

    // 3. Status de Rede/Bateria
    const saveData = nav.connection?.saveData || false;

    // 4. Cálculo do Tier de Performance
    let tier: PerformanceTier = 'medium';

    if (saveData) {
        tier = 'low'; // Força low se usuário quer economizar dados
    } else if (deviceMemory >= 8 && cpuCores >= 6) {
        tier = 'high'; // Máquina potente
    } else if (deviceMemory < 4 || cpuCores < 4) {
        tier = 'low'; // Dispositivo de entrada ou antigo
    }

    return {
        hasScheduler,
        hasOffscreenCanvas,
        hasIdleCallback,
        hasOPFS,
        deviceMemory,
        cpuCores,
        saveData,
        tier
    };
};

export const CAPABILITIES = detectCapabilities();

/**
 * Injeta classes no body para adaptação CSS automática e loga o diagnóstico.
 * Deve ser chamado no boot da aplicação (App.tsx).
 */
export const configureEnvironment = () => {
    if (typeof document === 'undefined') return;

    const body = document.body;
    const root = document.documentElement;

    // Remove classes anteriores para evitar conflitos em hot-reload
    body.classList.remove('perf-high', 'perf-medium', 'perf-low', 'no-glass');

    // Aplica classe de Tier
    body.classList.add(`perf-${CAPABILITIES.tier}`);

    // Se for Low Tier ou SaveData, desativa efeitos pesados via CSS global
    if (CAPABILITIES.tier === 'low') {
        body.classList.add('no-glass'); // O CSS deve remover backdrop-filter
        root.style.setProperty('--glass-bg', 'var(--bg-main)'); // Fallback opaco
    }

    // Marca suporte a APIs para seletores CSS avançados (ex: contain-intrinsic-size)
    if (CAPABILITIES.hasScheduler) root.classList.add('supports-scheduler');
    if (CAPABILITIES.hasOPFS) root.classList.add('supports-opfs');

    console.log(
        `%c[LUMEN KERNEL] Environment Configured: ${CAPABILITIES.tier.toUpperCase()}`,
        `background: ${CAPABILITIES.tier === 'high' ? '#4ade80' : CAPABILITIES.tier === 'medium' ? '#facc15' : '#ef4444'}; color: black; padding: 2px 5px; border-radius: 3px; font-weight: bold;`,
        CAPABILITIES
    );
};