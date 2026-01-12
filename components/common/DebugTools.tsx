
import React, { useEffect, useState, version as reactVersion } from 'react';
import { createPortal } from 'react-dom';

interface ImportMap {
    imports: Record<string, string>;
}

export const DebugTools: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [envData, setEnvData] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shouldEnable = params.get('eruda') === 'true' || params.get('debug') === 'true';

        if (shouldEnable) {
            setIsVisible(true);
            analyzeEnvironment();
            
            // Load Eruda for console debugging
            if (!document.getElementById('eruda-script')) {
                const script = document.createElement('script');
                script.id = 'eruda-script';
                script.src = "https://cdn.jsdelivr.net/npm/eruda";
                script.async = true;
                script.onload = () => {
                    // @ts-ignore
                    if (window.eruda) window.eruda.init({ tool: ['console', 'network', 'info'] });
                };
                document.body.appendChild(script);
            }
        }
    }, []);

    const analyzeEnvironment = () => {
        const scriptMap = document.querySelector('script[type="importmap"]');
        let importMap: ImportMap | null = null;
        
        try {
            if (scriptMap && scriptMap.textContent) {
                importMap = JSON.parse(scriptMap.textContent);
            }
        } catch (e) {
            console.error("Erro ao ler ImportMap", e);
        }

        const reactEntry = importMap?.imports['react'] || 'Não encontrado no ImportMap';
        const reactDomEntry = importMap?.imports['react-dom/'] || 'Não encontrado no ImportMap';

        // Check for version pinning issues (using ^ or ~ in CDN links causes duplicates)
        const hasSemverRange = reactEntry.includes('@^') || reactEntry.includes('@~') || 
                               reactDomEntry.includes('@^') || reactDomEntry.includes('@~');

        setEnvData({
            reactVersionRuntime: reactVersion,
            importMap,
            reactEntry,
            reactDomEntry,
            hasSemverRange,
            userAgent: navigator.userAgent,
            onLine: navigator.onLine,
            // @ts-ignore
            memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB' : 'N/A'
        });
    };

    if (!isVisible) return null;

    return createPortal(
        <div className="fixed bottom-20 right-4 z-[9999] font-sans">
            {!isOpen ? (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-12 h-12 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-white animate-bounce"
                    title="Abrir Diagnóstico de Ambiente"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            ) : (
                <div className="bg-slate-900 text-slate-200 p-4 rounded-lg shadow-2xl border border-slate-700 w-80 md:w-96 text-xs max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                        <h3 className="font-bold text-sm text-white">Diagnóstico de Ambiente</h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <div className="space-y-4">
                        {envData?.hasSemverRange && (
                            <div className="bg-red-900/30 border border-red-500/50 p-2 rounded text-red-200">
                                <strong>⚠️ ALERTA CRÍTICO:</strong> Detectado uso de versões dinâmicas (^ ou ~) no CDN. Isso pode causar o erro "Null useRef" se o React e ReactDOM carregarem versões diferentes.
                            </div>
                        )}

                        <div>
                            <p className="font-bold text-indigo-400 mb-1">Runtime React Version</p>
                            <code className="bg-black/50 p-1 rounded block">{envData?.reactVersionRuntime}</code>
                        </div>

                        <div>
                            <p className="font-bold text-green-400 mb-1">ImportMap (React)</p>
                            <code className="bg-black/50 p-1 rounded block break-all">{envData?.reactEntry}</code>
                        </div>

                        <div>
                            <p className="font-bold text-green-400 mb-1">ImportMap (ReactDOM)</p>
                            <code className="bg-black/50 p-1 rounded block break-all">{envData?.reactDomEntry}</code>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-800 p-2 rounded">
                                <span className="block text-slate-500">Memória</span>
                                <span className="font-mono">{envData?.memory}</span>
                            </div>
                            <div className="bg-slate-800 p-2 rounded">
                                <span className="block text-slate-500">Online</span>
                                <span className={`font-bold ${envData?.onLine ? 'text-green-400' : 'text-red-400'}`}>
                                    {envData?.onLine ? 'SIM' : 'NÃO'}
                                </span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-700">
                            <p className="text-slate-500 mb-2">Dependências Completas:</p>
                            <pre className="bg-black p-2 rounded overflow-x-auto text-[10px] text-slate-400">
                                {JSON.stringify(envData?.importMap?.imports, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
};
