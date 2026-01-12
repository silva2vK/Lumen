
import React, { useEffect, useState, version as reactVersion } from 'react';
import { ICONS } from '../constants/index';

interface ImportMap {
    imports: Record<string, string>;
}

const AdminDiagnostics: React.FC = () => {
    const [envData, setEnvData] = useState<any>(null);

    useEffect(() => {
        const scriptMap = document.querySelector('script[type="importmap"]');
        let importMap: ImportMap | null = null;
        try { if (scriptMap && scriptMap.textContent) importMap = JSON.parse(scriptMap.textContent); } catch (e) {}

        const reactEntry = importMap?.imports['react'] || 'Not Found';
        const reactDomEntry = importMap?.imports['react-dom/'] || 'Not Found';
        const hasSemverRange = reactEntry.includes('@^') || reactEntry.includes('@~');

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
    }, []);

    if (!envData) return <div className="p-8 text-center text-slate-500 font-mono">Running diagnostics...</div>;

    return (
        <div className="space-y-6 animate-fade-in font-mono text-sm">
            <h1 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">
                <span className="text-brand mr-2">root@system:</span> diagnostics --verbose
            </h1>

            {envData.hasSemverRange && (
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded text-red-300">
                    <p className="font-bold">[CRITICAL] Version Conflict Detected</p>
                    <p className="mt-1 opacity-80">ImportMap uses dynamic ranges (^/~). This may cause multiple React instances.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0d1117] border border-white/10 p-4 rounded">
                    <h3 className="text-slate-500 font-bold mb-3 uppercase">Runtime Environment</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-slate-400">React Runtime</span>
                            <span className="text-green-400">{envData.reactVersionRuntime}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-slate-400">User Agent</span>
                            <span className="text-slate-200 text-xs truncate max-w-[150px]" title={envData.userAgent}>{envData.userAgent}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-slate-400">Memory Usage</span>
                            <span className="text-blue-400">{envData.memory}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-slate-400">Network Status</span>
                            <span className={envData.onLine ? "text-green-400" : "text-red-500"}>{envData.onLine ? "ONLINE" : "OFFLINE"}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#0d1117] border border-white/10 p-4 rounded">
                    <h3 className="text-slate-500 font-bold mb-3 uppercase">Module Resolution</h3>
                    <div className="space-y-3 text-xs">
                        <div>
                            <p className="text-slate-400 mb-1">React Entry Point</p>
                            <code className="block bg-black/50 p-2 rounded text-slate-300 break-all border border-white/5">{envData.reactEntry}</code>
                        </div>
                        <div>
                            <p className="text-slate-400 mb-1">ReactDOM Entry Point</p>
                            <code className="block bg-black/50 p-2 rounded text-slate-300 break-all border border-white/5">{envData.reactDomEntry}</code>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#0d1117] border border-white/10 p-4 rounded">
                <h3 className="text-slate-500 font-bold mb-2 uppercase">Full Import Map Dump</h3>
                <pre className="text-xs text-slate-400 bg-black/50 p-4 rounded overflow-x-auto border border-white/5">
                    {JSON.stringify(envData.importMap?.imports, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default AdminDiagnostics;
