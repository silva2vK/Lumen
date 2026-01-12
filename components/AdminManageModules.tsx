
import React, { useState } from 'react';
import { ICONS, SpinnerIcon } from '../constants/index';
import { useAdminData } from '../contexts/AdminDataContext';
import { useNavigation } from '../contexts/NavigationContext';
import type { Module } from '../types';

const ModuleRow: React.FC<{ 
    module: Module; 
    onEdit: () => void; 
    onDelete: () => void; 
    onStatusChange: () => void;
    isSelected: boolean;
    onSelect: () => void;
}> = ({ module, onEdit, onDelete, onStatusChange, isSelected, onSelect }) => {
    
    // Configuração visual baseada no estado (Estilo Terminal)
    const statusDot = module.status === 'Ativo' ? 'bg-green-500' : 'bg-slate-600';
    const statusText = module.status === 'Ativo' ? 'text-green-400' : 'text-slate-500';
    
    const visibilityBadge = module.visibility === 'public' 
        ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
        : 'border-purple-500/30 text-purple-400 bg-purple-500/10';

    return (
        <tr className={`group border-b border-white/5 transition-colors ${isSelected ? 'bg-blue-900/10' : 'hover:bg-white/5'}`}>
            <td className="p-4 w-4 align-middle">
                 <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={onSelect}
                    className="h-4 w-4 rounded border-slate-600 bg-[#010409] text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
            </td>
            <td className="p-4 align-middle">
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-200 group-hover:text-white transition-colors text-sm">
                        {module.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">ID: {module.id.slice(0, 8)}</span>
                </div>
            </td>
            <td className="p-4 align-middle">
                <div className="flex flex-col gap-1">
                    {module.materia && (
                        <span className="text-xs font-mono text-slate-400">
                            <span className="text-slate-600">&lt;</span>
                            {Array.isArray(module.materia) ? module.materia[0] : module.materia}
                            <span className="text-slate-600">/&gt;</span>
                        </span>
                    )}
                </div>
            </td>
            <td className="p-4 align-middle">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${visibilityBadge} uppercase tracking-wide`}>
                    {module.visibility === 'public' ? 'PUB' : 'PRIV'}
                </span>
            </td>
            <td className="p-4 align-middle">
                <button 
                    onClick={onStatusChange}
                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                >
                    <div className={`w-2 h-2 rounded-full ${statusDot}`}></div>
                    <span className={`text-xs font-mono font-bold ${statusText}`}>{module.status}</span>
                </button>
            </td>
            <td className="p-4 align-middle text-right">
                <div className="flex items-center justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                     <button onClick={onEdit} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                     </button>
                     <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                </div>
            </td>
        </tr>
    );
};

const AdminManageModules: React.FC = () => {
    const { modules, totalModulesCount, handleDeleteModule, handleUpdateModule, handleBulkDeleteModules, fetchNextModulesPage, hasMoreModules, isLoadingModules, isSubmitting } = useAdminData();
    const { setCurrentPage, startEditingModule } = useNavigation();
    const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
    
    const publishedCount = modules.filter(m => m.status === 'Ativo').length;
    const isAllSelected = modules.length > 0 && selectedModules.size === modules.length;

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedModules(new Set(modules.map(m => m.id)));
        else setSelectedModules(new Set());
    };

    const handleSelectModule = (moduleId: string) => {
        setSelectedModules(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(moduleId)) newSelection.delete(moduleId);
            else newSelection.add(moduleId);
            return newSelection;
        });
    };

    const onDeleteSelected = async () => {
        if (selectedModules.size === 0) return;
        if (window.confirm(`CONFIRM DELETE: ${selectedModules.size} modules?`)) {
            await handleBulkDeleteModules(selectedModules);
            setSelectedModules(new Set());
        }
    };

    const onStatusChange = async (module: Module) => {
        const newStatus = module.status === 'Ativo' ? 'Inativo' : 'Ativo';
        await handleUpdateModule({ ...module, status: newStatus });
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0d1117] p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-6">
                    <h2 className="text-xl font-bold text-white font-mono flex items-center">
                        <span className="text-blue-500 mr-2">./</span>
                        Módulos
                    </h2>
                    <div className="h-6 w-px bg-white/10 hidden md:block"></div>
                    <div className="flex gap-4 text-xs font-mono text-slate-400">
                        <span>TOTAL: <span className="text-white">{totalModulesCount}</span></span>
                        <span>ATIVOS: <span className="text-green-400">{publishedCount}</span></span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {selectedModules.size > 0 && (
                        <button
                            onClick={onDeleteSelected}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 bg-red-900/20 text-red-400 border border-red-900/50 rounded text-xs font-bold hover:bg-red-900/40 transition-colors uppercase tracking-wider disabled:opacity-50"
                        >
                            Delete ({selectedModules.size})
                        </button>
                    )}
                    <button 
                        onClick={() => setCurrentPage('admin_create_module')}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-500 transition-colors uppercase tracking-wider"
                    >
                        <div className="h-4 w-4 mr-2">{ICONS.plus}</div>
                        Novo Módulo
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-[#0d1117] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#161b22] text-xs font-mono font-bold text-slate-400 border-b border-white/10">
                            <th className="p-4 w-4">
                                <input 
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 rounded border-slate-600 bg-[#010409] text-blue-500 focus:ring-0 cursor-pointer"
                                />
                            </th>
                            <th className="p-4 uppercase">Identificador</th>
                            <th className="p-4 uppercase">Tag</th>
                            <th className="p-4 uppercase">Visibilidade</th>
                            <th className="p-4 uppercase">Status</th>
                            <th className="p-4 text-right uppercase">Opções</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-[#0d1117]">
                        {modules.map(mod => (
                            <ModuleRow 
                                key={mod.id} 
                                module={mod} 
                                onEdit={() => startEditingModule(mod)} 
                                onDelete={() => handleDeleteModule(mod.id)} 
                                onStatusChange={() => onStatusChange(mod)}
                                isSelected={selectedModules.has(mod.id)}
                                onSelect={() => handleSelectModule(mod.id)}
                            />
                        ))}
                    </tbody>
                </table>
                
                {/* Pagination Footer */}
                {hasMoreModules && (
                    <div className="p-4 bg-[#161b22] border-t border-white/10 flex justify-center">
                        <button 
                            onClick={fetchNextModulesPage}
                            disabled={isLoadingModules}
                            className="text-xs font-mono font-bold text-blue-400 hover:text-blue-300 disabled:opacity-50"
                        >
                            {isLoadingModules ? 'LOADING STREAM...' : 'LOAD MORE DATA'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminManageModules;
