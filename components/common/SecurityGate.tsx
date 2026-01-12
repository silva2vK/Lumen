
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const SecurityGate: React.FC = () => {
    const { userRole } = useAuth();
    const [lockdown, setLockdown] = useState(false);

    // Regras de isenção: Admins, Professores e Direção podem usar DevTools
    const bypass = userRole === 'admin' || userRole === 'professor' || userRole === 'direcao';

    useEffect(() => {
        if (bypass) return;

        const triggerLockdown = () => {
            setLockdown(true);
            // Opcional: Logar tentativa de violação no analytics
            console.warn("⚠️ ALERTA DE SEGURANÇA: Tentativa de acesso ao console detectada.");
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12') {
                e.preventDefault();
                triggerLockdown();
            }
            
            // Atalhos comuns de DevTools
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) {
                e.preventDefault();
                triggerLockdown();
            }
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
                e.preventDefault();
                triggerLockdown();
            }
        };

        // Detecção Heurística de Janela
        const detectDockedDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            
            if ((widthThreshold || heightThreshold) && (window.outerWidth > 600 && window.outerHeight > 600)) {
                // Se a janela mudar drasticamente de tamanho interno sem mudar o externo,
                // é provável que o DevTools tenha sido acoplado.
                triggerLockdown();
            }
        };

        // Debugger Loop (Técnica "Annoyance")
        // Se o console estiver aberto, o navegador vai pausar aqui constantemente
        const antiDebug = () => {
            if (lockdown) return;
            // Apenas executa se não estivermos em localhost para não atrapalhar o desenvolvimento legítimo
            if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                const start = Date.now();
                // eslint-disable-next-line no-debugger
                debugger; 
                if (Date.now() - start > 100) {
                    // Se houve um delay significativo, o debugger pausou a execução -> Console aberto
                    triggerLockdown();
                }
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', detectDockedDevTools);
        
        // Verifica a cada 2 segundos
        const interval = setInterval(antiDebug, 2000);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', detectDockedDevTools);
            clearInterval(interval);
        };
    }, [bypass, lockdown]);

    if (!lockdown) return null;

    // Lockdown UI: Bloqueia a tela inteira
    return (
        <div className="fixed inset-0 z-[99999] bg-red-950 flex flex-col items-center justify-center text-white p-8 text-center animate-fade-in font-mono cursor-not-allowed select-none">
            {/* Background Noise visual para dar um ar de "Erro Crítico" */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10 max-w-2xl bg-black/50 p-12 border-4 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                <div className="text-6xl mb-6 animate-pulse">🔒</div>
                
                <h1 className="text-4xl font-black uppercase mb-4 tracking-tighter text-red-500">
                    SESSÃO BLOQUEADA
                </h1>
                
                <div className="w-full h-1 bg-red-600 mb-8"></div>

                <p className="text-lg text-red-200 mb-4 font-bold">
                    O sistema de integridade acadêmica do Lumen detectou uma ferramenta de inspeção não autorizada.
                </p>
                
                <p className="text-sm text-red-400/80 mb-8 bg-black/40 p-4 border border-red-900/50 font-mono text-left">
                    ERROR_CODE: INTEGRITY_VIOLATION_0x99<br/>
                    STATUS: SUSPENDED<br/>
                    ACTION: RELOAD_REQUIRED
                </p>

                <p className="text-xs text-slate-400 mb-8">
                    Todas as tentativas de alteração de notas ou conteúdo via console são bloqueadas e auditadas pelo servidor.
                </p>

                <button 
                    onClick={() => window.location.reload()}
                    className="px-10 py-4 bg-white text-red-900 font-black rounded hover:bg-gray-200 transition-colors uppercase tracking-[0.2em] shadow-xl hover:scale-105 transform duration-200"
                >
                    Recarregar Plataforma
                </button>
            </div>
        </div>
    );
};
