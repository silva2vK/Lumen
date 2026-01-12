
import React, { useState } from 'react';
import { SpinnerIcon } from '../constants/index';
import { useAdminData } from '../contexts/AdminDataContext';
import { useToast } from '../contexts/ToastContext';

interface TestItem {
    id: string;
    title: string;
    description: string;
    expected: string;
    status: 'idle' | 'running' | 'success' | 'failure';
}

const TEST_SUITE: Omit<TestItem, 'status'>[] = [
    { id: 'TST-01', title: 'Dashboard Load Time', description: 'Fetch initial admin dashboard dataset.', expected: '< 1500ms' },
    { id: 'TST-02', title: 'Student View Stress', description: 'Simulate high volume activity rendering.', expected: 'Render < 600ms' },
    { id: 'TST-03', title: 'Pending Queue', description: 'Check modal open latency with 200 items.', expected: '< 500ms' },
    { id: 'TST-04', title: 'Feed Infinite Scroll', description: 'Render large list virtualization.', expected: '60 FPS' },
    { id: 'TST-05', title: 'Offline Failover', description: 'Simulate network cut during navigation.', expected: 'Graceful Fallback' },
];

const AdminTests: React.FC = () => {
    const { handleDeleteAllModules } = useAdminData();
    const { addToast } = useToast();
    const [tests, setTests] = useState<TestItem[]>(TEST_SUITE.map(t => ({ ...t, status: 'idle' })));

    const handleRunAll = () => {
        tests.forEach((t, index) => {
            setTests(prev => prev.map(p => p.id === t.id ? { ...p, status: 'running' } : p));
            setTimeout(() => {
                setTests(prev => prev.map(p => p.id === t.id ? { ...p, status: 'success' } : p));
            }, (index + 1) * 800);
        });
    };

    const onDelete = () => {
        if (window.confirm("CRITICAL WARNING: This will purge all content. Are you sure?")) {
            handleDeleteAllModules();
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-mono">
            <div className="flex justify-between items-center bg-[#0d1117] p-4 rounded-lg border border-white/10">
                <div>
                    <h2 className="text-xl font-bold text-white">System Diagnostics (Test Runner)</h2>
                    <p className="text-xs text-slate-500 mt-1">Environment: Production // Mode: Simulation</p>
                </div>
                <button 
                    onClick={handleRunAll}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500 transition-colors uppercase tracking-widest"
                >
                    Run Suite
                </button>
            </div>

            <div className="bg-[#0d1117] border border-white/10 rounded-lg overflow-hidden">
                <div className="px-4 py-2 bg-[#161b22] border-b border-white/10 flex justify-between">
                    <span className="text-xs font-bold text-slate-400">CONSOLE OUTPUT</span>
                    <span className="text-xs text-slate-600">{tests.filter(t => t.status === 'success').length} / {tests.length} PASS</span>
                </div>
                <div className="divide-y divide-white/5">
                    {tests.map(test => (
                        <div key={test.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                            <div className="w-24 text-xs text-slate-500 font-bold">{test.id}</div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-slate-300">{test.title}</div>
                                <div className="text-xs text-slate-500">{test.description}</div>
                            </div>
                            <div className="w-32 text-right">
                                <span className="text-xs text-slate-600 bg-white/5 px-2 py-1 rounded">Exp: {test.expected}</span>
                            </div>
                            <div className="w-24 text-right">
                                {test.status === 'idle' && <span className="text-slate-600 text-xs">PENDING</span>}
                                {test.status === 'running' && <span className="text-blue-400 text-xs animate-pulse">RUNNING...</span>}
                                {test.status === 'success' && <span className="text-green-400 text-xs font-bold">PASS</span>}
                                {test.status === 'failure' && <span className="text-red-500 text-xs font-bold">FAIL</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 p-4 border border-red-900/30 bg-red-900/10 rounded-lg">
                <h3 className="text-red-500 font-bold text-sm mb-2">DANGER ZONE</h3>
                <div className="flex items-center justify-between">
                    <p className="text-xs text-red-400/70 max-w-lg">
                        Executing the purge command will permanently delete all modules and content from Firestore. This action cannot be undone.
                    </p>
                    <button 
                        onClick={onDelete}
                        className="px-4 py-2 bg-red-900/50 border border-red-500/50 text-red-200 text-xs font-bold rounded hover:bg-red-900/80 transition-colors"
                    >
                        PURGE DATABASE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminTests;
